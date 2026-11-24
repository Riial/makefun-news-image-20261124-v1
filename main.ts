// news-image-20261124 v1 — "The World in One Day", Tuesday 24 November 2026.
//
// A newspaper front page summing up the world's news of Tuesday 24
// November 2026 in one image: 35 verified stories across 9 regions and
// 16 fields, with a giant date masthead, a six-number stats strip, a
// colour-coded region bar, a UTC timeline, 3 illustrated heroes, numbered
// text grid cards (no photos in the grid), a 22-story ALSO list, a DATE
// CHECK naming the prior-day stories deliberately left out, and a HOW WE
// CHECKED footer. Dense text is typeset HTML, never drawn by an image
// model; the three hero illustrations are AI-generated photographs.
//
// Node 24, standard library only. The entry image sits beside this file as
// entry.png (1024x1024 PNG, under 1 MiB). The program validates it — PNG
// signature, IHDR dimensions, byte size, SHA-256 — then copies it
// byte-for-byte to $MAKEFUN_OUTPUT_DIR (or /output). It reads nothing else,
// makes no network calls, and holds no secrets, so repeated runs are
// byte-identical.

import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const HERE = dirname(fileURLToPath(import.meta.url));
const IMAGE_PATH = join(HERE, 'entry.png');

// SHA-256 of the final v1 entry.png (1024x1024, 460,457 bytes).
// Fix: story 6 headline + stats strip say "22-month high" (best since Jan
// 2025 = 22 months), matching the body text and Reuters/Conference Board.
const EXPECTED_SHA256 =
  '1946eb3f585fa36157525d1c8309dfc018270f19d1a1e2b15562372395fcd8ea';
const EXPECTED_BYTES = 460457;
const ONE_MIB = 1_048_576;

const bytes = readFileSync(IMAGE_PATH);

if (bytes.subarray(1, 4).toString('ascii') !== 'PNG') {
  throw new Error('entry.png is not a PNG file');
}
const width = bytes.readUInt32BE(16);
const height = bytes.readUInt32BE(20);
if (width !== 1024 || height !== 1024) {
  throw new Error(`entry.png is ${width}x${height}, expected 1024x1024`);
}
if (bytes.length > ONE_MIB) {
  throw new Error(`entry.png is ${bytes.length} bytes, over the 1 MiB limit`);
}
if (bytes.length !== EXPECTED_BYTES) {
  throw new Error(`entry.png is ${bytes.length} bytes, expected ${EXPECTED_BYTES}`);
}
const digest = createHash('sha256').update(bytes).digest('hex');
if (digest !== EXPECTED_SHA256) {
  throw new Error(`entry.png sha256 mismatch: got ${digest}`);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
const outPath = join(OUTPUT_DIR, 'entry.png');
writeFileSync(outPath, bytes);
// Read the copy back and confirm it is the same validated image, so a
// partial or failed write can never pass silently as a success.
const written = readFileSync(outPath);
const writtenDigest = createHash('sha256').update(written).digest('hex');
if (writtenDigest !== EXPECTED_SHA256) {
  throw new Error(`written entry.png sha256 mismatch: got ${writtenDigest}`);
}
console.log(`entry.png verified (${bytes.length} bytes, sha256 ${digest.slice(0, 12)}…)`);
