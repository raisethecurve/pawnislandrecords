# Pawn Island Records

This repo now contains a cleaner multi-page static site for Pawn Island Records, built around a simple public-facing flow:

- `index.html` is the homepage landing page with one featured release.
- `about.html` is the public-facing bio page for Matthew Freeman.
- `process.html` is the public creative process page.
- `roster.html` is the public roster page.
- `artist.html` is the per-project landing page, with gallery and media views that can be restored from the query string.
- `catalog.html` is the release catalog page.
- `admin.html` is the catalog editor for managing artist profiles, release intake, and JSON export.

## Core files

- `public-data.js` is the published seed dataset for the site.
- `site-ui.js` provides shared helpers for artist/release lookups and simple reveal animations.
- `public.css` is the shared design system for the public pages and editor.
- `site-audio-config.js` is the single place to point the site-wide background player at an audio file.
- `site-audio.js` restores background music state across page loads in the same tab.
- `site-audio.css` styles the floating site-wide music controls.
- `shell.html`, `shell.css`, and `shell.js` provide the persistent iframe shell that keeps the audio player alive while inner pages change.
- `story.css` is the styling layer for the About and Process pages.
- `home.js`, `artists.js`, `artist.js`, and `catalog.js` render the public pages.
- `story.js` applies shared theming and reveal behavior on the About and Process pages.
- `admin.js` powers the editor workflow.

## Background music

To turn on site-wide background audio:

1. Add your MP3 to the repo.
2. Set its path in `site-audio-config.js`.
3. Open any page and press `Play`.

The player will remember volume and mute state. With the persistent shell in place, the audio element itself stays alive while inner pages navigate, so the soundtrack no longer restarts on normal page changes.

## Release intake workflow

Open `admin.html` in the browser to:

1. Add or refine artist profiles.
2. Input a release title, artist, type, year, vibe, description, and accent color.
3. Attach square cover art by path/URL or browser upload.
4. Add the track listing with optional YouTube video IDs for each track.
5. Add streaming platform links.
6. Download the current dataset as JSON or as a publish-ready `public-data.js`.

The editor now works in-memory for the current session. Use the JSON import/export tools when you want to move changes in or out of the repo.

## Data notes

The public data model is intentionally compact:

```js
{
  label: {
    name: "Pawn Island Records",
    tagline: "Release worlds with room to breathe.",
    intro: "Catalog introduction copy",
    platformPresets: ["Spotify", "Apple Music", "YouTube"]
  },
  artists: [
    {
      slug: "rhea-mauro",
      name: "Rhea Mauro",
      lane: "Songwriter soul / country dusk",
      accent: "#cb7c4c",
      image: "media/public/rhea-hearthblood.jpg",
      summary: "Short overview",
      headline: "Public-facing headline",
      story: "Public story copy",
      industryPitch: "Industry-facing copy",
      pressBio: "Press bio",
      pressHighlights: ["One line per highlight"],
      pressAssets: ["One line per asset"],
      merchIntro: "Merch page copy"
    }
  ],
  releases: [
    {
      slug: "rhea-mauro-hearthblood",
      artist: "rhea-mauro",
      title: "Hearthblood",
      type: "Album",
      vibe: "firelit, handwritten, cinematic",
      year: "2026",
      accent: "#cb7c4c",
      cover: "media/public/rhea-hearthblood.jpg",
      description: "Release copy",
      platforms: [
        { label: "Spotify", url: "https://..." }
      ],
      tracks: [
        { title: "About The Town", runtime: "3:42", youtubeId: "abc123xyz" }
      ]
    }
  ],
  merch: [
    {
      slug: "rhea-hearthblood-print",
      artist: "rhea-mauro",
      title: "Hearthblood Collector Print",
      price: "$28",
      description: "Merch copy",
      image: "media/public/rhea-hearthblood.jpg",
      url: ""
    }
  ]
}
```

## Publishing

If you want the current browser-edited data to become the new default site data:

1. Open `admin.html`.
2. Click `Download public-data.js`.
3. Replace the repo's `public-data.js` with the downloaded version.
4. Commit the updated file.

## Notes

- Cover art is displayed in a square aspect ratio across the public site.
- Artist pages are public-facing by default and do not carry internal or self-referential label language.
- The current seed data includes the projects:
  `Rhea Mauro`, `High Ground`, `Velvet Orchard`, `Quiet Filter`, `Resunant`, `Matt Freeman`, `Blackout State`, `Crick Kinnard`, and `second watch`.
