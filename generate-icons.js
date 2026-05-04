'use strict';
const { PNG } = require('pngjs');
const fs = require('fs');

const PALETTE = [
  [0x11, 0x11, 0x11], // 0  background
  [0xe8, 0x5d, 0x04], // 1  orange (tee + shorts)
  [0xcc, 0xcc, 0xcc], // 2  light grey (clock face)
  [0x88, 0x88, 0x88], // 3  mid grey (clock details, sofa outline)
  [0x7c, 0x5c, 0x3a], // 4  brown (sofa body)
  [0xf4, 0xc6, 0x8c], // 5  skin
  [0xf0, 0xf0, 0xf0], // 6  white (sneakers)
  [0x2a, 0x2a, 0x2a], // 7  dark hair
];

function makePng(w, h) {
  const png = new PNG({ width: w, height: h });
  png.data.fill(0);
  return png;
}

function px(png, x, y, c) {
  if (x < 0 || x >= png.width || y < 0 || y >= png.height) return;
  const [r, g, b] = PALETTE[c];
  const i = (png.width * y + x) * 4;
  png.data[i] = r; png.data[i+1] = g; png.data[i+2] = b; png.data[i+3] = 255;
}

function rect(png, x, y, w, h, c) {
  for (let dy = 0; dy < h; dy++)
    for (let dx = 0; dx < w; dx++)
      px(png, x+dx, y+dy, c);
}

function drawArt(png) {
  const p = (x, y, c) => px(png, x, y, c);
  const r = (x, y, w, h, c) => rect(png, x, y, w, h, c);

  // Background
  r(0, 0, 32, 32, 0);

  // Clock (top-right, 8×8 rounded square, cols 23–30, rows 1–8)
  r(23, 1, 8, 8, 2);
  p(23, 1, 0); p(30, 1, 0);
  p(23, 8, 0); p(30, 8, 0);
  p(26, 2, 3);
  p(29, 4, 3);
  p(26, 7, 3);
  p(24, 4, 3);
  p(26, 4, 3); p(26, 3, 3);
  p(25, 4, 3); p(24, 3, 3);
  p(26, 5, 3);

  // Sofa (lower-left, cols 0–13, rows 20–29)
  r(0, 20, 14, 9, 4);
  r(0, 20, 14, 1, 3);
  r(0, 20, 1, 9, 3);
  r(13, 20, 1, 9, 3);
  r(2, 28, 2, 2, 3);
  r(10, 28, 2, 2, 3);
  r(6, 21, 1, 6, 3);

  // Runner (center, striding right, cols 13–24, rows 6–26)
  r(16, 6, 4, 2, 7);
  r(16, 8, 4, 3, 5);
  p(17, 11, 5); p(18, 11, 5);
  r(15, 12, 6, 4, 1);
  r(21, 12, 2, 3, 5);
  r(13, 13, 2, 3, 1);
  r(15, 16, 6, 3, 1);
  r(19, 19, 3, 5, 5);
  r(15, 19, 3, 4, 5);
  r(14, 23, 3, 2, 5);
  r(19, 24, 5, 2, 6);
  r(14, 25, 4, 2, 6);
}

function scaleNearest(src, dstW, dstH) {
  const dst = makePng(dstW, dstH);
  for (let y = 0; y < dstH; y++) {
    for (let x = 0; x < dstW; x++) {
      const sx = Math.floor(x * src.width / dstW);
      const sy = Math.floor(y * src.height / dstH);
      const si = (src.width * sy + sx) * 4;
      const di = (dstW * y + x) * 4;
      dst.data[di]   = src.data[si];
      dst.data[di+1] = src.data[si+1];
      dst.data[di+2] = src.data[si+2];
      dst.data[di+3] = src.data[si+3];
    }
  }
  return dst;
}

const master = makePng(32, 32);
drawArt(master);

fs.writeFileSync('favicon.png', PNG.sync.write(master));
console.log('favicon.png written (32×32)');

const large = scaleNearest(master, 180, 180);
fs.writeFileSync('apple-touch-icon.png', PNG.sync.write(large));
console.log('apple-touch-icon.png written (180×180)');
