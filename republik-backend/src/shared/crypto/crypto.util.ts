import {
  createHash,
  createHmac,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from 'node:crypto';
import { promisify } from 'node:util';
import { z } from 'zod';
import { USER_ROLE, type UserRole } from '../../constants/app.constants.js';

const scryptAsync = promisify(scryptCallback);

const SCRYPT_KEYLEN = 64;

export async function hashPassword(plainPassword: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scryptAsync(
    plainPassword,
    salt,
    SCRYPT_KEYLEN,
  )) as Buffer;
  return `scrypt$${salt}$${derivedKey.toString('hex')}`;
}

export async function verifyPassword(
  plainPassword: string,
  storedHash: string,
): Promise<boolean> {
  const parts = storedHash.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') {
    return false;
  }
  const salt = parts[1];
  const hexKey = parts[2];
  if (!salt || !hexKey) {
    return false;
  }
  const storedBuffer = Buffer.from(hexKey, 'hex');
  const derivedKey = (await scryptAsync(
    plainPassword,
    salt,
    SCRYPT_KEYLEN,
  )) as Buffer;
  if (storedBuffer.length !== derivedKey.length) {
    return false;
  }
  return timingSafeEqual(storedBuffer, derivedKey);
}

export function sha256Hex(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export function generateRandomToken(bytes = 32): string {
  return randomBytes(bytes).toString('hex');
}

export function generateSixDigitOtp(): string {
  const num = randomBytes(4).readUInt32BE(0) % 900_000;
  return String(100_000 + num);
}

export const JwtPayloadSchema = z.object({
  sub: z.string().uuid(),
  email: z.string().email(),
  role: z.enum([USER_ROLE.STUDENT, USER_ROLE.ADMIN]),
  iat: z.number().int(),
  exp: z.number().int(),
});

export type JwtPayload = z.infer<typeof JwtPayloadSchema>;

function base64UrlEncode(input: string | Buffer): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecodeToString(input: string): string {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    '=',
  );
  return Buffer.from(padded, 'base64').toString('utf8');
}

export function signJwtToken(
  payload: { sub: string; email: string; role: UserRole },
  secret: string,
  ttlSeconds: number,
): string {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const fullPayload: JwtPayload = {
    sub: payload.sub,
    email: payload.email,
    role: payload.role,
    iat: nowSeconds,
    exp: nowSeconds + ttlSeconds,
  };
  const headerPart = base64UrlEncode(
    JSON.stringify({ alg: 'HS256', typ: 'JWT' }),
  );
  const payloadPart = base64UrlEncode(JSON.stringify(fullPayload));
  const signingInput = `${headerPart}.${payloadPart}`;
  const signature = createHmac('sha256', secret)
    .update(signingInput)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `${signingInput}.${signature}`;
}

export function verifyJwtToken(
  token: string,
  secret: string,
): JwtPayload | null {
  const segments = token.split('.');
  if (segments.length !== 3) {
    return null;
  }
  const [headerPart, payloadPart, signaturePart] = segments;
  if (!headerPart || !payloadPart || !signaturePart) {
    return null;
  }
  const signingInput = `${headerPart}.${payloadPart}`;
  const expectedSig = createHmac('sha256', secret)
    .update(signingInput)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const sigBuffer = Buffer.from(signaturePart);
  const expectedBuffer = Buffer.from(expectedSig);
  if (
    sigBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(sigBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const rawJson: unknown = JSON.parse(base64UrlDecodeToString(payloadPart));
    const parsed = JwtPayloadSchema.safeParse(rawJson);
    if (!parsed.success) {
      return null;
    }
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (parsed.data.exp <= nowSeconds) {
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

