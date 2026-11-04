# Security Review: 20-Point Status

Last checked: 2026-11-05, after Phase 1. An earlier version of this document marked everything PASS. The code did not support that, so this version only claims what has evidence.

**Done** means implemented and checked. **Partial** means something real exists and a gap remains. **Open** means not done yet.

| # | Item | Status | Evidence and remaining gap |
|---|---|---|---|
| 1 | SQL injection | Done | Parameterised client calls and PL/pgSQL functions. No dynamic SQL built from user input. |
| 2 | XSS | Done | No `dangerouslySetInnerHTML`. CSP in `public/.htaccess`, checked against the production build. `style-src` keeps `unsafe-inline` because the site uses inline styles. |
| 3 | CSRF | Done | Requests use bearer tokens, not cookies. |
| 4 | File uploads | Partial | Bucket type and size limits, owner-folder policies, no base64 fallback, extension taken from the type. Gap: no server-side check of file contents. ID document flow arrives in Phase 4. |
| 5 | Object-level authorization | Partial | Owner-only write policies, locked identity columns. Gap: `unlock_profile_contact` and interest lists ignore blocks until Phase 2. |
| 6 | Rate limiting | Partial | `rate_limit_hit` on the contact form and interests, page sizes capped. Gap: reports (Phase 4). Auth limits rely on Supabase defaults. |
| 7 | JWT secrets | Done | Held by Supabase; only the public anon key is in the client. |
| 8 | Server-side secrets | Done | `envPrefix` is `VITE_` only. Service role is used only in Edge Functions. Production bundle scanned. |
| 9 | Password hashing | Partial | Hashing by Supabase Auth. Gap: leaked-password protection is off; turn it on in the Supabase dashboard. |
| 10 | MFA | Partial | TOTP for admins built, enforced in `is_admin()` when `admin_mfa_required` is on. Gap: not yet enrolled or switched on; the super admin must scan the QR code. |
| 11 | CORS | Done | `send-push` allows listed origins only; open header removed from `.htaccess`. |
| 12 | Tokens in localStorage | Partial | A browser-only app has no server to hold cookies. Mitigated by CSP and MFA, not eliminated. |
| 13 | Server-side permissions | Partial | Roles enforced by `require_admin_role`, admin edits only through functions. **Gap: `activate_dummy_subscription` lets any member grant themselves a paid plan. Launch blocker until the payment phase.** |
| 14 | RLS | Done | On for every public table. `tests/db-phase1.sql` exercises it as anon, member and admin. |
| 15 | Webhook signatures | Open | No payment webhook exists yet; arrives with the payment phase. `send-push` uses a constant-time shared secret. |
| 16 | SSRF | Done | Push endpoints allowlisted in `save_push_subscription` and again in `send-push`. |
| 17 | Source maps | Done | `sourcemap: false`; no `.map` files in `dist`. |
| 18 | Default credentials | Partial | No hardcoded admin email or user ID in the client. **Gap: exposed passwords in `scratch/` must be rotated. One was committed, so it stays in git history.** |
| 19 | Sensitive logs | Done | No `console.log` of personal data. `send-push` no longer logs provider response bodies. |
| 20 | Dependencies | Done | `npm audit` reports 0 after upgrading Vite and React Router. Re-run before each release. |

## Accepted advisor warnings

- `authenticated_security_definer_function_executable`: these are the intended member and admin functions. Each checks the caller itself.
- `extension_in_public` for `pg_net`: moving it requires dropping and recreating the extension. Low risk, left as is.
- `rls_enabled_no_policy` on `rate_limits`: deliberate. Only internal functions touch it.

## If an admin loses their 2-step verification device

In the Supabase SQL editor, set `admin_mfa_required` to `false` in `platform_settings`, and delete that admin's row from `auth.mfa_factors`. They can then enrol again.

## Testing

`tests/db-phase1.sql` runs real checks against the database. It always ends by raising an error, so nothing is saved; the error text is the report, and it should say `FAILED: 0`.
