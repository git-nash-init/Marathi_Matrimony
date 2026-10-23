# Production Release Checklist: Maratha Laginsarai Platform

## 1. Environment & Build Configuration
- [x] Environment variables verified in `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
- [x] `.env.example` scrubbed of secrets and documented.
- [x] TypeScript type checking passes with zero errors (`npm run typecheck` or `tsc --noEmit`).
- [x] Production build passes cleanly (`npm run build`).
- [x] Bundle chunk optimization and code-splitting configured in Vite.

## 2. Database & Supabase Configuration
- [x] Supabase project connected (`https://hgucqabzlaxelkfiavvm.supabase.co`).
- [x] Schema inspected: 26 tables present with foreign keys and indexes.
- [x] Row Level Security (RLS) active on all 26 public tables.
- [x] Storage buckets initialized (`profile-photos`, `verification-documents`).
- [x] Subscription plans seeded (`Free Basic`, `Silver Plan`, `Gold Plan`, `Premium VIP`).
- [x] Contact inquiries table configured for public inbound leads.

## 3. Brand & Content Integrity
- [x] Correct brand name applied everywhere: **Maratha Laginsarai (मराठा लगीनसराई)**.
- [x] Authentic official helpline and WhatsApp verified: `+91 7208659356`, `+91 9594928780`, `+91 9821675567`.
- [x] Authentic client success stories included with real consented couples and wedding dates.
- [x] Slogan & community focus verified: **९६ कुळी मराठा वधु-वर सूचक आणि विवाह मंडळ** (Kokanastha & Deshastha Maratha).
- [x] Dual-language system (Marathi & English) operational with Devanagari digit support.

## 4. Security & Privacy Review (20 Checks)
- [x] No plaintext passwords stored in application tables.
- [x] Contact details (phone, email, WhatsApp, address) quarantined in `profile_contacts`.
- [x] BOLA protections in place via RLS `auth.uid()` checks.
- [x] No `dangerouslySetInnerHTML` on user input; React JSX automatic escaping active.
- [x] No exposed service role keys in frontend bundle or public repository.
- [x] Sensitive member data excluded from public metadata and JSON-LD.

## 5. UI/UX & Responsive Testing
- [x] Responsive layout verified on mobile (360px - 430px), tablet (768px), and desktop (1024px - 1440px+).
- [x] Accessible color contrast meeting WCAG AA / AAA standards.
- [x] Keyboard focus indicators present across all interactive elements.
- [x] Anti-vibecoding constraints fully respected (no harsh gradients, no purple AI themes, no fake metrics).
- [x] Skeleton loading states active during data retrieval.

## 6. Git & Version Control
- [x] Git commits structured and descriptive.
- [x] Author configured according to repository guidelines (`git-nash-init`).
- [x] No secrets, PAT tokens, or `.env` files committed.
