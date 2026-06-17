#!/usr/bin/env node
// Runs the unicorn.js test suite against a built dist/unicorn.js.
//
//   npm test                          # uses ./dist/unicorn.js
//   node tests/main.js                # same
//   node tests/main.js path/to/unicorn.js
//
// Each test is a standalone Node script that exits 0 on PASS, non-zero on FAIL.
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const dist = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, '..', 'dist', 'unicorn.js');

if (!fs.existsSync(dist)) {
  console.error(`dist not found: ${dist}`);
  console.error('Build it first:  python3 build.py   (or: npm run build)');
  process.exit(2);
}

const TESTS = ['test_arch_arm.js', 'test_arch_x86.js', 'test_hooks.js', 'test_helpers.js'];
const results = [];

for (const t of TESTS) {
  console.log(`\n===== ${t} =====`);
  const r = spawnSync(process.execPath, [path.join(__dirname, t), dist], { stdio: 'inherit' });
  results.push([t, r.status === 0]);
}

console.log(`\n===== SUMMARY (${dist}) =====`);
let failures = 0;
for (const [t, ok] of results) {
  if (!ok) failures++;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${t}`);
}
console.log(failures === 0 ? '\nALL TESTS PASSED' : `\n${failures} TEST(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
