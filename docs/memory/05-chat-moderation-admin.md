# 05 — Real-Time Chat, WhatsApp Safe Reveal & Admin Moderation

## Features & Endpoints
1. **In-App Encrypted Student Chat (`UNjUZ`, `vhz0v`)**:
   - Filter threads by `ALL`, `HOUSING`, `MARKETPLACE`, `UNREAD`, plus search conversations by student name or listing title.
   - Real-time message streaming via Server-Sent Events (`GET /api/chat/stream`) with automatic REST polling/optimistic UI fallback.
   - Read receipts (`✓✓ Lida`) and safety notice banner in every thread.
2. **Safe WhatsApp Contact Reveal**:
   - By default, a host's WhatsApp number is protected.
   - Inside a conversation thread, the interested student can click "Solicitar WhatsApp Seguro", and the host can click "Autorizar WhatsApp Seguro", setting `whatsappRevealedByHost = true` and unlocking the direct `wa.me` link for that conversation.
3. **Student Academic Verification (`qSgox`, `kZ0Wc`)**:
   - Option 1: Instant `.edu.br` / `.usp.br` / `.ufba.br` / `.uefs.br` institutional email 6-digit OTP verification.
   - Option 2: Upload enrollment certificate (PDF/JPG from JupiterWeb / SIGAA / UNE) into `verification_requests` for Admin review.
4. **Admin Moderation & Trust/Safety Back-Office (`kZ0Wc`)**:
   - Top-level KPIs: Pending Verifications, Pending Safety Reports, Active Campus Listings, Network Trust Rate (`99.4%`).
   - Manual Enrollment Verification Queue: Inspect student document, Approve Verified Student Badge, Request Resubmission, or Reject.
   - Safety Reports Queue: Inspect reported listing (e.g., suspiciously low rent / advance PIX request), Pause Listing, Contact Advertiser, or Ban User.

## Status
- [ ] Implement Chat module (`GET /api/chat/conversations`, `POST /api/chat/conversations`, `GET /api/chat/conversations/:id/messages`, `POST /api/chat/conversations/:id/messages`, `PATCH /api/chat/conversations/:id/reveal-whatsapp`, `GET /api/chat/stream`)
- [ ] Implement Verification & Admin Moderation module (`POST /api/verification/instant-otp`, `POST /api/verification/confirm-otp`, `POST /api/verification/document`, `GET /api/admin/overview`, `PATCH /api/admin/verifications/:id`, `PATCH /api/admin/reports/:id`)

