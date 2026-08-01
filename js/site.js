/* site.js — reads window.CONTENT and builds the shared chrome plus
   the entry lists. Every page loads this. */

const C = window.CONTENT;

/* ── helpers ──────────────────────────────────────────────── */

const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );

/** "2026-08-01" → "1 August 2026". Parsed as local time so the day never slips. */
function fmtDate(iso) {
  const [y, m, d] = String(iso || "").split("-").map(Number);
  if (!y || !m || !d) return "";
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const yearOf = (iso) => String(iso || "").slice(0, 4);

/** Posts newest first. */
function sortedPosts() {
  return [...(C.posts || [])].sort((a, b) =>
    String(b.date).localeCompare(String(a.date))
  );
}

const mailto = () => `mailto:${C.links.email}`;

const ICONS = {
  github:
    '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.4 7.4 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>',
  linkedin:
    '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 1.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM1.7 6.2h3.6V15H1.7V6.2Zm5.6 0h3.45v1.2h.05c.48-.87 1.65-1.8 3.4-1.8 3.63 0 4.3 2.3 4.3 5.3V15h-3.6v-3.6c0-.86-.02-1.96-1.25-1.96-1.25 0-1.44.94-1.44 1.9V15H7.3V6.2Z"/></svg>',
  mail: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1.5 2.5h13a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Zm.9 1.7L8 8.6l5.6-4.4H2.4Zm11.6 1.3-5.4 4.3a1 1 0 0 1-1.2 0L2 5.5v6.3h12V5.5Z"/></svg>',
};

/* ── shared chrome ────────────────────────────────────────── */

function renderHeader() {
  const el = document.querySelector("[data-site-head]");
  if (!el) return;
  const here = location.pathname.split("/").pop() || "index.html";
  const pages = [
    ["index.html", "Overview"],
    ["projects.html", "Projects"],
    ["blog.html", "Blog"],
  ];
  el.innerHTML = `
    <div class="wrap">
      <a class="brand" href="index.html">${esc(C.profile.name)}</a>
      <nav class="site-nav" aria-label="Primary">
        <ul>
          ${pages
            .map(
              ([href, label]) =>
                `<li><a href="${href}"${
                  href === here ? ' aria-current="page"' : ""
                }>${label}</a></li>`
            )
            .join("")}
        </ul>
      </nav>
    </div>`;
}

function renderFooter() {
  const el = document.querySelector("[data-site-foot]");
  if (!el) return;
  el.innerHTML = `
    <div class="wrap">
      <p class="foot-bio">${esc(C.profile.bio)}</p>
      <ul class="foot-links">
        <li><a href="${esc(C.links.github)}" rel="me noopener">GitHub</a></li>
        <li><a href="${esc(C.links.linkedin)}" rel="me noopener">LinkedIn</a></li>
        <li><a href="${mailto()}">${esc(C.links.email)}</a></li>
      </ul>
      <p class="colophon">
        <span>© ${new Date().getFullYear()} ${esc(C.profile.name)}</span>
        <button class="egg" data-egg aria-label="A small surprise">·</button>
      </p>
    </div>`;
}

/* ── entry rendering ──────────────────────────────────────── */

function postEntry(p) {
  return `
    <a class="entry" href="post.html?p=${encodeURIComponent(p.slug)}">
      <span class="entry-tile">${glyph(p.glyph)}</span>
      <span class="entry-body">
        <span class="entry-title">${esc(p.title)}</span>
        <span class="entry-blurb">${esc(p.blurb)}</span>
        <span class="entry-meta">${esc(fmtDate(p.date))}</span>
      </span>
    </a>`;
}

function projectEntry(p, { full }) {
  const links = (p.links || [])
    .filter((l) => l && l.url)
    .map(
      (l) =>
        `<a href="${esc(l.url)}" rel="noopener">${esc(l.label || "Link")}</a>`
    )
    .join("");
  return `
    <article class="entry${full ? " entry--card" : ""}">
      <div class="entry-tile">${glyph(p.glyph)}</div>
      <div class="entry-body">
        <h3 class="entry-title">${esc(p.title)}${
          p.year ? `<span class="entry-year">${esc(p.year)}</span>` : ""
        }</h3>
        <p class="entry-blurb">${esc(p.description)}</p>
        ${p.role ? `<p class="entry-meta">${esc(p.role)}</p>` : ""}
        ${links && full ? `<p class="entry-links">${links}</p>` : ""}
      </div>
    </article>`;
}

/** Drops a list into `sel`, or a quiet note when there is nothing yet. */
function fill(sel, html, emptyNote) {
  const el = document.querySelector(sel);
  if (!el) return;
  el.innerHTML = html || `<p class="empty">${esc(emptyNote)}</p>`;
}

function renderContact() {
  const el = document.querySelector("[data-contact]");
  if (!el) return;
  el.innerHTML = `
    <a class="btn" href="${esc(C.links.github)}" rel="me noopener">
      ${ICONS.github}<span>GitHub</span>
    </a>
    <a class="btn" href="${esc(C.links.linkedin)}" rel="me noopener">
      ${ICONS.linkedin}<span>LinkedIn</span>
    </a>
    <a class="btn" href="${mailto()}" data-copy-email="${esc(C.links.email)}">
      ${ICONS.mail}<span data-label>Email</span>
    </a>`;
}

function renderHome() {
  // The HTML carries the same words as a no-JS fallback; content.js wins.
  const name = document.querySelector("[data-hero-name]");
  const tag = document.querySelector("[data-hero-tagline]");
  if (name) name.textContent = C.profile.name;
  if (tag) tag.textContent = C.profile.tagline;

  renderContact();
  const posts = sortedPosts();
  fill(
    "[data-home-posts]",
    posts.slice(0, 3).map(postEntry).join(""),
    "Nothing written yet."
  );

  const featured = (C.projects || []).filter((p) => p.featured).slice(0, 3);
  fill(
    "[data-home-projects]",
    featured.map((p) => projectEntry(p, { full: false })).join(""),
    "Nothing to show yet."
  );

  fill(
    "[data-experience]",
    (C.experience || [])
      .map(
        (x) => `
      <li class="xp">
        <span class="xp-org">${esc(x.org)}</span>
        <span class="xp-period">${esc(x.period)}</span>
        <span class="xp-role">${esc(x.role)}</span>
        ${x.note ? `<span class="xp-note">${esc(x.note)}</span>` : ""}
      </li>`
      )
      .join(""),
    "Nothing here yet."
  );
}

function renderProjectsPage() {
  fill(
    "[data-all-projects]",
    (C.projects || []).map((p) => projectEntry(p, { full: true })).join(""),
    "Nothing to show yet — check back."
  );
}

function renderBlogPage() {
  const posts = sortedPosts();
  let html = "";
  let year = null;
  for (const p of posts) {
    const y = yearOf(p.date);
    if (y !== year) {
      year = y;
      html += `<h2 class="year-head">${esc(y)}</h2>`;
    }
    html += postEntry(p);
  }
  fill("[data-all-posts]", html, "Nothing written yet — check back.");
}

/* ── motion ───────────────────────────────────────────────── */

/** Fades sections in, and plays each glyph's draw-in once when first seen. */
function initReveal() {
  const show = (el) =>
    el.classList.add(el.matches(".glyph") ? "is-seen" : "is-visible");
  const targets = document.querySelectorAll(".reveal, .glyph");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced || !("IntersectionObserver" in window)) {
    targets.forEach(show);
    return;
  }

  // Only now is it safe to hide anything — see .js-reveal in the CSS.
  document.documentElement.classList.add("js-reveal");

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        show(e.target);
        io.unobserve(e.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.15 }
  );
  targets.forEach((el) => io.observe(el));

  // Belt and braces: if the observer never reports (backgrounded tab, an
  // engine that doesn't paint), show everything rather than nothing.
  setTimeout(() => {
    document.querySelectorAll(".reveal:not(.is-visible)").forEach(show);
  }, 800);
}

/* ── boot ─────────────────────────────────────────────────── */

document.addEventListener("DOMContentLoaded", () => {
  renderHeader();
  renderFooter();

  const page = document.body.dataset.page;
  if (page === "home") renderHome();
  if (page === "projects") renderProjectsPage();
  if (page === "blog") renderBlogPage();

  // post.js renders its own body first, then asks for the reveal pass
  if (page !== "post") initReveal();
});
