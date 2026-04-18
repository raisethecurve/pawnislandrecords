(function () {
  const ui = window.PAWN_UI || null;
  const page = document.body.dataset.storyPage || "";
  const artist = ui && ui.getArtist ? ui.getArtist("matt-freeman") : null;
  const release = ui && ui.getRelease ? ui.getRelease("matt-freeman-morris-trash") : null;

  const metaByPage = {
    about: {
      title: artist ? `About ${artist.name} | Pawn Island Records` : "About | Pawn Island Records",
      description:
        artist && artist.pressBio
          ? `${artist.name}. ${artist.pressBio}`
          : "A public bio for Matthew Freeman at Pawn Island Records."
    },
    process: {
      title: "Creative Process | Pawn Island Records",
      description:
        "Matthew Freeman's creative process at Pawn Island Records: intention first, active authorship, and tools treated as instruments."
    }
  };

  const meta = metaByPage[page];

  if (meta) {
    document.title = meta.title;

    if (ui && ui.setMetaDescription) {
      ui.setMetaDescription(meta.description);
    }
  }

  if (ui && ui.applyExperienceTheme) {
    ui.applyExperienceTheme({
      accent: (release && release.accent) || (artist && artist.accent) || "#7b362b",
      image: (release && release.cover) || (artist && artist.image) || "",
      backdropId: "story-backdrop",
      title: page === "process" ? "Creative Process" : (artist && artist.name) || "About",
      subtitle: page === "process" ? "Intention first" : "Public bio"
    });
  }

  if (ui && ui.revealOnScroll) {
    ui.revealOnScroll();
  } else {
    document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
    document.body.classList.add("is-ready");
  }
})();
