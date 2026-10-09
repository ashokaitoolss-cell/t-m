// Writes the traced glyphs (data/logo.json, from scripts/prep_logo.py) into compositions/lockup.html between
// the <!-- glyphs:word --> and <!-- glyphs:chip --> markers. Re-runnable: it replaces what an
// earlier run wrote.
//
//   node scripts/build.mjs
import { readFileSync, writeFileSync } from "node:fs";

const root = new URL("..", import.meta.url).pathname;
const logo = JSON.parse(readFileSync(root + "data/logo.json", "utf8"));
const PAD = 2;
const CHIP = [1091 + 12, 469 + 12]; // #chip left/top in compositions/lockup.html (inside the ring)

const ids = { E: "g-E", l: "g-l", e1: "g-e1", v: "g-v", e2: "g-e2", n: "g-n", V: "g-V", 4: "g-4" };
// V and 4 start below the chip and rise into view, so their overflow of #chip is the reveal.
function glyph(name, [ox, oy], indent, extra = "") {
  const [x, y, w, h] = logo.glyphs[name].box;
  const bx = x - PAD, by = y - PAD, bw = w + 2 * PAD, bh = h + 2 * PAD;
  return (
    `${indent}<div id="${ids[name]}" class="glyph"${extra} style="left: ${bx - ox}px; top: ${by - oy}px; width: ${bw}px; height: ${bh}px">` +
    `<svg viewBox="${bx} ${by} ${bw} ${bh}" aria-hidden="true"><path fill-rule="evenodd" d="${logo.glyphs[name].d}" /></svg></div>`
  );
}

const word = ["E", "l", "e1", "v", "e2", "n"].map((n) => glyph(n, [0, 0], "          ")).join("\n");
const chip = ["V", "4"].map((n) => glyph(n, CHIP, "              ", ' data-layout-allow-overflow="true"')).join("\n");

let html = readFileSync(root + "compositions/lockup.html", "utf8");
html = html.replace(/( *)<!-- glyphs:word -->[\s\S]*?(?=\n *<div id="press">)/, `$1<!-- glyphs:word -->\n${word}`);
html = html.replace(/( *)<!-- glyphs:chip -->[\s\S]*?(?=\n *<\/div>\n *<\/div>\n *<\/div>)/, `$1<!-- glyphs:chip -->\n${chip}`);
writeFileSync(root + "compositions/lockup.html", html);
console.log("glyphs written:", Object.keys(ids).length);
