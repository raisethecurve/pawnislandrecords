# Artist Page Production Upgrade Plan

Status date: 2026-06-09

## Current Diagnosis

The site has two artist page systems:

- `/artists/` and `/artists/<slug>/` are generated, indexable, canonical SEO pages from `tools/generate-seo-artifacts.js`.
- `artist.html?artist=<slug>&preview=full` is the richer interactive project page, but it is hidden behind launch mode and remains `noindex,follow`.

That split is the central production issue. The public route is crawlable but too thin to feel like the real product, while the better experience is not the canonical route. A production upgrade should make `/artists/<slug>/` the primary public artist page and either demote `artist.html` to a preview/compat route or redirect users toward the canonical page.

## Upgrade Goal

Make each canonical artist page feel like a complete public project world:

- Clear first-viewport identity: artist name, lane, visual, latest release, and primary action.
- Data-driven page sections that render reliably for every artist, including sparse catalog states.
- Strong search and answer-engine metadata without sacrificing human polish.
- Mobile-first layout with no horizontal overflow, no nested scroll traps, and accessible tap targets.
- No production CTA that sends users to a hidden preview route.

## Route Decision

The production artist URL is:

```txt
/artists/<artist-slug>/
```

Recommended route changes:

- Update roster/project cards to link to `/artists/<slug>/` even while `label.launchMode` remains `essentials`.
- Remove "Open Visual Page" CTAs from generated artist and release pages.
- Keep `artist.html?artist=<slug>&preview=full` as an internal preview route until the upgraded generated pages have parity.
- After parity, make `artist.html?artist=<slug>` a compatibility redirect to `/artists/<slug>/` or keep it `noindex` and unlinked for local preview only.

## Data Contract

Use existing `public-data.js` fields first:

- Artist: `slug`, `name`, `lane`, `accent`, `image`, `summary`, `headline`, `story`, `industryPitch`, `pressBio`, `epkStatus`, `pressAssetRecords`.
- Releases: `artist`, `title`, `type`, `year`, `status`, `releaseDate`, `cover`, `description`, `tooFmUrl`, `youtubeId`, `primaryEmbedUrl`, `platforms`, `tracks`.
- Discovery playlists: `label.discoveryPlaylists`.

Add source-backed fields only when they remove ambiguity:

- `artist.featuredReleaseSlug` for manual hero control.
- `artist.priority` or `artist.sortOrder` if the public roster should stop relying on current array order.
- `artist.publicLinks` for official artist-level Spotify, YouTube playlist, Instagram, or store links.
- `artist.heroNote` or `artist.shortBio` if `story` is too long for a production hero.
- `artist.visualTheme` only if accent color alone cannot support distinct artist worlds.

Keep `public-data.js` generated. Edit `data/source-catalog.json` or the generator path when source-backed data changes are needed.

## Page Structure

Each `/artists/<slug>/` page should render these sections:

1. Breadcrumb
2. Artist hero
3. Latest release focus
4. Discography
5. Listen/watch paths
6. Project story
7. Press/contact module
8. Related navigation

### Artist Hero

Required:

- Artist image or latest release cover using real artwork.
- H1 with the artist name.
- Lane as compact metadata.
- Headline and short story excerpt.
- Primary CTA to the best current action: listen, pre-save, latest release, or contact.
- Secondary CTA to roster or press kit when ready.

Avoid:

- Generic brand-only hero artwork when artist/release media exists.
- Large explanatory text about how to use the page.
- A CTA into `artist.html?preview=full`.

### Latest Release Focus

Required:

- Latest live or upcoming release, selected deterministically.
- Cover art, title, status, release date, description, and action.
- Link to `/releases/<slug>/` when release pages remain canonical.

Selection rule:

1. `artist.featuredReleaseSlug`, if present.
2. Upcoming release with nearest future date.
3. Most recent live release.
4. First catalog release with artwork.

### Discography

Required:

- Card/grid presentation with cover art, title, type, date/year, and status.
- Grouping for "Out Now", "Forthcoming", and "Catalog Notes" when useful.
- Empty state that still feels intentional for artists with few releases.

### Listen/Watch Paths

Required:

- Render direct platform links from release data.
- Render artist-matched YouTube/Spotify playlists from `label.discoveryPlaylists` when available.
- Prefer lightweight cards and outbound links for the generated static pages.

Optional:

- One lazy embed for the featured release when it has `primaryEmbedUrl` or `youtubeId`.
- If embeds are added to generated pages, include explicit `loading`, `title`, `data-media-embed`, and fallback coverage.

### Project Story

Required:

- Full `story` or `pressBio` with a tighter supporting paragraph.
- `industryPitch` can appear as an "For playlist/press context" note only if it reads public-facing.

### Press/Contact

Required:

- If `isEpkReady(artist, data)` is true, link to `/press/<slug>/`.
- Otherwise, show a simple contact CTA to `mailto:pawnisland@outlook.com`.
- Never expose unapproved press asset records as public press inventory.

### Related Navigation

Required:

- Link back to `/artists/`.
- Link to adjacent artists or roster highlights.
- Link to `/releases/` for catalog exploration.

## Artist Index Upgrade

The `/artists/` page should become more than a text list:

- Hero heading with concise roster framing.
- Responsive artist cards using real artist images.
- Release count, latest release, lane, and canonical artist link.
- Optional filters only if they solve a real browsing problem; otherwise keep it simple and fast.
- Preserve `CollectionPage` and `ItemList` structured data.

## Implementation Phases

### Phase 1: Foundation

Files:

- `tools/generate-seo-artifacts.js`
- `label-site.js`
- `tools/routes.js`
- `ROUTE_INVENTORY.md`
- `README.md`

Work:

- Add helper functions for artist public URLs, latest release selection, artist playlist matching, and release action selection.
- Update roster/project links to prefer `/artists/<slug>/`.
- Remove production links from generated pages to hidden preview routes.
- Decide and document the long-term role of `artist.html`.

Acceptance:

- Public roster can navigate to every canonical artist page.
- Generated pages no longer invite public users into `artist.html?preview=full`.
- Existing hidden preview tests still pass or are intentionally updated.

### Phase 2: Canonical Artist Page Generator

Files:

- `tools/generate-seo-artifacts.js`
- `label-site.css`
- Generated `artists/index.html`
- Generated `artists/<slug>/index.html`

Work:

- Replace the current `about-copy` plus `seo-list` layout with production-grade generated markup.
- Add hero, featured release, release cards, media paths, story, press/contact, and related navigation.
- Keep generated pages static-first and useful without JavaScript.
- Add CSS under a dedicated namespace such as `.seo-artist-*` or a carefully shared production namespace.

Acceptance:

- Every artist page looks intentional with the current data, including artists with one release.
- No horizontal overflow on mobile.
- Images have stable dimensions and meaningful alt text.
- CTAs are visible, accessible, and production-safe.

### Phase 3: Artist Index Page

Files:

- `tools/generate-seo-artifacts.js`
- `label-site.css`
- Generated `artists/index.html`

Work:

- Upgrade `/artists/` into a visual roster index.
- Render cards with image, lane, latest release, release count, and canonical link.
- Keep the page fast and scannable.

Acceptance:

- `/artists/` feels like a real public section, not a sitemap.
- It gives users a clear path into every artist page.

### Phase 4: Metadata and Structured Data

Files:

- `tools/generate-seo-artifacts.js`
- `tools/check-links.js` if route policy checks need expansion
- `llms.txt`
- `sitemap.xml`

Work:

- Enrich `MusicGroup` schema with `sameAs` when official artist links exist.
- Add `subjectOf` or `mainEntityOfPage` only where it is valid and source-backed.
- Ensure release cards and featured release data align with sitemap image entries.
- Keep canonical URLs on `/artists/<slug>/`.

Acceptance:

- `npm run generate:seo` produces stable metadata.
- Sitemap, robots, canonical tags, and `llms.txt` agree.
- No unverified claims appear in schema.

### Phase 5: Production QA Coverage

Files:

- `tests/smoke.spec.js`
- `tests/accessibility.spec.js`
- `tools/routes.js`
- Possible new test: `tests/generated-artists.spec.js`

Work:

- Add direct smoke coverage for `/artists/` and at least two generated artist pages: one rich page such as Rhea Mauro and one sparse/held EPK page.
- Add a generated-page accessibility pass or extend existing route sets.
- Add assertions that canonical artist pages include hero media, release links, and no hidden preview CTA.
- Capture Playwright screenshots for desktop and mobile review.

Acceptance:

- `npm run test:links`
- `npm run test:perf`
- `npm run test:a11y`
- `npm run test:smoke`
- `npm test` before launch PR

### Phase 6: Data Enrichment Pass

Files:

- `data/source-catalog.json`
- `tools/generate-public-data.js`
- `public-data.js`

Work:

- Seed artist-level official links where available.
- Fill missing release platform links, YouTube IDs, and Spotify seeds when production-safe.
- Add featured release overrides only where the automatic rule picks the wrong hero.
- Keep EPK readiness strict.

Acceptance:

- `npm run audit:data` reports only intentional gaps.
- `npm run test:data` passes.
- Any launch-gate failures are either fixed or explicitly documented.

## Visual Direction

The pages should feel like artist worlds inside the existing Pawn Island system:

- Dense enough for repeat visitors and industry users.
- Visual enough for fans and social discovery.
- Quietly premium, not a splashy landing page.
- Real images first; decorative effects second.
- Distinct artist accents, but avoid one-note single-color pages.

Specific design rules:

- Use actual artist promo images or release covers in the first viewport.
- Use stable image aspect ratios.
- Keep cards at 8px radius or match the existing system only where already established.
- Avoid card-inside-card layouts.
- Keep buttons readable on mobile, with minimum 40px touch targets.
- Use compact headings inside modules; reserve large type for the page H1.

## Production Launch Checklist

- `/artists/` is visually upgraded and indexable.
- Every `/artists/<slug>/` page is visually upgraded and indexable.
- Roster links to canonical artist pages.
- Generated pages contain no public CTAs to hidden preview routes.
- All canonical pages have accurate title, description, canonical, OG/Twitter image, and JSON-LD.
- All local links and image references pass validation.
- Image assets stay within the public performance budget.
- Axe reports no serious or critical violations on covered artist pages.
- Mobile screenshots show no overlap, clipped button text, or horizontal overflow.
- `sitemap.xml`, `robots.txt`, `llms.txt`, `README.md`, and `ROUTE_INVENTORY.md` reflect the final route posture.

## Recommended PR Shape

PR 1: Route posture and navigation

- Canonical artist URL decision.
- Roster links.
- Hidden preview CTA removal.
- Documentation updates.

PR 2: Generated page redesign

- Generator markup.
- CSS.
- Regenerated artist pages.
- Link/perf validation.

PR 3: Test coverage and QA

- Generated artist smoke/accessibility coverage.
- Screenshot review.
- Any fallback fixes.

PR 4: Data enrichment

- Source-backed artist/release links.
- Optional featured release overrides.
- Final generation and launch checklist.

## First Implementation Target

Start with Rhea Mauro and Quiet Filter as the representative pair:

- Rhea Mauro exercises ready press-kit behavior, approved media, a Spotify embed source, and multiple releases.
- Quiet Filter exercises held press-kit behavior, fewer public links, and a newer generated release path.

Once those render beautifully from the generator, apply the same component system to every artist and regenerate all artifacts.
