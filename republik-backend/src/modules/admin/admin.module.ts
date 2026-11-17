import {
  Body,
  Controller,
  Get,
  Inject,
  Injectable,
  Module,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { count, eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { Pool } from 'pg';
import { z } from 'zod';
import {
  DOC_VERIFICATION_DECISION,
  LISTING_STATUS,
  SAFETY_REPORT_STATUS,
  VERIFICATION_STATUS,
} from '../../constants/app.constants.js';
import { DRIZZLE_DB, PG_POOL } from '../../database/database.constants.js';
import * as schema from '../../database/schema.js';
import type { JwtPayload } from '../../shared/crypto/crypto.util.js';
import {
  CurrentUser,
  JwtAuthGuard,
  ZodValidationPipe,
} from '../../shared/security/security.js';

export const ReviewVerificationDtoSchema = z.object({
  decision: z.enum([
    DOC_VERIFICATION_DECISION.APPROVED,
    DOC_VERIFICATION_DECISION.NEEDS_RESUBMISSION,
    DOC_VERIFICATION_DECISION.REJECTED,
  ]),
  reviewerNotes: z.string().max(400).optional(),
});
export type ReviewVerificationDto = z.infer<typeof ReviewVerificationDtoSchema>;

export const ReviewReportDtoSchema = z.object({
  action: z.enum([
    SAFETY_REPORT_STATUS.PAUSED_LISTING,
    SAFETY_REPORT_STATUS.BANNED_USER,
    SAFETY_REPORT_STATUS.RESOLVED,
  ]),
});
export type ReviewReportDto = z.infer<typeof ReviewReportDtoSchema>;

export const CreateSafetyReportDtoSchema = z.object({
  listingId: z.string().uuid(),
  reason: z.string().min(4).max(160),
  details: z.string().min(4).max(800),
});
export type CreateSafetyReportDto = z.infer<typeof CreateSafetyReportDtoSchema>;

interface RawVerificationRow {
  id: string;
  user_id: string;
  university_name: string;
  registration_number: string;
  document_name: string;
  document_url: string;
  status: string;
  reviewer_notes: string | null;
  created_at: Date;
  full_name: string;
  email: string;
}

interface RawReportRow {
  id: string;
  listing_id: string;
  reason: string;
  details: string;
  reporters_count: number;
  status: string;
  created_at: Date;
  listing_code: string;
  listing_title: string;
  listing_price_cents: number;
  owner_id: string;
  owner_name: string;
}

@Injectable()
export class AdminService {
  constructor(
    @Inject(PG_POOL) private readonly pool: Pool,
    @Inject(DRIZZLE_DB)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async getOverview(searchQuery?: string) {
    const q = searchQuery?.trim();
    const params: unknown[] = [];
    let filterSql = '';
    if (q) {
      params.push(`%${q}%`);
      filterSql = `WHERE (u.full_name ILIKE $1 OR u.email ILIKE $1 OR vr.registration_number ILIKE $1 OR vr.university_name ILIKE $1)`;
    }

    const verificationsRes = await this.pool.query<RawVerificationRow>(
      `
      SELECT
        vr.*,
        u.full_name,
        u.email
      FROM verification_requests vr
      JOIN users u ON u.id = vr.user_id
      ${filterSql}
      ORDER BY vr.created_at DESC
    `,
      params,
    );

    const reportsRes = await this.pool.query<RawReportRow>(`
      SELECT
        sr.*,
        l.code AS listing_code,
        l.title AS listing_title,
        l.price_cents AS listing_price_cents,
        l.owner_id AS owner_id,
        u.full_name AS owner_name
      FROM safety_reports sr
      JOIN listings l ON l.id = sr.listing_id
      JOIN users u ON u.id = l.owner_id
      ORDER BY sr.created_at DESC
    `);

    const [activeListingsRow] = await this.db
      .select({ value: count() })
      .from(schema.listings);

    const pendingVerifications = verificationsRes.rows.filter(
      (r) => r.status === 'PENDING' || r.status === 'IN_REVIEW',
    ).length;

    const pendingReports = reportsRes.rows.filter(
      (r) => r.status === 'PENDING',
    ).length;

    return {
      metrics: {
        pendingVerificationsCount: pendingVerifications,
        pendingReportsCount: pendingReports,
        activeListingsCount: activeListingsRow?.value ?? 12,
        networkTrustRate: '99.4%',
      },
      verifications: verificationsRes.rows.map((v) => ({
        id: v.id,
        userId: v.user_id,
        studentName: v.full_name,
        studentEmail: v.email,
        universityName: v.university_name,
        registrationNumber: v.registration_number,
        documentName: v.document_name,
        documentUrl: v.document_url,
        status: v.status,
        reviewerNotes: v.reviewer_notes,
        createdAt: new Date(v.created_at).toISOString(),
      })),
      reports: reportsRes.rows.map((r) => ({
        id: r.id,
        listingId: r.listing_id,
        listingCode: r.listing_code,
        listingTitle: r.listing_title,
        listingPriceCents: r.listing_price_cents,
        ownerId: r.owner_id,
        ownerName: r.owner_name,
        reason: r.reason,
        details: r.details,
        reportersCount: r.reporters_count,
        status: r.status,
        createdAt: new Date(r.created_at).toISOString(),
      })),
    };
  }

  async reviewVerification(id: string, dto: ReviewVerificationDto) {
    const [existing] = await this.db
      .select()
      .from(schema.verificationRequests)
      .where(eq(schema.verificationRequests.id, id))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Solicitação de verificação não encontrada.');
    }

    const [updated] = await this.db
      .update(schema.verificationRequests)
      .set({
        status: dto.decision,
        reviewerNotes: dto.reviewerNotes ?? existing.reviewerNotes,
        reviewedAt: new Date(),
      })
      .where(eq(schema.verificationRequests.id, id))
      .returning();

    const userStatus =
      dto.decision === DOC_VERIFICATION_DECISION.APPROVED
        ? VERIFICATION_STATUS.VERIFIED
        : dto.decision === DOC_VERIFICATION_DECISION.REJECTED
          ? VERIFICATION_STATUS.REJECTED
          : VERIFICATION_STATUS.PENDING_DOC;

    await this.db
      .update(schema.users)
      .set({
        verificationStatus: userStatus,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, existing.userId));

    return { verification: updated, userVerificationStatus: userStatus };
  }

  async reviewSafetyReport(id: string, dto: ReviewReportDto) {
    const [existing] = await this.db
      .select()
      .from(schema.safetyReports)
      .where(eq(schema.safetyReports.id, id))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Denúncia não encontrada.');
    }

    const [updated] = await this.db
      .update(schema.safetyReports)
      .set({ status: dto.action })
      .where(eq(schema.safetyReports.id, id))
      .returning();

    if (dto.action === SAFETY_REPORT_STATUS.PAUSED_LISTING) {
      await this.db
        .update(schema.listings)
        .set({ status: LISTING_STATUS.PAUSADO, updatedAt: new Date() })
        .where(eq(schema.listings.id, existing.listingId));
    } else if (dto.action === SAFETY_REPORT_STATUS.BANNED_USER) {
      const [listing] = await this.db
        .select()
        .from(schema.listings)
        .where(eq(schema.listings.id, existing.listingId))
        .limit(1);
      if (listing) {
        await this.db
          .update(schema.listings)
          .set({ status: LISTING_STATUS.PAUSADO, updatedAt: new Date() })
          .where(eq(schema.listings.id, listing.id));
        await this.db
          .update(schema.users)
          .set({ isBanned: true, updatedAt: new Date() })
          .where(eq(schema.users.id, listing.ownerId));
      }
    }

    return { report: updated };
  }

  async createSafetyReport(
    reporterId: string,
    dto: CreateSafetyReportDto,
  ) {
    const [created] = await this.db
      .insert(schema.safetyReports)
      .values({
        listingId: dto.listingId,
        reporterId,
        reason: dto.reason,
        details: dto.details,
        reportersCount: 1,
        status: SAFETY_REPORT_STATUS.PENDING,
      })
      .returning();

    return { report: created };
  }
}

@Controller()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('admin/overview')
  async getOverview(@Query('q') q?: string) {
    return this.adminService.getOverview(q);
  }

  @Patch('admin/verifications/:id')
  @UseGuards(JwtAuthGuard)
  async reviewVerification(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(ReviewVerificationDtoSchema))
    dto: ReviewVerificationDto,
  ) {
    return this.adminService.reviewVerification(id, dto);
  }

  @Patch('admin/reports/:id')
  @UseGuards(JwtAuthGuard)
  async reviewReport(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(ReviewReportDtoSchema)) dto: ReviewReportDto,
  ) {
    return this.adminService.reviewSafetyReport(id, dto);
  }

  @Post('reports')
  @UseGuards(JwtAuthGuard)
  async submitReport(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(CreateSafetyReportDtoSchema))
    dto: CreateSafetyReportDto,
  ) {
    return this.adminService.createSafetyReport(user.sub, dto);
  }
}

@Module({
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}

