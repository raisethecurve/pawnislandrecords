# Pawn Island Records Website Completion Workflow

Status date: 2026-05-03

## Current State

Pawn Island Records is a static, data-driven website with no package manifest or build step. The public experience is controlled by HTML entry points, shared CSS/JS, and the published dataset in `public-data.js`.

The active public launch mode is `essentials`:

- `public-data.js` sets `label.launchMode` to `essentials`.
- `label-site.js` uses that flag to hide catalog, artist, release, and press surfaces from the primary nav.
- The published dataset currently includes 9 artists, 29 releases, 9 merch records, 14 live releases, and 15 upcoming releases.

Primary public pages:

- `index.html`: home with Spotify embed, featured discovery, shared label shell.
- `roster.html`: artist roster.
- `connect.html`: social, playlist, support, and email contact paths.
- `about.html`: public label story.

Hidden or gated pages:

- `catalog.html`: release catalog, currently `noindex,follow`.
- `artist.html`: dynamic project page, currently `noindex,follow`.
- `release.html`: dynamic release detail page, currently `noindex,follow`.
- `epks.html`: press/EPK index, currently `noindex,follow`.
- `epk.html`: dynamic artist press kit, currently `noindex,follow`.
- `process.html`: creative-process story page, currently `noindex,follow`.
- `merch.html`, `campaigns.html`, `brand-kit.html`: older internal/lab surfaces using `data.js`, `catalog-store.js`, `styles.css`, and the split `styles/` design stack.
- `release-deck.html`: standalone coming-soon product/analytics page, currently `noindex,nofollow`.
- `admin.html`: local catalog editor, intentionally `noindex,nofollow`.
- `shell.html`: persistent iframe shell for music continuity, intentionally `noindex,follow`.
- `artists.html`: redirect shim to `roster.html`.

Key architecture facts:

- The modern public site stack is `public-data.js`, `site-ui.js`, `label-site.js`, `label-site.css`, `site-audio.js`, `site-audio.css`, and `site-shell-bootstrap.js`.
- `shell.html`, `shell.js`, and `shell.css` wrap pages in a persistent iframe so audio keeps playing during navigation.
- `admin.html` and `admin.js` manage in-browser data intake and export.
- Older lab pages still depend on `data.js`, `catalog-published.js`, `catalog-store.js`, `theme.js`, and `styles.css`.
- `README.md` is directionally useful but stale in places: it references page scripts such as `home.js`, `artists.js`, `artist.js`, and `catalog.js` that are not present in the current repo.
- There is no automated test, lint, accessibility, visual-regression, sitemap, or link-validation workflow yet.

## Product Goal

Ship a fully functional, state-of-the-art independent label website that moves a visitor from discovery to listening, press confidence, fan support, and direct contact with minimal friction.

The finished site should feel:

- Fast on mobile and desktop.
- Clear enough for first-time listeners.
- Deep enough for press, playlist curators, and collaborators.
- Durable enough for frequent release updates.
- Easy for future agents or maintainers to extend without guessing.

## Agile Operating Model

Use one-week sprints until launch mode can safely move from `essentials` to `full`.

Each sprint has:

- A written sprint goal.
- A groomed backlog with user stories and acceptance criteria.
- A small implementation scope that can be reviewed independently.
- A demoable increment at the end of the sprint.
- Validation notes added to the PR.

Definition of Ready:

- The story names the user, need, and value.
- The affected pages and data fields are known.
- Acceptance criteria include desktop, mobile, accessibility, SEO, and no-JS fallback expectations where relevant.
- Any copy, art, playlist, or external-link dependency is named.

Definition of Done:

- The story is implemented in the current architecture or a documented migration path.
- Page content renders from `public-data.js` unless the page is intentionally local/admin-only.
- Keyboard navigation, focus states, headings, labels, and reduced-motion behavior are checked.
- Mobile and desktop layouts are visually verified.
- Public pages have correct title, description, canonical, Open Graph, Twitter card, and robots metadata.
- Links, embeds, image paths, and query-string routes are validated.
- The change does not expose `admin.html` or local-only docs.
- The README and workflow are updated when architecture changes.

## Delivery Roadmap

### Sprint 0: Baseline And Guardrails

Goal: make the repo safe to change repeatedly.

Stories:

- As a maintainer, I can run a local static server and know which URL to open.
- As a maintainer, I can validate links, route parameters, metadata, and missing assets before opening a PR.
- As a maintainer, I can compare desktop and mobile screenshots for the main and hidden pages.

Tasks:

- Add a lightweight `package.json` only if it earns its keep: static server, Playwright smoke tests, link checker, formatting helpers.
- Add a route inventory file or script covering all public, hidden, admin, shell, and redirect pages.
- Add smoke tests for `index.html`, `roster.html`, `connect.html`, `about.html`, `catalog.html`, `artist.html?artist=rhea-mauro`, `release.html?release=...`, `epks.html`, and `epk.html?artist=rhea-mauro`.
- Update `README.md` so it matches the actual file structure.
- Decide whether screenshots in `tmp/` should stay ignored/generated or be curated into a visual QA folder.

Acceptance criteria:

- A new agent can clone, serve, inspect, and smoke-test the site in under ten minutes.
- CI or a documented local command catches broken internal links and missing assets.

### Sprint 1: Public Route Completion

Goal: finish the hidden routes that are already part of the modern public site.

Stories:

- As a listener, I can browse the full catalog by project, status, and release type.
- As a listener, I can open a project page that feels complete even when an artist has upcoming releases.
- As a listener, I can open a release page from catalog, project, and featured cards.
- As a press or playlist contact, I can open a press index and individual EPK without seeing placeholders.

Tasks:

- Complete empty states and fallback copy for `catalog.html`, `artist.html`, `release.html`, `epks.html`, and `epk.html`.
- Replace generic metadata on dynamic pages after data resolution.
- Ensure canonical URLs include durable query parameters or move to generated static slugs if SEO needs demand it.
- Make all route-to-route links preserve shell behavior without trapping users.
- Add JSON-LD for MusicGroup, MusicAlbum, MusicRecording, and Organization where appropriate.
- Keep `launchMode` as `essentials` until all acceptance criteria pass.

Acceptance criteria:

- No hidden page uses "being prepared for launch" copy in the rendered experience.
- Every live artist and release has a usable route.
- Upcoming releases show clear status, date, pre-save/listen action, and no broken platform CTA.

### Sprint 2: Press, Campaign, And Merch Decisions

Goal: decide what becomes public, what stays internal, and what gets retired.

Stories:

- As press, I can download or view credible artist assets and bios.
- As a fan, I can support the label or find merch without prototype language.
- As a label operator, I can use campaign and brand tools without exposing drafts publicly.

Tasks:

- Audit `merch.html`, `campaigns.html`, `brand-kit.html`, and `release-deck.html`.
- Port public-worthy merch and campaign features to the modern `label-site` stack.
- Keep true internal tools `noindex,nofollow` and remove them from public navigation.
- Decide whether `process.html` is public storytelling or a hidden support page; if public, migrate it to the modern nav and metadata standard.
- Add robots and sitemap rules that match the final publication decision.

Acceptance criteria:

- Every route has an explicit classification: public, hidden-but-shareable, admin-only, redirect, or retired.
- Public pages use one design system and one data source unless there is a documented reason not to.

### Sprint 3: State-Of-The-Art UX Layer

Goal: make the site feel polished, fast, accessible, and resilient.

Stories:

- As a mobile visitor, I can move through the roster and catalog without layout jumps or tiny tap targets.
- As a listener, I can play or continue audio without surprise restarts.
- As an accessibility user, I can navigate all routes with keyboard and assistive tech.

Tasks:

- Tighten responsive layout around fixed-format UI: playlist embeds, release cards, nav, and audio dock.
- Add loading, error, and fallback states for iframes, artwork, and external platform assets.
- Add reduced-motion alternatives for shell transitions and page reveals.
- Audit color contrast, focus outlines, heading order, landmarks, skip links, and modal behavior.
- Optimize image sizes and add lazy/eager loading rules by viewport importance.
- Add a privacy-respectful analytics plan if analytics are desired.

Acceptance criteria:

- Lighthouse or equivalent checks are green enough to be actionable: performance, accessibility, best practices, and SEO.
- No page has incoherent overlap at common mobile and desktop breakpoints.
- The audio shell is tested both with direct page entry and shell-framed navigation.

### Sprint 4: Launch Mode And Publishing

Goal: move from `essentials` to `full` with confidence.

Stories:

- As a visitor, I can discover catalog, releases, and press from primary navigation.
- As a maintainer, I can publish release data without hand-editing fragile markup.
- As search engines and social previews, every intended public page has coherent metadata.

Tasks:

- Change `public-data.js` `label.launchMode` from `essentials` to `full`.
- Update `sitemap.xml` to include final public URLs.
- Update `robots.txt` to block only admin/internal/retired surfaces.
- Update page-level robots tags from `noindex` to `index` only after content and QA pass.
- Create release-day checklist for adding future releases, artwork, platform URLs, and YouTube IDs.

Acceptance criteria:

- Direct load and shell load both work for every public route.
- Final PR includes validation screenshots or links to generated QA output.
- The site can be published without manual hidden-page toggles outside `public-data.js` and route metadata.

## Backlog Epics

Epic: Data Integrity

- Normalize release status names and dates.
- Validate artist/release slug uniqueness.
- Validate platform URL completeness for live releases.
- Separate live, upcoming, draft, and archived content in data.

Epic: Route Architecture

- Keep static HTML entry points until there is a concrete need for a build system.
- Consider generated static pages for artists and releases if query-string routes limit SEO or sharing.
- Keep `shell.html` as progressive enhancement, not the only way to experience the site.

Epic: Design System

- Consolidate modern public UI into `label-site.css`.
- Retire or quarantine older `styles.css` and `styles/` stack for internal labs.
- Create reusable patterns for cards, media embeds, badges, CTA groups, breadcrumbs, and empty states.

Epic: Content And Conversion

- Clarify the top conversion for each route: listen, pre-save, support, press contact, or explore.
- Add press-ready bios and assets for each artist.
- Add merch only where purchase/support links are live or deliberately marked as concepts.

Epic: Quality And Automation

- Add Playwright smoke coverage for every route class.
- Add link and asset checks.
- Add basic accessibility checks.
- Add visual screenshot baselines for desktop and mobile.

## PR Workflow

For each development PR:

1. Start from `main` unless continuing an existing feature branch.
2. Use branch prefix `codex/`.
3. Keep one sprint story or tightly related set of tasks per PR.
4. Update `WORKFLOW.md` when the route inventory, architecture, or launch plan changes.
5. Run the available smoke checks. If checks are not yet automated, document manual browser coverage in the PR body.
6. Open PRs as draft unless the user explicitly asks for ready review.

## First Implementation Slice

Recommended next PR after this workflow:

1. Add `package.json` with `serve`, `test:smoke`, and `test:links` scripts.
2. Add Playwright route smoke tests for the modern public and hidden pages.
3. Update `README.md` to match the actual file structure.
4. Add a route inventory document that classifies public, hidden, admin, redirect, and retired pages.

That gives the project a reliable runway before deeper page-completion work begins.
