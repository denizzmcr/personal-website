/* glyphs.js — the little line-art illustrations.
   Each is a 48×48 inline SVG drawn in currentColor. Animation lives
   in css/style.css, hung off the class names below (g-node, g-edge…).
   Strokes are drawn on with stroke-dashoffset; the CSS uses a dash
   longer than any line here rather than pathLength, which Chrome
   ignores on <line> and <polyline>. */

const GLYPHS = {
  // think — nodes wiring themselves together
  nodes: `
    <line class="g-edge" x1="13" y1="15" x2="34" y2="13"/>
    <line class="g-edge" x1="13" y1="15" x2="15" y2="35"/>
    <line class="g-edge" x1="34" y1="13" x2="33" y2="34"/>
    <line class="g-edge" x1="15" y1="35" x2="33" y2="34"/>
    <circle class="g-node" cx="13" cy="15" r="3.5"/>
    <circle class="g-node" cx="34" cy="13" r="3.5"/>
    <circle class="g-node" cx="15" cy="35" r="3.5"/>
    <circle class="g-node" cx="33" cy="34" r="3.5"/>`,

  // talk — a bubble mid-sentence
  bubble: `
    <path d="M9 13a3 3 0 0 1 3-3h24a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H21l-7 7v-7h-2a3 3 0 0 1-3-3z"/>
    <circle class="g-dot" cx="18" cy="20" r="1.8"/>
    <circle class="g-dot" cx="24" cy="20" r="1.8"/>
    <circle class="g-dot" cx="30" cy="20" r="1.8"/>`,

  // initiate — a line that climbs
  ascent: `
    <polyline class="g-draw" points="8,38 18,28 26,33 39,14"/>
    <polyline class="g-tip" points="31,13 40,13 40,22"/>`,

  orbit: `
    <circle class="g-ring" cx="24" cy="24" r="14"/>
    <circle class="g-core" cx="24" cy="24" r="3.5"/>
    <g class="g-orbiter"><circle cx="24" cy="10" r="3"/></g>`,

  grid: `
    <circle class="g-cell" cx="14" cy="14" r="2.6"/>
    <circle class="g-cell" cx="24" cy="14" r="2.6"/>
    <circle class="g-cell" cx="34" cy="14" r="2.6"/>
    <circle class="g-cell" cx="14" cy="24" r="2.6"/>
    <circle class="g-cell" cx="24" cy="24" r="2.6"/>
    <circle class="g-cell" cx="34" cy="24" r="2.6"/>
    <circle class="g-cell" cx="14" cy="34" r="2.6"/>
    <circle class="g-cell" cx="24" cy="34" r="2.6"/>
    <circle class="g-cell" cx="34" cy="34" r="2.6"/>`,

  wave: `
    <g class="g-wave">
      <path d="M-16 24q8-11 16 0t16 0 16 0 16 0 16 0"/>
    </g>`,

  stack: `
    <rect class="g-layer" x="10" y="28" width="28" height="9" rx="2"/>
    <rect class="g-layer" x="10" y="19" width="28" height="9" rx="2"/>
    <rect class="g-layer" x="10" y="10" width="28" height="9" rx="2"/>`,

  spark: `
    <g class="g-rays">
      <line x1="24" y1="7" x2="24" y2="17"/>
      <line x1="24" y1="31" x2="24" y2="41"/>
      <line x1="7" y1="24" x2="17" y2="24"/>
      <line x1="31" y1="24" x2="41" y2="24"/>
      <line x1="12" y1="12" x2="19" y2="19"/>
      <line x1="29" y1="29" x2="36" y2="36"/>
      <line x1="36" y1="12" x2="29" y2="19"/>
      <line x1="19" y1="29" x2="12" y2="36"/>
    </g>
    <circle class="g-core" cx="24" cy="24" r="3"/>`,
};

/** Inline SVG markup for a glyph. Unknown names fall back to `nodes`. */
function glyph(name) {
  const body = GLYPHS[name] || GLYPHS.nodes;
  return `<svg class="glyph" viewBox="0 0 48 48" aria-hidden="true" focusable="false">${body}</svg>`;
}
