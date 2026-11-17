# 06 — Frontend MVVM Architecture & Responsive Design System (27 Nodes)

## Strict Engineering Standards (`AGENTS.md`)
- **Zero `any` Tolerance**: Strict TypeScript types and Zod runtime schema validation at boundaries.
- **No Inline Styles**: Zero `style={{ ... }}` in JSX/TSX. All styling via Tailwind CSS v4 utility classes and semantic tokens.
- **Constants Over Plain Text**: All UI strings, labels, aria-labels, routes, and status keys extracted into collocated `*.constants.ts` with `as const`.
- **MVVM Pattern**:
  - `models/`: Domain types, Zod schemas, formatters.
  - `view-models/`: Custom React hooks returning `{ state, actions, computed }`.
  - `views/`: Pure presentational components consuming ViewModels.

## Mapping of All 27 `.pen` Design Nodes
1. `GDsPL` — Brand Identity & Reference Assets (Logo mark + wordmark in Navbar/Footer/Auth)
2. `NF0Fs` — 00 — Republik Design System & Reusable Components (Color palette, typography, Desktop Navbar, Global Footer, Mobile Top Bar, Floating Capsule Tab Bar)
3. `jT9c8` & `TFfUc` — Screen 1 & Mobile 1: Home / Housing Discovery (`/`)
4. `z0d6m` — Mobile 8A: Overlay Bottom Sheet — Filtros de Moradia (Interactive filter drawer on `/` and `/moradia`)
5. `tKyaQ` & `mfSxI` — Screen 2 & Mobile 2: Housing Listing Details Page (`/moradia/[id]`)
6. `Ki8q1` & `W94sj` — Screen 3 & Mobile 3: University Marketplace 'Desapego' Feed (`/desapego`)
7. `SHFbU` — Screen 4: Item Details & Safe Contact View (`/desapego/[id]`)
8. `TNFPJ` & `Y5M5y` — Screen 5 & Mobile 4: Multi-Step Create Listing Wizard (`/anunciar`)
9. `TLozQ` & `v0YGC` — Screen 6 & Mobile 5: User Dashboard & Saved Items 'Meu Espaço' (`/meu-espaco`)
10. `qSgox` — Screen 7: Student Verification & Onboarding Modal (`.edu.br`) (Accessible as modal from Navbar/Dashboard and at `/verificacao`)
11. `LD2ge` — Screen 8: Cadastro — Sign-Up & Vínculo Universitário (`/auth/cadastro`)
12. `g2TWf` — Screen 9: Login & Recuperação de Senha (`/auth/login`)
13. `FhzQG` & `h1VHz` — Screen 12 & Mobile 7: Auth Verification (6-digit OTP) & Password Recovery Suite (`/auth/verificacao`)
14. `n3QYlm` — Screen 10: Perfil do Usuário & Academic Verification (`/perfil`)
15. `bSj0v` — Screen 11: Privacidade e Proteção de Dados — LGPD Dedicated Page (`/lgpd`)
16. `UNjUZ` & `vhz0v` — Screen 13 & Mobile 6: Mensagens & Gestão de Interessados (`/mensagens`)
17. `zwaYK` — Screen 14: Edição Rápida e Gerenciamento do Anúncio (`/anuncios/[id]/editar`)
18. `H1fBVf` & `Gbkvo` — Screen 15 & Mobile 8B: Kit de Compartilhamento, Printable A4 QR Code Poster & Mobile Share Bottom Sheet (`/anuncios/[id]/compartilhar` + Share Sheet modal on listing details)
19. `kZ0Wc` — Screen 16: Painel Administrativo de Moderação & Validação Acadêmica (`/admin`)

## Status
- [ ] Configure Tailwind CSS v4 tokens & fonts in `src/app/globals.css` & `src/app/layout.tsx`
- [ ] Implement shared API client with CSRF double-submit header & Zod validation
- [ ] Implement Auth Context & Student Verification Modal
- [ ] Implement all 6 Feature MVVM modules (`housing`, `marketplace`, `listing-wizard`, `dashboard`, `chat`, `auth-profile-lgpd`, `admin`)
- [ ] Write isolated ViewModel unit tests (`vitest` / `@testing-library/react`)
- [ ] Run Biome lint & format check (`npm run lint`)

