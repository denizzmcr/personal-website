# denizmucur.com

Personal site. Plain HTML, CSS and JavaScript — no build step, no dependencies
to install. Everything you'd normally edit lives in **`content.js`**.

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

## Adding a project or a role

Same idea — copy the example block in the `projects` or `experience` list in
`content.js`. Setting `featured: true` on a project also puts it on the home
page (up to three).

Delete an entry entirely and that section just says nothing is there yet.

## Glyphs

The small animated illustrations. Pick one per entry with `glyph:`:

`nodes` · `bubble` · `ascent` · `orbit` · `grid` · `wave` · `stack` · `spark`

They live in `js/glyphs.js` if you want to draw more.

## Your name and tagline

`content.js` is authoritative. The same words also sit in `index.html` as a
fallback for anyone with JavaScript off — if you change your name, update it in
both places.

## The easter egg

The Konami code (↑↑↓↓←→←→BA) opens a game of Snake. So does the faint dot next
to the copyright line.

## Deploying

Vercel, framework preset **Other**, no build command, output directory `.`.
`vercel.json` turns on clean URLs so `/blog` works as well as `/blog.html`.

## Layout

```
index.html      home
projects.html   all projects
blog.html       post index
post.html       renders one post (?p=slug)
content.js      ← the file you edit
posts/*.md      your writing
css/style.css   all styling; colours are the variables at the top
js/             glyphs, shared rendering, hero canvas, post loader, game
vendor/         marked.js, for turning Markdown into HTML
```
