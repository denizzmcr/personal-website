# Deniz Mucur

My personal website — a home page, a projects page and a blog. Plain HTML, CSS
and JavaScript: no framework, no build step, nothing to install. Deployed on
Vercel; every push to `main` redeploys.

## Design

Monochrome and typographic. There's no colour and there are no images, so the
type and the empty space around it carry the whole page: oversized headers,
short lines of body text, sections set far apart. Illustration is line-art SVG —
a small mark on each card, a seated figure in the hero — and motion is kept
quiet enough that you notice it only when you're looking for it.

## The technical bits

- **The design system is CSS custom properties.** Colours, spacing and the type
  scale are all tokens at the top of `css/style.css`. Change `--ink` and the
  whole site follows, game included.
- **Type is fluid.** Every size is a `clamp()`, so nothing snaps at a
  breakpoint — it scales continuously from phone to desktop.
- **Cards alternate** two half-width, then one full-width, on their own:
  `.card:nth-child(3n)`.
- **Motion is CSS wherever it can be** — the hero lifts out of a mask on load,
  links animate an underline through `::after`, and the scroll reveal is
  `animation-timeline: view()`. Two things need JavaScript (`js/hero.js`): the
  bar field behind the hero and the thinker whose head follows your cursor.
  Everything stops under `prefers-reduced-motion`.
- **Posts are Markdown**, rendered in the browser by `vendor/marked.min.js`.
- **Easter egg.** The Konami code — ↑↑↓↓←→←→BA — opens a game of Snake, as does
  the faint dot by the copyright line.

Run it locally with `python3 -m http.server 8000`, not by opening the HTML file
directly — posts are fetched as files, which browsers block over `file://`.

## Editing the site: `content.js`

Everything you'd normally change lives in `content.js`. You never touch the
HTML.

```js
profile   name, tagline, the About text, the footer line
links     GitHub, LinkedIn, email, a link to your résumé
projects  one block per project — featured: true also puts it on the home page
posts     one entry per post
```

**A project or a post** is one block copied from the one above it. Empty out the
list and the section quietly says there's nothing there yet.

**To publish a post**, create `posts/my-post.md`, write in it, and add an entry
to `posts` with `slug: "my-post"` — the filename without `.md`. Posts sort
themselves by date, so the order in the file doesn't matter.

**`glyph`** picks the line-art mark on a card: `nodes` · `bubble` · `ascent` ·
`orbit` · `grid` · `wave` · `stack` · `spark`.

**`profile.secret`** is the key caps under the About text giving the Konami code
away. Set it to `""` to keep the secret.

**`links.resume`** takes a full `https://` link to the PDF wherever it's hosted,
and the button opens it in a new tab. A bare filename works too and downloads
instead — but only by committing the PDF to this public repo, where it would
stay in the git history even after deleting it. Empty means no button.

Two things to know. Your name and tagline are also written into `index.html` as
a fallback for anyone with JavaScript off, so changing them means changing both.
And if you edit something and the page looks the same, it's the browser cache —
there's no build step to fingerprint filenames, so hard-refresh with
**Cmd+Shift+R**.

---

Layout and typographic approach owe a lot to
[tobiasahlin.com](https://tobiasahlin.com).
