# Plan — personal website

Written 1 August 2026, describing the site **as it stands**, not as it was first
sketched. The original plan (drafted before the redesign) is out of date in
several places; this replaces it. The README is the user-facing document — this
one is the working record: why things are the way they are, and what's left.

---

## What this is

A personal site for Deniz Mucur that works as a front door: three contact
routes, a place to publish writing, a place to show projects. Visual reference
is [tobiasahlin.com](https://tobiasahlin.com) — light, editorial, monochrome,
very little prose, small line-art marks carrying the visual weight.

The GitHub account behind it is new, so the site ships as an **empty,
well-commented structure** to fill in over time rather than a site padded with
invented content.

### Decisions, settled

| | |
|---|---|
| Stack | Vanilla HTML/CSS/JS. No framework, no npm, no build step. |
| Theme | Monochrome — black on white, no colour accent, no images. |
| Structure | Overview (home) + Projects + Blog, plus a post renderer. |
| Authoring | Markdown files in `posts/`, indexed from `content.js`. |
| Projects | Full description on the projects page; no per-project pages. |
| Illustration | Hand-coded line-art SVG. No image assets anywhere. |
| Seed content | One commented example per array, nothing else. |
| Easter egg | Konami code → Snake. |
| Deploy | GitHub → Vercel, static, push to `main` to redeploy. |

The no-build constraint is the load-bearing one. Every other decision here
follows from it: no fonts to fetch, no bundler, no module graph, `content.js`
as a plain script assigning a global rather than an ES module.

---

## File map

```
personal-website/
├── index.html          overview          109 lines
├── projects.html       all projects       32
├── blog.html           post index         33
├── post.html           one post (?p=…)    34
├── content.js          ← THE file to edit 79
├── css/style.css       everything visual 1008
├── js/
│   ├── site.js         renders every page 308
│   ├── glyphs.js       the 8 SVG marks     76
│   ├── hero.js         bar field + thinker 298
│   ├── post.js         Markdown post       70
│   └── game.js         Konami + Snake     333
├── posts/example-post.md
├── vendor/marked.min.js   vendored, MIT
├── favicon.svg · robots.txt · vercel.json · .gitignore
├── README.md           how to use it
├── CLAUDE.md           project instruction file (see Open questions)
└── plan.md             this file
```

Scripts load `defer` in a fixed order — `content.js`, `glyphs.js`, `site.js`,
then the optional `hero.js` / `game.js` / `post.js`. `site.js` and `post.js`
both read the globals `esc()`, `fmtDate()` and `glyph()`; that's why order
matters and why none of these are modules.

---

## `content.js` — the single source of truth

```js
window.CONTENT = {
  profile: { name, tagline, about, secret, bio },
  links:   { github, linkedin, email, resume },
  projects: [{ title, year, role, description, links[], glyph, featured }],
  posts:    [{ slug, title, date, blurb, glyph }],
};
```

- `profile.about` — the About block on the home page. Empty hides it.
- `profile.secret` — the key caps that give the Konami code away. `""` keeps it.
- `profile.bio` — one line in the footer of every page. Empty hides it.
- `links.resume` — a full `https://` link opens in a new tab; a bare filename
  downloads, but only by committing the PDF to this public repo, where it stays
  in git history for good. Currently a Google Drive PDF link — chosen precisely
  to keep the file out of history.
- `featured: true` also puts a project on the home page, capped at 3.
- Posts sort themselves by date; order in the file is irrelevant.

Every array ships with exactly one example entry. Empty an array and the section
renders a quiet line ("Nothing written yet.") rather than a broken grid — that's
`fill()` in `site.js`, which swaps the `<ul>` for a `<p class="empty">`.

---

## Pages

**`index.html`** — hero (name, tagline, bar-field canvas, the thinker, three
contact buttons) → Writing, newest 3 → Projects, up to 3 featured → About
(text, the key caps, the résumé button) → footer. The name and tagline are also
written into the HTML as a no-JS fallback, so **changing them means changing
both** `content.js` and `index.html`.

The email button copies the address to the clipboard and flips to "Copied" for
two seconds, falling back to its own `mailto:` href where the Clipboard API
isn't available.

**`projects.html`** — every project as a card, same renderer as the home page.

**`blog.html`** — all posts, newest first, paged in 8 at a time. The "More"
button is the guaranteed path; an `IntersectionObserver` just presses it for you
on scroll, so the list works with the observer unavailable.

**`post.html`** — reads `?p=slug`, matches it against `content.js` **before**
fetching, so nothing arbitrary from the URL reaches the fetch path. Renders with
`marked`, strips a duplicate leading `# H1`, sets `document.title` and the meta
description, and links prev/next. Unknown slug → "Post not found".

Header nav on every page: Overview · Projects · Blog, current marked with
`aria-current="page"`.

---

## Design system

All of it is custom properties at the top of `css/style.css`:

```css
--bg #ffffff  --ink #0a0a0a  --muted #6e6e6e  --faint #9b9b9b  --rule #ebebeb
--wrap 72rem  --measure 50ch  --gap/--section-gap/--card-pad (clamp)
--step--1 … --step-4          fluid type, clamp() throughout
--sans (system stack)  --mono  --ease
```

- No colour accent. The redesign dropped the original blue; the site is now
  strictly monochrome, and `--ink` alone re-themes everything, game included.
- System font stack — zero font requests, instant first paint.
- `--measure: 50ch` caps prose at ~72 characters. It reads low because `ch` is
  the width of "0", far wider than the average letter; `70ch` renders ~100.
- Type is fluid everywhere, so nothing snaps at a breakpoint. One layout
  breakpoint, at `46rem`.
- Cards alternate two half-width then one full-width via `.card:nth-child(3n)` —
  no wrapper markup, no JS, so it holds for any number of cards.

---

## Motion

The rule is **CSS wherever it can be**; JavaScript only where CSS genuinely
can't reach. Everything sits behind `prefers-reduced-motion` — the decorative
work is inside `@media (prefers-reduced-motion: no-preference)` blocks so it's
opt-in rather than switched off after the fact.

CSS only:
- Hero entrance — the name and tagline lift out of a `mask`.
- Link underlines drawn with `::after`.
- Scroll reveal via `animation-timeline: view()`, inside `@supports`, so
  browsers without it simply show the content.
- Every glyph animation, on hover and on first sight.

JavaScript (`js/hero.js`, both purely decorative):
- **The bar field** — a canvas of vertical bars easing between two
  noise-seeded patterns, thickening near the pointer, with a ring on click.
  Patterns are built once per resize, not per frame. Drawing is gated on *both*
  an `IntersectionObserver` and `visibilitychange`, tracked as two independent
  flags so neither event can strand the loop in the wrong state.
- **The thinker** — JS writes only `--think` and `--tilt`; the stylesheet does
  the actual moving. The canvas ignores pointer events so links stay clickable;
  the `.hero` section listens on its behalf.

---

## Glyphs

Eight marks in `js/glyphs.js`, each a 48×48 inline SVG in `currentColor`:
`nodes` · `bubble` · `ascent` · `orbit` · `grid` · `wave` · `stack` · `spark`.
The first three map to the tagline — think, talk, initiate. An unknown name
falls back to `nodes` rather than rendering nothing.

Strokes draw on with `stroke-dashoffset` using a dash longer than any line in
the file, rather than `pathLength`, which Chrome ignores on `<line>` and
`<polyline>`.

---

## Easter egg

Konami code on `document`, plus a barely-visible `·` in the footer for anyone
who'd never guess. Either opens a full-screen Snake overlay: arrow keys and
swipe, score and a best score in `localStorage`, `Esc` closes and restores focus
to whatever opened it. The overlay isn't built until someone asks for it.

`profile.secret` renders the code as key caps under the About text — currently
set, so the secret is given away on purpose.

---

## Markdown

`marked` is vendored into `vendor/` and committed. No npm, one `<script>` tag.
Posts are authored only by the site owner, so no HTML sanitization is layered
on — worth remembering before ever accepting an outside contribution.

**Known trade-off:** posts render client-side, so post text isn't in the initial
HTML and crawlers see only the shell. That's the accepted cost of no build step.
If search ever matters, the fix is a small Node script that pre-renders each
post to static HTML at deploy time, without changing how posts are authored.

---

## Local development

```bash
python3 -m http.server 8000
```

Not by opening the file directly — posts are `fetch`ed, which browsers block
over `file://`. And there's no fingerprinting on filenames, so an edit that
seems to do nothing is the browser cache: **Cmd+Shift+R**.

---

## Deploy

Pushed to `github.com/denizzmcr/personal-website`, `main`.

Vercel import: framework preset **Other**, root directory `./`, build command
empty, output directory empty (there's no `public/`, so Vercel serves the repo
root). `vercel.json` sets `cleanUrls: true` and `trailingSlash: false`, so
`/blog` works as well as `/blog.html`. Every push to `main` redeploys.

---

## Open

- [ ] **Vercel isn't connected yet.** The site is on GitHub only — not live.
- [ ] Real content. `projects` and `posts` still hold the example entries, and
      `posts/example-post.md` is still the sample. `profile.bio` is empty, so
      the footer line doesn't render.
- [ ] Confirm the Drive résumé link is shared as **Viewer**, not Editor.
- [ ] The résumé carries a phone number, now one click from a public page.
      Worth a decision either way.
- [ ] `CLAUDE.md` is tracked and therefore public. It's an instruction file for
      Claude Code, not part of the website — removing it from the repo while
      keeping it locally would work fine.
- [ ] The bar field has never been *visually* confirmed — it was only ever
      checked in an automation tab where rAF was frozen. Worth one look in a
      real browser.

## Verification

At `http://localhost:8000`:

- [ ] All four pages load, nav marks the current page, no console errors.
- [ ] Contact buttons hit the right targets; email copies to clipboard.
- [ ] `/post.html?p=example-post` renders with the right title and date; a bogus
      slug shows "Post not found".
- [ ] Adding a second `.md` plus a `content.js` entry makes it appear on both
      the blog index and the home page, newest first — the real test of the
      authoring flow.
- [ ] Emptying `projects` or `posts` shows the quiet empty line, not a break.
- [ ] Glyphs animate on hover and on scroll-in; the thinker tracks the cursor.
- [ ] Konami opens Snake; arrows steer; `Esc` closes and returns focus.
- [ ] 375 / 768 / 1440px — no horizontal scroll at any width.
- [ ] Reduce Motion on: the canvas and every animation stop, site stays usable.
- [ ] Keyboard-only pass: every link and button reachable, focus ring visible.

Then deploy and repeat the pass on the live URL, on a phone.

---

## Divergences from the first draft

Recorded so the history makes sense:

- **Colour accent dropped.** The original plan had `--accent: #2b5cff`; the
  redesign (`f123f32`) went fully monochrome.
- **`experience` array removed** (`97a5c36`), replaced by the About block and
  the résumé link — a CV says it better than a list of rows.
- **Particle canvas and magnetic buttons replaced.** What shipped is the bar
  field and the thinker (`10c6722`), which suit the monochrome layout better.
- **Blog is paged**, not grouped by year.
- **Scroll reveal is `animation-timeline: view()`**, not an
  `IntersectionObserver` — CSS turned out to be enough.
