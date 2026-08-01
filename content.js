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
    about:
      "I think, I talk more than I probably should, and I start things. Mostly I like taking something apart to work out why it is the way it is, and then arguing about whether it ought to be. I live to discover secrets, so here is one of mine.",

    // The keys below render as caps under the About text — the easter egg
    // code. Set it to "" to keep the secret.
    secret: "↑ ↑ ↓ ↓ ← → ← → B A",

    // One line for the foot of every page — a signature, not a repeat of
    // the above. Leave it empty and it hides too.
    bio: "",
  },

  links: {
    github: "https://github.com/denizzmcr",
    linkedin: "https://www.linkedin.com/in/deniz-mucur-66b63136b/",
    email: "denizmucur5@gmail.com",

    // Your CV, as a full https:// link to wherever it's hosted — the
    // button opens it in a new tab. (A bare filename works too, and
    // downloads instead, but it means committing the PDF to this public
    // repo, where it stays in the git history for good.)
    // Empty means no résumé button is shown at all.
    resume:
      "https://docs.google.com/document/d/1Y8eqqW-PN5IUSF-IS6IY2U0zPjTmBc4m/preview",
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
