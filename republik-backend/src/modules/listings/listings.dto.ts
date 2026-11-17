import { z } from 'zod';
import {
  GENDER_PREFERENCE,
  HOUSING_MODALITY,
  ITEM_CONDITION,
  LISTING_STATUS,
  LISTING_TYPE,
  MARKETPLACE_CATEGORY,
} from '../../constants/app.constants.js';

export const ListingsQueryDtoSchema = z.object({
  type: z.enum([LISTING_TYPE.HOUSING, LISTING_TYPE.MARKETPLACE]).optional(),
  q: z.string().max(150).optional(),
  university: z.string().max(30).optional(),
  modality: z
    .enum([
      HOUSING_MODALITY.QUARTO_INDIVIDUAL,
      HOUSING_MODALITY.SUITE,
      HOUSING_MODALITY.VAGA_COMPARTILHADA,
      HOUSING_MODALITY.REPUBLICA,
      HOUSING_MODALITY.STUDIO_KITNET,
    ])
    .optional(),
  category: z
    .enum([
      MARKETPLACE_CATEGORY.MOVEIS,
      MARKETPLACE_CATEGORY.ELETRODOMESTICOS,
      MARKETPLACE_CATEGORY.ELETRONICOS_ESTUDO,
      MARKETPLACE_CATEGORY.UTENSILIOS,
      MARKETPLACE_CATEGORY.BICICLETAS,
    ])
    .optional(),
  maxPriceCents: z.coerce.number().int().positive().optional(),
  billsIncluded: z.enum(['true', 'false']).optional(),
  furnished: z.enum(['true', 'false']).optional(),
  petsAllowed: z.enum(['true', 'false']).optional(),
  genderPreference: z
    .enum([
      GENDER_PREFERENCE.MISTO,
      GENDER_PREFERENCE.SO_MENINAS,
      GENDER_PREFERENCE.SO_MENINOS,
    ])
    .optional(),
  urgentMoving: z.enum(['true', 'false']).optional(),
  ownerOnly: z.enum(['true', 'false']).optional(),
  savedOnly: z.enum(['true', 'false']).optional(),
  includeAllStatuses: z.enum(['true', 'false']).optional(),
});

export type ListingsQueryDto = z.infer<typeof ListingsQueryDtoSchema>;

export const CreateListingDtoSchema = z.object({
  type: z.enum([LISTING_TYPE.HOUSING, LISTING_TYPE.MARKETPLACE]),
  title: z.string().min(5, 'O título deve ter pelo menos 5 caracteres.').max(160),
  description: z
    .string()
    .min(10, 'A descrição deve ter pelo menos 10 caracteres.')
    .max(3000),
  priceCents: z.number().int().positive(),
  universityCode: z.string().min(2).max(20).default('USP'),
  neighborhood: z.string().min(2).max(120).default('Próximo ao Campus'),
  proximityLabel: z.string().min(2).max(120).default('5 min a pé do campus'),
  distanceMeters: z.number().int().nonnegative().optional().default(450),
  badgeText: z.string().max(60).optional(),
  photos: z
    .array(
      z.object({
        url: z.string().min(3),
        caption: z.string().optional().default(''),
        isCover: z.boolean().optional().default(false),
      }),
    )
    .optional()
    .default([]),
  housing: z
    .object({
      modality: z
        .enum([
          HOUSING_MODALITY.QUARTO_INDIVIDUAL,
          HOUSING_MODALITY.SUITE,
          HOUSING_MODALITY.VAGA_COMPARTILHADA,
          HOUSING_MODALITY.REPUBLICA,
          HOUSING_MODALITY.STUDIO_KITNET,
        ])
        .default(HOUSING_MODALITY.QUARTO_INDIVIDUAL),
      baseRentCents: z.number().int().nonnegative(),
      condoAndBillsCents: z.number().int().nonnegative().default(0),
      billsSummary: z.string().max(80).default('(contas inclusas)'),
      billsIncluded: z.boolean().default(true),
      includedExpenses: z.array(z.string()).default(['AGUA', 'LUZ', 'INTERNET']),
      furnished: z.boolean().default(true),
      noGuarantor: z.boolean().default(true),
      petsAllowed: z.boolean().default(false),
      smokingPolicy: z.string().max(120).default('Apenas na varanda'),
      genderPreference: z
        .enum([
          GENDER_PREFERENCE.MISTO,
          GENDER_PREFERENCE.SO_MENINAS,
          GENDER_PREFERENCE.SO_MENINOS,
        ])
        .default(GENDER_PREFERENCE.MISTO),
      houseRoutine: z.string().max(160).default('Perfil de silêncio p/ estudos'),
      moveInDateLabel: z
        .string()
        .max(120)
        .default('Entrada Imediata (Semestre Atual)'),
      residentsSummary: z
        .string()
        .max(160)
        .default('Estudantes verificados do campus'),
      amenities: z
        .array(z.string())
        .default(['Wi-Fi 500Mb incluso', 'Quarto mobiliado']),
    })
    .optional(),
  marketplace: z
    .object({
      category: z
        .enum([
          MARKETPLACE_CATEGORY.MOVEIS,
          MARKETPLACE_CATEGORY.ELETRODOMESTICOS,
          MARKETPLACE_CATEGORY.ELETRONICOS_ESTUDO,
          MARKETPLACE_CATEGORY.UTENSILIOS,
          MARKETPLACE_CATEGORY.BICICLETAS,
        ])
        .default(MARKETPLACE_CATEGORY.MOVEIS),
      condition: z
        .enum([
          ITEM_CONDITION.NOVO,
          ITEM_CONDITION.ESTADO_DE_NOVO,
          ITEM_CONDITION.SEMINOVO,
          ITEM_CONDITION.USADO,
        ])
        .default(ITEM_CONDITION.SEMINOVO),
      conditionLabel: z.string().max(80).default('Seminovo (Nota 9/10)'),
      retailPriceCents: z.number().int().positive().nullable().optional(),
      acceptsOffer: z.boolean().default(true),
      isUrgentMoving: z.boolean().default(false),
      disassemblesForTransport: z.boolean().default(true),
      pickupLocationLabel: z
        .string()
        .max(120)
        .default('Retirar próximo ao campus'),
      pickupNotes: z
        .string()
        .max(240)
        .default('Combine a retirada na portaria ou no Centro Acadêmico.'),
    })
    .optional(),
});

export type CreateListingDto = z.infer<typeof CreateListingDtoSchema>;

export const UpdateListingDtoSchema = z.object({
  title: z.string().min(5).max(160).optional(),
  description: z.string().min(10).max(3000).optional(),
  priceCents: z.number().int().positive().optional(),
  neighborhood: z.string().min(2).max(120).optional(),
  proximityLabel: z.string().min(2).max(120).optional(),
  status: z
    .enum([
      LISTING_STATUS.DISPONIVEL,
      LISTING_STATUS.RESERVADO,
      LISTING_STATUS.ALUGADO_VENDIDO,
      LISTING_STATUS.PAUSADO,
    ])
    .optional(),
  housing: z
    .object({
      baseRentCents: z.number().int().nonnegative().optional(),
      condoAndBillsCents: z.number().int().nonnegative().optional(),
      includedExpenses: z.array(z.string()).optional(),
      genderPreference: z
        .enum([
          GENDER_PREFERENCE.MISTO,
          GENDER_PREFERENCE.SO_MENINAS,
          GENDER_PREFERENCE.SO_MENINOS,
        ])
        .optional(),
      petsAllowed: z.boolean().optional(),
      smokingPolicy: z.string().max(120).optional(),
      houseRoutine: z.string().max(160).optional(),
      furnished: z.boolean().optional(),
    })
    .optional(),
  photos: z
    .array(
      z.object({
        url: z.string().min(3),
        caption: z.string().optional().default(''),
        isCover: z.boolean().optional().default(false),
      }),
    )
    .optional(),
});

export type UpdateListingDto = z.infer<typeof UpdateListingDtoSchema>;

export const UpdateListingStatusDtoSchema = z.object({
  status: z.enum([
    LISTING_STATUS.DISPONIVEL,
    LISTING_STATUS.RESERVADO,
    LISTING_STATUS.ALUGADO_VENDIDO,
    LISTING_STATUS.PAUSADO,
  ]),
});

export type UpdateListingStatusDto = z.infer<
  typeof UpdateListingStatusDtoSchema
>;

export const UploadBase64DtoSchema = z.object({
  fileName: z.string().min(1).max(180),
  mimeType: z
    .string()
    .regex(/^(image\/(jpeg|png|webp)|application\/pdf)$/),
  base64Data: z.string().min(8),
  folder: z.enum(['listings', 'verifications', 'avatars']).default('listings'),
});

export type UploadBase64Dto = z.infer<typeof UploadBase64DtoSchema>;

