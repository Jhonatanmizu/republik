import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { USER_ROLE } from './constants/app.constants.js';
import { extractAcademicDomain } from './modules/auth/auth.constants.js';
import {
  hashPassword,
  signJwtToken,
  verifyJwtToken,
  verifyPassword,
} from './shared/crypto/crypto.util.js';
import { ConsoleEmailStrategy } from './shared/mail/mail.module.js';
import { LocalStorageStrategy } from './shared/storage/storage.module.js';

describe('Republik Backend Unit Suite', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('AppController', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });

    it('should return health status', () => {
      const health = appController.getHealth();
      expect(health.status).toBe('ok');
      expect(health.service).toBe('republik-backend');
    });
  });

  describe('Security & Crypto Utilities', () => {
    it('hashes and verifies passwords with scrypt safely', async () => {
      const hash = await hashPassword('Republik@2026');
      expect(hash.startsWith('scrypt$')).toBe(true);
      expect(await verifyPassword('Republik@2026', hash)).toBe(true);
      expect(await verifyPassword('WrongPassword', hash)).toBe(false);
    });

    it('signs and verifies JWT tokens with HMAC-SHA256', () => {
      const secret = 'test-secret-2026';
      const userId = '550e8400-e29b-41d4-a716-446655440000';
      const token = signJwtToken(
        {
          sub: userId,
          email: 'jhonatan.mizu@uefs.br',
          role: USER_ROLE.STUDENT,
        },
        secret,
        900,
      );
      const verified = verifyJwtToken(token, secret);
      expect(verified).not.toBeNull();
      expect(verified?.sub).toBe(userId);
      expect(verified?.email).toBe('jhonatan.mizu@uefs.br');
      expect(verifyJwtToken(token, 'wrong-secret')).toBeNull();
    });

    it('identifies recognized Brazilian academic email domains', () => {
      expect(extractAcademicDomain('marina.silva@usp.br')).toBe('usp.br');
      expect(extractAcademicDomain('jhonatan.mizu@uefs.br')).toBe('uefs.br');
      expect(extractAcademicDomain('aluno@ufba.br')).toBe('ufba.br');
      expect(extractAcademicDomain('estudante@faculdade.edu.br')).toBe(
        'faculdade.edu.br',
      );
      expect(extractAcademicDomain('visitante@gmail.com')).toBeNull();
    });
  });

  describe('Strategy Pattern Adapters (Email & Storage)', () => {
    it('delivers OTP via ConsoleEmailStrategy', async () => {
      const strategy = new ConsoleEmailStrategy();
      const res = await strategy.sendOtpEmail({
        to: 'marina.silva@usp.br',
        code: '482916',
        purpose: 'INSTANT_EDU_VERIFY',
      });
      expect(res.delivered).toBe(true);
      expect(res.provider).toBe('console');
    });

    it('uploads and deletes files via LocalStorageStrategy', async () => {
      const strategy = new LocalStorageStrategy();
      const uploaded = await strategy.uploadFile({
        fileName: 'quarto-usp.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake-image-content'),
        folder: 'test',
      });
      expect(uploaded.strategy).toBe('local');
      expect(uploaded.url).toContain('/uploads/test/');
      await strategy.deleteFile(uploaded.key);
    });
  });
});
