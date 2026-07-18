import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Generates warm-editorial SVG cover placeholders so Phase 1 needs no external
 * image assets. Deterministic output — re-running produces identical files.
 */
const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "../public/covers");
mkdirSync(outDir, { recursive: true });

// Logo-matched stops (blush → rose → magenta, alternating with gold), per cover.
const palettes = [
  ["#FBE9F1", "#EFA6C8", "#CE2A72"], // rose
  ["#FBF0DA", "#E9C06A", "#C99A3B"], // gold
  ["#F7E1EC", "#E28CB6", "#B21F60"], // deep rose
  ["#FCEAF2", "#ECA6CB", "#D53F8C"], // pink
  ["#FBEED2", "#E6B85C", "#B98A2E"], // warm gold
  ["#F9E6EE", "#E799BE", "#C21E63"], // rose
  ["#F3E0EC", "#D98FB4", "#A81C57"], // magenta
  ["#FCF1DE", "#EAC578", "#CDA03F"], // gold
];

function cover(i) {
  const [a, b, c] = palettes[i % palettes.length];
  const angle = 115 + (i % 5) * 12;
  const cx = 20 + ((i * 17) % 60);
  const cy = 15 + ((i * 23) % 50);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000" role="img" aria-label="Abstract warm gradient cover">
  <defs>
    <linearGradient id="g${i}" gradientTransform="rotate(${angle})">
      <stop offset="0%" stop-color="${a}"/>
      <stop offset="55%" stop-color="${b}"/>
      <stop offset="100%" stop-color="${c}"/>
    </linearGradient>
    <radialGradient id="r${i}" cx="${cx}%" cy="${cy}%" r="70%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="800" height="1000" fill="url(#g${i})"/>
  <rect width="800" height="1000" fill="url(#r${i})"/>
  <circle cx="${cx * 8}" cy="${cy * 10}" r="${180 + (i % 3) * 60}" fill="#FFFFFF" opacity="0.06"/>
  <circle cx="${800 - cx * 6}" cy="${1000 - cy * 8}" r="${120 + (i % 4) * 50}" fill="#26204A" opacity="0.06"/>
</svg>`;
}

const COUNT = 16;
for (let i = 0; i < COUNT; i++) {
  const name = `c${String(i + 1).padStart(2, "0")}.svg`;
  writeFileSync(resolve(outDir, name), cover(i));
}
console.log(`Generated ${COUNT} covers in public/covers/`);
