/* post.js — renders one blog post from posts/<slug>.md.
   The slug is only ever used after matching it against content.js,
   so nothing arbitrary from the URL reaches the fetch path. */

(() => {
  const posts = [...(window.CONTENT.posts || [])].sort((a, b) =>
    String(b.date).localeCompare(String(a.date))
  );

  const head = document.querySelector("[data-post-head]");
  const body = document.querySelector("[data-post-body]");
  const nav = document.querySelector("[data-post-nav]");

  function notFound(msg) {
    head.innerHTML = `<h1>Post not found</h1>`;
    body.innerHTML = `<p>${msg}</p><p><a href="blog.html">← Back to the blog</a></p>`;
    document.title = `Post not found — ${window.CONTENT.profile.name}`;
    initReveal();
  }

  /* content.js already carries the title, so drop a duplicate leading H1. */
  function stripLeadingH1(md) {
    return md.replace(/^\s*#\s+.*\r?\n+/, "");
  }

  async function render() {
    const slug = new URLSearchParams(location.search).get("p");
    const i = posts.findIndex((p) => p.slug === slug);
    if (i === -1) {
      notFound("That post doesn’t exist — it may have been renamed.");
      return;
    }
    const post = posts[i];

    head.innerHTML = `
      <h1>${esc(post.title)}</h1>
      <p class="post-date">${esc(fmtDate(post.date))}</p>`;

    document.title = `${post.title} — ${window.CONTENT.profile.name}`;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", post.blurb || "");

    try {
      const res = await fetch(`posts/${post.slug}.md`, { cache: "no-cache" });
      if (!res.ok) throw new Error(String(res.status));
      body.innerHTML = marked.parse(stripLeadingH1(await res.text()));
    } catch {
      notFound(
        `Couldn’t load <code>posts/${post.slug}.md</code>. Check the file exists and that you’re viewing this over http, not a file:// path.`
      );
      return;
    }

    // newer is earlier in the list
    const newer = posts[i - 1];
    const older = posts[i + 1];
    nav.innerHTML = `
      <span>${
        older
          ? `<a href="post.html?p=${encodeURIComponent(
              older.slug
            )}">← ${esc(older.title)}</a>`
          : ""
      }</span>
      <span class="post-nav-next">${
        newer
          ? `<a href="post.html?p=${encodeURIComponent(
              newer.slug
            )}">${esc(newer.title)} →</a>`
          : ""
      }</span>`;

    initReveal();
  }

  document.addEventListener("DOMContentLoaded", render);
})();
