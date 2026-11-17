# 02 — PostgreSQL, Drizzle ORM & Full-Text Search

## Database Schema Design
1. **`universities`**:
   - `id`, `code` (e.g., `USP`, `UFBA`, `UEFS`, `UNICAMP`, `UFMG`), `name`, `campusName`, `city`, `state`, `emailDomains` (text array, e.g., `['usp.br', 'edu.br']`).
2. **`users`**:
   - `id`, `fullName`, `email`, `passwordHash`, `whatsapp`, `hideWhatsappForGuests` (boolean, LGPD default `true`), `avatarUrl`, `universityId`, `courseName`, `courseSemester`, `enrollmentStatus` (`CURSANDO`, `FORMADO`, `POS_GRADUACAO`), `verificationStatus` (`UNVERIFIED`, `PENDING_DOC`, `VERIFIED`, `REJECTED`), `verifiedDomain`, `role` (`STUDENT`, `ADMIN`), `createdAt`, `updatedAt`.
3. **`refresh_tokens` & `otp_codes`**:
   - `refresh_tokens`: `id`, `userId`, `tokenHash`, `userAgent`, `ipAddress`, `expiresAt`, `revokedAt`.
   - `otp_codes`: `id`, `email`, `userId`, `codeHash`, `purpose` (`VERIFY_EMAIL`, `RESET_PASSWORD`, `INSTANT_EDU_VERIFY`), `expiresAt`, `consumedAt`.
4. **`listings` (Unified Core Table)**:
   - `id`, `slug`, `code` (e.g., `8291`), `ownerId`, `universityId`, `type` (`HOUSING`, `MARKETPLACE`), `title`, `description`, `priceCents`, `Neighborhood`, `proximityLabel` (e.g., `5 min da USP • Portão 1`), `distanceMeters`, `status` (`DISPONIVEL`, `RESERVADO`, `ALUGADO_VENDIDO`, `PAUSADO`), `isFeatured`, `viewsCount`, `favoritesCount`, `leadsCount`, `searchVector` (`tsvector`), `createdAt`, `updatedAt`.
5. **`housing_details` (1:1 with `listings`)**:
   - `listingId`, `modality` (`QUARTO_INDIVIDUAL`, `SUITE`, `VAGA_COMPARTILHADA`, `REPUBLICA`, `STUDIO_KITNET`), `condoAndBillsCents`, `internetSpeedMbps`, `billsIncluded` (boolean), `includedExpenses` (text array: `AGUA`, `LUZ`, `INTERNET`, `FAXINA`, `GAS`, `CONDOMINIO`, `IPTU`), `furnished` (boolean), `noGuarantor` (boolean), `petsAllowed` (boolean), `smokingPolicy`, `genderPreference` (`MISTO`, `SO_MENINAS`, `SO_MENINOS`), `houseRoutine`, `moveInDateLabel`, `residentsSummary`, `amenities` (text array).
6. **`marketplace_details` (1:1 with `listings`)**:
   - `listingId`, `category` (`MOVEIS`, `ELETRODOMESTICOS`, `ELETRONICOS_ESTUDO`, `UTENSILIOS`, `BICICLETAS`), `condition` (`NOVO`, `ESTADO_DE_NOVO`, `SEMINOVO`, `USADO`), `conditionScore`, `retailPriceCents`, `acceptsOffer` (boolean), `isUrgentMoving` (boolean), `disassemblesForTransport` (boolean), `pickupLocationLabel`, `pickupNotes`.
7. **`listing_photos` & `saved_listings`**:
   - `listing_photos`: `id`, `listingId`, `url`, `caption`, `isCover`, `sortOrder`.
   - `saved_listings`: `userId`, `listingId`, `createdAt` (composite PK).
8. **`conversations` & `messages`**:
   - `conversations`: `id`, `listingId`, `buyerId`, `sellerId`, `whatsappRevealedByHost` (boolean), `lastMessageAt`, `createdAt`.
   - `messages`: `id`, `conversationId`, `senderId`, `body`, `isSystemMessage`, `readAt`, `createdAt`.
9. **`verification_requests` & `safety_reports`**:
   - `verification_requests`: `id`, `userId`, `universityId`, `registrationNumber` (RA/Matrícula), `documentName`, `documentUrl`, `status` (`PENDING`, `IN_REVIEW`, `APPROVED`, `REJECTED`, `NEEDS_RESUBMISSION`), `reviewerNotes`, `createdAt`, `reviewedAt`.
   - `safety_reports`: `id`, `listingId`, `reporterId`, `reason`, `details`, `reportersCount`, `status` (`PENDING`, `PAUSED_LISTING`, `BANNED_USER`, `RESOLVED`), `createdAt`.

## Full-Text Search Strategy
- Combine Portuguese `to_tsvector('portuguese', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(neighborhood, '') || ' ' || coalesce(proximity_label, ''))` with `websearch_to_tsquery('portuguese', query)` AND `ILIKE` / `pg_trgm` (`word_similarity`) fallback so partial words, accents, and typos return ranked results (`ts_rank_cd`).

## Status
- [ ] Implement Drizzle schema & database module
- [ ] Implement automatic schema initialization & FTS GIN index creation
- [ ] Implement rich seed service matching `.pen` data

