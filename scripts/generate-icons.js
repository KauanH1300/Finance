import fs from 'fs';
import zlib from 'zlib';
import path from 'path';

function createPngBuffer(width, height, getPixel) {
  // 8-byte PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk (13 bytes payload)
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // 8 bits per channel
  ihdr.writeUInt8(6, 9); // Color type 6: RGBA
  ihdr.writeUInt8(0, 10); // Compression method 0
  ihdr.writeUInt8(0, 11); // Filter method 0
  ihdr.writeUInt8(0, 12); // Interlace method 0

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Scanlines with filter byte 0 (None)
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;

  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // filter type 0
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(4 + 4 + length + 4);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crc = calculateCrc32(chunk.subarray(4, 8 + length));
  chunk.writeUInt32BE(crc >>> 0, 8 + length);
  return chunk;
}

// CRC32 implementation
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function calculateCrc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return crc ^ 0xffffffff;
}

// Emerald wallet icon color drawer
function iconPixelShader(x, y, width, height, isMaskable = false) {
  const cx = width / 2;
  const cy = height / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Background squircle / rounded rect or full bleed
  const radius = width * (isMaskable ? 0.5 : 0.42);
  
  // Background gradient: Slate-950 to Slate-900
  let bgR = 15;
  let bgG = 23;
  let bgB = 42;
  
  if (isMaskable) {
    // Fill full bleed
    bgR = Math.floor(15 + (y / height) * 10);
    bgG = Math.floor(23 + (y / height) * 10);
    bgB = Math.floor(42 + (x / width) * 10);
  } else {
    // Rounded corners
    const cornerR = width * 0.22;
    const innerX = Math.max(Math.abs(dx) - (cx - cornerR), 0);
    const innerY = Math.max(Math.abs(dy) - (cy - cornerR), 0);
    if (Math.sqrt(innerX * innerX + innerY * innerY) > cornerR) {
      return [0, 0, 0, 0]; // transparent
    }
  }

  // Draw wallet shape in center
  const scale = width / 512;
  const nx = x / scale;
  const ny = y / scale;

  // Emerald accent ring
  if (dist > width * 0.28 && dist < width * 0.36) {
    return [16, 185, 129, 255]; // emerald-500
  }

  // Wallet rectangle (center area: 130 to 380 X, 160 to 350 Y)
  if (nx >= 140 && nx <= 370 && ny >= 180 && ny <= 330) {
    // Wallet latch
    if (nx >= 310 && nx <= 370 && ny >= 230 && ny <= 280) {
      // Golden coin clasp
      if (nx >= 335 && nx <= 355 && ny >= 245 && ny <= 265) {
        return [245, 158, 11, 255]; // amber coin
      }
      return [51, 65, 85, 255]; // slate-700 clasp
    }
    // Emerald green card band
    if (ny >= 205 && ny <= 225) {
      return [52, 211, 153, 255]; // emerald-400
    }
    return [30, 41, 59, 255]; // slate-800 leather
  }

  // Upward growth arrow in center
  if (nx >= 180 && nx <= 280 && ny >= 240 && ny <= 300) {
    // Diagonal slope
    const lineY = 300 - (nx - 180) * 0.55;
    if (Math.abs(ny - lineY) < 14) {
      return [16, 185, 129, 255]; // emerald
    }
  }

  return [bgR, bgG, bgB, 255];
}

// Generate files
const outDir = path.resolve('public');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

console.log('Generating PWA icons...');

fs.writeFileSync(
  path.join(outDir, 'pwa-192x192.png'),
  createPngBuffer(192, 192, (x, y, w, h) => iconPixelShader(x, y, w, h, false))
);

fs.writeFileSync(
  path.join(outDir, 'pwa-512x512.png'),
  createPngBuffer(512, 512, (x, y, w, h) => iconPixelShader(x, y, w, h, false))
);

fs.writeFileSync(
  path.join(outDir, 'pwa-maskable-512x512.png'),
  createPngBuffer(512, 512, (x, y, w, h) => iconPixelShader(x, y, w, h, true))
);

fs.writeFileSync(
  path.join(outDir, 'apple-touch-icon.png'),
  createPngBuffer(180, 180, (x, y, w, h) => iconPixelShader(x, y, w, h, false))
);

console.log('All icons generated successfully!');
