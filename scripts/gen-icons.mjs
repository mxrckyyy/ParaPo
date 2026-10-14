// PARA PO placeholder PWA icons (Phase 4). Flat brand-green rounded square
// with a white "window" + gold dot. Intentionally simple geometric branding —
// replace with final artwork before any public launch (see docs/CHANGELOG.md).
// Run: node scripts/gen-icons.mjs  (outputs to public/icons/, no dependencies)
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";

const GREEN = [22, 163, 74, 255];
const WHITE = [255, 255, 255, 255];
const GOLD = [245, 158, 11, 255];

const crcTable = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc(bytes) {
  let c = 0xffffffff;
  for (const b of bytes) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return Buffer.alloc(4).map((_, i) => (c ^ 0xffffffff) >>> ((3 - i) * 8) & 0xff);
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  return Buffer.concat([len, body, crc(body)]);
}

function roundedRect(d, x0, y0, x1, y1, r, color) {
  const size = Math.sqrt(d.length / 4);
  for (let y = Math.floor(y0); y < y1; y++) {
    for (let x = Math.floor(x0); x < x1; x++) {
      const cx = Math.min(Math.max(x, x0 + r), x1 - r);
      const cy = Math.min(Math.max(y, y0 + r), y1 - r);
      if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) {
        const i = (y * size + x) * 4;
        d[i] = color[0]; d[i + 1] = color[1]; d[i + 2] = color[2]; d[i + 3] = color[3];
      }
    }
  }
}

function makeIcon(size, { maskable = false } = {}) {
  const d = Buffer.alloc(size * size * 4, 0);
  if (maskable) {
    d.forEach((_, i) => { if (i % 4 === 3) d[i] = 255; });
    for (let p = 0; p < size * size; p++) { d[p * 4] = GREEN[0]; d[p * 4 + 1] = GREEN[1]; d[p * 4 + 2] = GREEN[2]; }
  } else {
    roundedRect(d, 0, 0, size, size, size * 0.22, GREEN);
  }
  // White "window" centered at ~62% of the canvas (safe for maskable crop).
  const m = size * 0.19;
  roundedRect(d, m, m * 0.82, size - m, size - m * 1.18, size * 0.09, WHITE);
  // Gold dot (fare accent) lower-right of the window.
  roundedRect(d, size * 0.6, size * 0.6, size * 0.74, size * 0.74, size * 0.07, GOLD);

  const raw = Buffer.alloc(size * (1 + size * 4));
  for (let y = 0; y < size; y++) {
    raw[y * (1 + size * 4)] = 0;
    d.copy(raw, y * (1 + size * 4) + 1, y * size * 4, (y + 1) * size * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

mkdirSync("public/icons", { recursive: true });
writeFileSync("public/icons/icon-192.png", makeIcon(192));
writeFileSync("public/icons/icon-512.png", makeIcon(512));
writeFileSync("public/icons/icon-maskable-512.png", makeIcon(512, { maskable: true }));
console.log("icons written to public/icons/");
