#!/usr/bin/env node
// Downloads every Higgsfield result listed in data/plates.json into assets/plates/<key>.png.
// Skips files that already exist; re-run after filling in more urls.
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const { plates } = JSON.parse(readFileSync(join(ROOT, "data/plates.json"), "utf8"));
const outDir = join(ROOT, "assets/plates");
mkdirSync(outDir, { recursive: true });

let failed = 0;
for (const [key, { url }] of Object.entries(plates)) {
  const dest = join(outDir, `${key}.png`);
  if (!url || existsSync(dest)) continue;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    console.log(`ok   ${key}`);
  } catch (err) {
    failed++;
    console.error(`fail ${key}: ${err.cause?.message || err.message}`);
  }
}
process.exit(failed ? 1 : 0);
