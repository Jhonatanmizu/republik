import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq, sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { Pool } from 'pg';
import { getEnvConfig } from '../../config/env.config.js';
import {
  LISTING_STATUS,
  LISTING_TYPE,
  USER_ROLE,
} from '../../constants/app.constants.js';
import { DRIZZLE_DB, PG_POOL } from '../../database/database.constants.js';
import * as schema from '../../database/schema.js';
import type {
  CreateListingDto,
  ListingsQueryDto,
  UpdateListingDto,
  UpdateListingStatusDto,
} from './listings.dto.js';

export interface RoommateItem {
  readonly initials: string;
  readonly name: string;
  readonly course: string;
}

export interface ListingViewDto {
  readonly id: string;
  readonly slug: string;
  readonly code: string;
  readonly type: string;
  readonly title: string;
  readonly description: string;
  readonly priceCents: number;
  readonly neighborhood: string;
  readonly proximityLabel: string;
  readonly distanceMeters: number;
  readonly badgeText: string;
  readonly rating: string;
  readonly status: string;
  readonly isFeatured: boolean;
  readonly viewsCount: number;
  readonly favoritesCount: number;
  readonly leadsCount: number;
  readonly isSaved: boolean;
  readonly coverPhotoUrl: string;
  readonly photos: ReadonlyArray<{
    readonly id: string;
    readonly url: string;
    readonly caption: string;
    readonly isCover: boolean;
  }>;
  readonly university: {
    readonly code: string;
    readonly name: string;
    readonly campusName: string;
  };
  readonly owner: {
    readonly id: string;
    readonly fullName: string;
    readonly initials: string;
    readonly courseName: string;
    readonly courseSemester: string;
    readonly verificationStatus: string;
    readonly verifiedDomain: string | null;
    readonly whatsapp: string | null;
    readonly whatsappMasked: boolean;
  };
  readonly housing: {
    readonly modality: string;
    readonly baseRentCents: number;
    readonly condoAndBillsCents: number;
    readonly billsSummary: string;
    readonly billsIncluded: boolean;
    readonly includedExpenses: readonly string[];
    readonly furnished: boolean;
    readonly noGuarantor: boolean;
    readonly petsAllowed: boolean;
    readonly smokingPolicy: string;
    readonly genderPreference: string;
    readonly houseRoutine: string;
    readonly moveInDateLabel: string;
    readonly residentsSummary: string;
    readonly roommates: readonly RoommateItem[];
    readonly amenities: readonly string[];
  } | null;
  readonly marketplace: {
    readonly category: string;
    readonly condition: string;
    readonly conditionLabel: string;
    readonly retailPriceCents: number | null;
    readonly acceptsOffer: boolean;
    readonly isUrgentMoving: boolean;
    readonly disassemblesForTransport: boolean;
    readonly pickupLocationLabel: string;
    readonly pickupNotes: string;
  } | null;
  readonly createdAt: string;
}

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? 'R';
  const second = parts[1]?.[0] ?? parts[0]?.[1] ?? 'P';
  return `${first}${second}`.toUpperCase();
}

function slugifyTitle(title: string, code: string): string {
  const base = title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return `${base}-${code}`;
}

function parseRoommatesJson(raw: string | null | undefined): RoommateItem[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => {
      if (
        typeof item === 'object' &&
        item !== null &&
        'initials' in item &&
        'name' in item &&
        'course' in item &&
        typeof item.initials === 'string' &&
        typeof item.name === 'string' &&
        typeof item.course === 'string'
      ) {
        return [{ initials: item.initials, name: item.name, course: item.course }];
      }
      return [];
    });
  } catch {
    return [];
  }
}

interface RawListingQueryRow {
  id: string;
  slug: string;
  code: string;
  owner_id: string;
  university_id: string;
  type: string;
  title: string;
  description: string;
  price_cents: number;
  neighborhood: string;
  proximity_label: string;
  distance_meters: number;
  badge_text: string;
  rating: string;
  status: string;
  is_featured: boolean;
  views_count: number;
  favorites_count: number;
  leads_count: number;
  created_at: Date;
  uni_code: string;
  uni_name: string;
  uni_campus_name: string;
  owner_full_name: string;
  owner_course_name: string;
  owner_course_semester: string;
  owner_verification_status: string;
  owner_verified_domain: string | null;
  owner_whatsapp: string;
  owner_hide_whatsapp: boolean;
  h_modality: string | null;
  h_base_rent_cents: number | null;
  h_condo_and_bills_cents: number | null;
  h_bills_summary: string | null;
  h_bills_included: boolean | null;
  h_included_expenses: string[] | null;
  h_furnished: boolean | null;
  h_no_guarantor: boolean | null;
  h_pets_allowed: boolean | null;
  h_smoking_policy: string | null;
  h_gender_preference: string | null;
  h_house_routine: string | null;
  h_move_in_date_label: string | null;
  h_residents_summary: string | null;
  h_roommates_json: string | null;
  h_amenities: string[] | null;
  m_category: string | null;
  m_condition: string | null;
  m_condition_label: string | null;
  m_retail_price_cents: number | null;
  m_accepts_offer: boolean | null;
  m_is_urgent_moving: boolean | null;
  m_disassembles: boolean | null;
  m_pickup_location_label: string | null;
  m_pickup_notes: string | null;
}

@Injectable()
export class ListingsService {
  constructor(
    @Inject(PG_POOL) private readonly pool: Pool,
    @Inject(DRIZZLE_DB)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async findAll(
    query: ListingsQueryDto,
    viewerUserId?: string,
  ): Promise<ListingViewDto[]> {
    const conditions: string[] = [];
    const params: unknown[] = [];

    const pushParam = (val: unknown): string => {
      params.push(val);
      return `$${params.length}`;
    };

    if (query.includeAllStatuses !== 'true' && query.ownerOnly !== 'true') {
      conditions.push(`l.status != 'PAUSADO'`);
    }

    if (query.type) {
      conditions.push(`l.type = ${pushParam(query.type)}`);
    }

    if (query.university) {
      conditions.push(`UPPER(u.code) = UPPER(${pushParam(query.university)})`);
    }

    if (query.maxPriceCents !== undefined) {
      conditions.push(`l.price_cents <= ${pushParam(query.maxPriceCents)}`);
    }

    if (query.modality) {
      conditions.push(`hd.modality = ${pushParam(query.modality)}`);
    }

    if (query.billsIncluded === 'true') {
      conditions.push(`hd.bills_included = TRUE`);
    }

    if (query.furnished === 'true') {
      conditions.push(`hd.furnished = TRUE`);
    }

    if (query.petsAllowed === 'true') {
      conditions.push(`hd.pets_allowed = TRUE`);
    }

    if (query.genderPreference) {
      conditions.push(
        `hd.gender_preference = ${pushParam(query.genderPreference)}`,
      );
    }

    if (query.category) {
      conditions.push(`md.category = ${pushParam(query.category)}`);
    }

    if (query.urgentMoving === 'true') {
      conditions.push(`md.is_urgent_moving = TRUE`);
    }

    if (query.ownerOnly === 'true' && viewerUserId) {
      conditions.push(`l.owner_id = ${pushParam(viewerUserId)}`);
    }

    if (query.savedOnly === 'true' && viewerUserId) {
      conditions.push(
        `EXISTS (SELECT 1 FROM saved_listings sl WHERE sl.listing_id = l.id AND sl.user_id = ${pushParam(viewerUserId)})`,
      );
    }

    let orderByClause = `l.is_featured DESC, l.distance_meters ASC, l.created_at DESC`;
    const trimmedQ = query.q?.trim();
    if (trimmedQ) {
      const qParam = pushParam(trimmedQ);
      const likeParam = pushParam(`%${trimmedQ}%`);
      conditions.push(`(
        to_tsvector('portuguese', coalesce(l.title, '') || ' ' || coalesce(l.description, '') || ' ' || coalesce(l.neighborhood, '') || ' ' || coalesce(l.proximity_label, '') || ' ' || coalesce(u.code, ''))
        @@ websearch_to_tsquery('portuguese', ${qParam})
        OR word_similarity(${qParam}, l.title) > 0.25
        OR l.title ILIKE ${likeParam}
        OR l.neighborhood ILIKE ${likeParam}
        OR u.code ILIKE ${likeParam}
      )`);
      orderByClause = `
        ts_rank_cd(
          to_tsvector('portuguese', coalesce(l.title, '') || ' ' || coalesce(l.description, '') || ' ' || coalesce(l.neighborhood, '') || ' ' || coalesce(l.proximity_label, '')),
          websearch_to_tsquery('portuguese', ${qParam})
        ) + word_similarity(${qParam}, l.title) DESC,
        l.is_featured DESC
      `;
    }

    const whereSql =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sqlText = `
      SELECT
        l.*,
        u.code AS uni_code,
        u.name AS uni_name,
        u.campus_name AS uni_campus_name,
        usr.full_name AS owner_full_name,
        usr.course_name AS owner_course_name,
        usr.course_semester AS owner_course_semester,
        usr.verification_status AS owner_verification_status,
        usr.verified_domain AS owner_verified_domain,
        usr.whatsapp AS owner_whatsapp,
        usr.hide_whatsapp_for_guests AS owner_hide_whatsapp,
        hd.modality AS h_modality,
        hd.base_rent_cents AS h_base_rent_cents,
        hd.condo_and_bills_cents AS h_condo_and_bills_cents,
        hd.bills_summary AS h_bills_summary,
        hd.bills_included AS h_bills_included,
        hd.included_expenses AS h_included_expenses,
        hd.furnished AS h_furnished,
        hd.no_guarantor AS h_no_guarantor,
        hd.pets_allowed AS h_pets_allowed,
        hd.smoking_policy AS h_smoking_policy,
        hd.gender_preference AS h_gender_preference,
        hd.house_routine AS h_house_routine,
        hd.move_in_date_label AS h_move_in_date_label,
        hd.residents_summary AS h_residents_summary,
        hd.roommates_json AS h_roommates_json,
        hd.amenities AS h_amenities,
        md.category AS m_category,
        md.condition AS m_condition,
        md.condition_label AS m_condition_label,
        md.retail_price_cents AS m_retail_price_cents,
        md.accepts_offer AS m_accepts_offer,
        md.is_urgent_moving AS m_is_urgent_moving,
        md.disassembles_for_transport AS m_disassembles,
        md.pickup_location_label AS m_pickup_location_label,
        md.pickup_notes AS m_pickup_notes
      FROM listings l
      JOIN universities u ON u.id = l.university_id
      JOIN users usr ON usr.id = l.owner_id
      LEFT JOIN housing_details hd ON hd.listing_id = l.id
      LEFT JOIN marketplace_details md ON md.listing_id = l.id
      ${whereSql}
      ORDER BY ${orderByClause}
      LIMIT 60
    `;

    const res = await this.pool.query<RawListingQueryRow>(sqlText, params);
    return this.hydrateListingRows(res.rows, viewerUserId);
  }

  async findOneByIdOrSlug(
    idOrSlug: string,
    viewerUserId?: string,
  ): Promise<ListingViewDto> {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        idOrSlug,
      );

    const whereCond = isUuid
      ? `WHERE l.id = $1`
      : `WHERE l.slug = $1 OR l.code = $1`;

    const sqlText = `
      SELECT
        l.*,
        u.code AS uni_code,
        u.name AS uni_name,
        u.campus_name AS uni_campus_name,
        usr.full_name AS owner_full_name,
        usr.course_name AS owner_course_name,
        usr.course_semester AS owner_course_semester,
        usr.verification_status AS owner_verification_status,
        usr.verified_domain AS owner_verified_domain,
        usr.whatsapp AS owner_whatsapp,
        usr.hide_whatsapp_for_guests AS owner_hide_whatsapp,
        hd.modality AS h_modality,
        hd.base_rent_cents AS h_base_rent_cents,
        hd.condo_and_bills_cents AS h_condo_and_bills_cents,
        hd.bills_summary AS h_bills_summary,
        hd.bills_included AS h_bills_included,
        hd.included_expenses AS h_included_expenses,
        hd.furnished AS h_furnished,
        hd.no_guarantor AS h_no_guarantor,
        hd.pets_allowed AS h_pets_allowed,
        hd.smoking_policy AS h_smoking_policy,
        hd.gender_preference AS h_gender_preference,
        hd.house_routine AS h_house_routine,
        hd.move_in_date_label AS h_move_in_date_label,
        hd.residents_summary AS h_residents_summary,
        hd.roommates_json AS h_roommates_json,
        hd.amenities AS h_amenities,
        md.category AS m_category,
        md.condition AS m_condition,
        md.condition_label AS m_condition_label,
        md.retail_price_cents AS m_retail_price_cents,
        md.accepts_offer AS m_accepts_offer,
        md.is_urgent_moving AS m_is_urgent_moving,
        md.disassembles_for_transport AS m_disassembles,
        md.pickup_location_label AS m_pickup_location_label,
        md.pickup_notes AS m_pickup_notes
      FROM listings l
      JOIN universities u ON u.id = l.university_id
      JOIN users usr ON usr.id = l.owner_id
      LEFT JOIN housing_details hd ON hd.listing_id = l.id
      LEFT JOIN marketplace_details md ON md.listing_id = l.id
      ${whereCond}
      LIMIT 1
    `;

    const res = await this.pool.query<RawListingQueryRow>(sqlText, [idOrSlug]);
    const row = res.rows[0];
    if (!row) {
      throw new NotFoundException('Anúncio não encontrado.');
    }

    await this.db
      .update(schema.listings)
      .set({ viewsCount: sql`${schema.listings.viewsCount} + 1` })
      .where(eq(schema.listings.id, row.id));

    const hydrated = await this.hydrateListingRows([row], viewerUserId);
    const first = hydrated[0];
    if (!first) {
      throw new NotFoundException('Anúncio não encontrado.');
    }
    return first;
  }

  private async hydrateListingRows(
    rows: RawListingQueryRow[],
    viewerUserId?: string,
  ): Promise<ListingViewDto[]> {
    if (rows.length === 0) {
      return [];
    }

    const allPhotos = await this.db.select().from(schema.listingPhotos);
    const photosByListing = new Map<
      string,
      Array<{ id: string; url: string; caption: string; isCover: boolean }>
    >();
    for (const p of allPhotos) {
      const list = photosByListing.get(p.listingId) ?? [];
      list.push({
        id: p.id,
        url: p.url,
        caption: p.caption,
        isCover: p.isCover,
      });
      photosByListing.set(p.listingId, list);
    }

    const savedSet = new Set<string>();
    if (viewerUserId) {
      const savedRows = await this.db
        .select()
        .from(schema.savedListings)
        .where(eq(schema.savedListings.userId, viewerUserId));
      for (const s of savedRows) {
        savedSet.add(s.listingId);
      }
    }

    const env = getEnvConfig();
    return rows.map((r) => {
      const photos = photosByListing.get(r.id) ?? [];
      const cover =
        photos.find((p) => p.isCover)?.url ??
        photos[0]?.url ??
        (r.type === LISTING_TYPE.HOUSING
          ? env.DEFAULT_COVER_PHOTO_HOUSING
          : env.DEFAULT_COVER_PHOTO_MARKETPLACE);

      const canSeeWhatsapp =
        Boolean(viewerUserId) || !r.owner_hide_whatsapp;

      return {
        id: r.id,
        slug: r.slug,
        code: r.code,
        type: r.type,
        title: r.title,
        description: r.description,
        priceCents: r.price_cents,
        neighborhood: r.neighborhood,
        proximityLabel: r.proximity_label,
        distanceMeters: r.distance_meters,
        badgeText: r.badge_text,
        rating: r.rating,
        status: r.status,
        isFeatured: r.is_featured,
        viewsCount: r.views_count,
        favoritesCount: r.favorites_count,
        leadsCount: r.leads_count,
        isSaved: savedSet.has(r.id),
        coverPhotoUrl: cover,
        photos,
        university: {
          code: r.uni_code,
          name: r.uni_name,
          campusName: r.uni_campus_name,
        },
        owner: {
          id: r.owner_id,
          fullName: r.owner_full_name,
          initials: getInitials(r.owner_full_name),
          courseName: r.owner_course_name,
          courseSemester: r.owner_course_semester,
          verificationStatus: r.owner_verification_status,
          verifiedDomain: r.owner_verified_domain,
          whatsapp: canSeeWhatsapp ? r.owner_whatsapp : null,
          whatsappMasked: !canSeeWhatsapp,
        },
        housing:
          r.type === LISTING_TYPE.HOUSING && r.h_modality
            ? {
                modality: r.h_modality,
                baseRentCents: r.h_base_rent_cents ?? r.price_cents,
                condoAndBillsCents: r.h_condo_and_bills_cents ?? 0,
                billsSummary: r.h_bills_summary ?? '(contas inclusas)',
                billsIncluded: r.h_bills_included ?? true,
                includedExpenses: r.h_included_expenses ?? [],
                furnished: r.h_furnished ?? true,
                noGuarantor: r.h_no_guarantor ?? true,
                petsAllowed: r.h_pets_allowed ?? false,
                smokingPolicy: r.h_smoking_policy ?? 'Apenas na varanda',
                genderPreference: r.h_gender_preference ?? 'MISTO',
                houseRoutine: r.h_house_routine ?? 'Perfil de silêncio p/ estudos',
                moveInDateLabel:
                  r.h_move_in_date_label ?? 'Entrada Imediata',
                residentsSummary:
                  r.h_residents_summary ?? 'Estudantes da universidade',
                roommates: parseRoommatesJson(r.h_roommates_json),
                amenities: r.h_amenities ?? [],
              }
            : null,
        marketplace:
          r.type === LISTING_TYPE.MARKETPLACE && r.m_category
            ? {
                category: r.m_category,
                condition: r.m_condition ?? 'SEMINOVO',
                conditionLabel: r.m_condition_label ?? 'Seminovo',
                retailPriceCents: r.m_retail_price_cents,
                acceptsOffer: r.m_accepts_offer ?? true,
                isUrgentMoving: r.m_is_urgent_moving ?? false,
                disassemblesForTransport: r.m_disassembles ?? true,
                pickupLocationLabel:
                  r.m_pickup_location_label ?? 'Retirar próximo ao campus',
                pickupNotes: r.m_pickup_notes ?? '',
              }
            : null,
        createdAt: new Date(r.created_at).toISOString(),
      };
    });
  }

  async create(
    ownerId: string,
    dto: CreateListingDto,
  ): Promise<ListingViewDto> {
    const [uni] = await this.db
      .select()
      .from(schema.universities)
      .where(eq(schema.universities.code, dto.universityCode.toUpperCase()))
      .limit(1);

    const fallbackUni =
      uni ?? (await this.db.select().from(schema.universities).limit(1))[0];
    if (!fallbackUni) {
      throw new NotFoundException('Universidade de referência não encontrada.');
    }

    const code = String(Math.floor(1000 + Math.random() * 9000));
    const slug = slugifyTitle(dto.title, code);

    const [created] = await this.db
      .insert(schema.listings)
      .values({
        slug,
        code,
        ownerId,
        universityId: fallbackUni.id,
        type: dto.type,
        title: dto.title,
        description: dto.description,
        priceCents: dto.priceCents,
        neighborhood: dto.neighborhood,
        proximityLabel: dto.proximityLabel,
        distanceMeters: dto.distanceMeters,
        badgeText:
          dto.badgeText ??
          (dto.type === LISTING_TYPE.HOUSING ? 'Vaga Imediata' : 'Seminovo'),
        status: LISTING_STATUS.DISPONIVEL,
      })
      .returning();

    if (!created) {
      throw new NotFoundException('Falha ao criar anúncio.');
    }

    if (dto.type === LISTING_TYPE.HOUSING) {
      const h = dto.housing;
      await this.db.insert(schema.housingDetails).values({
        listingId: created.id,
        modality: h?.modality ?? 'QUARTO_INDIVIDUAL',
        baseRentCents: h?.baseRentCents ?? dto.priceCents,
        condoAndBillsCents: h?.condoAndBillsCents ?? 0,
        billsSummary: h?.billsSummary ?? '(contas inclusas)',
        billsIncluded: h?.billsIncluded ?? true,
        includedExpenses: h?.includedExpenses ?? ['AGUA', 'LUZ', 'INTERNET'],
        furnished: h?.furnished ?? true,
        noGuarantor: h?.noGuarantor ?? true,
        petsAllowed: h?.petsAllowed ?? false,
        smokingPolicy: h?.smokingPolicy ?? 'Apenas na varanda',
        genderPreference: h?.genderPreference ?? 'MISTO',
        houseRoutine: h?.houseRoutine ?? 'Perfil de silêncio p/ estudos',
        moveInDateLabel: h?.moveInDateLabel ?? 'Entrada Imediata',
        residentsSummary:
          h?.residentsSummary ?? 'Estudantes verificados do campus',
        amenities: h?.amenities ?? ['Wi-Fi 500Mb incluso', 'Quarto mobiliado'],
      });
    } else {
      const m = dto.marketplace;
      await this.db.insert(schema.marketplaceDetails).values({
        listingId: created.id,
        category: m?.category ?? 'MOVEIS',
        condition: m?.condition ?? 'SEMINOVO',
        conditionLabel: m?.conditionLabel ?? 'Seminovo (Nota 9/10)',
        retailPriceCents: m?.retailPriceCents ?? null,
        acceptsOffer: m?.acceptsOffer ?? true,
        isUrgentMoving: m?.isUrgentMoving ?? false,
        disassemblesForTransport: m?.disassemblesForTransport ?? true,
        pickupLocationLabel:
          m?.pickupLocationLabel ?? 'Retirar próximo ao campus',
        pickupNotes:
          m?.pickupNotes ??
          'Combine a retirada na portaria ou no Centro Acadêmico.',
      });
    }

    const env = getEnvConfig();
    const photosToInsert =
      dto.photos.length > 0
        ? dto.photos
        : [
            {
              url:
                dto.type === LISTING_TYPE.HOUSING
                  ? env.DEFAULT_COVER_PHOTO_HOUSING
                  : env.DEFAULT_COVER_PHOTO_MARKETPLACE,
              caption: dto.title,
              isCover: true,
            },
          ];

    await this.db.insert(schema.listingPhotos).values(
      photosToInsert.map((p, idx) => ({
        listingId: created.id,
        url: p.url,
        caption: p.caption ?? '',
        isCover: idx === 0 ? true : Boolean(p.isCover),
        sortOrder: idx,
      })),
    );

    return this.findOneByIdOrSlug(created.id, ownerId);
  }

  async update(
    listingId: string,
    actorId: string,
    actorRole: string,
    dto: UpdateListingDto,
  ): Promise<ListingViewDto> {
    const [existing] = await this.db
      .select()
      .from(schema.listings)
      .where(eq(schema.listings.id, listingId))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Anúncio não encontrado.');
    }

    if (existing.ownerId !== actorId && actorRole !== USER_ROLE.ADMIN) {
      throw new ForbiddenException(
        'Você só pode editar seus próprios anúncios.',
      );
    }

    const listingPatch: Partial<typeof schema.listings.$inferInsert> = {
      updatedAt: new Date(),
    };
    if (dto.title !== undefined) listingPatch.title = dto.title;
    if (dto.description !== undefined)
      listingPatch.description = dto.description;
    if (dto.priceCents !== undefined) listingPatch.priceCents = dto.priceCents;
    if (dto.neighborhood !== undefined)
      listingPatch.neighborhood = dto.neighborhood;
    if (dto.proximityLabel !== undefined)
      listingPatch.proximityLabel = dto.proximityLabel;
    if (dto.status !== undefined) listingPatch.status = dto.status;

    await this.db
      .update(schema.listings)
      .set(listingPatch)
      .where(eq(schema.listings.id, listingId));

    if (dto.housing && existing.type === LISTING_TYPE.HOUSING) {
      const hPatch: Partial<typeof schema.housingDetails.$inferInsert> = {};
      if (dto.housing.baseRentCents !== undefined) {
        hPatch.baseRentCents = dto.housing.baseRentCents;
      }
      if (dto.housing.condoAndBillsCents !== undefined) {
        hPatch.condoAndBillsCents = dto.housing.condoAndBillsCents;
      }
      if (dto.housing.includedExpenses !== undefined) {
        hPatch.includedExpenses = dto.housing.includedExpenses;
      }
      if (dto.housing.genderPreference !== undefined) {
        hPatch.genderPreference = dto.housing.genderPreference;
      }
      if (dto.housing.petsAllowed !== undefined) {
        hPatch.petsAllowed = dto.housing.petsAllowed;
      }
      if (dto.housing.smokingPolicy !== undefined) {
        hPatch.smokingPolicy = dto.housing.smokingPolicy;
      }
      if (dto.housing.houseRoutine !== undefined) {
        hPatch.houseRoutine = dto.housing.houseRoutine;
      }
      if (dto.housing.furnished !== undefined) {
        hPatch.furnished = dto.housing.furnished;
      }
      if (Object.keys(hPatch).length > 0) {
        await this.db
          .update(schema.housingDetails)
          .set(hPatch)
          .where(eq(schema.housingDetails.listingId, listingId));
      }
    }

    if (dto.photos && dto.photos.length > 0) {
      await this.db
        .delete(schema.listingPhotos)
        .where(eq(schema.listingPhotos.listingId, listingId));
      await this.db.insert(schema.listingPhotos).values(
        dto.photos.map((p, idx) => ({
          listingId,
          url: p.url,
          caption: p.caption ?? '',
          isCover: p.isCover ?? idx === 0,
          sortOrder: idx,
        })),
      );
    }

    return this.findOneByIdOrSlug(listingId, actorId);
  }

  async updateStatus(
    listingId: string,
    actorId: string,
    actorRole: string,
    dto: UpdateListingStatusDto,
  ): Promise<ListingViewDto> {
    return this.update(listingId, actorId, actorRole, { status: dto.status });
  }

  async toggleFavorite(
    listingId: string,
    userId: string,
  ): Promise<{ isSaved: boolean; favoritesCount: number }> {
    const [existing] = await this.db
      .select()
      .from(schema.savedListings)
      .where(
        and(
          eq(schema.savedListings.userId, userId),
          eq(schema.savedListings.listingId, listingId),
        ),
      )
      .limit(1);

    if (existing) {
      await this.db
        .delete(schema.savedListings)
        .where(
          and(
            eq(schema.savedListings.userId, userId),
            eq(schema.savedListings.listingId, listingId),
          ),
        );
      const [updated] = await this.db
        .update(schema.listings)
        .set({
          favoritesCount: sql`GREATEST(0, ${schema.listings.favoritesCount} - 1)`,
        })
        .where(eq(schema.listings.id, listingId))
        .returning();
      return {
        isSaved: false,
        favoritesCount: updated?.favoritesCount ?? 0,
      };
    }

    await this.db.insert(schema.savedListings).values({
      userId,
      listingId,
    });

    const [updated] = await this.db
      .update(schema.listings)
      .set({
        favoritesCount: sql`${schema.listings.favoritesCount} + 1`,
      })
      .where(eq(schema.listings.id, listingId))
      .returning();

    return {
      isSaved: true,
      favoritesCount: updated?.favoritesCount ?? 1,
    };
  }

  async remove(
    listingId: string,
    actorId: string,
    actorRole: string,
  ): Promise<{ deleted: boolean }> {
    const [existing] = await this.db
      .select()
      .from(schema.listings)
      .where(eq(schema.listings.id, listingId))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Anúncio não encontrado.');
    }

    if (existing.ownerId !== actorId && actorRole !== USER_ROLE.ADMIN) {
      throw new ForbiddenException(
        'Você só pode excluir seus próprios anúncios.',
      );
    }

    await this.db
      .delete(schema.listings)
      .where(eq(schema.listings.id, listingId));

    return { deleted: true };
  }
}

