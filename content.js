/* ============================================================
   content.js — everything on this site comes from this file.
   Edit here; you never need to touch the HTML.

   Available glyphs (the little animated illustrations):
     nodes · bubble · ascent · orbit · grid · wave · stack · spark
   ============================================================ */

window.CONTENT = {
  profile: {
    name: "Deniz Mucur",
    tagline: "I think, talk (sometimes too much) & initiate",

    // 2–3 sentences on who you are. This is the About block on the home
    // page. Leave it empty and the block hides itself.
    about: "",

    // One line for the foot of every page — a signature, not a repeat of
    // the above. Leave it empty and it hides too.
    bio: "",
  },

  links: {
    github: "https://github.com/denizzmcr",
    linkedin: "https://www.linkedin.com/in/deniz-mucur-66b63136b/",
    email: "denizmucur5@gmail.com",

    // Your CV. Put the PDF in this folder and write its filename here,
    // e.g. "deniz-mucur-cv.pdf" — or paste a full https:// link if it
    // lives somewhere else. Empty means no résumé link is shown.
    resume: "",
  },

  /* ── PROJECTS ───────────────────────────────────────────────
     Copy the block below for each project you want to show.
       role      — your part in it, e.g. "Founder". Omit if n/a.
       links     — as many as you like, or an empty list [].
       featured  — true also puts it on the home page (max 3).
     ─────────────────────────────────────────────────────────── */
  projects: [
    {
      title: "Example project",
      year: "2026",
      role: "Founder",
      description:
        "Two or three sentences on what it is and why it exists. Replace this whole block with a real project — or delete it and the section politely says nothing is here yet.",
      links: [
        { label: "Live", url: "#" },
        { label: "Code", url: "#" },
      ],
      glyph: "ascent",
      featured: true,
    },
  ],

  /* ── WRITING ────────────────────────────────────────────────
     To publish a post:
       1. Create posts/<slug>.md and write in it.
       2. Add an entry here with that same slug.
     Sorted by date automatically — no need to keep this in order.
     ─────────────────────────────────────────────────────────── */
  posts: [
    {
      slug: "example-post", // → posts/example-post.md
      title: "Example post",
      date: "2026-08-01", // YYYY-MM-DD
      blurb: "One line that shows on the home page and the blog index.",
      glyph: "bubble",
    },
  ],
};
