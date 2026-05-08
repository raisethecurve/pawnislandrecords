# Pawn Island Records Route Inventory

Status date: 2026-05-04

This inventory classifies every HTML entry point in the repo. The source-of-truth route list for automated checks lives in `tools/routes.js`; this document is the human-readable version for sprint planning and PR review.

## Route Classes

| Route | Classification | Stack | Data source | Robots | Smoke coverage | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `index.html` | Public | Modern public | `public-data.js` | `index,follow` | Direct and shell | Homepage, Spotify embed, featured discovery. |
| `roster.html` | Public | Modern public | `public-data.js` | `index,follow` | Direct and shell | Primary project roster. |
| `connect.html` | Public | Modern public | `public-data.js` | `index,follow` | Direct and shell | Social, playlist, support, and contact paths. |
| `about.html` | Public | Modern public | `public-data.js` | `index,follow` | Direct and shell | Public label story and contact context. |
| `catalog.html` | Hidden-but-shareable | Modern public | `public-data.js` | `noindex,follow` | Direct hold plus direct/shell `preview=full` | Full preview shows catalog filters, release groups, CTAs, runtime metadata, and JSON-LD while launch mode stays gated. |
| `catalog.html?artist=rhea-mauro` | Hidden-but-shareable | Modern public | `public-data.js` | `noindex,follow` | Direct `preview=full` | Artist-filter route variant with durable canonical query parameter. |
| `artist.html?artist=rhea-mauro` | Hidden-but-shareable | Modern public | `public-data.js` | `noindex,follow` | Direct hold plus direct/shell `preview=full` | Project detail route variant with discography, media, runtime metadata, and JSON-LD. |
| `release.html?release=rhea-mauro-hearthblood` | Hidden-but-shareable | Modern public | `public-data.js` | `noindex,follow` | Direct hold plus direct/shell `preview=full` | Release detail route variant with actions, embeds, tracklist, runtime metadata, and JSON-LD. |
| `epks.html` | Hidden-but-shareable | Modern public | `public-data.js` | `noindex,follow` | Direct hold plus direct/shell `preview=full` | Press index route with contact paths and runtime metadata. |
| `epk.html?artist=rhea-mauro` | Hidden-but-shareable | Modern public | `public-data.js` | `noindex,follow` | Direct hold plus direct/shell `preview=full` | Artist EPK route variant with bio, assets, media, contact path, runtime metadata, and JSON-LD. |
| `process.html` | Hidden-but-shareable | Story | `public-data.js` | `noindex,follow` | Direct and shell | Creative-process story page; remains shareable but outside primary public nav. |
| `merch.html` | Hidden-but-shareable | Modern public | `public-data.js` | `noindex,follow` | Direct and shell | Merch concepts moved to the modern stack; empty store URLs render as checkout-pending states with support-first CTA. |
| `campaigns.html` | Internal lab | Legacy lab | `data.js` | `noindex,nofollow` | Direct | Campaign planning lab; blocked in `robots.txt` and kept out of public navigation. |
| `brand-kit.html` | Internal lab | Legacy lab | `data.js` | `noindex,nofollow` | Direct | Internal brand system lab; blocked in `robots.txt` and kept out of public navigation. |
| `release-deck.html` | Internal lab | Standalone product page | Static HTML | `noindex,nofollow` | Direct | Standalone product concept page; blocked in `robots.txt` and detached from public navigation. |
| `admin.html` | Admin-only | Admin | `public-data.js` | `noindex,nofollow` | Inventory only | Local catalog editor; do not expose publicly. |
| `shell.html` | Shell | Persistent iframe shell | Iframe target | `noindex,follow` | Inventory only | Primary public pages are shell-smoked through it. |
| `artists.html` | Redirect | Redirect shim | Static HTML | `noindex,follow` | Inventory only | Redirects to `roster.html`. |

## Validation Policy

- Run `npm run test:links` before PR review to catch broken local HTML links, missing local assets, data slug collisions, broken `public-data.js` image references, and route publication mismatches across `tools/routes.js`, page robots tags, `robots.txt`, and `sitemap.xml`.
- Run `npm run test:perf` before PR review to catch public image budget drift and missing media-embed loading/hydration hooks.
- Run `npm run test:media` before PR review to verify Spotify and YouTube fallback states when external players fail.
- Run `npm run test:smoke` before PR review to load the primary public routes, hidden launch-hold samples, and hidden `preview=full` samples at desktop and mobile viewports.
- Direct page smoke tests use `standalone=1` so the page itself is tested without the shell redirect.
- Shell smoke tests load the current public navigation set and selected `preview=full` hidden routes through `shell.html?page=...`.
- Playwright screenshots are written to ignored `test-results/` output and remain manual review artifacts rather than visual-regression baselines. The existing tracked `tmp/` screenshots are legacy QA captures to remove or curate in a separate maintenance branch.
