# Pawn Island Records

Static, data-driven website for Pawn Island Records. The current public launch mode is `essentials`, so the primary interactive flow is Home, Roster, Connect, and About while deeper catalog, release, project, press, merch, and process routes stay hidden-but-shareable. Generated static SEO pages under `artists/`, `releases/`, and `press/` provide crawlable canonical entity pages while the richer interactive routes remain gated.

## Quick Start

1. Install dependencies:

   ```sh
   npm install
   ```

2. Start the local static server:

   ```sh
   npm run serve
   ```

3. Open `http://127.0.0.1:4173/`.

Direct page loads redirect into `shell.html` so site-wide audio can persist. To inspect a page without the shell redirect, add `standalone=1`, for example `http://127.0.0.1:4173/roster.html?standalone=1`.

To preview hidden modern routes as if launch mode were `full` without changing `public-data.js`, add `preview=full`. Examples:

- `http://127.0.0.1:4173/catalog.html?preview=full&standalone=1`
- `http://127.0.0.1:4173/artist.html?artist=rhea-mauro&preview=full&standalone=1`
- `http://127.0.0.1:4173/release.html?release=rhea-mauro-hearthblood&preview=full&standalone=1`

## Validation

- `npm run audit:data` prints the current source-truth audit for release, artist, Spotify, and EPK readiness.
- `npm run generate:data` regenerates `public-data.js` from the source catalog and Spotify cache.
- `npm run generate:seo` regenerates static SEO entity pages, `sitemap.xml`, and `llms.txt` from `public-data.js`.
- `npm run sync:spotify` fetches seeded Spotify artist/release/track facts into the local cache. It requires `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`.
- `npm run test:data` validates source coverage, seeded Spotify URL parsing, strict-ready EPK requirements, and release action readiness.
- `npm run test:links` checks route inventory files, local HTML links, local assets, `public-data.js` image references, slug uniqueness, release artist references, the configured site-audio file, and route publication policy across page robots tags, `robots.txt`, and `sitemap.xml`.
- `npm run test:perf` checks the public image asset budget and verifies media iframes keep explicit loading and embed hydration hooks.
- `npm run test:a11y` runs axe-backed Playwright accessibility smoke checks across key public and hidden-preview routes on desktop and mobile. It also checks primary tap target sizing, visible initial focus, landmarks/navigation, and page-level horizontal overflow.
- `npm run test:media` verifies Spotify and YouTube embed fallback UI when external players fail.
- `npm run test:smoke` runs Playwright smoke coverage across desktop and mobile for public routes, hidden route samples, internal route samples, and shell-framed navigation.
- `npm test` runs links, performance, accessibility, media resilience, and smoke checks.

Playwright screenshots are written under ignored `test-results/` output and are treated as manual review artifacts, not visual-regression baselines. If a fresh machine reports a missing browser executable, run `npx playwright install chromium` once and rerun the smoke tests.

## Cloudflare Pages Merch Desk

The merch desk uses Cloudflare Pages Functions as a same-origin API layer for Printful v1. The browser never receives the Printful token. The current public posture is a hidden-but-shareable manual order request flow: fans can browse curated products, estimate shipping, and request an invoice before production begins.

Required Cloudflare secret:

- `PRINTFUL_API_TOKEN`: private Printful token with the store/product/order scopes needed for the MVP.

Optional Cloudflare variables:

- `PRINTFUL_STORE_ID`: store context header for account-level tokens.
- `MERCH_DRAFT_ORDERS_ENABLED=false`: disables `/api/merch/draft-order`; by default, draft orders are enabled when the Printful token is configured.

The current MVP routes are:

- `GET /api/merch/products`: v1 `/store/products` proxy for synced pre-designed merch.
- `GET /api/merch/products/:id`: v1 `/store/products/{id}` proxy for product variants.
- `GET /api/merch/catalog`: v1 `/categories` + `/products` catalog proxy for internal `?internal=catalog` design exploration.
- `POST /api/merch/shipping-rates`: v1 `/shipping/rates`.
- `POST /api/merch/draft-order`: v1 `/orders?confirm=false`, disabled only when `MERCH_DRAFT_ORDERS_ENABLED=false`.

POST endpoints reject cross-site browser requests, require object-shaped JSON, return structured JSON errors, and include a lightweight per-IP in-memory throttle to reduce repeated shipping/order spam before the request reaches Printful.

Curated product titles, categories, launch posture, and policy copy live in `data/merch-products.json`. Run `npm run test:merch-metadata` before launch or synced-product changes.

Manual order launch brief:

- Route status: hidden-but-shareable, `noindex,follow`; do not add public nav or sitemap priority until payment/email operations are ready.
- Checkout model: manual order request. Fans add curated Printful sync products, estimate shipping, acknowledge the policy, and request an invoice before production.
- Public collection: the 14 synced products listed in `data/merch-products.json`; the full Printful catalog remains internal behind `?internal=catalog`.
- Supported ship-to countries in the desk: US, CA, GB, AU, DE, FR, NL, SE, and JP.
- Repeat checkout convenience is opt-in browser storage for contact and shipping fields only; order notes and policy acknowledgements are not stored.
- Ecommerce pattern borrow: the order desk now includes same-drop "Complete the Drop" pairings, and product detail pages include a compact sticky request bar for long-page browsing.
- Ecommerce pattern borrow: fans can save browser-local merch picks and revisit recently viewed products while planning a manual invoice request.
- Support: `pawnisland@outlook.com`, expected response window 1-2 business days.
- Payment and cancellation: payment link is emailed before production; requests can be changed or cancelled until that payment link is paid.
- Returns: printed-on-demand returns are limited to damaged, misprinted, or incorrect items.
- Operator process: keep `MERCH_DRAFT_ORDERS_ENABLED=false` until someone is actively monitoring Printful draft orders and the support inbox. When enabled, use the Printful dashboard draft order, optional customer notes, and `external_id` to reconcile the request, then email the payment link manually.

Use `.dev.vars` for local Pages Functions testing and never commit it.

## Route Inventory

See `ROUTE_INVENTORY.md` for the human-readable route classification. The executable route list lives in `tools/routes.js` and is used by the link checker and smoke tests.

Primary public pages:

- `index.html`: homepage with streaming embed, featured discovery, and shared label shell.
- `roster.html`: public project roster.
- `connect.html`: social, playlist, support, and email contact paths.
- `about.html`: public label story.

Hidden or gated modern routes:

- `catalog.html`: release catalog, currently `noindex,follow`.
- `artist.html`: dynamic project page, currently `noindex,follow`.
- `release.html`: dynamic release detail page, currently `noindex,follow`.
- `epks.html`: press/EPK index, currently `noindex,follow`.
- `epk.html`: dynamic artist press kit, currently `noindex,follow`.
- `merch.html`: modern merch desk, currently `noindex,follow`; curated live Printful inventory loads through Cloudflare Pages Functions and the full Printful catalog is internal-only.
- `process.html`: creative-process story page, currently `noindex,follow`.

Generated public SEO artifacts:

- `artists/index.html` and `artists/<slug>/index.html`: crawlable artist/project entity pages.
- `releases/index.html` and `releases/<slug>/index.html`: crawlable release entity pages.
- `press/index.html` and ready `press/<slug>/index.html`: crawlable public press-kit snapshots.
- `sitemap.xml` and `llms.txt`: generated discovery manifests.

Internal, shell, and legacy surfaces:

- `admin.html`: local catalog editor, intentionally `noindex,nofollow`.
- `shell.html`, `shell.css`, and `shell.js`: persistent iframe shell for music continuity.
- `artists.html`: redirect shim to `roster.html`.
- `campaigns.html`, `brand-kit.html`, and `release-deck.html`: internal/lab surfaces, intentionally `noindex,nofollow` and blocked in `robots.txt`.

## Core Files

- `data/source-catalog.json`: maintainer-owned source overlay for verified Spotify seeds, Too.fm links, YouTube IDs, press readiness, and approved asset metadata.
- `data/spotify-cache.json`: local/build-time Spotify API cache generated from seeded URLs. Do not put Spotify secrets in public files.
- `public-data.js`: generated public artist, release, playlist, merch, and label data consumed by the static site.
- `data/merch-products.json`: curated Printful merch metadata and manual-order launch posture.
- `site-ui.js`: shared data helpers, release-state helpers, artwork fallbacks, metadata helpers, and reveal behavior.
- `label-site.js`: modern public rendering for home, roster, connect, about, catalog, project, merch, and press routes.
- `label-site.css`: modern public design system.
- `release.js` and `release.css`: standalone release-detail experience.
- `site-audio-config.js`, `site-audio.js`, and `site-audio.css`: site-wide background audio configuration and controls.
- `admin.html` and `admin.js`: in-browser catalog intake and export workflow.
- `tools/audit-data.js`, `tools/generate-public-data.js`, `tools/sync-spotify.js`, and `tools/check-data.js`: source-backed catalog audit, generation, Spotify sync, and data readiness checks.
- `tools/generate-seo-artifacts.js`: static SEO page, sitemap, and `llms.txt` generator.
- `tools/check-links.js`: local route, link, data, and asset validator.
- `tools/check-performance.js`: public image and media-embed budget validator.
- `tests/smoke.spec.js`: Playwright route smoke tests.
- `tests/accessibility.spec.js`: Playwright/axe accessibility smoke tests.
- `tests/media.spec.js`: Playwright embed fallback tests.

## Release Intake Workflow

Open `admin.html` in the browser to:

1. Add or refine artist profiles.
2. Input a release title, artist, type, year, vibe, description, and accent color.
3. Attach square cover art by path, URL, or browser upload.
4. Add a track listing with optional YouTube video IDs.
5. Add streaming platform links.
6. Download the current dataset as JSON or as publish-ready `public-data.js`.

The editor works in memory for the current session. Use JSON import/export when moving changes in or out of the repo.

Source-backed fields such as Spotify metadata, identifiers, EPK status, approval flags, and structured press assets are preserved by the editor, but the preferred path for platform facts is still `data/source-catalog.json` plus `npm run generate:data`.

## Publishing Notes

- Keep `public-data.js` `label.launchMode` set to `essentials` until the Sprint 4 launch criteria pass.
- Do not flip release, artist, or EPK routes public until `npm run test:data -- --launch-gate` passes or the remaining missing Spotify seeds are intentionally waived in the launch PR.
- Public pages should render from `public-data.js` unless they are intentionally local/admin-only.
- Update `WORKFLOW.md` at sprint closeout with completed work, validation, risks, and the next recommended sprint.
- Follow `GITHUB_PRACTICES.md` for branch naming, stacked branches, staged draft PRs, validation notes, review readiness, and merge hygiene.
