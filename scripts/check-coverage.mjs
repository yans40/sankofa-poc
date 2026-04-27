#!/usr/bin/env node
/**
 * Coverage gate — lit coverage/coverage-summary.json et valide les seuils.
 * Générer d'abord le rapport : npm run test:coverage
 * Usage : node scripts/check-coverage.mjs
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const summaryPath = resolve(__dirname, '..', 'coverage', 'coverage-summary.json');

const THRESHOLDS = {
  statements: 70,
  functions: 70,
  branches: 65,
  lines: 70,
};

if (!existsSync(summaryPath)) {
  console.error('❌  coverage/coverage-summary.json introuvable.');
  console.error('    Exécuter d\'abord : npm run test:coverage');
  process.exit(1);
}

const summary = JSON.parse(readFileSync(summaryPath, 'utf8'));
const total = summary.total;

if (!total) {
  console.error('❌  Format inattendu dans coverage-summary.json (clé "total" manquante).');
  process.exit(1);
}

const metrics = ['statements', 'functions', 'branches', 'lines'];

console.log('\n📊  Coverage Gate — Sankofa POC\n');
console.log('Métrique     │ Couverture │  Seuil  │ Statut');
console.log('─────────────┼────────────┼─────────┼───────');

const failures = [];

for (const m of metrics) {
  const pct = total[m]?.pct ?? 0;
  const threshold = THRESHOLDS[m];
  const pass = pct >= threshold;
  const status = pass ? '✅ PASS' : '❌ FAIL';
  const pctStr = `${pct.toFixed(1)} %`.padStart(9);
  const thrStr = `${threshold} %`.padStart(6);
  console.log(`${m.padEnd(12)} │ ${pctStr}  │  ${thrStr} │ ${status}`);
  if (!pass) failures.push(`${m} (${pct.toFixed(1)} % < ${threshold} %)`);
}

console.log('');

if (failures.length > 0) {
  console.error(`❌  Coverage gate FAILED : ${failures.join(', ')}\n`);
  process.exit(1);
}

console.log('✅  Coverage gate PASSED\n');
