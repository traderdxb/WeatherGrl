/**
 * Generate a minimal 256×256 PNG icon for TempVeritas.
 * Run: node scripts/generate-icon.cjs
 *
 * Creates public/icon.png (used by electron-builder).
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Minimal PNG generator — no external dependencies.
// Creates a solid dark-blue square with a simple "T" pattern.

const W = 256;
const H = 256;

// Raw RGBA pixel data (top-to-bottom, left-to-right)
const raw = Buffer.alloc(W * H * 4, 0);

function setPixel(x, y, r, g, b, a = 255) {
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const i = (y * W + x) * 4;
  raw[i] = r;
  raw[i + 1] = g;
  raw[i + 2] = b;
  raw[i + 3] = a;
}

// Draw background (dark gradient)
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const t = y / H;
    const r = Math.floor(10 + t * 16);
    const g = Math.floor(10 + t * 20);
    const b = Math.floor(15 + t * 30);
    setPixel(x, y, r, g, b);
  }
}

// Draw a simple "T" thermometer shape
const cx = 128;
const cy = 128;
const rOuter = 72;

// Outer circle
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist >= rOuter - 2 && dist <= rOuter + 1) {
      setPixel(x, y, 59, 130, 246, 180); // blue accent ring
    }
  }
}

// Thermometer body - vertical bar
const tbLeft = cx - 10;
const tbRight = cx + 10;
const tbTop = cy - 50;
const tbBottom = cy + 40;

for (let y = tbTop; y <= tbBottom; y++) {
  for (let x = tbLeft; x <= tbRight; x++) {
    const dx = x - cx;
    // Rounded ends
    const inRoundTop = (y - tbTop) * (y - tbTop) + dx * dx <= 10 * 10;
    const inRoundBot = (y - tbBottom) * (y - tbBottom) + dx * dx <= 10 * 10;
    if (x >= tbLeft && x <= tbRight && (inRoundTop || inRoundBot || (y > tbTop && y < tbBottom))) {
      setPixel(x, y, 232, 232, 240); // white-grey
    }
  }
}

// Red mercury column (bottom half of thermometer)
const mercuryTop = cy + 10;
for (let y = mercuryTop; y <= tbBottom; y++) {
  for (let x = tbLeft + 2; x <= tbRight - 2; x++) {
    const dx = x - cx;
    const inRoundBot = (y - tbBottom) * (y - tbBottom) + dx * dx <= 8 * 8;
    if (inRoundBot || (y > mercuryTop && y < tbBottom)) {
      setPixel(x, y, 239, 68, 68); // red
    }
  }
}

// Mercury bulb at bottom
for (let y = tbBottom - 4; y <= tbBottom + 14; y++) {
  for (let x = tbLeft - 4; x <= tbRight + 4; x++) {
    const dx = x - cx;
    const dy = y - (tbBottom + 5);
    if (dx * dx + dy * dy <= 14 * 14) {
      setPixel(x, y, 239, 68, 68);
    }
  }
}

// Trend arrow up (green triangle)
const arrowX = cx + 45;
const arrowY = cy - 30;
for (let y = 0; y < 20; y++) {
  for (let x = 0; x < 40; x++) {
    const halfWidth = Math.floor(y * 0.5);
    if (x >= 20 - halfWidth && x <= 20 + halfWidth) {
      setPixel(arrowX + x - 20, arrowY + y, 34, 197, 94);
    }
  }
}

// Build IDAT chunks
function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeB = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeB, data]);
  const crc = crc32(crcData);
  const crcB = Buffer.alloc(4);
  crcB.writeUInt32BE(crc);
  return Buffer.concat([len, typeB, data, crcB]);
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let j = 0; j < 8; j++) {
      c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

// PNG signature
const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

// IHDR
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);  // width
ihdr.writeUInt32BE(H, 4);  // height
ihdr[8] = 8;               // bit depth
ihdr[9] = 6;               // color type (RGBA)
ihdr[10] = 0;              // compression
ihdr[11] = 0;              // filter
ihdr[12] = 0;              // interlace

// IDAT (raw data with filter byte 0 per row)
const filtered = Buffer.alloc(W * H + H);
for (let y = 0; y < H; y++) {
  filtered[y * (W * 4 + 1)] = 0; // no filter
  raw.copy(filtered, y * (W * 4 + 1) + 1, y * W * 4, (y + 1) * W * 4);
}
const compressed = zlib.deflateSync(filtered);

// IEND
const iend = Buffer.alloc(0);

const png = Buffer.concat([
  sig,
  createChunk('IHDR', ihdr),
  createChunk('IDAT', compressed),
  createChunk('IEND', iend),
]);

const outPath = path.join(__dirname, '..', 'public', 'icon.png');
fs.writeFileSync(outPath, png);
console.log(`✓ Icon generated: ${outPath} (${png.length} bytes)`);
