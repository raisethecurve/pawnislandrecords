# Pawn Island Records

Static, data-driven website for Pawn Island Records. The current public launch mode is `essentials`, so the primary public flow is Home, Roster, Connect, and About while deeper catalog, release, project, press, merch, and process routes stay hidden-but-shareable.

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

- `npm run test:links` checks route inventory files, local HTML links, local assets, `public-data.js` image references, slug uniqueness, release artist references, the configured site-audio file, and route publication policy across page robots tags, `robots.txt`, and `sitemap.xml`.
- `npm run test:perf` checks the public image asset budget and verifies media iframes keep explicit loading and embed hydration hooks.
- `npm run test:a11y` runs axe-backed Playwright accessibility smoke checks across key public and hidden-preview routes on desktop and mobile. It also checks primary tap target sizing, visible initial focus, landmarks/navigation, and page-level horizontal overflow.
- `npm run test:media` verifies Spotify and YouTube embed fallback UI when external players fail.
- `npm run test:smoke` runs Playwright smoke coverage across desktop and mobile for public routes, hidden route samples, internal route samples, and shell-framed navigation.
- `npm test` runs links, performance, accessibility, media resilience, and smoke checks.

Playwright screenshots are written under ignored `test-results/` output and are treated as manual review artifacts, not visual-regression baselines. If a fresh machine reports a missing browser executable, run `npx playwright install chromium` once and rerun the smoke tests.

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
- `merch.html`: modern merch concept/support page, currently `noindex,follow`; checkout actions only appear when item URLs are present.
- `process.html`: creative-process story page, currently `noindex,follow`.

Internal, shell, and legacy surfaces:

- `admin.html`: local catalog editor, intentionally `noindex,nofollow`.
- `shell.html`, `shell.css`, and `shell.js`: persistent iframe shell for music continuity.
- `artists.html`: redirect shim to `roster.html`.
- `campaigns.html`, `brand-kit.html`, and `release-deck.html`: internal/lab surfaces, intentionally `noindex,nofollow` and blocked in `robots.txt`.

## Core Files

- `public-data.js`: published artist, release, playlist, merch, and label data.
- `site-ui.js`: shared data helpers, release-state helpers, artwork fallbacks, metadata helpers, and reveal behavior.
- `label-site.js`: modern public rendering for home, roster, connect, about, catalog, project, merch, and press routes.
- `label-site.css`: modern public design system.
- `release.js` and `release.css`: standalone release-detail experience.
- `site-audio-config.js`, `site-audio.js`, and `site-audio.css`: site-wide background audio configuration and controls.
- `admin.html` and `admin.js`: in-browser catalog intake and export workflow.
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

## Publishing Notes

- Keep `public-data.js` `label.launchMode` set to `essentials` until the Sprint 4 launch criteria pass.
- Public pages should render from `public-data.js` unless they are intentionally local/admin-only.
- Update `WORKFLOW.md` at sprint closeout with completed work, validation, risks, and the next recommended sprint.
- Follow `GITHUB_PRACTICES.md` for branch naming, stacked branches, staged draft PRs, validation notes, review readiness, and merge hygiene.
