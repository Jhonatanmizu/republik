import { createHash, createHmac, randomBytes } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { Global, Injectable, Logger, Module } from '@nestjs/common';
import { getEnvConfig } from '../../config/env.config.js';

export const STORAGE_SERVICE_PORT = Symbol('STORAGE_SERVICE_PORT');

export interface UploadFileInput {
  readonly fileName: string;
  readonly mimeType: string;
  readonly buffer: Buffer;
  readonly folder?: string;
}

export interface UploadFileResult {
  readonly key: string;
  readonly url: string;
  readonly strategy: 'local' | 's3';
}

export interface StorageServicePort {
  uploadFile(input: UploadFileInput): Promise<UploadFileResult>;
  deleteFile(key: string): Promise<void>;
}

function sanitizeExtension(fileName: string, mimeType: string): string {
  const ext = extname(fileName).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.webp', '.pdf'].includes(ext)) {
    return ext;
  }
  if (mimeType === 'application/pdf') return '.pdf';
  if (mimeType === 'image/png') return '.png';
  if (mimeType === 'image/webp') return '.webp';
  return '.jpg';
}

@Injectable()
export class LocalStorageStrategy implements StorageServicePort {
  private readonly baseDir = resolve(getEnvConfig().LOCAL_STORAGE_PATH);

  async uploadFile(input: UploadFileInput): Promise<UploadFileResult> {
    const folder = input.folder ?? 'general';
    const targetDir = join(this.baseDir, folder);
    await mkdir(targetDir, { recursive: true });

    const ext = sanitizeExtension(input.fileName, input.mimeType);
    const uniqueName = `${Date.now()}-${randomBytes(6).toString('hex')}${ext}`;
    const relativeKey = `${folder}/${uniqueName}`;
    const fullPath = join(this.baseDir, relativeKey);

    await writeFile(fullPath, input.buffer);

    const publicBase = getEnvConfig().PUBLIC_BACKEND_URL.replace(/\/$/, '');
    return {
      key: relativeKey,
      url: `${publicBase}/uploads/${relativeKey}`,
      strategy: 'local',
    };
  }

  async deleteFile(key: string): Promise<void> {
    const safeKey = key.replace(/\.\./g, '');
    const fullPath = join(this.baseDir, safeKey);
    try {
      await unlink(fullPath);
    } catch {
      // Ignore if file already removed
    }
  }
}

function hmacSha256(key: Buffer | string, data: string): Buffer {
  return createHmac('sha256', key).update(data, 'utf8').digest();
}

function sha256HexBuffer(data: Buffer | string): string {
  return createHash('sha256').update(data).digest('hex');
}

@Injectable()
export class S3StorageStrategy implements StorageServicePort {
  private readonly logger = new Logger(S3StorageStrategy.name);
  private readonly localFallback = new LocalStorageStrategy();

  async uploadFile(input: UploadFileInput): Promise<UploadFileResult> {
    const env = getEnvConfig();
    const endpoint = env.S3_ENDPOINT;
    const region = env.S3_REGION;
    const bucket = env.S3_BUCKET;
    const accessKeyId = env.S3_ACCESS_KEY_ID.trim();
    const secretAccessKey = env.S3_SECRET_ACCESS_KEY.trim();
    const publicUrlBase = env.S3_PUBLIC_URL.trim()
      ? env.S3_PUBLIC_URL.trim()
      : `${endpoint.replace(/\/$/, '')}/${bucket}`;

    if (!accessKeyId || !secretAccessKey) {
      this.logger.warn(
        'S3 credentials missing in .env; falling back to LocalStorageStrategy',
      );
      return this.localFallback.uploadFile(input);
    }

    const folder = input.folder ?? 'general';
    const ext = sanitizeExtension(input.fileName, input.mimeType);
    const key = `${folder}/${Date.now()}-${randomBytes(6).toString('hex')}${ext}`;

    const url = new URL(`${endpoint.replace(/\/$/, '')}/${bucket}/${key}`);
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.slice(0, 8);
    const payloadHash = sha256HexBuffer(input.buffer);

    const canonicalHeaders =
      `content-type:${input.mimeType}\n` +
      `host:${url.host}\n` +
      `x-amz-content-sha256:${payloadHash}\n` +
      `x-amz-date:${amzDate}\n`;
    const signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date';
    const canonicalRequest = [
      'PUT',
      url.pathname,
      '',
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join('\n');

    const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
    const stringToSign = [
      'AWS4-HMAC-SHA256',
      amzDate,
      credentialScope,
      sha256HexBuffer(canonicalRequest),
    ].join('\n');

    const kDate = hmacSha256(`AWS4${secretAccessKey}`, dateStamp);
    const kRegion = hmacSha256(kDate, region);
    const kService = hmacSha256(kRegion, 's3');
    const kSigning = hmacSha256(kService, 'aws4_request');
    const signature = createHmac('sha256', kSigning)
      .update(stringToSign, 'utf8')
      .digest('hex');

    const authorizationHeader =
      `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, ` +
      `SignedHeaders=${signedHeaders}, Signature=${signature}`;

    try {
      const response = await fetch(url.toString(), {
        method: 'PUT',
        headers: {
          'Content-Type': input.mimeType,
          'x-amz-content-sha256': payloadHash,
          'x-amz-date': amzDate,
          Authorization: authorizationHeader,
        },
        body: new Uint8Array(input.buffer),
      });

      if (!response.ok) {
        this.logger.warn(
          `S3 upload returned ${response.status}; falling back to LocalStorageStrategy`,
        );
        return this.localFallback.uploadFile(input);
      }

      return {
        key,
        url: `${publicUrlBase.replace(/\/$/, '')}/${key}`,
        strategy: 's3',
      };
    } catch (err) {
      this.logger.warn(
        `S3 endpoint unreachable (${String(err)}); falling back to LocalStorageStrategy`,
      );
      return this.localFallback.uploadFile(input);
    }
  }

  async deleteFile(key: string): Promise<void> {
    await this.localFallback.deleteFile(key);
  }
}

@Global()
@Module({
  providers: [
    LocalStorageStrategy,
    S3StorageStrategy,
    {
      provide: STORAGE_SERVICE_PORT,
      inject: [LocalStorageStrategy, S3StorageStrategy],
      useFactory: (
        localStrategy: LocalStorageStrategy,
        s3Strategy: S3StorageStrategy,
      ): StorageServicePort => {
        const env = getEnvConfig();
        return env.STORAGE_DRIVER === 's3' ? s3Strategy : localStrategy;
      },
    },
  ],
  exports: [STORAGE_SERVICE_PORT, LocalStorageStrategy, S3StorageStrategy],
})
export class StorageModule {}
