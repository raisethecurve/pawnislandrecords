# Pawn Island Records Starter Site

This repository now contains a zero-dependency starter website for Pawn Island Records. It is designed as a first foundation for a full label catalog site, with room for many artist identities, release entries, platform links, Too.fm pre-save campaigns, direct fan downloads, merch, and campaign testing.

## Files

- `index.html` contains the main label homepage, catalog, vault, merch preview, and control-room sections.
- `admin.html` and `admin.js` provide a browser-based data-entry workflow for artists and releases, plus JSON import/export and demo-data clearing.
- `admin-youtube.js`, `youtube-stats.js`, and `youtube-stats-published.js` add a static-site-safe YouTube metrics workflow for pulling live video stats in admin and publishing a snapshot to the public site.
- `styles.css` contains the shared glass visual system, layout rules, and responsive styling.
- `data.js` contains the roster, release catalog, supported platforms, brand kit tokens, merch items, and roadmap content.
- `catalog-published.js` is the publishable repo-backed catalog layer. When present, the public site reads it before falling back to the original theme seed.
- `catalog-store.js` loads the seed data and then swaps in any browser-saved catalog data from localStorage.
- `app.js` renders the homepage sections from `data.js`.
- `youtube-pulse.js` renders the public Control Room YouTube pulse from the latest saved or published snapshot.
- `merch.html` and `merch.js` provide a dedicated merch storefront page with bundle ideas tied to direct music ownership.
- `campaigns.html` and `campaigns.js` provide a landing-page concept lab for artist and release A/B ideas.
- `brand-kit.html` and `brand-kit.js` provide a living brand reference for palette, typography, glass treatment, and voice.
- `theme-init.js` and `theme.js` manage the day/night theme and remember visitor preference in the browser.
- `downloads/fan/` holds placeholder MP3 and FLAC files so download actions resolve during buildout.

## How to update the content

1. Open `admin.html` in the browser.
2. Click `Remove Demo Releases` if you want to strip out the theme-development release seed, or click `Start Empty Real Catalog` if you want a completely blank release slate.
3. Add your real artists in the `Artist Entry` section if needed.
4. Add real releases in the `Release Entry` section, including tracks, platform URLs, lyrics, downloads, and pre-save data.
5. Use `Download Current JSON` after important updates so the browser-saved catalog can be backed up.
6. Open the `DSP Trends` section in `admin.html`, save a YouTube Data API key in the browser, and click `Refresh Stats` to pull the current YouTube pulse for every track that has a `youtubeId`.
7. Use `Download Publish Script` to promote the catalog, and `Download Pulse Script` to promote the latest YouTube snapshot. Replace the local `catalog-published.js` and `youtube-stats-published.js` files with those downloaded versions when you are ready to commit them.
8. Replace the placeholder files in `downloads/fan/mp3` and `downloads/fan/flac` with your real mastered assets when you are ready to deliver downloads from the public site.

Important: the admin workflow still stores edits in browser localStorage while you work. The public site will prefer that browser override when it exists, then fall back to `catalog-published.js`, then finally to the original theme seed in `data.js`.

The YouTube pulse follows the same pattern: the admin page prefers the browser-saved metrics snapshot when it exists, then falls back to `youtube-stats-published.js`, and never exposes the API key on the public site.

If your YouTube API key is restricted by HTTP referrer, run the site from a local web server or your deployed domain instead of opening the HTML files directly with `file://`.

## Release object format

Each release in `data.js` follows this structure:

```js
{
  slug: "unique-id",
  title: "Release title",
  artist: "artist-slug",
  type: "Single",
  status: "out", // or "presave" or "archive"
  releaseDate: "2026-05-08",
  genres: ["Hip-Hop", "Rap"],
  description: "Short release summary",
  palette: ["#d56d47", "#3d1710"],
  expectedPlatforms: ["Spotify", "Apple Music", "YouTube"],
  links: [
    { label: "Spotify", url: "https://..." },
    { label: "Apple Music", url: "https://..." }
  ],
  tracks: [
    {
      slug: "track-slug",
      title: "Track title",
      runtime: "3:42",
      youtubeId: "abc123xyz",
      lyrics: "Full lyric text here",
      fanDownloads: [
        {
          label: "Fan MP3",
          format: "MP3",
          size: "8.4 MB",
          url: "downloads/fan/mp3/track-title.mp3"
        },
        {
          label: "Fan FLAC",
          format: "FLAC",
          size: "29 MB",
          url: "downloads/fan/flac/track-title.flac"
        }
      ],
      superfan: {
        title: "Exclusive bundle name",
        description: "What the fan gets",
        price: "$6",
        provider: "Gumroad",
        checkoutUrl: "https://...",
        djPackage: {
          title: "Direct To DJ WAV Pack",
          description: "High-quality mixed WAVs for DJs and radio.",
          format: "24-bit WAV",
          price: "$15",
          checkoutUrl: "https://..."
        }
      }
    }
  ],
  presave: {
    label: "Too.fm pre-save",
    url: "https://too.fm/your-link",
    note: "Optional note"
  }
}
```

Each artist now also supports fields like `headline`, `story`, `currentFocus`, `signatures`, and `epk` so the dossier section can feel closer to a real artist page.

The `merch` array in `data.js` uses a lightweight structure like this:

```js
{
  slug: "pawn-island-core-logo-tee",
  title: "Pawn Island Core Logo Tee",
  artist: "label", // or an artist slug
  category: "Apparel",
  price: "$30",
  description: "Core black tee with label mark.",
  status: "Concept", // or "Live"
  imageLabel: "Core logo apparel",
  url: "https://..." // optional live store URL
}
```

## Good next steps

- Replace the browser-stored test data with your full real roster and release archive.
- Decide whether you want this to stay a strong one-page label site or split into dedicated artist pages next.
- Add real cover art or photo assets for each release and artist.
- Move the catalog data into a spreadsheet, CMS, Airtable, or database when the list gets large.
- Connect the control-room logic to a CMS or sheet so missing links and pre-save gaps are easy to update.
- Extend the admin page to cover merch entry and DSP stats beyond YouTube.
- Connect real checkout URLs for merch and superfan offers.
- Expand the published pulse pattern to the next DSP after YouTube.
- Add newsletter signup, show dates, press assets, and artist-specific landing pages as the next platform layer.

## Opening the site

Open `index.html` in a browser to view the current starter build.
