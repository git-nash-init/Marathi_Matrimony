# Security Review: 20-Point Status

Last checked: 2026-11-05, after Phase 12. An earlier version of this document marked everything PASS. The code did not support that, so every row now states what was actually checked.

**Done** means implemented and checked. **Partial** means something real exists and a gap remains. **Open** means not yet possible.

**How far the checks go:** database rules ran against the live database as guest, member and each admin role, using simulated sign-ins inside transactions that roll back. Screens ran in a browser with stubbed responses. A real admin sign-in, a real member journey and the Hostinger deployment have not been tested.

| # | Item | Status | Evidence and remaining gap |
|---|---|---|---|
| 1 | SQL injection | Done | Parameterised client calls and PL/pgSQL functions, with search text escaped and tested using `%` and `_`. |
| 2 | XSS | Done | No `dangerouslySetInnerHTML`. Admin-edited website text renders as plain text, and social links must be `https://`. CSP in `public/.htaccess`. |
| 3 | CSRF | Done | Requests use bearer tokens, not cookies. |
| 4 | File uploads | Partial | Bucket type and size limits, owner-folder rules, and no SVG. ID documents must really exist in the member's own folder. Gap: storage trusts the declared file type and does not inspect file contents. |
| 5 | Object-level authorization | Done | Member functions act on the caller only. Someone else's ticket, file path or profile is refused, and each case is tested. Functions taking a user ID refuse other users unless the caller is an admin. |
| 6 | Rate limiting | Done | `rate_limit_hit` on the contact form, search, interests, reports, ID submission, ticket replies and admin broadcasts. List sizes are capped. Sign-in limits come from Supabase Auth. |
| 7 | JWT secrets | Done | Held by Supabase; only the public anon key is in the client. |
| 8 | Server-side secrets | Done | `envPrefix` is `VITE_` only. The service role is used only in Edge Functions. |
| 9 | Password hashing | Partial | Hashing by Supabase Auth. **Gap: leaked-password protection is off.** Turn it on in the Supabase dashboard; it may need a paid plan. |
| 10 | MFA | Partial | TOTP for admins is built and enforced by `require_admin_role`. **Gap: `admin_mfa_required` is still off.** It stays off until the super admin enrols, so nobody is locked out. Not yet tried with a real authenticator. |
| 11 | CORS | Done | `send-push` and `admin-users` allow listed origins only, checked with a request from an unlisted origin. |
| 12 | Tokens in localStorage | Partial | A browser-only app has no server to hold cookies. Mitigated by CSP, MFA and short token life. Accepted. |
| 13 | Server-side permissions | Done | Every `admin_*` function checks the role, apart from internal helpers members cannot call. Direct writes to plans, payments, subscriptions and tickets are refused. |
| 14 | RLS | Done | On for every public table, re-counted after Phase 12. |
| 15 | Webhook signatures | Open | No payment webhook exists; it arrives with the payment work. |
| 16 | SSRF | Done | Push endpoints allowlisted. Admin message links must be pages on this site, and story photos must be in our own storage. |
| 17 | Source maps | Done | `sourcemap: false`; no `.map` files in `dist`. The dev stub user is absent from the production bundle. |
| 18 | Default credentials | Partial | No hardcoded admin or test login in the app. **Gap: a password is in git history in `scratch/get-auth-session.cjs`, and another is in untracked scratch scripts. Both must be changed.** Removing the file does not remove it from history. |
| 19 | Sensitive logs | Done | Surname, date of birth, income, phone and village are masked in the audit log. Each opening of an ID document is logged. |
| 20 | Dependencies | Done | `npm audit --omit=dev` reports 0. Re-run before each release. |

## Launch blockers

1. **Dummy checkout.** Any signed-in member can call `activate_dummy_subscription`, get Platinum free and unlock members' surname, phone, email, address and village. **The site must not open to the public until real payments replace it.**
2. **Exposed passwords** (row 18), and the Supabase access token in `~/.claude/settings.json`.
3. **`unblock_member`** must be applied by hand from `supabase/pending/014_run_by_hand.sql`. Until then, members cannot unblock anyone.
4. **MFA and leaked-password protection** (rows 9 and 10).
5. **Marketing figures** such as "3,000+ marriages" and "11,000+" are unverified. Confirm or change them under Website Content. The privacy and terms text should have a legal review.

## Known limits

- Taluka names were written from general knowledge. Check them against the Local Government Directory. The village list is empty until a CSV is imported.
- Email and SMS are not connected, so a reply to someone who wrote in without signing in must be sent by hand.
- ID documents are kept after review. Decide on a retention period, because these are sensitive files.
- Removing the raw `aadhaar_number` column is still pending (`supabase/pending/drop_aadhaar_column.sql`). It holds no numbers, and the trigger clears any sent. Run it once the new client is deployed.
- The Website Content editor covers text and contact details. Location pages and images are not editable there yet.
- `search_villages` and the village import have only been tested with a few rows, not the full list.

## Accepted advisor warnings

- `authenticated_security_definer_function_executable`: these are the intended member and admin functions. Each checks the caller itself.
- `extension_in_public` for `pg_net`: moving it requires dropping and recreating the extension. Low risk, left as is.
- `rls_enabled_no_policy` on `rate_limits`, `account_blocks`, `profile_reviews`, `ticket_messages`, `site_content` and similar: deliberate. Only functions touch these tables.

## If an admin loses their 2-step verification device

In the Supabase SQL editor, set `admin_mfa_required` to `false` in `platform_settings`, and delete that admin's row from `auth.mfa_factors`. They can then enrol again from Settings. Turn the requirement back on afterwards.

## Testing

`tests/db-phase1.sql` to `tests/db-phase5.sql` run real checks against the database. Each ends by raising an error on purpose, so nothing is saved; the error text is the report, and it should say `FAILED: 0`. The Phase 6 to 11 checks were run the same way but only inline, so they are not saved as files yet. `npm test` runs the code checks.
