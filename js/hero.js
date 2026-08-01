/* hero.js — the two pieces of the hero that CSS can't do on its own:
   a field of vertical bars that eases between two noise patterns and
   reacts to the pointer, and the thinker, whose head follows the cursor.

   Everything here is decoration. With JS off the hero is still a hero,
   and under prefers-reduced-motion none of it runs. */

(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");

  /** "#0a0a0a" → "10,10,10", for building rgba() strings. */
  function inkChannels() {
    const hex = (
      getComputedStyle(document.documentElement).getPropertyValue("--ink") ||
      "#0a0a0a"
    ).trim();
    const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex);
    return m
      ? `${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)}`
      : "10,10,10";
  }

  /* ── The bar field ──────────────────────────────────────────
     Two noise-seeded patterns of short bars; the draw eases back and
     forth between them so the field keeps reorganising itself. The
     pointer thickens nearby lines, and a click sends a ring outward.  */
  function initBars() {
    const canvas = document.getElementById("hero-bg");
    const hero = canvas?.closest(".hero");
    if (!canvas || !hero || reduced.matches) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    const SPACING = 26; // wider than a dense field — this is background
    const SPEED = 0.004;
    const REACH = 170; // how far the pointer is felt
    const BURST_MS = 2400;

    let w = 0;
    let h = 0;
    let lines = 0;
    let step = 0;
    let patternA = [];
    let patternB = [];
    let ink = inkChannels();
    let t = 0;
    let raf = 0;
    let running = false;
    const pointer = { x: -9999, y: -9999 };
    let bursts = [];

    const noise = (x, y, seed) =>
      (Math.sin(x * 0.02 + seed) * Math.cos(y * 0.02 + seed) +
        Math.sin(x * 0.03 - seed) * Math.cos(y * 0.01 + seed) +
        1) /
      2;

    /* Built once per resize rather than per frame — the reference
       rebuilt both patterns 60 times a second, which is a lot of
       garbage for a background. */
    function buildPattern(seed) {
      const out = [];
      for (let i = 0; i < lines; i++) {
        const bars = [];
        let y = 0;
        while (y < h) {
          const n = noise(i * step, y, seed);
          if (n > 0.5) {
            const len = 10 + n * 30;
            bars.push({ y: y + len / 2, h: len, w: 2 + n * 3 });
            y += len + 15;
          } else {
            y += 15;
          }
        }
        out.push(bars);
      }
      return out;
    }

    function size() {
      const r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      lines = Math.max(2, Math.floor(w / SPACING));
      step = w / lines;
      ink = inkChannels();
      patternA = buildPattern(0);
      patternB = buildPattern(5);
    }

    const near = (x, y) => {
      const d = Math.hypot(x - pointer.x, y - pointer.y);
      return Math.max(0, 1 - d / REACH);
    };

    function burstAt(x, y, now) {
      let total = 0;
      for (const b of bursts) {
        const age = now - b.time;
        if (age >= BURST_MS) continue;
        const d = Math.hypot(x - b.x, y - b.y);
        const ring = (age / BURST_MS) * 300;
        const band = 60;
        const off = Math.abs(d - ring);
        if (off < band) {
          total += (1 - age / BURST_MS) * (1 - off / band);
        }
      }
      return Math.min(total, 1.5);
    }

    function frame() {
      const now = Date.now();
      t += SPEED;

      // Ease all the way to pattern B and back, pausing at each end.
      const cycle = t % (Math.PI * 2);
      let p;
      if (cycle < Math.PI * 0.1) p = 0;
      else if (cycle < Math.PI * 0.9) p = (cycle - Math.PI * 0.1) / (Math.PI * 0.8);
      else if (cycle < Math.PI * 1.1) p = 1;
      else if (cycle < Math.PI * 1.9)
        p = 1 - (cycle - Math.PI * 1.1) / (Math.PI * 0.8);
      else p = 0;
      const e =
        p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      const swell = e * (1 - e) * 4; // peaks mid-transition

      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < lines; i++) {
        const x = i * step + step / 2;
        const lineNear = near(x, h / 2);

        ctx.beginPath();
        ctx.strokeStyle = `rgba(${ink},${0.045 + lineNear * 0.1})`;
        ctx.lineWidth = 1 + lineNear * 1.2;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();

        const a = patternA[i] || [];
        const b = patternB[i] || [];
        const count = Math.max(a.length, b.length);

        for (let j = 0; j < count; j++) {
          const barA = a[j] || { y: (b[j]?.y ?? 0) - 100, h: 0, w: 0 };
          const barB = b[j] || { y: (a[j]?.y ?? 0) + 100, h: 0, w: 0 };

          const n = near(x, barA.y);
          const bu = burstAt(x, barA.y, now);

          const wave =
            Math.sin(i * 0.3 + j * 0.5 + t * 2) * 10 * swell +
            n * Math.sin(t * 3 + i * 0.2) * 15 +
            bu * Math.sin(t * 4 + j * 0.3) * 20;

          const y = barA.y + (barB.y - barA.y) * e + wave;
          const bh = barA.h + (barB.h - barA.h) * e + n * 5 + bu * 8;
          const bw = barA.w + (barB.w - barA.w) * e + n * 2 + bu * 3;

          if (bh > 0.1 && bw > 0.1) {
            const alpha = Math.min(0.5, 0.11 + n * 0.14 + bu * 0.2);
            ctx.fillStyle = `rgba(${ink},${alpha})`;
            ctx.fillRect(x - bw / 2, y - bh / 2, bw, bh);
          }
        }
      }

      if (bursts.length) bursts = bursts.filter((b) => now - b.time < BURST_MS);
      raf = requestAnimationFrame(frame);
    }

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    size();
    start();

    addEventListener("resize", size, { passive: true });

    // The canvas ignores pointer events so links stay clickable; the
    // hero section listens on its behalf.
    hero.addEventListener(
      "pointermove",
      (e) => {
        const r = canvas.getBoundingClientRect();
        pointer.x = e.clientX - r.left;
        pointer.y = e.clientY - r.top;
      },
      { passive: true }
    );
    hero.addEventListener("pointerleave", () => {
      pointer.x = pointer.y = -9999;
    });
    hero.addEventListener(
      "pointerdown",
      (e) => {
        const r = canvas.getBoundingClientRect();
        bursts.push({
          x: e.clientX - r.left,
          y: e.clientY - r.top,
          time: Date.now(),
        });
      },
      { passive: true }
    );

    /* Only draw when the hero is both on screen and in a visible tab.
       Tracked as two independent flags so neither event can strand the
       loop in the wrong state. */
    let onScreen = true;
    let visible = !document.hidden;
    const sync = () => (onScreen && visible ? start() : stop());

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        ([entry]) => {
          onScreen = entry.isIntersecting;
          sync();
        },
        { threshold: 0 }
      ).observe(canvas);
    }
    document.addEventListener("visibilitychange", () => {
      visible = !document.hidden;
      sync();
    });
    reduced.addEventListener?.("change", (e) => (e.matches ? stop() : sync()));
  }

  /* ── The thinker ────────────────────────────────────────────
     JS only writes two custom properties; the transitions that make
     it feel alive are in the stylesheet. */
  function initThinker() {
    const fig = document.querySelector("[data-thinker]");
    if (!fig || reduced.matches) return;

    const MAX_TILT = 7;
    const REACH = 320;
    let queued = false;
    let last = null;

    function apply() {
      queued = false;
      if (!last) return;
      const r = fig.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = last.x - cx;
      const dist = Math.hypot(dx, last.y - cy);

      const think = Math.max(0, 1 - dist / REACH);
      // negative dx (cursor to the left) leans the head that way
      const tilt = Math.max(-1, Math.min(1, dx / (r.width * 2))) * MAX_TILT;

      fig.style.setProperty("--think", think.toFixed(3));
      fig.style.setProperty("--tilt", `${tilt.toFixed(2)}deg`);
    }

    addEventListener(
      "pointermove",
      (e) => {
        last = { x: e.clientX, y: e.clientY };
        if (!queued) {
          queued = true;
          requestAnimationFrame(apply);
        }
      },
      { passive: true }
    );

    // Clicking it lets a thought go.
    fig.addEventListener("click", () => {
      fig.classList.remove("has-idea");
      void fig.offsetWidth; // restart the animation
      fig.classList.add("has-idea");
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initBars();
    initThinker();
  });
})();
