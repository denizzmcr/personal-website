/* hero.js — the drifting particle field behind the hero, the slight
   magnetic pull on the contact buttons, and copy-to-clipboard on the
   email button. All of it is decoration: the page works without it. */

(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");

  /* ── particle field ─────────────────────────────────────── */
  function initCanvas() {
    const canvas = document.getElementById("hero-canvas");
    if (!canvas) return;

    // Not worth the battery on phones, and pointless without motion.
    if (reduced.matches || innerWidth < 640) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    const LINK_DIST = 120;
    const PUSH_DIST = 110;
    let w = 0;
    let h = 0;
    let dots = [];
    let raf = 0;
    let running = false;
    const pointer = { x: -9999, y: -9999 };

    function size() {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(64, Math.round((w * h) / 14000));
      dots = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: 1 + Math.random() * 1.4,
      }));
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);

      for (const d of dots) {
        d.x += d.vx;
        d.y += d.vy;

        // wrap rather than bounce — no clustering at the edges
        if (d.x < -10) d.x = w + 10;
        if (d.x > w + 10) d.x = -10;
        if (d.y < -10) d.y = h + 10;
        if (d.y > h + 10) d.y = -10;

        // gentle shove away from the cursor
        const dx = d.x - pointer.x;
        const dy = d.y - pointer.y;
        const dist = Math.hypot(dx, dy);
        if (dist < PUSH_DIST && dist > 0.01) {
          const push = (1 - dist / PUSH_DIST) * 0.9;
          d.x += (dx / dist) * push;
          d.y += (dy / dist) * push;
        }
      }

      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const a = dots[i];
          const b = dots[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist > LINK_DIST) continue;
          ctx.strokeStyle = `rgba(17,17,17,${(1 - dist / LINK_DIST) * 0.13})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      ctx.fillStyle = "rgba(17,17,17,0.22)";
      for (const d of dots) {
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(frame);
    }
    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    size();
    start();

    addEventListener("resize", size, { passive: true });
    addEventListener(
      "pointermove",
      (e) => {
        const r = canvas.getBoundingClientRect();
        pointer.x = e.clientX - r.left;
        pointer.y = e.clientY - r.top;
      },
      { passive: true }
    );
    addEventListener("pointerleave", () => {
      pointer.x = pointer.y = -9999;
    });

    // don't burn frames off-screen or in a background tab
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        ([e]) => (e.isIntersecting && !document.hidden ? start() : stop()),
        { threshold: 0 }
      ).observe(canvas);
    }
    document.addEventListener("visibilitychange", () => {
      document.hidden ? stop() : start();
    });
    reduced.addEventListener?.("change", (e) => (e.matches ? stop() : start()));
  }

  /* ── magnetic buttons ───────────────────────────────────── */
  function initMagnetic() {
    if (reduced.matches || !matchMedia("(hover: hover)").matches) return;
    const btns = document.querySelectorAll(".contact .btn");
    const PULL = 6;
    const RANGE = 90;

    addEventListener(
      "pointermove",
      (e) => {
        for (const btn of btns) {
          const r = btn.getBoundingClientRect();
          const dx = e.clientX - (r.left + r.width / 2);
          const dy = e.clientY - (r.top + r.height / 2);
          const dist = Math.hypot(dx, dy);
          if (dist < RANGE + r.width / 2) {
            const k = PULL / (RANGE + r.width / 2);
            btn.classList.add("is-magnetic");
            btn.style.transform = `translate(${dx * k}px, ${dy * k}px)`;
          } else if (btn.style.transform) {
            btn.classList.remove("is-magnetic");
            btn.style.transform = "";
          }
        }
      },
      { passive: true }
    );
  }

  /* ── copy the email address ─────────────────────────────── */
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
      label.textContent = "Copied ✓";
      btn.classList.add("is-copied");
      clearTimeout(timer);
      timer = setTimeout(() => {
        label.textContent = original;
        btn.classList.remove("is-copied");
      }, 2000);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initCanvas();
    initMagnetic();
    initCopy();
  });
})();
