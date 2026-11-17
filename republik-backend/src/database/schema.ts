import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import type {
  DocVerificationDecision,
  EnrollmentStatus,
  GenderPreference,
  HousingModality,
  ItemCondition,
  ListingStatus,
  ListingType,
  MarketplaceCategory,
  OtpPurpose,
  SafetyReportStatus,
  UserRole,
  VerificationStatus,
} from '../constants/app.constants.js';

export const universities = pgTable('universities', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  campusName: text('campus_name').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  emailDomains: text('email_domains').array().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  fullName: text('full_name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  whatsapp: text('whatsapp').notNull(),
  hideWhatsappForGuests: boolean('hide_whatsapp_for_guests')
    .default(true)
    .notNull(),
  avatarUrl: text('avatar_url'),
  universityId: uuid('university_id').references(() => universities.id, {
    onDelete: 'set null',
  }),
  courseName: text('course_name').default('Graduação').notNull(),
  courseSemester: text('course_semester').default('1º Semestre').notNull(),
  enrollmentStatus: text('enrollment_status')
    .$type<EnrollmentStatus>()
    .default('CURSANDO')
    .notNull(),
  verificationStatus: text('verification_status')
    .$type<VerificationStatus>()
    .default('UNVERIFIED')
    .notNull(),
  verifiedDomain: text('verified_domain'),
  role: text('role').$type<UserRole>().default('STUDENT').notNull(),
  isBanned: boolean('is_banned').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull().unique(),
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const otpCodes = pgTable('otp_codes', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  codeHash: text('code_hash').notNull(),
  purpose: text('purpose').$type<OtpPurpose>().notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  consumedAt: timestamp('consumed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const listings = pgTable('listings', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  code: text('code').notNull().unique(),
  ownerId: uuid('owner_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  universityId: uuid('university_id')
    .notNull()
    .references(() => universities.id, { onDelete: 'restrict' }),
  type: text('type').$type<ListingType>().notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  priceCents: integer('price_cents').notNull(),
  neighborhood: text('neighborhood').notNull(),
  proximityLabel: text('proximity_label').notNull(),
  distanceMeters: integer('distance_meters').default(500).notNull(),
  badgeText: text('badge_text').default('Vaga Imediata').notNull(),
  rating: text('rating').default('4.95').notNull(),
  status: text('status')
    .$type<ListingStatus>()
    .default('DISPONIVEL')
    .notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  viewsCount: integer('views_count').default(0).notNull(),
  favoritesCount: integer('favorites_count').default(0).notNull(),
  leadsCount: integer('leads_count').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const housingDetails = pgTable('housing_details', {
  listingId: uuid('listing_id')
    .primaryKey()
    .references(() => listings.id, { onDelete: 'cascade' }),
  modality: text('modality')
    .$type<HousingModality>()
    .default('QUARTO_INDIVIDUAL')
    .notNull(),
  baseRentCents: integer('base_rent_cents').notNull(),
  condoAndBillsCents: integer('condo_and_bills_cents').default(0).notNull(),
  billsSummary: text('bills_summary').default('(contas inclusas)').notNull(),
  billsIncluded: boolean('bills_included').default(true).notNull(),
  includedExpenses: text('included_expenses').array().notNull(),
  furnished: boolean('furnished').default(true).notNull(),
  noGuarantor: boolean('no_guarantor').default(true).notNull(),
  petsAllowed: boolean('pets_allowed').default(false).notNull(),
  smokingPolicy: text('smoking_policy')
    .default('Apenas na varanda / área externa')
    .notNull(),
  genderPreference: text('gender_preference')
    .$type<GenderPreference>()
    .default('MISTO')
    .notNull(),
  houseRoutine: text('house_routine')
    .default('Perfil de silêncio p/ estudos durante a semana')
    .notNull(),
  moveInDateLabel: text('move_in_date_label')
    .default('Entrada Imediata (Semestre Atual)')
    .notNull(),
  residentsSummary: text('residents_summary')
    .default('Estudantes de Graduação')
    .notNull(),
  roommatesJson: text('roommates_json').default('[]').notNull(),
  amenities: text('amenities').array().notNull(),
});

export const marketplaceDetails = pgTable('marketplace_details', {
  listingId: uuid('listing_id')
    .primaryKey()
    .references(() => listings.id, { onDelete: 'cascade' }),
  category: text('category')
    .$type<MarketplaceCategory>()
    .default('MOVEIS')
    .notNull(),
  condition: text('condition')
    .$type<ItemCondition>()
    .default('SEMINOVO')
    .notNull(),
  conditionLabel: text('condition_label')
    .default('Seminovo (Nota 9/10)')
    .notNull(),
  retailPriceCents: integer('retail_price_cents'),
  acceptsOffer: boolean('accepts_offer').default(true).notNull(),
  isUrgentMoving: boolean('is_urgent_moving').default(false).notNull(),
  disassemblesForTransport: boolean('disassembles_for_transport')
    .default(true)
    .notNull(),
  pickupLocationLabel: text('pickup_location_label')
    .default('Retirar próximo ao campus')
    .notNull(),
  pickupNotes: text('pickup_notes')
    .default('Combine a retirada na portaria ou no Centro Acadêmico.')
    .notNull(),
});

export const listingPhotos = pgTable('listing_photos', {
  id: uuid('id').defaultRandom().primaryKey(),
  listingId: uuid('listing_id')
    .notNull()
    .references(() => listings.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  caption: text('caption').default('').notNull(),
  isCover: boolean('is_cover').default(false).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
});

export const savedListings = pgTable(
  'saved_listings',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    listingId: uuid('listing_id')
      .notNull()
      .references(() => listings.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.listingId] })],
);

export const conversations = pgTable('conversations', {
  id: uuid('id').defaultRandom().primaryKey(),
  listingId: uuid('listing_id')
    .notNull()
    .references(() => listings.id, { onDelete: 'cascade' }),
  buyerId: uuid('buyer_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  sellerId: uuid('seller_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  whatsappRevealedByHost: boolean('whatsapp_revealed_by_host')
    .default(false)
    .notNull(),
  whatsappRequestedByBuyer: boolean('whatsapp_requested_by_buyer')
    .default(false)
    .notNull(),
  lastMessagePreview: text('last_message_preview').default('').notNull(),
  lastMessageAt: timestamp('last_message_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  conversationId: uuid('conversation_id')
    .notNull()
    .references(() => conversations.id, { onDelete: 'cascade' }),
  senderId: uuid('sender_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  body: text('body').notNull(),
  isSystemMessage: boolean('is_system_message').default(false).notNull(),
  readAt: timestamp('read_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const verificationRequests = pgTable('verification_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  universityName: text('university_name').notNull(),
  registrationNumber: text('registration_number').notNull(),
  documentName: text('document_name').notNull(),
  documentUrl: text('document_url').notNull(),
  status: text('status')
    .$type<DocVerificationDecision>()
    .default('PENDING')
    .notNull(),
  reviewerNotes: text('reviewer_notes'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
});

export const safetyReports = pgTable('safety_reports', {
  id: uuid('id').defaultRandom().primaryKey(),
  listingId: uuid('listing_id')
    .notNull()
    .references(() => listings.id, { onDelete: 'cascade' }),
  reporterId: uuid('reporter_id').references(() => users.id, {
    onDelete: 'set null',
  }),
  reason: text('reason').notNull(),
  details: text('details').notNull(),
  reportersCount: integer('reporters_count').default(1).notNull(),
  status: text('status')
    .$type<SafetyReportStatus>()
    .default('PENDING')
    .notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

