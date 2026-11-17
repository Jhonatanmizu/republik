import { z } from "zod";

export const RoommateSchema = z.object({
  initials: z.string(),
  name: z.string(),
  course: z.string(),
});

export type Roommate = z.infer<typeof RoommateSchema>;

export const ListingPhotoSchema = z.object({
  id: z.string(),
  url: z.string(),
  caption: z.string(),
  isCover: z.boolean(),
});

export type ListingPhoto = z.infer<typeof ListingPhotoSchema>;

export const HousingDetailSchema = z.object({
  modality: z.string(),
  baseRentCents: z.number(),
  condoAndBillsCents: z.number(),
  billsSummary: z.string(),
  billsIncluded: z.boolean(),
  includedExpenses: z.array(z.string()),
  furnished: z.boolean(),
  noGuarantor: z.boolean(),
  petsAllowed: z.boolean(),
  smokingPolicy: z.string(),
  genderPreference: z.string(),
  houseRoutine: z.string(),
  moveInDateLabel: z.string(),
  residentsSummary: z.string(),
  roommates: z.array(RoommateSchema),
  amenities: z.array(z.string()),
});

export type HousingDetail = z.infer<typeof HousingDetailSchema>;

export const MarketplaceDetailSchema = z.object({
  category: z.string(),
  condition: z.string(),
  conditionLabel: z.string(),
  retailPriceCents: z.number().nullable(),
  acceptsOffer: z.boolean(),
  isUrgentMoving: z.boolean(),
  disassemblesForTransport: z.boolean(),
  pickupLocationLabel: z.string(),
  pickupNotes: z.string(),
});

export type MarketplaceDetail = z.infer<typeof MarketplaceDetailSchema>;

export const ListingItemSchema = z.object({
  id: z.string(),
  slug: z.string(),
  code: z.string(),
  type: z.enum(["HOUSING", "MARKETPLACE"]),
  title: z.string(),
  description: z.string(),
  priceCents: z.number(),
  neighborhood: z.string(),
  proximityLabel: z.string(),
  distanceMeters: z.number(),
  badgeText: z.string(),
  rating: z.string(),
  status: z.enum(["DISPONIVEL", "RESERVADO", "ALUGADO_VENDIDO", "PAUSADO"]),
  isFeatured: z.boolean(),
  viewsCount: z.number(),
  favoritesCount: z.number(),
  leadsCount: z.number(),
  isSaved: z.boolean(),
  coverPhotoUrl: z.string(),
  photos: z.array(ListingPhotoSchema),
  university: z.object({
    code: z.string(),
    name: z.string(),
    campusName: z.string(),
  }),
  owner: z.object({
    id: z.string(),
    fullName: z.string(),
    initials: z.string(),
    courseName: z.string(),
    courseSemester: z.string(),
    verificationStatus: z.string(),
    verifiedDomain: z.string().nullable(),
    whatsapp: z.string().nullable(),
    whatsappMasked: z.boolean(),
  }),
  housing: HousingDetailSchema.nullable(),
  marketplace: MarketplaceDetailSchema.nullable(),
  createdAt: z.string(),
});

export type ListingItem = z.infer<typeof ListingItemSchema>;

export const UserProfileSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string(),
  whatsapp: z.string(),
  hideWhatsappForGuests: z.boolean(),
  avatarUrl: z.string().nullable(),
  universityId: z.string().nullable(),
  universityCode: z.string(),
  universityName: z.string(),
  courseName: z.string(),
  courseSemester: z.string(),
  enrollmentStatus: z.string(),
  verificationStatus: z.string(),
  verifiedDomain: z.string().nullable(),
  role: z.string(),
  createdAt: z.string(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

export const ConversationItemSchema = z.object({
  id: z.string(),
  listing: z.object({
    id: z.string(),
    title: z.string(),
    slug: z.string(),
    code: z.string(),
    type: z.string(),
    priceCents: z.number(),
  }),
  roleInConversation: z.enum(["BUYER", "HOST"]),
  peer: z.object({
    id: z.string(),
    fullName: z.string(),
    initials: z.string(),
    courseName: z.string(),
    verifiedDomain: z.string(),
    whatsapp: z.string().nullable(),
  }),
  whatsappRevealedByHost: z.boolean(),
  whatsappRequestedByBuyer: z.boolean(),
  unreadCount: z.number(),
  lastMessagePreview: z.string(),
  lastMessageAt: z.string(),
});

export type ConversationItem = z.infer<typeof ConversationItemSchema>;

export const ChatMessageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  senderId: z.string(),
  isMine: z.boolean(),
  body: z.string(),
  isSystemMessage: z.boolean(),
  readAt: z.string().nullable(),
  createdAt: z.string(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const AdminVerificationItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  studentName: z.string(),
  studentEmail: z.string(),
  universityName: z.string(),
  registrationNumber: z.string(),
  documentName: z.string(),
  documentUrl: z.string(),
  status: z.string(),
  reviewerNotes: z.string().nullable(),
  createdAt: z.string(),
});

export type AdminVerificationItem = z.infer<typeof AdminVerificationItemSchema>;

export const AdminSafetyReportSchema = z.object({
  id: z.string(),
  listingId: z.string(),
  listingCode: z.string(),
  listingTitle: z.string(),
  listingPriceCents: z.number(),
  ownerId: z.string(),
  ownerName: z.string(),
  reason: z.string(),
  details: z.string(),
  reportersCount: z.number(),
  status: z.string(),
  createdAt: z.string(),
});

export type AdminSafetyReport = z.infer<typeof AdminSafetyReportSchema>;

export const AdminOverviewSchema = z.object({
  metrics: z.object({
    pendingVerificationsCount: z.number(),
    pendingReportsCount: z.number(),
    activeListingsCount: z.number(),
    networkTrustRate: z.string(),
  }),
  verifications: z.array(AdminVerificationItemSchema),
  reports: z.array(AdminSafetyReportSchema),
});

export type AdminOverview = z.infer<typeof AdminOverviewSchema>;

export function formatCurrencyBRL(cents: number): string {
  const reais = Math.round(cents / 100);
  return `R$ ${reais.toLocaleString("pt-BR")}`;
}

export function formatExactBRL(cents: number): string {
  const reais = cents / 100;
  return reais.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
