# Plan — a personal website

A brief for building a personal site: a front door with three contact routes, a
place to publish writing, and a place to show projects. Written as direction,
not description — hand it to someone (or something) starting from an empty
repo and it should be enough to build from.

---

## The idea

Light, editorial, monochrome. Reference point:
[tobiasahlin.com](https://tobiasahlin.com) — black on white, oversized type,
extreme whitespace, very little prose, small line-art marks carrying the visual
weight. No photography, no stock illustration, no colour accent.

Assume the owner has little to show at first. Ship an **empty, well-commented
structure** they fill in over time — one example entry per section, clearly
marked — rather than a site padded with invented content. The measure of success
is that adding a blog post means writing one Markdown file and four lines of
config.

### Constraints to hold

| | |
|---|---|
| Stack | Vanilla HTML/CSS/JS. No framework, no npm, no build step. |
| Theme | Monochrome. One ink colour re-themes the whole site. |
| Structure | Overview (home) + Projects + Blog, plus a post renderer. |
| Authoring | Markdown files in `posts/`, indexed from one config file. |
| Projects | Full description on the projects page; no per-project pages. |
| Illustration | Hand-coded line-art SVG. No image assets anywhere. |
| Seed content | One commented example per array, nothing else. |
| Deploy | Git host → Vercel, static, push to `main` to redeploy. |

The no-build constraint is the load-bearing one — everything else follows from
it. No fonts to fetch, no bundler, no module graph, and the config file is a
plain script assigning a global rather than an ES module, so every page reads it
with one `<script>` tag and no CORS or module friction.

### Details to wire in

Collect these before starting; they're the only project-specific values.

| | |
|---|---|
| Name | for the hero, the brand link and every `<title>` |
| Tagline | one line, sets the tone of the whole site |
| GitHub · LinkedIn · email | the three contact buttons |
| Résumé | a link to wherever the PDF is hosted |

---

## File structure

```
├── index.html          overview
├── projects.html       all projects
├── blog.html           post index
├── post.html           one post (?p=slug)
├── content.js          ← THE file the owner edits
├── css/style.css       everything visual
├── js/
│   ├── site.js         shared: header, footer, cards, page renderers
│   ├── glyphs.js       the SVG mark library
│   ├── hero.js         the two hero interactions
│   ├── post.js         loads and renders one Markdown post
│   └── game.js         the easter egg
├── posts/example-post.md
├── vendor/marked.min.js   vendored Markdown parser, MIT
├── favicon.svg · robots.txt · vercel.json · .gitignore
└── README.md           how to add a post, a project, a link
```

Load scripts `defer`, in order: `content.js`, `glyphs.js`, `site.js`, then the
optional `hero.js` / `game.js` / `post.js`. The renderers share plain globals
(an escaper, a date formatter, the glyph lookup), which is why order matters and
why none of these are modules. Keep it that way — it's the simplest thing that
works without a bundler.

---

## 1. `content.js` — the single source of truth

Everything the owner would ever change lives here. They should never open the
HTML.

```js
window.CONTENT = {
  profile: {
    name, tagline,
    about,    // 2–3 sentences — the About block on the home page
    secret,   // key caps giving the easter egg away; "" keeps it
    bio,      // one line in the footer of every page
  },
  links: { github, linkedin, email, resume },

  // Copy the block for each project.
  //   role     — your part in it; omit if n/a
  //   links    — as many as you like, or []
  //   featured — true also puts it on the home page (max 3)
  projects: [{ title, year, role, description, links: [], glyph, featured }],

  // To publish: create posts/<slug>.md, then add an entry here.
  posts: [{ slug, title, date, blurb, glyph }],
};
```

Rules the renderers must honour:

- **Every empty value hides its own UI.** No `about`, no About block. No `bio`,
  no footer line. No `resume`, no button. A half-filled section never ships.
- **Empty arrays render a quiet line** — "Nothing written yet." — not a broken
  grid. Swap the `<ul>` for a `<p>`; don't leave an empty list in the DOM.
- **Posts sort themselves by date**, so file order is irrelevant.
- **`resume` accepts either form**: a full `https://` link opens in a new tab; a
  bare filename downloads (`download` is same-origin only, so the two cases need
  different markup). Say plainly in the comment that the second means committing
  the PDF to a public repo, where it stays in git history for good — hosting it
  elsewhere is the better default.

Ship exactly one example entry per array, commented, so the shape is obvious
and deleting it is obviously safe.

---

## 2. Pages

**Overview.** Hero → Writing (newest 3) → Projects (up to 3 `featured`) →
About → footer.

- The hero is name, tagline, a canvas behind them, a line-art figure, and the
  three contact buttons.
- Write the name and tagline into the HTML too, as a no-JS fallback. Note in the
  README that this means they live in two places.
- The email button copies the address and flips to "Copied" for two seconds,
  with its own `mailto:` href as the fallback where the Clipboard API isn't
  available.
- The About block is the prose plus the résumé button — this is where a CV lives,
  in place of a list of past roles.

**Projects.** Every project as a card; the same renderer as the home page.

**Blog.** All posts, newest first, paged in ~8. Make the "More" button the
guaranteed path and let an `IntersectionObserver` merely press it on scroll, so
the page still works if the observer is unavailable.

**Post.** Read `?p=slug`, **match it against the config before fetching** — so
nothing arbitrary from the URL reaches the fetch path — then render the
Markdown. Strip a duplicate leading `# H1`, since the config already carries the
title. Set `document.title` and the meta description. Link prev/next. An unknown
slug gets a friendly "Post not found" and a way back.

Header nav on every page: Overview · Projects · Blog, current marked with
`aria-current="page"`.

---

## 3. Design system

Custom properties at the top of the stylesheet, nothing hard-coded below them:

```css
--bg --ink --muted --faint --rule        /* monochrome only */
--wrap --measure --gap --section-gap --card-pad
--step--1 … --step-4                     /* fluid type, clamp() */
--sans --mono --ease
```

- **No accent colour.** Changing `--ink` alone should re-theme the entire site,
  easter egg included. That's the test of whether the tokens are honest.
- **System font stack.** Zero font requests, instant first paint.
- **Fluid type.** Every size a `clamp()`, so nothing snaps at a breakpoint; it
  scales continuously from phone to desktop. One layout breakpoint is enough.
- **Cap the measure** so prose never runs long. Bear in mind `ch` is the width
  of "0" — far wider than the average letter — so `70ch` renders about 100
  characters. Around `50ch` is the ~72-character line you actually want.
- **Alternate the cards**: two half-width, then one full-width, via
  `:nth-child(3n)`. No wrapper markup, no JS, holds for any number of cards.
- Visible `:focus-visible` rings throughout.

---

## 4. Motion

**Do it in CSS wherever CSS can reach.** Reserve JavaScript for what it
genuinely can't. Put decorative motion *inside*
`@media (prefers-reduced-motion: no-preference)` so it's opt-in, rather than
switching it off afterwards.

CSS carries:
- The hero entrance — the name and tagline lifting out of a `mask`.
- Link underlines drawn with `::after`.
- The scroll reveal, via `animation-timeline: view()` wrapped in `@supports`, so
  browsers without it simply show the content.
- Every glyph animation, on hover and on first sight.

JavaScript carries two hero pieces, both purely decorative and both absent under
reduced motion:
- **A generative canvas behind the hero** that reacts to the pointer. Build any
  per-pattern data once per resize, never per frame — a background isn't worth
  60 allocations a second. Gate the draw loop on *both* an
  `IntersectionObserver` and `visibilitychange`, tracking them as two
  independent flags so neither event can strand the loop in the wrong state. Let
  the canvas ignore pointer events and have the section listen on its behalf, so
  links stay clickable.
- **A line-art figure that responds to the cursor.** JS should write only custom
  properties; let the stylesheet do the moving. Throttle to one
  `requestAnimationFrame` per pointer burst.

---

## 5. Glyphs

A library of small marks — one per card — each an inline SVG in `currentColor`,
uniform viewBox, stroke only, no fills. Eight is a good number: enough variety,
few enough to hand-draw well. Tie the first few to the tagline so the marks mean
something.

- An unknown name must fall back to a default rather than render nothing.
- Animate by drawing strokes on with `stroke-dashoffset`, using a dash longer
  than any line in the file rather than `pathLength` — Chrome ignores
  `pathLength` on `<line>` and `<polyline>`.
- Keep the animation in the stylesheet, hung off class names in the SVG.

---

## 6. Easter egg

The Konami code (↑↑↓↓←→←→BA) on `document`, plus a barely-visible dot in the
footer for anyone who'd never guess. Either opens a full-screen Snake overlay:
arrow keys and swipe, score plus a best score in `localStorage`, `Esc` closes
and restores focus to whatever opened it. Don't build the overlay until someone
asks for it, and keep it hidden from the accessibility tree while closed.

Give the owner a config key that renders the code as key caps under the About
text, so they can choose whether to give the secret away.

---

## 7. Markdown

Vendor the parser and commit it — one `<script>` tag, no npm. Posts are authored
only by the site owner, so HTML sanitization isn't layered on; note that in a
comment, because it stops being true the moment anyone else contributes.

**Known trade-off:** rendering posts client-side means the text isn't in the
initial HTML, so crawlers and link previews see only the shell. That's the
accepted cost of having no build step. If search ever matters, the fix is a
small script that pre-renders each post to static HTML at deploy time — it
doesn't change how posts are authored, which is the part worth protecting.

---

## 8. Local development

Serve it, don't open the files:

```bash
python3 -m http.server 8000
```

Posts are `fetch`ed, which browsers block over `file://`. Also warn in the
README that with no build step there's no filename fingerprinting, so an edit
that appears to do nothing is the browser cache — hard-refresh.

---

## 9. Deploy

1. `.gitignore` for `.DS_Store`, `node_modules/`, `.vercel`. Commit on `main`,
   push to the git host.
2. Import on Vercel: framework preset **Other**, root directory `./`, build
   command and output directory both empty — with no `public/`, the repo root is
   served as-is.
3. `vercel.json` with `cleanUrls: true` and `trailingSlash: false`, so `/blog`
   works as well as `/blog.html`.
4. Every push to `main` redeploys.

---

## Verification

Serve locally, then check:

- [ ] All four pages load, nav marks the current page, no console errors.
- [ ] Contact buttons hit the right targets; the email button copies.
- [ ] The example post renders with the right title and date; a bogus slug shows
      "Post not found"; prev/next link correctly.
- [ ] **Adding a second `.md` plus a config entry** makes it appear on both the
      blog index and the home page, newest first. This is the real test — it's
      the whole authoring flow.
- [ ] Emptying `projects` or `posts` gives the quiet empty line, not a break.
      Same for each optional profile field.
- [ ] Glyphs animate on hover and on scroll-in; the hero figure tracks the
      cursor; the canvas reacts to the pointer.
- [ ] Konami opens the game; arrows steer; `Esc` closes and returns focus.
- [ ] 375 / 768 / 1440px — no horizontal scroll at any width.
- [ ] Reduce Motion on: canvas and every animation stop, site stays fully usable.
- [ ] Keyboard-only pass: every link and button reachable, focus ring visible.
- [ ] Changing `--ink` alone re-themes everything, game included.
- [ ] Lighthouse: performance and accessibility both ≥ 95.

Then deploy and repeat the pass on the live URL, on a phone.
