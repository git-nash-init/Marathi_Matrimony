# System Architecture: Maratha Laginsarai Platform

## 1. Technical Stack Overview
- **Frontend Framework:** React 18 with TypeScript 5.5
- **Build Tool:** Vite 5.4 with code-splitting and chunk optimization
- **Routing:** React Router v6 (Nested routes, lazy loading, scroll restoration)
- **State Management & Contexts:**
  - `AuthContext`: Supabase session, profile cache, auth state lifecycle
  - `LanguageContext`: Marathi (`mr`) & English (`en`) dual-mode internationalization with Devanagari digit conversion
  - `ToastContext`: Accessible notifications
- **Styling Architecture:** Pure CSS Modules with CSS custom properties design tokens (no Tailwind or bloated CSS frameworks)
- **Database & Backend:** Supabase PostgreSQL 15+ (PostgREST API, RLS, Storage Buckets, RPC Functions)
- **Hosting / Target Runtime:** Vite SPA with Static Prerender capability for SEO location pages

---

## 2. Information Architecture & Route Hierarchy
```
/                                   -> Homepage (Editorial Hero, Search Console, Success Stories, Trust)
/search                             -> Database Search Directory (Filters: Gender, Age, Caste, Location, Education)
/matches                            -> Alias for /search
/profile/:id                        -> Profile Detail View (Privacy-gated fields, Photos, Express Interest)
/shortlist                          -> Saved Profiles (Persisted via DB / Local fallback)
/success-stories                    -> Official Maratha Laginsarai Married Couples Archive
/how-it-works                       -> 4-Step Matchmaking Guide & Verification Explainer
/membership                         -> Membership Plans (Free, Silver, Gold, Premium VIP)
/wedding-services                   -> Verified Maratha Wedding Vendors (Catering, Photography, Halls)
/about                              -> Organization History, 10+ Years Trust, Leadership
/contact                            -> Official Phone, WhatsApp, Branch Offices, Direct Inquiry Form
/faq                                -> Frequently Asked Questions
/privacy                            -> Comprehensive Privacy Policy (DPDP Act Compliance)
/terms                              -> Terms of Service

# SEO Dynamic Location & Category Routes (Matching Sitemap)
/location/:slug                     -> Area landing (e.g., borivali, dadar, lower-parel, mulund, pune, etc.)
/maratha-marriage-bureau-borivali   -> Canonical route mapping
/maratha-marriage-bureau-lower-parel-> Canonical route mapping
/maratha-vadhu-var-suchak-dadar     -> Canonical route mapping
/maratha-vadhu-var-suchak-dhankawadi-pune -> Canonical route mapping
/maratha-vadhu-var-suchak-pimpri-chinchwad -> Canonical route mapping
/maratha-vivah-mandal-mulund        -> Canonical route mapping
/maratha-matrimony/:category/:filter-> Dynamic category discovery

# Auth & Account Routes
/login                              -> Member Login (Email / Password, Session persist)
/register                           -> Guided Multi-Step Registration
/verify-email                       -> Email Confirmation Landing
/forgot-password                    -> Password Recovery Request
/reset-password                     -> Secure Token Password Reset

# Protected Member Dashboard
/dashboard                          -> Member Overview (Profile Status, Views, Interests, Shortlists)
/dashboard/profile/edit             -> Detailed Biodata & Horoscope Editor
/dashboard/photos                   -> Multi-photo Upload & Privacy Setting
/dashboard/preferences              -> Partner Expectations (Age, Height, Caste, Sub-caste, Location)
/dashboard/interests                -> Sent & Received Connection Requests
/dashboard/settings                 -> Privacy, Password, Account Deletion Request

# Protected Administration
/admin                              -> Admin Console (Restricted to 'admin' / 'super_admin' roles)
/admin/profiles                     -> Profile Moderation Queue (Approve / Reject / Request Correction)
/admin/photos                       -> Photo Approval Grid
/admin/inquiries                    -> Customer Contact Inquiries
/admin/audit-logs                   -> System Event Audit Log
```

---

## 3. Database Schema & RLS Security Model
Supabase database consists of 26 core tables, with Row Level Security (RLS) actively enabled:
1. `profiles`: Master member record (anonymized public fields, strict visibility rules).
2. `profile_contacts`: Strict privacy enclosure for phone, WhatsApp, email, physical address. Accessible only to owner, verified admins, or unlocked mutual interests.
3. `profile_photos`: Storage bucket references with approval status (`pending`, `approved`, `rejected`) and visibility settings.
4. `partner_preferences`: Criteria for age, height, education, occupation, community, location.
5. `interests`: State-machine tracking connection requests (`pending`, `accepted`, `declined`, `withdrawn`).
6. `shortlists`: User-to-profile bookmark relationships.
7. `profile_views`: Access history tracking for dashboard analytics.
8. `subscription_plans` & `subscriptions`: Membership tier enforcement.
9. `contact_unlocks`: Credit-based or subscription-based contact revelation ledger.
10. `contact_inquiries`: Public inquiries submitted through website.
11. `admin_users`: Explicit role-based permissions (`super_admin`, `admin`, `moderator`, `support`).
12. `audit_logs`: Immutable security action log for sensitive operations.

---

## 4. Session & Authentication Architecture
- Authentication is governed by Supabase Auth (`gotrue-js`).
- Session tokens are stored securely in browser storage via Supabase client, with automatic token refresh on expiry.
- Administrative operations are protected both at the UI layer (`ProtectedRoute` with role check) and at the PostgreSQL layer (`is_admin()` SQL security definer function).
- Password policies require minimum 8 characters with alphanumeric complexity. Plaintext passwords never touch application tables.
