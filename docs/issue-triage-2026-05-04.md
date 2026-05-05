# Issue Triage Plan — 2026-05-04

Triage of 23 issues reported by manual QA across PoseidonJS storefront, admin dashboard, and backend.

## Status legend

- ✅ **Fixed and merged**
- 🚧 **PR open** (awaiting merge)
- 🔍 **Verified non-bug** — code already correct or by design, no fix needed
- ⏳ **Pending** — not yet addressed

## Status snapshot — 2026-05-05

| Bucket | Done / open | Notes |
|--------|-------------|-------|
| Wishlist heart visibility (extra) | ✅ Merged in PR #2 | `fix/wishlist-heart-visibility` |
| P0 #2 Add to cart silently fails | 🚧 PR #3 open | `fix/cart-guest-add` |
| P0 #1, #1b, #3, #5 server errors | ⏳ Pending — not reproducible from current dev stack | Need browser repro w/ stack trace |
| P1 #6 AI chatbot empty bubble | 🚧 In PR `fix/p1-confirms-and-search` | Frontend coalesce + backend scope bug |
| P1 #8 Block vendor confirm | 🚧 In same PR | |
| P1 #9 Search "SonySony" dedup | 🚧 In same PR | |
| P1 #7 Delete product | 🔍 Non-bug | onClick already wired at `products/page.tsx:321` |
| P1 #10 /returns shows shipping | 🔍 Non-bug | content correct, browser cache |
| P1 #4 FAQ infinite loading | ⏳ Pending — needs runtime verify | Likely resolves with broader fixes |
| P3 #19 Missing standalone admin pages | 🔍 Non-bug | Pages exist; tied to P0 #5 |
| P3 #23 /special-offers 404 | 🔍 Non-bug | Intentional; redirect can be added |
| P2 #11–#17, P3 #18, #20–#22 | ⏳ Pending | PR 3 / PR 4 |

## Context

Issues span the storefront (`templates/frontend/`), admin dashboard (`templates/admin/`), backend (`templates/server/`), and seed data. Source-of-truth lives in `templates/`; live scratch in `my-store/` mirrors it (every edit must apply to both).

Static audits found **clear bugs in code** for ~14 issues. The remaining ~9 either (a) require dev-server log capture to pinpoint (the generic Next.js "Jest worker encountered 2 child process exceptions" error masks the real crash), or (b) are already non-bugs (e.g. `/returns` actually has correct content — likely browser cache during user's testing).

## Classification of all 23 issues

### P0 — Critical, code-confirmed bugs

| # | Issue | File(s) | Root cause | Fix |
|---|-------|---------|-----------|-----|
| 5 | `/dashboard/collections`, `categories`, `brands` server error | `templates/admin/src/app/dashboard/{collections,categories,brands}/page.tsx` | Static read shows pages are well-formed; very likely a runtime crash inside `<Image>` (external URLs from seed) or `DashboardLayout` (always wraps these). Could also be a backend 500 surfacing as Jest-worker. Real cause must be read from the **admin Next.js terminal log** when the page is hit. | Capture log → fix actual exception. |
| 1 | `/dashboard/products/[id]` (edit page) server error | `templates/admin/src/app/dashboard/products/[id]/page.tsx` + `components/ProductForm.tsx` | Same — Jest worker is generic. Likely ProductForm crashes when `productId` is the `[id]` segment but data hasn't arrived. | Capture log → fix actual error. Likely add `enabled: !!productId` guards + null-coalesce on form fields. |
| 1b | `/products/[slug]` (storefront product detail) server error | `templates/frontend/src/app/products/[slug]/page.tsx` | Likely a related runtime crash — possibly an `<Image>` with missing src or a `productDisplay` helper assuming non-null fields. | Capture log → fix. |
| 3 | `/wishlist` server error | `templates/frontend/src/app/wishlist/page.tsx` | Page is `'use client'` but throws when `useWishlist()` `hasToken=true` and the `/wishlist` API returns shape mismatch / unauth. | Add error boundary around wishlist content + handle 401 in query. |

**Action for all P0**: start `my-store` admin + frontend dev servers in foreground, hit each broken route, record the **first stack trace** from the terminal. Fixes per-route from there.

### P0 — Critical, behavior bug

| # | Issue | File | Cause | Fix |
|---|-------|------|-------|-----|
| 2 | Add to cart silently fails on storefront | `templates/frontend/src/hooks/useStorefrontAddToCart.ts` lines 25-64 | When user is unauthenticated, the hook redirects to `/login` instead of adding to a guest cart. There IS a toast in the path, so "silently fails" likely means user is logged out and the redirect is happening too fast or being suppressed. | Mirror the wishlist guest-store pattern: add to a Zustand guest cart, then if auth required for checkout enforce it there. Verify header cart badge reads from same store. |

### P1 — High, code-confirmed bugs

| # | Issue | File | Cause | Fix |
|---|-------|------|-------|-----|
| 7 | Delete product — no confirm/no action | `templates/admin/src/app/dashboard/products/page.tsx` lines 52-62 | Code DOES have `confirm()` + API call. Need to verify trash button onClick is wired around lines 280-330 (Trash2 button). | If onClick missing, add `onClick={() => handleDelete(product._id)}`. |
| 8 | Block vendor — no confirm | `templates/admin/src/app/dashboard/vendors/page.tsx` line 45 | `handleStatusToggle` mutates immediately without prompt. | Add `if (!confirm('Block/Unblock this vendor?')) return;` before mutate, or replace with shadcn AlertDialog. |
| 9 | Search overlay duplicates query "SonySony" | `templates/frontend/src/components/layout/Header.tsx` lines 119, 222 | Toggle button does `setSearchOpen(!searchOpen)` but never clears `headerSearch`. Controlled input retains value. | `onClick={() => { setHeaderSearch(''); setSearchOpen(v => !v); }}`. |
| 10 | `/returns` shows shipping content | n/a — **NOT A BUG** | Verified: `templates/frontend/src/app/returns/page.tsx` renders return-specific content (initiate return, print label, ship package). `/shipping` is a separate file with shipping content. User likely saw browser-cached `/shipping`. | Confirm via hard-refresh. No code change. |
| 6 | AI chatbot no response | `templates/admin/src/components/AIChat.tsx` + `templates/server/src/controllers/ai.controller.js` | Frontend reads `response.data.data.message`. If backend `generateAIResponse()` returns empty string (no `ANTHROPIC_API_KEY` configured, falls through to fallback that may return empty), the bubble shows timestamp only. | (a) Validate `data.message` non-empty before rendering. (b) Ensure `.env` has `ANTHROPIC_API_KEY`. (c) Backend: never return empty `message` — always include the fallback canned reply. |

### P1 — High, needs runtime verification

| # | Issue | Notes |
|---|-------|-------|
| 4 | `/faq` infinite loading | Page is pure client component, no fetches. Suspect: parent layout error or stuck dev compile. Hard-refresh → if still hangs, capture browser console + Next dev terminal. Probably resolves with the broader server-error fixes. |

### P2 — Medium

| # | Issue | File | Fix |
|---|-------|------|-----|
| 11 | First search-icon click on homepage doesn't open overlay | `templates/frontend/src/components/layout/Header.tsx` | Likely state hydration race. Force re-render with `key={searchOpen}` on overlay container, or use functional setState. |
| 12 | Hero second CTA button has no visible text | `templates/frontend/src/components/home/DefaultHeroPanel.tsx` lines 34-41 | `variant="outline"` + `text-white` over white-ish backdrop. Change to `variant="secondary"` with explicit `bg-white/20 text-white` or solid bg. |
| 13 | `/products` slow / "0 found" intermittent | `templates/frontend/src/app/products/page.tsx` lines 36-50 | Tanstack Query race when filter state changes faster than queryKey settles. Add small debounce on `search` input + ensure single-source filter state. Confirm backend `/products` endpoint returns under 1s. |
| 14 | Vendor Status filter missing "Blocked" | `templates/admin/src/app/dashboard/vendors/page.tsx` lines 65-76 | Replace dropdown options with `Active` (`isActive=true`) / `Blocked` (`isActive=false`). |
| 15 | No "Verify Vendor" action | `templates/admin/src/app/dashboard/vendors/page.tsx` + backend `users.routes.js`/`users.controller.js` | Add `PATCH /api/users/:id/verify` (admin-only) that flips `isVerified=true`. UI: button next to Block on each vendor row. |
| 16 | Search bar ghost in navbar after navigation | `templates/frontend/src/components/layout/Header.tsx` | Add `useEffect` that listens to `pathname` changes to close overlay. |
| 17 | "Mark as on sale" doesn't enforce sale price | `templates/admin/src/app/dashboard/products/components/ProductForm.tsx` lines ~1208-1218 | Wrap sale price field in `{formData.isOnSale && (...)}` and add `required={formData.isOnSale}` validation. |

### P3 — Low / UX

| # | Issue | File | Fix |
|---|-------|------|-----|
| 18 | Dashboard KPI cards not clickable | `templates/admin/src/app/dashboard/page.tsx` lines 93-109 | Wrap each card in `<Link href={...}>` (Total Orders → `/dashboard/orders`, Low Stock → `/dashboard/products?stock=low`, etc.). |
| 19 | Collections/Categories/Brands no standalone pages | n/a — pages DO exist. Symptom is the P0 server error. | Resolved when P0 #5 is fixed. |
| 20 | Pie chart no labels/legend | `templates/admin/src/app/dashboard/analytics/page.tsx` lines 124-139 | Verify backend `/analytics/products` returns `productsByCategory` with `name` field; if shape is `{category, count}` map to `{name: category, value: count}` before passing to `<Pie>`. |
| 21 | Search result wrong image (green car for Sony) | seed data | Audit `seed-new.js` `images` URLs vs product names; replace any mismatch. Could also be Unsplash CDN cache collision. |
| 22 | Footer "My Account" / "Order History" require auth, no redirect | `templates/frontend/src/app/account/**` + Next middleware | Add a `middleware.ts` at frontend root that redirects `/account*` → `/login?next=/account...` if no token. Or client-side guard inside the account layout. |
| 23 | `/special-offers` 404 | n/a — by design. Nav links use `/products?offer=true`. | Add a `/special-offers` route that redirects to `/products?offer=true`. |

## Files to edit (summary)

**Storefront (templates/frontend + my-store/frontend):**
- `src/app/products/[slug]/page.tsx` (P0 #1b)
- `src/app/wishlist/page.tsx` (P0 #3)
- `src/app/products/page.tsx` (P2 #13)
- `src/app/special-offers/page.tsx` (NEW, P3 #23 — redirect)
- `src/components/layout/Header.tsx` (P1 #9, P2 #11, P2 #16)
- `src/components/home/DefaultHeroPanel.tsx` (P2 #12)
- `src/hooks/useStorefrontAddToCart.ts` (P0 #2)
- `src/middleware.ts` (NEW, P3 #22)
- `src/store/cart*.ts` (P0 #2 — guest cart store if missing)

**Admin (templates/admin + my-store/admin-dashboard):**
- `src/app/dashboard/page.tsx` (P3 #18)
- `src/app/dashboard/products/page.tsx` (P1 #7 — verify trash binding)
- `src/app/dashboard/products/[id]/page.tsx` (P0 #1)
- `src/app/dashboard/products/components/ProductForm.tsx` (P0 #1, P2 #17)
- `src/app/dashboard/{collections,categories,brands}/page.tsx` (P0 #5)
- `src/app/dashboard/vendors/page.tsx` (P1 #8, P2 #14, P2 #15)
- `src/app/dashboard/analytics/page.tsx` (P3 #20)
- `src/components/AIChat.tsx` (P1 #6)

**Backend (templates/server + my-store/backend):**
- `src/routes/users.routes.js` + `src/controllers/users.controller.js` (P2 #15 — verify endpoint)
- `src/controllers/ai.controller.js` (P1 #6 — never return empty)
- Confirm `/collections`, `/categories`, `/brands` response shapes match what admin pages expect (P0 #5).

**Seed:**
- `my-store/backend/seed-new.js` — audit product image URLs (P3 #21).

## Phasing — agreed

All 23 issues, split into 4 sequential PRs. Each PR: edit `templates/` AND `my-store/`, branch off `main`, commit at end, no Claude co-author trailer.

- **PR 1 — Unblock (P0)**: #1 product detail, #1b product edit, #2 add-to-cart, #3 wishlist page, #5 collections/categories/brands. Depends on dev-server log capture (Step 0).
- **PR 2 — High (P1)**: #4 FAQ verify, #6 AI chatbot, #7 delete product, #8 block vendor confirm, #9 search dedup, #10 returns verify.
- **PR 3 — Medium (P2)**: #11 search first-click, #12 hero CTA text, #13 products list slow, #14 vendor blocked filter, #15 verify vendor action, #16 search ghost, #17 sale price required.
- **PR 4 — Low (P3)**: #18 KPI cards clickable, #19 confirms after PR 1, #20 pie chart labels, #21 image audit, #22 footer auth-redirect, #23 special-offers redirect.

### Step 0 — Diagnostic prep (before PR 1 edits)

User-confirmed approach: **restart dev servers in foreground, capture stack traces.**

1. Stop current background stack (`taskkill /F /IM node.exe` — keep `poseidon-mongo` Docker container running).
2. Open 3 terminals (or 3 background bash jobs with separate IDs):
   - `cd my-store/backend && npm run dev`
   - `cd my-store/admin-dashboard && npm run dev`
   - `cd my-store/frontend && npm run dev`
3. With logs visible, hit each P0 broken route in browser:
   - `http://localhost:3001/dashboard/collections`
   - `http://localhost:3001/dashboard/categories`
   - `http://localhost:3001/dashboard/brands`
   - `http://localhost:3001/dashboard/products/<real-id>`
   - `http://localhost:3000/products/<real-slug>`
   - `http://localhost:3000/wishlist`
4. For each, copy the **first stack trace** (above the `Jest worker` line) from the terminal. That stack trace is the real bug.
5. Once we have all six stack traces, write the actual fix per route in PR 1. Do NOT pre-emptively patch with try/catch — fix the real cause.

## Verification

Phased — fix P0 first, verify the broken pages render, then move down.

1. **P0 server errors**: with both Next dev servers running in foreground, hit each broken route. Re-test all routes — 200 + no terminal exception.
2. **P0 add-to-cart**: as guest, click cart icon on a product card → toast appears + header cart badge increments. Login → guest cart merges. Place order from cart.
3. **P1**: confirm dialogs visible on delete product / block vendor. AI chatbot returns text. Search overlay clears between opens. Re-test storefront `/returns` after hard-refresh.
4. **P2/P3**: spot-check each fix in UI.
5. After all merged, end-to-end smoke: register vendor → admin verifies vendor → admin adds product → guest browses → adds to cart + wishlist → checks out.

## Non-bugs (per audit)

- **#10 `/returns`** — code is correct, content is return-specific. Hard-refresh and confirm.
- **#19 missing standalone admin pages** — they exist; symptom = P0 #5 server error. Will resolve.
- **#23 `/special-offers` 404** — intentional; can add redirect for nicety.
