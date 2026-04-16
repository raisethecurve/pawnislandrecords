window.PAWN_DATA = {
  label: {
    name: "Pawn Island Records",
    founder: "Matthew H. Freeman",
    tagline: "A label system for many artist identities.",
    brandMessage:
      "One label. Many climates. Every release gets a world of its own.",
    defaultStreamingPlatforms: ["Spotify", "Apple Music", "YouTube"],
    supportedPlatforms: [
      "Spotify",
      "Apple Music",
      "YouTube",
      "YouTube Music",
      "Bandcamp",
      "Amazon Music",
      "Too.fm pre-save"
    ]
  },
  brandKit: {
    palette: [
      {
        name: "Pawn Black",
        token: "--brand-black",
        hex: "#070707",
        use: "Base backgrounds, media frames, dark glass depth."
      },
      {
        name: "Signal White",
        token: "--brand-white",
        hex: "#f7f8fb",
        use: "Typography, light-mode surfaces, contrast highlights."
      },
      {
        name: "Superbee Yellow",
        token: "--brand-yellow",
        hex: "#ffd12a",
        use: "Primary actions, hover energy, spotlight accents."
      },
      {
        name: "Electric Royal Blue",
        token: "--brand-blue",
        hex: "#2457ff",
        use: "Secondary actions, gradients, UI focus states."
      }
    ],
    typography: {
      display: "Instrument Serif",
      interface: "Bricolage Grotesque",
      guidance: [
        "Use Instrument Serif for hero lines, artist statements, and cinematic pull quotes.",
        "Use Bricolage Grotesque for interface labels, cards, navigation, and compact metadata.",
        "Keep headlines dramatic and low-line-count, then let glass panels carry the detail."
      ]
    },
    glass: [
      "High-blur translucent panels with bright edge highlights.",
      "Blue and yellow glow gradients anchored to black or white space.",
      "Strong shadows and reflective borders to make the UI feel collectible."
    ],
    voice: [
      "Cinematic but direct.",
      "Independent, multi-genre, and artist-first.",
      "Never generic label copy. Always specific to a lane, mood, or release moment."
    ]
  },
  artists: [
    {
      slug: "rhea-mauro",
      name: "Rhea Mauro",
      lane: "Soul / Country / Singer-Songwriter",
      moods: ["warm", "weathered", "cinematic"],
      summary:
        "Earthy songwriting and lived-in soul textures that can sit between intimate confession and wide-open Americana.",
      headline:
        "Warm-blooded songwriting that sits between intimate soul confession and open-road country atmosphere.",
      story:
        "Rhea Mauro is built for the releases that feel handwritten, voice-forward, and emotionally direct without losing scale.",
      currentFocus:
        "Lead with lyric-heavy singles, strong cover art, and a visual identity that feels tactile instead of polished flat.",
      signatures: ["close-mic vocals", "Americana grain", "slow-bloom hooks"],
      epk: [
        { label: "Short bio", status: "ready" },
        { label: "Press photos", status: "draft" },
        { label: "One-sheet", status: "needed" }
      ],
      palette: ["#ffd12a", "#2457ff"]
    },
    {
      slug: "high-ground",
      name: "High Ground",
      lane: "Hip-Hop / Rap",
      moods: ["focused", "gritty", "forward"],
      summary:
        "A direct rap lane built for strong bars, modern drums, and a clear point of view.",
      headline:
        "A sharp rap lane with clear intent, pressure in the drums, and enough edge to cut through fast.",
      story:
        "High Ground gives the label a direct voice: less drift, more statement, and releases that should land with immediate momentum.",
      currentFocus:
        "Pair singles with strong pre-save pushes, clean press language, and a rollout cadence built around short-form clips.",
      signatures: ["tight bars", "forward motion", "modern low-end"],
      epk: [
        { label: "Short bio", status: "ready" },
        { label: "Press photos", status: "needed" },
        { label: "One-sheet", status: "draft" }
      ],
      palette: ["#2457ff", "#070707"]
    },
    {
      slug: "quiet-filter",
      name: "Quiet Filter",
      lane: "Stoner Doom",
      moods: ["crushing", "slow-burn", "hazy"],
      summary:
        "Dense riffs, smoke-heavy pacing, and a sound designed to feel physical as much as musical.",
      headline:
        "Slow-moving heaviness with enough space and weight to feel like an environment, not just a song.",
      story:
        "Quiet Filter is the lane where the label gets cavernous, patient, and textural, with releases that should feel immersive from artwork to mastering.",
      currentFocus:
        "Build a darker visual language, deepen the archive, and support heavier releases with lyric sheets and asset packs.",
      signatures: ["monolithic riffs", "haze", "ritual pacing"],
      epk: [
        { label: "Short bio", status: "draft" },
        { label: "Press photos", status: "needed" },
        { label: "One-sheet", status: "needed" }
      ],
      palette: ["#070707", "#ffd12a"]
    },
    {
      slug: "resunant",
      name: "Resunant",
      lane: "Alternative Rock / Groove Metal",
      moods: ["angular", "driving", "volatile"],
      summary:
        "A heavier lane that can pivot from tension-filled alternative rock into groove-driven metal impact.",
      headline:
        "A collision point between alternative tension and groove-metal force, built for bigger swings and sharper visuals.",
      story:
        "Resunant is where the catalog can get more volatile and performance-driven, with releases that reward strong sequencing and bold artwork.",
      currentFocus:
        "Push strong singles now, then widen into a heavier release arc with live-performance assets and session imagery.",
      signatures: ["angular hooks", "groove impact", "high-voltage dynamics"],
      epk: [
        { label: "Short bio", status: "ready" },
        { label: "Press photos", status: "draft" },
        { label: "One-sheet", status: "draft" }
      ],
      palette: ["#f7f8fb", "#2457ff"]
    }
  ],
  releases: [
    {
      slug: "rhea-mauro-open-water-demo",
      title: "Open Water",
      artist: "rhea-mauro",
      type: "Single",
      status: "out",
      releaseDate: "2026-02-14",
      genres: ["Soul", "Singer-Songwriter"],
      description:
        "Demo catalog entry for a warm, voice-forward single. Replace this with the actual title, artwork, YouTube ID, and live platform URLs.",
      palette: ["#ffd12a", "#2457ff"],
      expectedPlatforms: ["Spotify", "Apple Music", "YouTube"],
      links: [
        { label: "Spotify", url: "" },
        { label: "Apple Music", url: "" },
        { label: "YouTube", url: "" }
      ],
      presave: null,
      tracks: [
        {
          slug: "open-water",
          title: "Open Water",
          runtime: "3:42",
          youtubeId: "",
          lyrics:
            "Keep the horizon near enough to hurt\nLet the salt sit bright on the sleeve of your shirt\nIf the tide wants a name, let it borrow mine\nI have been half gone and half on time",
          fanDownloads: [
            {
              label: "Fan MP3",
              format: "MP3",
              size: "4 KB demo",
              url: "downloads/fan/mp3/open-water-demo-mp3.txt"
            },
            {
              label: "Fan FLAC",
              format: "FLAC",
              size: "4 KB demo",
              url: "downloads/fan/flac/open-water-demo-flac.txt"
            }
          ],
          superfan: {
            title: "Open Water (Polaroid Session)",
            description:
              "Private acoustic pass, lyric scan, and handwritten note bundle.",
            price: "$4",
            provider: "Connect Gumroad or Shopify",
            checkoutUrl: "",
            djPackage: {
              title: "Direct To DJ WAV Pack",
              description:
                "High-quality mixed WAVs for radio edits, club sets, and selectors.",
              format: "24-bit WAV",
              price: "$12",
              checkoutUrl: ""
            }
          }
        }
      ]
    },
    {
      slug: "high-ground-static-season-demo",
      title: "Static Season",
      artist: "high-ground",
      type: "Single",
      status: "presave",
      releaseDate: "2026-05-08",
      genres: ["Hip-Hop", "Rap"],
      description:
        "Demo upcoming release card showing where a Too Lost pre-save campaign and release-day YouTube premiere should appear before launch day.",
      palette: ["#2457ff", "#070707"],
      expectedPlatforms: ["Too.fm pre-save", "YouTube"],
      links: [{ label: "YouTube", url: "" }],
      presave: {
        label: "Too.fm pre-save",
        url: "",
        note: "Add the Too Lost link here so fans can save the release before it goes live."
      },
      tracks: [
        {
          slug: "static-season",
          title: "Static Season",
          runtime: "2:58",
          youtubeId: "",
          lyrics:
            "Blue sparks under the tongue when the city talks back\nWhole block hums like a fuse in a backpack\nStatic in the halo, pressure in the floor\nSay it like you mean it, then say it twice more",
          fanDownloads: [
            {
              label: "Fan MP3",
              format: "MP3",
              size: "4 KB demo",
              url: "downloads/fan/mp3/static-season-demo-mp3.txt"
            },
            {
              label: "Fan FLAC",
              format: "FLAC",
              size: "4 KB demo",
              url: "downloads/fan/flac/static-season-demo-flac.txt"
            }
          ],
          superfan: {
            title: "Static Season (Night Shift Cut)",
            description:
              "Extended verse, alt bounce, and cover-art wallpaper pack.",
            price: "$5",
            provider: "Connect Gumroad or Shopify",
            checkoutUrl: "",
            djPackage: {
              title: "Direct To DJ WAV Pack",
              description:
                "High-quality mixed WAVs plus an instrumental for blend sets.",
              format: "24-bit WAV",
              price: "$14",
              checkoutUrl: ""
            }
          }
        }
      ]
    },
    {
      slug: "quiet-filter-ember-mire-demo",
      title: "Ember Mire",
      artist: "quiet-filter",
      type: "EP",
      status: "archive",
      releaseDate: "2025-10-31",
      genres: ["Stoner Doom", "Heavy Rock"],
      description:
        "Demo archive release showing how deeper catalog entries can still hold track lyrics, YouTube embeds, direct download bundles, and locked superfan extras.",
      palette: ["#070707", "#ffd12a"],
      expectedPlatforms: ["Bandcamp", "Spotify", "YouTube"],
      links: [
        { label: "Bandcamp", url: "" },
        { label: "Spotify", url: "" },
        { label: "YouTube", url: "" }
      ],
      presave: null,
      tracks: [
        {
          slug: "ember-mire",
          title: "Ember Mire",
          runtime: "6:14",
          youtubeId: "",
          lyrics:
            "Ash in the lung and a low red choir\nSomething below us is naming the fire\nEvery step slower, every shadow wider\nWe keep the ember and we keep it quieter",
          fanDownloads: [
            {
              label: "Fan MP3",
              format: "MP3",
              size: "5 KB demo",
              url: "downloads/fan/mp3/ember-mire-demo-mp3.txt"
            },
            {
              label: "Fan FLAC",
              format: "FLAC",
              size: "5 KB demo",
              url: "downloads/fan/flac/ember-mire-demo-flac.txt"
            }
          ],
          superfan: {
            title: "Ember Mire Ritual Pack",
            description:
              "Drone intro, artwork alt cover, and longform lyric PDF.",
            price: "$7",
            provider: "Connect Gumroad or Shopify",
            checkoutUrl: "",
            djPackage: {
              title: "Direct To DJ WAV Pack",
              description:
                "High-quality mixed WAVs for all EP stems delivered as a selector bundle.",
              format: "24-bit WAV",
              price: "$18",
              checkoutUrl: ""
            }
          }
        },
        {
          slug: "weight-of-static",
          title: "Weight Of Static",
          runtime: "5:41",
          youtubeId: "",
          lyrics:
            "The room tilts black and the wire goes slow\nEvery amp in the hall learns a deeper note below\nNothing moving quickly, everything pressed flat\nThe silence has a body and it keeps leaning back",
          fanDownloads: [
            {
              label: "Fan MP3",
              format: "MP3",
              size: "5 KB demo",
              url: "downloads/fan/mp3/weight-of-static-demo-mp3.txt"
            },
            {
              label: "Fan FLAC",
              format: "FLAC",
              size: "5 KB demo",
              url: "downloads/fan/flac/weight-of-static-demo-flac.txt"
            }
          ],
          superfan: {
            title: "Weight Of Static Live Floor Take",
            description:
              "Raw live-room pass with no master bus polish.",
            price: "$5",
            provider: "Connect Gumroad or Shopify",
            checkoutUrl: "",
            djPackage: {
              title: "Direct To DJ WAV Pack",
              description:
                "Mixed WAVs and alt intro loop for heavier late-night sets.",
              format: "24-bit WAV",
              price: "$14",
              checkoutUrl: ""
            }
          }
        },
        {
          slug: "low-fire-chant",
          title: "Low Fire Chant",
          runtime: "4:50",
          youtubeId: "",
          lyrics:
            "Hold the coal, hold the line\nHold the dark until it shines\nSmoke up the rafter, hum through the frame\nEvery low fire knows its name",
          fanDownloads: [
            {
              label: "Fan MP3",
              format: "MP3",
              size: "5 KB demo",
              url: "downloads/fan/mp3/low-fire-chant-demo-mp3.txt"
            },
            {
              label: "Fan FLAC",
              format: "FLAC",
              size: "5 KB demo",
              url: "downloads/fan/flac/low-fire-chant-demo-flac.txt"
            }
          ],
          superfan: {
            title: "Low Fire Chant Tape Saturation Mix",
            description:
              "Alt master with tape wear and extended outro.",
            price: "$5",
            provider: "Connect Gumroad or Shopify",
            checkoutUrl: "",
            djPackage: {
              title: "Direct To DJ WAV Pack",
              description:
                "High-quality mixed WAV with alt ending for long transitions.",
              format: "24-bit WAV",
              price: "$14",
              checkoutUrl: ""
            }
          }
        }
      ]
    },
    {
      slug: "resunant-glass-amp-demo",
      title: "Glass Amp",
      artist: "resunant",
      type: "Single",
      status: "out",
      releaseDate: "2026-01-17",
      genres: ["Alternative Rock", "Groove Metal"],
      description:
        "Demo release card for a hybrid rock and metal lane with sharper edge, video-first rollout potential, and stronger direct-to-fan packaging.",
      palette: ["#f7f8fb", "#2457ff"],
      expectedPlatforms: ["Spotify", "Apple Music", "YouTube"],
      links: [
        { label: "Spotify", url: "" },
        { label: "Apple Music", url: "" },
        { label: "YouTube", url: "" }
      ],
      presave: null,
      tracks: [
        {
          slug: "glass-amp",
          title: "Glass Amp",
          runtime: "3:31",
          youtubeId: "",
          lyrics:
            "Teeth on the current, spark on the rail\nCrack the room open and let the voltage exhale\nGlass amp halo, blue at the seam\nEverything louder than the shape of the dream",
          fanDownloads: [
            {
              label: "Fan MP3",
              format: "MP3",
              size: "4 KB demo",
              url: "downloads/fan/mp3/glass-amp-demo-mp3.txt"
            },
            {
              label: "Fan FLAC",
              format: "FLAC",
              size: "4 KB demo",
              url: "downloads/fan/flac/glass-amp-demo-flac.txt"
            }
          ],
          superfan: {
            title: "Glass Amp Session Vault",
            description:
              "Instrumental stem pack, alt intro, and rehearsal-photo set.",
            price: "$6",
            provider: "Connect Gumroad or Shopify",
            checkoutUrl: "",
            djPackage: {
              title: "Direct To DJ WAV Pack",
              description:
                "High-quality mixed WAV and clean intro for high-impact set opens.",
              format: "24-bit WAV",
              price: "$15",
              checkoutUrl: ""
            }
          }
        }
      ]
    }
  ],
  merch: [
    {
      slug: "pawn-island-core-logo-tee",
      title: "Pawn Island Core Logo Tee",
      artist: "label",
      category: "Apparel",
      price: "$30",
      description:
        "Core black tee with superbee yellow and electric royal blue label mark.",
      status: "Concept",
      imageLabel: "Core logo apparel",
      url: ""
    },
    {
      slug: "rhea-mauro-open-water-poster",
      title: "Open Water Poster",
      artist: "rhea-mauro",
      category: "Print",
      price: "$22",
      description:
        "Single-era poster print with lyric excerpt and campaign art treatment.",
      status: "Concept",
      imageLabel: "Poster mockup",
      url: ""
    },
    {
      slug: "high-ground-static-season-hoodie",
      title: "Static Season Hoodie",
      artist: "high-ground",
      category: "Apparel",
      price: "$58",
      description:
        "Heavy black hoodie with electric royal typography and campaign stamp.",
      status: "Concept",
      imageLabel: "Hoodie mockup",
      url: ""
    },
    {
      slug: "quiet-filter-ember-mire-slipmat",
      title: "Ember Mire Slipmat",
      artist: "quiet-filter",
      category: "Accessory",
      price: "$20",
      description:
        "Turntable slipmat concept for doom collectors and DJ packages.",
      status: "Concept",
      imageLabel: "Slipmat mockup",
      url: ""
    }
  ],
  roadmap: [
    {
      title: "Artist Pages",
      status: "In motion",
      body:
        "Each project should eventually have its own page with bio, imagery, release list, signature moods, direct platform links, and campaign history."
    },
    {
      title: "Release Admin Flow",
      status: "Next",
      body:
        "Move the catalog, lyrics, YouTube IDs, and download metadata into a sheet, CMS, Airtable, or Notion-backed feed."
    },
    {
      title: "Superfan Checkout",
      status: "Next",
      body:
        "Connect a real commerce layer so exclusive tracks and bundles can unlock through Gumroad, Shopify, Bandcamp, or a dedicated fan club flow."
    },
    {
      title: "Mailing List Capture",
      status: "Next",
      body:
        "Upcoming drops benefit from email capture so fans can pre-save now, get a release-day reminder, and receive exclusive offers."
    },
    {
      title: "EPK And Press Assets",
      status: "Next",
      body:
        "Press photos, bios, streaming embeds, and downloadable assets help each artist lane feel serious and industry-ready."
    },
    {
      title: "Shows, Merch, And News",
      status: "Later",
      body:
        "Once the catalog is stable, the site can grow into a central hub for live dates, merch drops, blog posts, and label announcements."
    }
  ]
};
