# denizmucur.com

Personal site. Plain HTML, CSS and JavaScript — no build step, no dependencies
to install. Everything you'd normally edit lives in **`content.js`**.

## Design system

Ahlin-style minimalism, and the rules are worth keeping if you extend it:

- **Monochrome only.** Pure white background, near-black text, grey for
  metadata. No colour anywhere — all five values are at the top of
  `css/style.css`.
- **Fluid type.** Every size is a `clamp()`. Section headers are oversized and
  heavy; body text is medium weight and capped at roughly 70 characters a line.
- **Flex card grid.** Two half-width cards, then one full-width feature,
  repeating. Handled by `.card:nth-child(3n)` — nothing to set per card.
- **Layout motion is CSS.** Hover uses layered box-shadows for depth; inline
  links animate an underline via `::after`; the hero rises out of a mask on
  load; the scroll reveal uses `animation-timeline: view()`, which degrades to
  plain visible text in browsers that don't support it.
- **No images.** Illustration is CSS shapes, inline SVG and typography.

Two things in the hero can't be done in CSS and live in `js/hero.js`:

- **The bar field** behind the hero — vertical lines with short bars that ease
  between two noise-seeded patterns on a ~26 second cycle. The pointer thickens
  nearby lines and a click sends a ring outward. It's masked to fade out across
  the headline so it never competes with the type.
- **The thinker** — the seated figure. Its head leans toward your cursor and its
  thoughts brighten as you approach; clicking it lets one go. JavaScript only
  writes two custom properties, `--tilt` and `--think`; the stylesheet does the
  actual moving.

Both are skipped entirely under `prefers-reduced-motion`, and both pause when
the hero scrolls off screen or the tab loses focus.

## Running it locally

The blog fetches Markdown files, which browsers block over `file://`. So open it
through a local server rather than double-clicking the HTML:

```bash
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

## Writing a blog post

1. Create `posts/my-post.md` and write in it. Plain text is fine; `#` makes a
   heading, `- ` makes a bullet, `**word**` makes it bold.
2. Add an entry to the `posts` list in `content.js`:

```js
{
  slug:  "my-post",        // must match the filename, without .md
  title: "My post",
  date:  "2026-08-14",     // YYYY-MM-DD
  blurb: "One line, shown on the home page and blog index.",
  glyph: "bubble",
}
```

That's it. It appears on the blog, and the newest three show on the home page.
Posts sort themselves by date, so the order in the file doesn't matter.

If your `.md` starts with a `# Title` line it gets dropped automatically — the
title from `content.js` is the one that renders.

The blog index renders eight posts at a time and loads the rest as you scroll,
with a "Load more" button as the guaranteed path. Change `PAGE_SIZE` in
`js/site.js` to adjust.

## Adding a project

Copy the example block in the `projects` list in `content.js`. Setting
`featured: true` also puts it on the home page (up to three).

Delete an entry entirely and that section just says nothing is there yet.

## The About block and your résumé

There's no experience list — an About block does that job instead, and it's
driven by two fields in `content.js`:

- `profile.about` — two or three sentences on who you are.
- `links.resume` — your CV. Put the PDF in this folder and write its filename
  (`"deniz-mucur-cv.pdf"`), and the button downloads it. Paste a full
  `https://` link instead and it opens in a new tab, because browsers only
  honour a forced download for files served from the same site.

The whole block stays hidden until at least one of those has something in it,
so a half-filled section never ships.

## Glyphs

The small line-art marks on each card. Pick one per entry with `glyph:`:

`nodes` · `bubble` · `ascent` · `orbit` · `grid` · `wave` · `stack` · `spark`

They live in `js/glyphs.js` if you want to draw more. Each animates on card
hover, in CSS.

## Your name and tagline

`content.js` is authoritative. The same words also sit in `index.html` as a
fallback for anyone with JavaScript off — if you change your name, update it in
both places.

## The easter egg

The Konami code (↑↑↓↓←→←→BA) opens a game of Snake. So does the faint dot next
to the copyright line. It's a canvas game, so it is the one thing on the site
driven by JavaScript rather than CSS.

## Deploying

Vercel, framework preset **Other**, no build command, output directory `.`.
`vercel.json` turns on clean URLs so `/blog` works as well as `/blog.html`.

## Layout

```
index.html      home
projects.html   all projects
blog.html       post index, pages in as you scroll
post.html       renders one post (?p=slug)
content.js      ← the file you edit
posts/*.md      your writing
css/style.css   the whole design system; tokens are at the top
js/site.js      rendering, list paging, email copy
js/hero.js      the bar field and the thinker
js/glyphs.js    the SVG marks
js/post.js      loads and renders a Markdown post
js/game.js      the easter egg
vendor/         marked.js, for turning Markdown into HTML
```
