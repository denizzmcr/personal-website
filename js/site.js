/* site.js — reads window.CONTENT and builds the page.
   Rendering and data loading only; every animation on this site is CSS. */

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
    <a class="brand" href="index.html">${esc(C.profile.name)}</a>
    <nav class="site-nav" aria-label="Primary">
      ${pages
        .map(
          ([href, label]) =>
            `<a class="link" href="${href}"${
              href === here ? ' aria-current="page"' : ""
            }>${label}</a>`
        )
        .join("")}
    </nav>`;
}

function renderFooter() {
  const el = document.querySelector("[data-site-foot]");
  if (!el) return;
  el.innerHTML = `
    <div class="wrap">
      <p class="foot-bio">${esc(C.profile.bio)}</p>
      <div class="foot-links">
        <a class="link link--static" href="${esc(
          C.links.github
        )}" rel="me noopener">GitHub</a>
        <a class="link link--static" href="${esc(
          C.links.linkedin
        )}" rel="me noopener">LinkedIn</a>
        <a class="link link--static" href="${mailto()}">${esc(
          C.links.email
        )}</a>
      </div>
      <p class="colophon">
        <span>© ${new Date().getFullYear()} ${esc(C.profile.name)}</span>
        <button class="egg" data-egg aria-label="A small surprise">·</button>
      </p>
    </div>`;
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
  initCopy();
}

/** Copies the address instead of opening a mail client, where possible. */
function initCopy() {
  const btn = document.querySelector("[data-copy-email]");
  if (!btn) return;
  const label = btn.querySelector("[data-label]");
  const original = label.textContent;
  let timer;

  btn.addEventListener("click", async (e) => {
    if (!navigator.clipboard) return; // let the mailto: href do its job
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(btn.dataset.copyEmail);
    } catch {
      location.href = btn.href;
      return;
    }
    label.textContent = "Copied";
    btn.classList.add("is-copied");
    clearTimeout(timer);
    timer = setTimeout(() => {
      label.textContent = original;
      btn.classList.remove("is-copied");
    }, 2000);
  });
}

/* ── cards ────────────────────────────────────────────────── */

function postCard(p) {
  return `
    <li class="card rise">
      <span class="card-mark">${glyph(p.glyph)}</span>
      <h3 class="card-title"><a class="card-hit" href="post.html?p=${encodeURIComponent(
        p.slug
      )}">${esc(p.title)}</a></h3>
      <p class="card-text">${esc(p.blurb)}</p>
      <p class="card-meta">${esc(fmtDate(p.date))}</p>
    </li>`;
}

function projectCard(p) {
  const links = (p.links || [])
    .filter((l) => l && l.url)
    .map(
      (l) =>
        `<a class="link" href="${esc(l.url)}" rel="noopener">${esc(
          l.label || "Link"
        )}</a>`
    )
    .join("");
  const meta = [p.role, p.year].filter(Boolean).map(esc).join(" · ");
  return `
    <li class="card rise">
      <span class="card-mark">${glyph(p.glyph)}</span>
      <h3 class="card-title">${esc(p.title)}</h3>
      <p class="card-text">${esc(p.description)}</p>
      ${meta ? `<p class="card-meta">${meta}</p>` : ""}
      ${links ? `<p class="card-links">${links}</p>` : ""}
    </li>`;
}

/** Drops a list into `sel`, or a quiet note when there is nothing yet. */
function fill(sel, html, emptyNote) {
  const el = document.querySelector(sel);
  if (!el) return;
  if (html) {
    el.innerHTML = html;
  } else {
    el.outerHTML = `<p class="empty">${esc(emptyNote)}</p>`;
  }
}

/* ── pages ────────────────────────────────────────────────── */

function renderHome() {
  // The HTML carries the same words as a no-JS fallback; content.js wins.
  const name = document.querySelector("[data-hero-name]");
  const tag = document.querySelector("[data-hero-tagline]");
  if (name) name.textContent = C.profile.name;
  if (tag) tag.textContent = C.profile.tagline;

  renderContact();

  fill(
    "[data-home-posts]",
    sortedPosts().slice(0, 3).map(postCard).join(""),
    "Nothing written yet."
  );

  fill(
    "[data-home-projects]",
    (C.projects || [])
      .filter((p) => p.featured)
      .slice(0, 3)
      .map(projectCard)
      .join(""),
    "Nothing to show yet."
  );

  fill(
    "[data-experience]",
    (C.experience || [])
      .map(
        (x) => `
      <li class="xp rise">
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
    (C.projects || []).map(projectCard).join(""),
    "Nothing to show yet — check back."
  );
}

/* Blog list pages in from the content set rather than rendering all of it
   at once, so the list scales to any number of posts. The button is the
   guaranteed path; the observer just presses it for you on scroll. */
const PAGE_SIZE = 8;

function renderBlogPage() {
  const list = document.querySelector("[data-all-posts]");
  const more = document.querySelector("[data-more]");
  if (!list) return;

  const posts = sortedPosts();
  if (!posts.length) {
    fill("[data-all-posts]", "", "Nothing written yet — check back.");
    more?.remove();
    return;
  }

  let shown = 0;
  const loadNext = () => {
    const batch = posts.slice(shown, shown + PAGE_SIZE);
    list.insertAdjacentHTML("beforeend", batch.map(postCard).join(""));
    shown += batch.length;
    if (shown >= posts.length) more?.remove();
  };

  loadNext();
  if (!more) return;
  more.addEventListener("click", loadNext);

  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting) && more.isConnected) loadNext();
    }).observe(more);
  }
}

/* ── boot ─────────────────────────────────────────────────── */

document.addEventListener("DOMContentLoaded", () => {
  renderHeader();
  renderFooter();

  const page = document.body.dataset.page;
  if (page === "home") renderHome();
  if (page === "projects") renderProjectsPage();
  if (page === "blog") renderBlogPage();
});
