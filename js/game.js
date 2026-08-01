/* game.js — the easter egg. Konami code (↑↑↓↓←→←→BA), or the faint
   dot in the footer, opens a game of Snake. Entirely optional; the
   overlay isn't built until someone actually asks for it. */

(() => {
  const KONAMI = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a",
  ];
  const CELLS = 21;
  const START_MS = 130;
  const MIN_MS = 70;
  const BEST_KEY = "snake-best";

  let el, canvas, ctx, scoreEl, bestEl, hintEl, closeBtn;
  let opener = null;
  let raf = 0;
  let progress = 0;

  /* ── overlay, built on first open ───────────────────────── */
  function build() {
    el = document.createElement("div");
    el.className = "game";
    el.hidden = true;
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-label", "Snake");
    el.innerHTML = `
      <button class="game-close" data-close aria-label="Close game">×</button>
      <div class="game-panel">
        <div class="game-score">
          <span>score <b data-score>0</b></span>
          <span>best <b data-best>0</b></span>
        </div>
        <canvas id="game-canvas"></canvas>
        <p class="game-hint" data-hint>Arrow keys or swipe. Esc to leave.</p>
      </div>`;
    document.body.appendChild(el);

    canvas = el.querySelector("#game-canvas");
    ctx = canvas.getContext("2d");
    scoreEl = el.querySelector("[data-score]");
    bestEl = el.querySelector("[data-best]");
    hintEl = el.querySelector("[data-hint]");
    closeBtn = el.querySelector("[data-close]");

    closeBtn.addEventListener("click", close);
    el.addEventListener("click", (e) => {
      if (e.target === el) close();
    });
  }

  /* ── game state ─────────────────────────────────────────── */
  const state = {
    snake: [],
    dir: { x: 1, y: 0 },
    queued: [],
    food: { x: 0, y: 0 },
    score: 0,
    best: 0,
    over: false,
    started: false,
    acc: 0,
    last: 0,
  };

  function readBest() {
    try {
      return Number(localStorage.getItem(BEST_KEY)) || 0;
    } catch {
      return 0;
    }
  }
  function writeBest(v) {
    try {
      localStorage.setItem(BEST_KEY, String(v));
    } catch {
      /* private mode — the score just won't stick */
    }
  }

  function placeFood() {
    const free = [];
    for (let y = 0; y < CELLS; y++) {
      for (let x = 0; x < CELLS; x++) {
        if (!state.snake.some((s) => s.x === x && s.y === y)) free.push({ x, y });
      }
    }
    if (!free.length) return;
    state.food = free[Math.floor(Math.random() * free.length)];
  }

  function reset() {
    const mid = Math.floor(CELLS / 2);
    state.snake = [
      { x: mid - 1, y: mid },
      { x: mid - 2, y: mid },
      { x: mid - 3, y: mid },
    ];
    state.dir = { x: 1, y: 0 };
    state.queued = [];
    state.score = 0;
    state.over = false;
    state.started = false;
    state.acc = 0;
    state.last = 0;
    state.best = readBest();
    scoreEl.textContent = "0";
    bestEl.textContent = String(state.best);
    hintEl.textContent = "Arrow keys or swipe to start. Esc to leave.";
    placeFood();
  }

  const stepMs = () => Math.max(MIN_MS, START_MS - state.score * 2);

  function step() {
    if (state.queued.length) state.dir = state.queued.shift();
    const head = {
      x: state.snake[0].x + state.dir.x,
      y: state.snake[0].y + state.dir.y,
    };

    const hitWall =
      head.x < 0 || head.y < 0 || head.x >= CELLS || head.y >= CELLS;
    const hitSelf = state.snake.some((s) => s.x === head.x && s.y === head.y);
    if (hitWall || hitSelf) {
      state.over = true;
      if (state.score > state.best) {
        state.best = state.score;
        writeBest(state.best);
        bestEl.textContent = String(state.best);
      }
      hintEl.textContent = "Game over — press Space or tap to play again.";
      return;
    }

    state.snake.unshift(head);
    if (head.x === state.food.x && head.y === state.food.y) {
      state.score++;
      scoreEl.textContent = String(state.score);
      placeFood();
    } else {
      state.snake.pop();
    }
  }

  /* ── drawing ────────────────────────────────────────────── */
  function size() {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw() {
    const w = canvas.getBoundingClientRect().width;
    const cell = w / CELLS;
    const pad = cell * 0.14;
    const css = getComputedStyle(document.documentElement);
    const ink = css.getPropertyValue("--ink").trim() || "#0a0a0a";

    ctx.clearRect(0, 0, w, w);

    // food reads as an outline so it stays distinct from the solid snake
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(
      (state.food.x + 0.5) * cell,
      (state.food.y + 0.5) * cell,
      cell * 0.26,
      0,
      Math.PI * 2
    );
    ctx.stroke();

    ctx.fillStyle = ink;
    state.snake.forEach((s, i) => {
      ctx.globalAlpha = state.over ? 0.35 : 1 - (i / state.snake.length) * 0.45;
      const r = cell * 0.25;
      const x = s.x * cell + pad;
      const y = s.y * cell + pad;
      const d = cell - pad * 2;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(x, y, d, d, r) : ctx.rect(x, y, d, d);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  function loop(t) {
    if (!state.last) state.last = t;
    const dt = t - state.last;
    state.last = t;

    if (state.started && !state.over) {
      state.acc += dt;
      while (state.acc >= stepMs()) {
        state.acc -= stepMs();
        step();
        if (state.over) break;
      }
    }
    draw();
    raf = requestAnimationFrame(loop);
  }

  /* ── input ──────────────────────────────────────────────── */
  function turn(x, y) {
    if (state.over) return;
    if (!state.started) {
      state.started = true;
      state.last = 0;
      hintEl.textContent = "Esc to leave.";
    }
    const last = state.queued.at(-1) || state.dir;
    if (last.x === -x && last.y === -y) return; // no instant reversal
    if (last.x === x && last.y === y) return;
    if (state.queued.length < 2) state.queued.push({ x, y });
  }

  const KEYS = {
    ArrowUp: [0, -1],
    ArrowDown: [0, 1],
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0],
    w: [0, -1],
    s: [0, 1],
    a: [-1, 0],
    d: [1, 0],
  };

  function onKey(e) {
    if (el.hidden) return;
    if (e.key === "Escape") return close();
    if (e.key === " " && state.over) {
      e.preventDefault();
      reset();
      return;
    }
    const move = KEYS[e.key] || KEYS[e.key?.toLowerCase?.()];
    if (move) {
      e.preventDefault();
      turn(move[0], move[1]);
    }
  }

  function initSwipe() {
    let sx = 0;
    let sy = 0;
    canvas.addEventListener(
      "pointerdown",
      (e) => {
        sx = e.clientX;
        sy = e.clientY;
      },
      { passive: true }
    );
    canvas.addEventListener("pointerup", (e) => {
      const dx = e.clientX - sx;
      const dy = e.clientY - sy;
      if (Math.hypot(dx, dy) < 24) {
        if (state.over) reset();
        return;
      }
      Math.abs(dx) > Math.abs(dy)
        ? turn(Math.sign(dx), 0)
        : turn(0, Math.sign(dy));
    });
  }

  /* ── open / close ───────────────────────────────────────── */
  function open() {
    if (!el) {
      build();
      initSwipe();
    }
    if (!el.hidden) return;
    opener = document.activeElement;
    el.hidden = false;
    document.body.style.overflow = "hidden";
    size();
    reset();
    closeBtn.focus();
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(loop);
  }

  function close() {
    if (!el || el.hidden) return;
    el.hidden = true;
    document.body.style.overflow = "";
    cancelAnimationFrame(raf);
    raf = 0;
    opener?.focus?.();
  }

  /* ── triggers ───────────────────────────────────────────── */
  document.addEventListener("keydown", (e) => {
    if (el && !el.hidden) return onKey(e);

    // don't hijack the sequence while someone is typing
    const t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA)$/.test(t.tagName))) return;

    const want = KONAMI[progress];
    const got = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    progress = got === want ? progress + 1 : got === KONAMI[0] ? 1 : 0;
    if (progress === KONAMI.length) {
      progress = 0;
      open();
    }
  });

  addEventListener("resize", () => {
    if (el && !el.hidden) size();
  });

  document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("click", (e) => {
      if (e.target.closest("[data-egg]")) open();
    });
  });
})();
