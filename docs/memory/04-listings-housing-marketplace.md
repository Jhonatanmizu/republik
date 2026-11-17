# 04 — Housing ("Moradia"), Marketplace ("Desapego"), Wizard & Sharing/QR

## Features & Endpoints
1. **Housing Discovery & Details (`jT9c8`, `tKyaQ`, `TFfUc`, `mfSxI`, `z0d6m`)**:
   - Filter by university/campus, modality (`QUARTO_INDIVIDUAL`, `SUITE`, `VAGA_COMPARTILHADA`, `REPUBLICA`, `STUDIO_KITNET`), max monthly budget, included bills, furnished, pets allowed, gender preference (`MISTO`, `SO_MENINAS`, `SO_MENINOS`), and full-text search query.
   - Detailed breakdown of monthly costs (`priceCents` base rent + `condoAndBillsCents` = total monthly cost), house rules, current roommates, and amenities.
2. **Marketplace "Desapego" Discovery & Details (`Ki8q1`, `SHFbU`, `W94sj`)**:
   - Filter by university/campus, category (`MOVEIS`, `ELETRODOMESTICOS`, `ELETRONICOS_ESTUDO`, `UTENSILIOS`, `BICICLETAS`), urgent moving flag, condition, and full-text search query.
   - Detailed view with condition score, original retail price comparison, pickup location, safety banner, and offer/chat initiation.
3. **Multi-Step Create Listing Wizard (`TNFPJ`, `Y5M5y`)**:
   - 4-step progressive flow:
     1. Listing Type (`HOUSING` vs `MARKETPLACE`) & Modality/Category
     2. Title, Description, Monthly Costs / Price, Reference University, Photo Upload
     3. House Rules / Campus Pickup Logistics & Highlights
     4. Live Review & Instant Publication
4. **Quick Edit & 1-Click Status Management (`TLozQ`, `zwaYK`, `v0YGC`)**:
   - Instant status toggle (`DISPONIVEL`, `RESERVADO`, `ALUGADO_VENDIDO`, `PAUSADO`) updating feed visibility immediately.
   - Quick edit page with real-time card preview, cover photo selection, expense toggles, and weekly performance stats.
5. **Viral Campus Sharing Kit & Printable A4 QR Code Poster (`H1fBVf`, `Gbkvo`)**:
   - Direct shareable link, WhatsApp/Telegram/X quick share, Visitor Mode banner for unauthenticated visitors, and an interactive client-side SVG QR Code generator + printable A4 Campus Poster ("Cartaz para Mural do CA/DCE").

## Status
- [ ] Implement Listings service & controller (`GET /api/listings`, `GET /api/listings/:idOrSlug`, `POST /api/listings`, `PATCH /api/listings/:id`, `PATCH /api/listings/:id/status`, `DELETE /api/listings/:id`)
- [ ] Implement Saved/Favorite listings endpoints (`POST /api/listings/:id/favorite`, `GET /api/users/me/favorites`)
- [ ] Implement Photo upload endpoint (`POST /api/uploads`) using Storage Strategy
- [ ] Implement QR Code SVG & Printable A4 Poster on Frontend

