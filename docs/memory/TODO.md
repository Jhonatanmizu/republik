# Republik — Master Feature Memory & Implementation Todo List

This directory (`docs/memory/`) serves as the persistent engineering memory and feature tracker for the **Republik** SaaS implementation. Every feature, architectural constraint (`AGENTS.md`), and `.pen` design node (`GDsPL` through `Gbkvo`) is tracked here.

---

## Memory Index

1. [01 — Infrastructure, Docker Compose & Strategy Adapters](./01-infrastructure-docker.md)
2. [02 — PostgreSQL, Drizzle ORM & Full-Text Search](./02-database-drizzle-fts.md)
3. [03 — Authentication, JWT Security, CSRF, Rate-Limiting & LGPD](./03-auth-security-lgpd.md)
4. [04 — Housing ("Moradia"), Marketplace ("Desapego"), Wizard & Sharing/QR](./04-listings-housing-marketplace.md)
5. [05 — Real-Time Chat, WhatsApp Safe Reveal & Admin Moderation](./05-chat-moderation-admin.md)
6. [06 — Frontend MVVM Architecture & Responsive Design System (27 Nodes)](./06-frontend-mvvm-screens.md)

---

## Global Progress Checklist

### Phase 1: Infrastructure & Docker Compose
- [x] Root `docker-compose.yml` (PostgreSQL 17, MinIO S3-compatible object storage, `republik-backend`, `republik-frontend`)
- [x] `republik-backend/Dockerfile` & `.dockerignore`
- [x] `republik-frontend/Dockerfile` & `.dockerignore`
- [x] `.env.example` & `.env` configuration for seamless local and containerized execution

### Phase 2: Backend Core, Security & Database (NestJS 12 ESM + Drizzle ORM)
- [x] Drizzle ORM setup (`drizzle.config.ts`, schema definitions, automatic schema/index sync, connection pool)
- [x] PostgreSQL Full-Text Search (`tsvector` with `'portuguese'` dictionary + GIN index + `pg_trgm` fuzzy matching)
- [x] Security middleware: Helmet-grade CSP headers, CORS with credentials, Double-Submit Cookie CSRF Guard, `@nestjs/throttler` rate limiting
- [x] Strategy Pattern for Storage (`StorageServicePort` -> `LocalStorageStrategy` & `S3StorageStrategy`)
- [x] Strategy Pattern for Email (`EmailServicePort` -> `ResendEmailStrategy` & `ConsoleEmailStrategy` fallback)
- [x] Authentication module: Scrypt/Argon2 password hashing, 15m JWT Access Token + 7d Rotating Refresh Token in `HttpOnly` cookies, 6-digit OTP email verification, Password Recovery
- [x] Academic Verification module: Instant `.edu.br` / `.usp.br` / `.ufba.br` / `.uefs.br` OTP verification + Manual enrollment PDF/Photo upload queue
- [x] Listings module: Unified `listings` + `housing_details` + `marketplace_details` + `listing_photos` + Favorites + 1-Click Status transitions + Full-Text Search endpoint
- [x] Chat & Leads module: Conversations, messages, read receipts, SSE real-time stream + REST fallback, explicit host WhatsApp reveal authorization
- [x] Admin & Trust/Safety module: Manual enrollment verification review queue, safety reports moderation queue, platform metrics
- [x] LGPD module: Full personal data export (JSON) and permanent account deletion
- [x] Automatic rich database seeder matching all `.pen` screens (`USP`, `UFBA`, `UEFS`, `UNICAMP`, `UFMG`, sample verified students, listings, chat threads, and admin moderation items)
- [x] Backend unit & e2e tests (`vitest`) + `oxlint` passing with zero `any`

### Phase 3: Frontend Architecture & Design System (Next.js 16 + React 19 + Tailwind v4 MVVM)
- [x] Brand & Design Tokens (`GDsPL`, `NF0Fs`): Republik Coral (`#F64A33`), Forest Slate (`#1B2925`), Off-White (`#FAFAF7`), Verified Green (`#389E0D`), Plus Jakarta Sans & Inter fonts
- [x] Reusable Responsive Shells: Desktop Global Navbar (Housing/Marketplace active states), Global Footer, Mobile Top Bar, Mobile Floating Capsule Tab Bar (`NXLaZ`), Mobile Bottom Sheets (`z0d6m`, `Gbkvo`)
- [x] Screen 1 & Mobile 1 (`jT9c8`, `TFfUc`, `z0d6m`): Home / Housing Discovery ("Moradia & Vagas") + Full-Text Search + Filter Bar + Mobile Filter Bottom Sheet
- [x] Screen 2 & Mobile 2 (`tKyaQ`, `mfSxI`): Housing Listing Details Page + Monthly Cost Transparency + Sticky Mobile CTA
- [x] Screen 3 & Mobile 3 (`Ki8q1`, `W94sj`): University Marketplace ("Desapego Universitário" Feed) + Category Filters + Search
- [x] Screen 4 (`SHFbU`): Marketplace Item Details & Safe Contact View
- [x] Screen 5 & Mobile 4 (`TNFPJ`, `Y5M5y`): Multi-Step Create Listing Wizard ("Anunciar no Republik")
- [x] Screen 6 & Mobile 5 (`TLozQ`, `v0YGC`): User Dashboard & Saved Items ("Meu Espaço") + 1-Click Status Switcher
- [x] Screen 7 (`qSgox`): Student Verification & Onboarding Modal (`.edu.br` Instant OTP & Enrollment Document Upload)
- [x] Screen 8 (`LD2ge`): Cadastro (Sign-Up & Vínculo Universitário)
- [x] Screen 9, Screen 12 & Mobile 7 (`g2TWf`, `FhzQG`, `h1VHz`): Login, 6-Digit OTP Verification & Password Recovery Suite
- [x] Screen 10 (`n3QYlm`): Perfil do Usuário (User Profile, Academic Verification, WhatsApp Privacy Toggle & LGPD Controls)
- [x] Screen 11 (`bSj0v`): Privacidade e Proteção de Dados — LGPD Dedicated Page
- [x] Screen 13 & Mobile 6 (`UNjUZ`, `vhz0v`): Mensagens & Gestão de Interessados (Encrypted Student Chat + Safe WhatsApp Reveal)
- [x] Screen 14 (`zwaYK`): Edição Rápida e Gerenciamento do Anúncio (Live Feed Preview + Weekly Metrics)
- [x] Screen 15 & Mobile 8B (`H1fBVf`, `Gbkvo`): Kit de Compartilhamento, Printable A4 QR Code Poster & Visitor Mode Banner
- [x] Screen 16 (`kZ0Wc`): Painel Administrativo de Moderação & Validação Acadêmica
- [x] Frontend MVVM unit tests + Biome lint/format passing with zero `any` and zero inline styles
