// Genera favicon.ico (32x32 PNG-in-ICO) y favicon.svg con un diseño minimalista
// (chispa de fuego artificial en azul marino). Ejecutar desde la raíz del proyecto.
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const OUT = join(process.cwd(), 'public');

const SIZE = 32;
const NAVY = [15, 23, 42, 255];      // #0f172a
const GOLD = [255, 209, 102, 255];   // #ffd166
const TRANSPARENT = [0, 0, 0, 0];

function roundedCorner(x, y, radius) {
  const dx = x < radius ? radius - x : x > SIZE - 1 - radius ? x - (SIZE - 1 - radius) : 0;
  const dy = y < radius ? radius - y : y > SIZE - 1 - radius ? y - (SIZE - 1 - radius) : 0;
  return dx * dx + dy * dy <= radius * radius;
}

function pixel(x, y) {
  const cx = (SIZE - 1) / 2;
  const cy = (SIZE - 1) / 2;

  if (!roundedCorner(x, y, 7)) return TRANSPARENT;

  const dist = Math.abs(x - cx) + Math.abs(y - cy);
  // Chispa: diamante dorado con centro navy + puntas
  if (dist <= 9) {
    if (dist <= 3) return NAVY;
    return GOLD;
  }

  // Rayos de la chispa (N/S/E/O)
  const inRay =
    (Math.abs(y - cy) <= 1 && Math.abs(x - cx) === 10) ||
    (Math.abs(x - cx) <= 1 && Math.abs(y - cy) === 10) ||
    (Math.abs(x - cx) === 7 && Math.abs(y - cy) === 7);
  if (inRay) return GOLD;

  return NAVY;
}

function buildPixels() {
  const buf = Buffer.alloc(SIZE * (SIZE * 4 + 1));
  let p = 0;
  for (let y = 0; y < SIZE; y++) {
    buf[p++] = 0; // filter none
    for (let x = 0; x < SIZE; x++) {
      const [r, g, b, a] = pixel(x, y);
      buf[p++] = r;
      buf[p++] = g;
      buf[p++] = b;
      buf[p++] = a;
    }
  }
  return buf;
}

const CRC_TABLE = (() => {
  const table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let crc = 0xffffffff;
  for (const b of buf) crc = CRC_TABLE[(crc ^ b) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePng(raw) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(SIZE, 0);
  ihdr.writeUInt32BE(SIZE, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const idat = deflateSync(raw);
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function encodeIco(png) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  const entry = Buffer.alloc(16);
  entry[0] = SIZE === 256 ? 0 : SIZE;
  entry[1] = SIZE === 256 ? 0 : SIZE;
  entry[2] = 0;
  entry[3] = 0;
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(6 + 16, 12);
  return Buffer.concat([header, entry, png]);
}

const png = encodePng(buildPixels());
mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'favicon.ico'), encodeIco(png));
writeFileSync(
  join(OUT, 'favicon.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <rect x="4" y="4" width="56" height="56" rx="14" fill="#0f172a"/>
  <path d="M32 16 L40 28 L32 40 L24 28 Z" fill="#ffd166"/>
  <circle cx="32" cy="32" r="5" fill="#0f172a"/>
  <g stroke="#ffd166" stroke-width="3" stroke-linecap="round">
    <line x1="32" y1="8" x2="32" y2="20"/>
    <line x1="32" y1="44" x2="32" y2="56"/>
    <line x1="8" y1="32" x2="20" y2="32"/>
    <line x1="44" y1="32" x2="56" y2="32"/>
  </g>
</svg>`,
);
console.log('favicon.ico y favicon.svg generados en public/');