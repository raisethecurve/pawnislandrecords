# Pawn Island Records Project Roadmap

Status date: 2026-05-27

This roadmap is the strategic plan for the Pawn Island Records website. Use it to decide what to build next, what is launch-critical, what can wait, and how to measure whether the site is ready to move from `essentials` launch mode to `full` launch mode.

For execution tracking, keep using `WORKFLOW.md` as the sprint closeout log. For route classification, keep using `ROUTE_INVENTORY.md` and `tools/routes.js`.

## Current Snapshot

Pawn Island Records is a static, data-driven label website with a modern public site, a persistent audio shell, a local catalog editor, and several older internal/lab surfaces.

Current launch mode:

- `public-data.js` sets `label.launchMode` to `essentials`.
- The public navigation currently emphasizes Home, Roster, Connect, and About.
- Catalog, project, release, and press routes exist but are hidden from primary navigation and marked `noindex,follow`.

Current data shape:

- 9 artists.
- 31 releases.
- 14 live releases.
- 17 upcoming releases.
- 1 strict-ready EPK.
- 8 held EPKs.
- 9 merch records.
- 18 discovery playlists.
- 10 social/contact/support links.

Current route groups:

- Public: `index.html`, `roster.html`, `connect.html`, `about.html`.
- Generated public SEO: `artists/`, `artists/<slug>/`, `releases/`, `releases/<slug>/`, `press/`, ready `press/<slug>/`, `llms.txt`.
- Hidden-but-shareable: `catalog.html`, `artist.html`, `release.html`, `epks.html`, `epk.html`, `merch.html`, `process.html`.
- Admin-only: `admin.html`.
- Shell: `shell.html`.
- Redirect shim: `artists.html`.
- Internal/lab: `campaigns.html`, `brand-kit.html`, `release-deck.html`.

Current guardrails:

- `npm run serve` starts a local static server.
- `npm run test:links` validates route inventory, local links, local assets, selected data integrity rules, site audio configuration, page robots tags, `robots.txt`, and `sitemap.xml`.
- `npm run test:perf` validates public image asset budgets and media iframe loading/hydration hooks.
- `npm run test:a11y` runs axe-backed accessibility smoke coverage across key direct routes.
- `npm run test:media` verifies Spotify and YouTube fallback states when external players fail.
- `npm run test:smoke` runs Playwright smoke coverage across desktop and mobile.
- `npm test` runs the full local validation stack.

Known gaps:

- Hidden modern routes are complete under `preview=full` but remain gated while `launchMode` is `essentials`.
- Interactive artist/release/press routes are still gated, but generated static entity pages now provide indexable canonical URLs for core project and release discovery.
- Full public SEO still needs external profile corroboration, Search Console/Bing submission, and remaining Spotify seed completion.
- No automated visual regression baseline is present; Playwright screenshots are manual review artifacts under ignored `test-results/`.
- Campaign, brand-kit, and Release Deck pages are quarantined as internal, but campaigns and brand-kit still use the older lab stack.
- Merch is modern and hidden-but-shareable, but store item URLs are still empty.
- Some downloadable fan files are placeholders.
- Release action rendering is normalized, and source-backed data validation now checks release action readiness before launch.
- Spotify seeds are still incomplete: 9 artist seeds and 30 release seeds are missing before the full launch gate.
- Press pages now use strict EPK readiness: held kits render request-by-email states instead of partial public kits.
- The tracked `tmp/` folder contains legacy QA screenshots and browser-profile artifacts that should be cleaned up in a dedicated maintenance pass.

## Product North Star

Build a fast, vivid, trustworthy independent label site that moves each visitor from discovery to the right next action:

- Listen to the catalog.
- Understand each project world.
- Follow or support the label.
- Open credible press materials.
- Contact the label directly.
- Maintain and publish release data without fragile hand edits.

The site should feel rich, polished, and unusual, but the operating model should stay simple: static files, data-driven pages, strong local validation, and no unnecessary build system until the project actually needs one.

## Strategic Principles

1. Keep `public-data.js` as the public content source of truth until a stronger data pipeline is justified.
2. Keep shell navigation as progressive enhancement. Every public page must still work by direct URL.
3. Treat mobile as the primary browsing surface.
4. Do not expose admin or draft tools through public navigation, sitemap, or indexable metadata.
5. Prefer completing existing route surfaces before adding new destinations.
6. Use one modern public design system for public-facing pages.
7. Add automation for every class of bug that is likely to recur.
8. Keep each sprint demoable and reversible.
9. Update docs at sprint closeout so future work starts from the truth instead of memory.

## Audience Journeys

Listener journey:

- Land on Home from social or search.
- Understand the label quickly.
- Play the featured catalog or a discovery playlist.
- Move into Roster, Catalog, Artist, or Release pages without confusion.
- Follow the label or save/listen on a streaming platform.

Press and curator journey:

- Open a project or EPK link.
- See a credible bio, release context, highlights, visuals, and listening links.
- Copy facts or open assets without hunting.
- Contact the label with enough confidence to write, playlist, or book coverage.

Fan support journey:

- Find live merch/support links without prototype language.
- Understand whether a support item is purchasable, upcoming, or concept-only.
- Move from listening to support without losing the music context.

Collaborator journey:

- Understand the label's creative world and project lanes.
- Find direct contact paths.
- See enough catalog depth to know whether collaboration makes sense.

Maintainer journey:

- Add or update artists, releases, artwork, platform URLs, and embeds.
- Validate locally.
- Publish without manually chasing stale route lists, metadata, or broken assets.

## Milestone Plan

### Milestone 0: Baseline And Guardrails

Status: completed 2026-05-04.

Purpose:

- Make the project safe to change repeatedly.
- Give future agents and maintainers a reliable way to serve, inspect, and smoke-test the site.

Completed outcomes:

- Added npm scripts for local serving, link checks, smoke tests, and full validation.
- Added executable route inventory in `tools/routes.js`.
- Added human-readable route inventory in `ROUTE_INVENTORY.md`.
- Added local link, asset, and data checks in `tools/check-links.js`.
- Added Playwright smoke tests for primary public routes, hidden route samples, and shell-framed navigation.
- Updated `README.md` and `WORKFLOW.md` to reflect the current architecture.

Remaining follow-up:

- Decide whether legacy tracked `tmp/` screenshots should become curated visual baselines or be removed from source control.

### Milestone 1: Hidden Route Completion

Status: completed 2026-05-04.

Purpose:

- Finish the modern route surfaces that already exist before making broader launch decisions.
- Keep them hidden from primary navigation until content, metadata, and QA are ready.

Primary routes:

- `catalog.html`
- `artist.html?artist=...`
- `release.html?release=...`
- `epks.html`
- `epk.html?artist=...`

Completed outcomes:

- Catalog renders useful release groups, filters, empty states, and release actions.
- Artist pages render complete project worlds for every artist.
- Release pages render complete listen/pre-save context, platform actions, embeds, track lists, related releases, and artist context.
- Press index and EPK pages render useful press material without placeholder language.
- Dynamic routes update page title, meta description, canonical URL, social preview metadata, robots state, and JSON-LD after data resolution.
- Route-to-route links work in direct page mode and shell mode.
- Smoke/link coverage includes hidden `preview=full` direct and shell cases.

Remaining follow-up:

- Keep `launchMode` as `essentials` until Milestone 4.
- Decide in a later SEO slice whether query-string artist/release URLs are enough or generated static pages are needed.
- Add automated accessibility checks in Milestone 3.

Acceptance criteria:

- No hidden modern route displays launch-hold copy when tested under `full` behavior.
- Every artist has a usable project page and EPK page.
- Every release has a usable release page or a documented reason it remains hidden.
- Upcoming releases show release date/status, pre-save or campaign CTA, and no broken platform action.
- Live releases show at least one useful listen action.
- Dynamic pages have accurate title, description, canonical strategy, social preview data, and robots state.
- Keyboard navigation, focus order, headings, and reduced-motion behavior are checked.

Recommended implementation sequence:

1. Add a local way to preview hidden routes as if `launchMode` were `full` without prematurely changing the published data.
2. Complete catalog and artist route rendering because release and EPK routes depend on those relationships.
3. Complete release pages with normalized action logic.
4. Complete press index and EPK pages.
5. Add metadata and structured data where it is stable.
6. Expand validation coverage.

### Milestone 2: Press, Merch, Campaign, And Route Decisions

Status: completed 2026-05-04.

Purpose:

- Decide which older/lab surfaces become public product features, which stay internal, and which are retired.

Routes to audit:

- `merch.html`
- `campaigns.html`
- `brand-kit.html`
- `release-deck.html`
- `process.html`

Key decisions:

- Should merch be public now, hidden-but-shareable, or delayed until purchase/support URLs are live?
- Should campaigns be a public discovery layer, an internal planning tool, or retired?
- Should the brand kit be public press infrastructure or internal-only?
- Should `process.html` become public storytelling or stay hidden?
- Should `release-deck.html` remain a standalone coming-soon product page, move to another project, or retire from this repo?

Key outcomes:

- Every route has one explicit classification: public, hidden-but-shareable, admin-only, internal-lab, redirect, or retired.
- Public-worthy features are migrated to the modern public stack.
- Internal tools are clearly marked `noindex,nofollow`.
- Retired pages redirect or are removed intentionally.
- Sitemap and robots rules match the route decisions.

Completed outcomes:

- `merch.html` is hidden-but-shareable, uses `public-data.js`, and renders on the modern public stack.
- Empty merch URLs render as checkout-pending states; only real store URLs can create active store buttons.
- TipTopJar remains the active support conversion on the merch page and connect page.
- `process.html` stays hidden-but-shareable story content outside primary nav.
- `campaigns.html`, `brand-kit.html`, and `release-deck.html` stay internal, `noindex,nofollow`, blocked in `robots.txt`, and absent from public navigation.
- `tools/check-links.js` now fails if route robots policy, page robots tags, `robots.txt`, or `sitemap.xml` drift out of sync.

Acceptance criteria:

- No public route depends on the legacy lab design stack unless that dependency is documented and temporary.
- No internal route is reachable from public navigation.
- Merch/support copy never implies a live purchase path when the URL is empty.
- Campaign and brand assets are credible enough for their chosen audience.

### Milestone 3: UX, Accessibility, And Performance Polish

Status: completed 2026-05-04.

Purpose:

- Make the site feel finished on real devices, not just structurally complete.

Key outcomes:

- Mobile layouts are stable across common viewport widths.
- Audio shell behavior is predictable across direct entry, shell entry, back/forward, and route changes.
- Artwork, embeds, and external assets have loading, error, and fallback states.
- Accessibility checks cover keyboard navigation, landmarks, focus indicators, headings, names/labels, contrast, and reduced motion.
- Image loading is optimized by importance and viewport.
- Playwright screenshots become useful for visual review.

Acceptance criteria:

- No incoherent overlap or layout shift on tested mobile and desktop breakpoints.
- All interactive controls are reachable and understandable by keyboard.
- Reduced-motion users get a calmer experience.
- Lighthouse or equivalent checks produce actionable green or documented exceptions for performance, accessibility, best practices, and SEO.
- External embeds fail gracefully.

Automation added:

- Axe-backed Playwright accessibility smoke checks for key public and hidden-preview routes.
- Playwright media fallback tests for Spotify and YouTube iframe failure states.
- Public image size budget and media iframe policy checks in `tools/check-performance.js`.
- Playwright screenshots remain ignored manual review artifacts in `test-results/`; true visual diffs are deferred until baseline maintenance is worth the extra workflow.

### Milestone 4: Full Launch

Status: planned.

Purpose:

- Move from `essentials` to `full` launch mode with confidence.

Key outcomes:

- `public-data.js` `label.launchMode` moves from `essentials` to `full`.
- Public navigation includes the final launch routes.
- Page-level robots tags are updated only for routes intended to be indexed.
- `sitemap.xml` includes all final public URLs.
- `robots.txt` blocks only admin, downloads, generated artifacts, retired pages, and truly internal surfaces.
- Social preview metadata and canonical behavior are coherent.
- A release-day publishing checklist exists.

Acceptance criteria:

- `npm test` passes.
- Manual browser review passes for direct and shell entry.
- Public pages have correct metadata, social cards, and indexability.
- Hidden/internal pages remain non-indexable and absent from public navigation.
- A maintainer can add a release, validate, and publish using documented steps.

Launch gate checklist:

- Route readiness: every public route renders complete content.
- Data readiness: every live release has at least one listen action; every upcoming release has a campaign/pre-save action or a clear status; `npm run test:data` passes.
- Press readiness: every public EPK has approved bio, approved structured asset, current release context, media/listen path, and contact path.
- SEO readiness: title, description, canonical, robots, sitemap, Open Graph, and Twitter card state are aligned.
- Accessibility readiness: keyboard, focus, headings, contrast, labels, and reduced motion are checked.
- Performance readiness: image loading, embed behavior, and mobile layout are acceptable.
- Operations readiness: release update workflow and rollback path are documented.

### Milestone 5: Post-Launch Operations And Growth

Status: future.

Purpose:

- Turn the site from a launch artifact into a reliable operating system for the label.

Possible outcomes:

- Improve `admin.html` into a safer release intake tool with stronger validation and local draft recovery.
- Generate static artist/release pages if query-string routes become a search or sharing limitation.
- Add a privacy-respectful analytics plan if the label wants conversion insight.
- Add release calendar views and campaign history.
- Create a real press asset library with downloadable files.
- Add a lightweight changelog for release data updates.
- Add CI once the repo workflow is ready for remote checks.

## Workstream Roadmap

### Content And Data

Near-term:

- Fill missing Spotify artist and release seeds in `data/source-catalog.json`, then run `npm run sync:spotify` and `npm run generate:data`.
- Keep `npm run test:data` passing as the source-data readiness gate.
- Keep every live release pointed at a valid listen path.
- Keep every upcoming release supplied with release date/status and a campaign/pre-save path.
- Fill missing track lists where release pages should show track detail.
- Replace placeholder fan download files or keep downloads blocked until real assets exist.

Later:

- Add optional fields for press photo credits, asset URLs, long bio, short bio, and quote pullouts.
- Separate draft, upcoming, live, archived, and private content if the catalog grows.
- Add data validation for required fields by release status.

### Public Route UX

Near-term:

- Keep hidden modern routes shareable through `preview=full` until launch mode changes.
- Keep merch and process hidden-but-shareable until full-launch navigation decisions are ready.

Later:

- Consider generated static routes for artists and releases.
- Add richer discovery paths by mood, project lane, status, and release wave.
- Add no-JS fallback content for critical pages if needed.

### Press And EPK

Near-term:

- Keep brand-kit assets internal for now; promote specific assets into EPK pages only when they are press-ready.
- Keep EPK pages strict: only `epkStatus: "ready"` artists with approved bio, approved structured asset, source-backed release context, media/listen path, and contact path appear in the press index.
- Replace held EPKs with approved source entries in `data/source-catalog.json` instead of filling page fallbacks.
- Replace text-only asset lists with downloadable press kits when real files are ready.

Later:

- Add downloadable press kits.
- Add one-sheets per release.
- Add media quote sections if coverage arrives.

### Merch And Support

Near-term:

- Keep `merch.html` hidden-but-shareable until checkout URLs or launch criteria justify public navigation.
- Add real store URLs only when checkout is ready; empty merch URLs must stay checkout-pending.
- Keep TipTopJar as the support-first conversion while merch is concept-stage.

Later:

- Add availability states: live, preorder, concept, sold out, hidden.

### SEO And Metadata

Near-term:

- Keep Sprint 1 runtime metadata and JSON-LD covered by smoke tests.
- Keep Sprint 2 route publication checks passing for robots and sitemap alignment.
- Decide canonical strategy for query-string routes.

Later:

- Generate sitemap entries for public artist/release pages if they become indexable.
- Add deeper metadata validation for title, description, canonical, Open Graph, Twitter card, and JSON-LD completeness.

### Accessibility And Quality

Near-term:

- Keep automated accessibility, media fallback, and performance budget checks passing before launch-mode changes.
- Keep Playwright screenshots as manual review artifacts.
- Run deeper manual Lighthouse/browser review before the final launch toggle if performance questions remain.

Later:

- Add visual regression baselines.
- Add CI for `npm test`.

### Architecture And Technical Debt

Near-term:

- Keep the static architecture.
- Avoid new frameworks unless a concrete build or content need emerges.
- Keep campaign, brand-kit, and Release Deck surfaces quarantined unless a later sprint migrates or retires them.

Later:

- Decide whether generated static pages, a small build step, or a CMS/export pipeline would reduce maintenance risk.
- Clean tracked/generated artifacts in `tmp/` through a dedicated branch.

## Next Sprint Backlog: Sprint 4

Sprint goal:

- Complete the remaining source-data gate before moving from `essentials` launch mode to `full`.

Recommended scope:

| Priority | Story | Main files | Acceptance notes |
| --- | --- | --- | --- |
| P0 | Spotify seed completion | `data/source-catalog.json`, `data/spotify-cache.json`, `public-data.js` | Missing artist/release seeds are filled or explicitly waived, sync runs, generated data is reviewed. |
| P0 | Strict EPK completion | `data/source-catalog.json`, `public-data.js`, `label-site.js` | Every public EPK has approved bio, structured asset, release context, media/listen path, and contact path. |
| P1 | Final public route audit | `tools/routes.js`, `ROUTE_INVENTORY.md`, `README.md` | Every route has a final launch classification before nav, robots, or sitemap changes. |
| P1 | SEO and publication alignment | `robots.txt`, `sitemap.xml`, HTML metadata | Robots tags, sitemap entries, canonicals, and public navigation agree. |
| P1 | URL strategy decision | `ROADMAP.md`, `WORKFLOW.md`, optional tooling | Query-string artist/release URLs are accepted for launch or a static-page generation slice is created first. |
| P1 | Release-day publishing checklist | `README.md`, `WORKFLOW.md` | Maintainer steps for data updates, validation, publish, and rollback are documented. |
| P2 | Sprint 4 closeout | `WORKFLOW.md`, `ROADMAP.md` | Validation, launch decision, deferred risks, and post-launch recommendation are captured. |

Suggested Sprint 4 slices:

1. Fill and sync Spotify seeds without flipping `launchMode`.
2. Promote held EPKs only when approved source data exists.
3. Route/nav/SEO launch audit.
4. Launch-mode implementation branch and release-day checklist.

Sprint 3 closeout:

- `npm run test:a11y` now runs axe-backed desktop/mobile accessibility smoke coverage for key public and hidden-preview routes.
- The first responsive/accessibility polish pass fixed standalone direct-page nav, small tap targets in artist cards, footer/social controls, merch filters, carousel dots, release nav, and the audio dock.
- Reduced-motion CSS coverage now exists for the modern public stack, release detail stack, shell, and audio dock.
- Spotify and YouTube embeds now expose slow/error states with public fallback actions.
- `npm run test:media` covers external-player failure UI.
- `npm run test:perf` covers public image budget and media iframe policy.
- Screenshot QA posture is decided: keep Playwright screenshots as ignored manual review artifacts, not visual baselines.

Sprint 4 risks:

- Query-string dynamic routes may be acceptable for launch speed but weaker for long-term SEO.
- Moving hidden routes into primary navigation changes user expectations for every project and release page.
- Sitemap and robots updates are easy to drift unless route inventory, HTML metadata, and validation stay synchronized.

## Decision Log

Open decisions:

- Whether query-string artist/release URLs are acceptable for full launch SEO.
- Whether downloads should be removed, blocked, or replaced with real fan files.
- Whether analytics are desired, and if so, which privacy posture is acceptable.

Decided for now:

- Keep `launchMode` as `essentials` until Milestone 4.
- Keep static files and avoid introducing a build system until there is a concrete need.
- Keep `admin.html` local/admin-only.
- Keep `WORKFLOW.md` as sprint closeout history and this file as strategic roadmap.
- Keep `merch.html` hidden-but-shareable and support-first until real checkout URLs or full-launch criteria justify public nav.
- Keep `campaigns.html`, `brand-kit.html`, and `release-deck.html` internal, `noindex,nofollow`, and blocked in `robots.txt`.
- Keep `process.html` hidden-but-shareable story content outside primary nav for now.
- Keep Playwright screenshots as ignored manual review artifacts for now; do not add automated visual diffs until baseline upkeep is clearly worth it.

## Risk Register

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Hidden routes are complete under preview but still gated publicly | Full launch could expose unfinished route decisions | Keep `launchMode` in `essentials` until Milestone 4 and continue testing `preview=full`. |
| External platform URLs are incomplete or split across fields | Broken or confusing CTAs | Sprint 1 normalized action fallbacks; add deeper validation by release status later. |
| Legacy lab pages drift from modern design/data patterns | Public experience becomes inconsistent | Sprint 2 quarantined campaign, brand-kit, and Release Deck surfaces; keep them blocked unless a later sprint migrates or retires them. |
| Query-string routes limit SEO/social sharing | Artist/release pages underperform in search and previews | Decide canonical strategy, then consider generated static pages. |
| Audio shell traps or surprises users | Navigation feels fragile | Keep direct pages functional and smoke-test shell entry separately. |
| Accessibility coverage stays smoke-level | Deeper regressions could still need manual review | Keep `npm run test:a11y` passing and expand route coverage when shell or launch navigation changes. |
| Placeholder downloads appear public | Trust and polish suffer | Keep `/downloads/` blocked and replace or remove placeholders before public exposure. |
| Generated/browser-profile artifacts stay tracked | Repo gets noisy and hard to review | Clean `tmp/` in a dedicated maintenance branch. |

## Success Metrics

Launch-readiness metrics:

- 0 broken local links from `npm run test:links`.
- 0 public image budget failures from `npm run test:perf`.
- 0 external-player fallback failures from `npm run test:media`.
- 0 serious or critical accessibility smoke failures from `npm run test:a11y`.
- 0 Playwright smoke failures from `npm run test:smoke`.
- 100 percent of public routes have accurate metadata and robots state.
- 100 percent of live releases have at least one valid listen action.
- 100 percent of upcoming releases have a release date/status and a valid campaign or pre-save action.
- 100 percent of public artist pages and EPK pages render without placeholder launch copy.
- No known mobile overlap issues at tested breakpoints.
- No known keyboard traps.

Operational metrics:

- A maintainer can run local validation in under ten minutes from a fresh setup.
- A release update can be made from data/admin workflow without editing page markup.
- Route inventory and sitemap/robots decisions stay synchronized at sprint closeout.

Audience metrics, if analytics are added:

- Homepage to listen action rate.
- Roster to artist/release route rate.
- EPK/contact click rate.
- Support/TipTopJar click rate.
- External platform click distribution.

## Documentation Map

- `README.md`: onboarding, commands, route overview, and publishing notes.
- `ROADMAP.md`: strategic plan, milestones, risks, and decision log.
- `WORKFLOW.md`: sprint operating model, closeout notes, and next recommended sprint.
- `GITHUB_PRACTICES.md`: branch, commit, stacked branch, staged PR, review, validation, and merge practices.
- `ROUTE_INVENTORY.md`: human-readable route classification.
- `tools/routes.js`: executable route source used by validation and smoke tests.
- `agent.md`: local future-agent guidance, ignored by git.

## Maintenance Rhythm

At the start of each sprint:

- Pick one milestone slice.
- Confirm affected routes, data fields, and files.
- Convert roadmap items into stories with acceptance criteria.
- Keep scope small enough to validate fully.

During each sprint:

- Keep route classification current.
- Add or update checks when a class of bug becomes visible.
- Preserve direct-page and shell-page behavior.

At sprint closeout:

- Run available validation.
- Update `WORKFLOW.md` with completed stories, deferred work, risks, and next recommendation.
- Update `README.md` if commands, architecture, or publishing behavior changed.
- Update this roadmap if priorities, decisions, or milestones changed.
