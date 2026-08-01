# Deniz Mucur

Personal website — a home page, a projects page and a blog. Plain HTML, CSS and
JavaScript: no framework, no build step, nothing to install. Everything you'd
normally edit lives in one file, `content.js`.

Deployed on Vercel. Every push to `main` redeploys automatically.

## Design

Monochrome and typographic, after [tobiasahlin.com](https://tobiasahlin.com).
The rules, if you extend it:

- **No colour.** White, near-black, two greys. All five values sit at the top of
  `css/style.css` — change `--ink` and the whole site follows, game included.
- **Type carries the page.** Every size is a `clamp()`, so nothing is fixed to a
  breakpoint. Headers are oversized and heavy; body text caps at ~70 characters
  a line.
- **Cards alternate.** Two half-width, then one full-width feature, repeating.
  `.card:nth-child(3n)` does it — nothing to set per card.
- **Whitespace is the layout.** Sections are 6–12rem apart, and that spacing is
  doing as much work as anything on the page.
- **No images anywhere.** Illustration is inline SVG and typography.
- **Motion is CSS wherever it can be.** The hero lifts out of a mask on load,
  cards use layered box-shadows for depth, links animate an underline through
  `::after`, and the scroll reveal is `animation-timeline: view()`.

## How it's built

- **No build step.** Run it with `python3 -m http.server 8000` and open
  <http://localhost:8000> — not by double-clicking the HTML. Posts are fetched
  as files, which browsers block over `file://`.
  If you edit something and the page doesn't change, it's the browser cache:
  hard-refresh with **Cmd+Shift+R**. There's no filename hashing to force it,
  so an ordinary refresh will happily reuse an old `content.js`.
- **Posts are Markdown**, rendered in the browser by `vendor/marked.min.js`.
  The trade-off: post text isn't in the HTML source, so search engines see only
  the shell. Fine for a personal blog. If that ever matters, the fix is a small
  pre-render script, not a rewrite.
- **The blog pages in** — eight posts at a time, more as you scroll, with a
  "Load more" button as the guaranteed path. `PAGE_SIZE` in `js/site.js`.
- **Two things need JavaScript**, both in `js/hero.js`: the bar field behind the
  hero (vertical lines easing between two noise-seeded patterns on a ~26 second
  cycle, reacting to the pointer) and the thinker, whose head follows your
  cursor. Both pause off-screen and in hidden tabs, and neither runs under
  `prefers-reduced-motion`.
- **Easter egg.** The Konami code — ↑↑↓↓←→←→BA — opens a game of Snake. So does
  the faint dot beside the copyright line. The About block gives the code away
  as key caps; set `profile.secret` to `""` to keep it hidden again.

## Layout

```
index.html      home — hero, writing, projects, about
projects.html   all projects
blog.html       post index, pages in as you scroll
post.html       renders one post (?p=slug)
content.js      ← the file you edit
posts/*.md      your writing
css/style.css   the design system; tokens at the top
js/site.js      rendering, list paging, email copy
js/hero.js      the bar field and the thinker
js/glyphs.js    the SVG marks
js/post.js      loads and renders a post
js/game.js      the easter egg
vendor/         marked.js
```

## What's a placeholder, and how to replace it

The site ships deliberately empty. Four things are waiting on you, all in
`content.js`:

**`profile.about`** — empty. Two or three sentences on who you are. The About
block on the home page stays hidden until you write it.

**`links.resume`** — empty, so no résumé button appears. Put a PDF in this
folder and write its filename (`"deniz-mucur-cv.pdf"`) and the button downloads
it. A full `https://` link works too but opens in a new tab instead, because
browsers only force a download for files served from the same site.

**"Example project"** in the `projects` list — a dummy. Type over it or delete
it; an empty section just says nothing is there yet. `featured: true` also puts
a project on the home page, up to three.

**"Example post"** — a dummy in two halves: the entry in `posts` and the file
`posts/example-post.md`. Replace both, or delete both.

### Writing a post

1. Create `posts/my-post.md` and write in it. Plain text is fine — `#` makes a
   heading, `- ` a bullet, `**word**` bold.
2. Add an entry to `posts` in `content.js`:

```js
{
  slug:  "my-post",     // matches the filename, without .md
  title: "My post",
  date:  "2026-08-20",  // YYYY-MM-DD
  blurb: "One line, shown on the card.",
  glyph: "bubble",
}
```

It sorts itself by date, so the order in the file doesn't matter. A leading
`# Title` in the Markdown is dropped automatically — the title above is the one
that renders.

### Glyphs

The line-art mark on each card. Pick one per entry with `glyph:`:

`nodes` · `bubble` · `ascent` · `orbit` · `grid` · `wave` · `stack` · `spark`

They're drawn in `js/glyphs.js` if you want to add your own.

### One gotcha

Your name and tagline live in `content.js` **and** in `index.html` — the HTML
copy is the fallback for anyone with JavaScript off. Change your name and you
have to change both.
