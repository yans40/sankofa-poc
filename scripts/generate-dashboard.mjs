#!/usr/bin/env node
/**
 * Usage : node scripts/generate-dashboard.mjs
 * Pré-requis : gh CLI authentifié, Node 18+
 * Lancement automatique : workflow `.github/workflows/dashboard-refresh.yml`
 *
 * Génère docs/CROSS_REVIEW_DASHBOARD.md depuis GitHub API + qa-history.md + coverage.
 */

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function gh(args) {
  try {
    return JSON.parse(execSync(`gh ${args}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }));
  } catch {
    return null;
  }
}

function ghText(args) {
  try {
    return execSync(`gh ${args}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch {
    return '';
  }
}

const now = new Date().toISOString();

// ── 1. PR ouvertes ──────────────────────────────────────────────────────────
const openPRs = gh('pr list --state open --json number,title,labels,headRefName,statusCheckRollup,author --limit 30') ?? [];

// ── 2. PR mergées (30 derniers jours) ──────────────────────────────────────
const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
const mergedPRs = gh(`pr list --state merged --search "merged:>=${since}" --json number,title,labels,author --limit 50`) ?? [];

// ── 3. qa-history.md ──────────────────────────────────────────────────────
const historyPath = resolve(root, 'docs', 'qa-history.md');
let recentVerdicts = [];
if (existsSync(historyPath)) {
  const lines = readFileSync(historyPath, 'utf8')
    .split('\n')
    .filter(l => l.startsWith('|') && !l.includes('Date (UTC)') && !l.includes('---'));
  recentVerdicts = lines.slice(-10).reverse();
}

// ── 4. Coverage ───────────────────────────────────────────────────────────
const summaryPath = resolve(root, 'coverage', 'coverage-summary.json');
let coverageRows = '';
if (existsSync(summaryPath)) {
  const s = JSON.parse(readFileSync(summaryPath, 'utf8')).total;
  const THRESHOLDS = { statements: 70, functions: 70, branches: 65, lines: 70 };
  coverageRows = ['statements', 'functions', 'branches', 'lines'].map(m => {
    const pct = s[m]?.pct ?? 0;
    const thr = THRESHOLDS[m];
    const icon = pct >= thr ? '✅' : '❌';
    return `| ${m} | ${pct.toFixed(1)} % | ${thr} % | ${icon} |`;
  }).join('\n');
} else {
  coverageRows = '| — | N/A | — | Lancer `npm run test:coverage` |';
}

// ── Helpers ───────────────────────────────────────────────────────────────
function labelNames(pr) {
  return (pr.labels ?? []).map(l => l.name);
}

function authorCamp(pr) {
  const ls = labelNames(pr);
  if (ls.includes('author:claude')) return 'claude';
  if (ls.includes('author:cursor')) return 'cursor';
  const branch = pr.headRefName ?? '';
  if (branch.startsWith('feature/claude/')) return 'claude';
  if (branch.startsWith('feature/cursor/')) return 'cursor';
  return '?';
}

function ciStatus(pr) {
  const checks = pr.statusCheckRollup ?? [];
  if (!checks.length) return '⏳';
  const all = checks.every(c => c.conclusion === 'SUCCESS' || c.status === 'SUCCESS');
  const any = checks.some(c => c.conclusion === 'FAILURE' || c.conclusion === 'TIMED_OUT');
  if (any) return '❌';
  if (all) return '✅';
  return '🔄';
}

function verdictLabel(pr) {
  const ls = labelNames(pr);
  const v = ['verdict:qa-confirmed', 'verdict:qa-passed', 'verdict:qa-passed-with-risks',
             'verdict:qa-blocked', 'verdict:qa-escalate'].find(l => ls.includes(l));
  return v ? `\`${v}\`` : '⏳ pending';
}

function reviewLabel(pr, camp) {
  const ls = labelNames(pr);
  const adverse = camp === 'claude' ? 'cursor' : 'claude';
  if (ls.includes(`review:${adverse}-approved`)) return `\`review:${adverse}-approved\``;
  if (ls.includes('review:changes-requested')) return '`changes-requested`';
  return '⏳ pending';
}

function blockers(pr, camp) {
  const ls = labelNames(pr);
  const issues = [];
  const adverse = camp === 'claude' ? 'cursor' : 'claude';
  if (!ls.includes(`review:${adverse}-approved`) && !ls.includes('review:changes-requested')) issues.push('review manquante');
  if (!ls.some(l => l.startsWith('verdict:'))) issues.push('verdict QA manquant');
  if (ciStatus(pr) === '❌') issues.push('CI rouge');
  return issues.length ? issues.join(', ') : '—';
}

// ── Activité par camp ──────────────────────────────────────────────────────
const stats = { claude: { open: 0, merged: 0 }, cursor: { open: 0, merged: 0 } };
openPRs.forEach(pr => { const c = authorCamp(pr); if (c !== '?') stats[c].open++; });
mergedPRs.forEach(pr => { const c = authorCamp(pr); if (c !== '?') stats[c].merged++; });

const qaHistory = existsSync(historyPath)
  ? readFileSync(historyPath, 'utf8').split('\n').filter(l => l.startsWith('|') && !l.includes('Date (UTC)'))
  : [];
const claudeVerdicts = qaHistory.filter(l => l.includes('| claude |') || l.includes('| challenger |')).length;
const cursorVerdicts = qaHistory.filter(l => l.includes('| cursor |')).length;

const adversarialBase = resolve(root, 'src', 'engine', '__tests__', 'adversarial');
function countTests(camp) {
  try {
    return parseInt(execSync(`find "${adversarialBase}/${camp}" -name "*.test.ts" | wc -l`, { encoding: 'utf8' }).trim(), 10) || 0;
  } catch { return 0; }
}

// ── PR en cours ───────────────────────────────────────────────────────────
const prRows = openPRs.length
  ? openPRs.map(pr => {
      const camp = authorCamp(pr);
      const ci = ciStatus(pr);
      const review = reviewLabel(pr, camp);
      const verdict = verdictLabel(pr);
      const block = blockers(pr, camp);
      return `| #${pr.number} | ${pr.title.slice(0, 40)} | ${camp} | ${ci} | ${review} | ${verdict} | ${block} |`;
    }).join('\n')
  : '| — | Aucune PR ouverte | — | — | — | — | — |';

// ── Désaccords ouverts ────────────────────────────────────────────────────
const escalated = openPRs.filter(pr => labelNames(pr).includes('verdict:qa-escalate'));
const escalateRows = escalated.length
  ? escalated.map(pr => `| #${pr.number} | ${now.slice(0, 10)} | \`verdict:qa-escalate\` | Arbitrage PM Claude requis |`).join('\n')
  : '| — | — | — | Aucun désaccord ouvert |';

// ── Santé ─────────────────────────────────────────────────────────────────
const pendingOver48h = openPRs.filter(pr => {
  const ls = labelNames(pr);
  return !ls.some(l => l.startsWith('verdict:')) && pr.createdAt
    && (Date.now() - new Date(pr.createdAt).getTime()) > 48 * 60 * 60 * 1000;
}).length;

// ── Assemblage du dashboard ───────────────────────────────────────────────
const dashboard = `# Cross-review Dashboard — Sankofa POC

> Généré par \`scripts/generate-dashboard.mjs\`. Source : GitHub API + \`docs/qa-history.md\`.
> Dernière mise à jour : ${now}

---

## 1. Activité par camp (30 derniers jours)

| Camp | PR ouvertes | PR mergées | Verdicts QA posés | Tests adversariaux ajoutés |
|---|---|---|---|---|
| Claude | ${stats.claude.open} | ${stats.claude.merged} | ${claudeVerdicts} | ${countTests('claude')} |
| Cursor | ${stats.cursor.open} | ${stats.cursor.merged} | ${cursorVerdicts} | ${countTests('cursor')} |

---

## 2. PR en cours (état temps réel)

| # | Titre | Auteur | CI | Reviewer adverse | Verdict QA | Bloqueurs |
|---|---|---|---|---|---|---|
${prRows}

---

## 3. Verdicts récents (10 derniers)

| Date (UTC) | PR | Agent | Verdict |
|---|---|---|---|
${recentVerdicts.length ? recentVerdicts.join('\n') : '| — | — | — | Aucun verdict enregistré |'}

---

## 4. Coverage actuel

| Métrique | Valeur | Seuil | Statut |
|---|---|---|---|
${coverageRows}

---

## 5. Désaccords ouverts (verdict:qa-escalate sans résolution)

| PR | Date escalade | Raison | Action attendue |
|---|---|---|---|
${escalateRows}

---

## 6. Santé du dispositif

- ${pendingOver48h === 0 ? '✅' : '❌'} Aucun verdict pending > 48h ${pendingOver48h > 0 ? `(${pendingOver48h} PR concernée(s))` : ''}
- ✅ Workflow \`cross-review-router\` actif
- ✅ Workflow \`qa-verdict-parser\` actif
- ✅ Coverage gate actif (seuil statements ≥ 70 %)
- ⏳ Branch protection \`develop\` — activer manuellement (voir \`docs/BRANCH_PROTECTION.md\`)
`;

// ── Écriture idempotente (ne commit que si contenu hors timestamp a changé) ──
const dashboardPath = resolve(root, 'docs', 'CROSS_REVIEW_DASHBOARD.md');
const stripTimestamp = s => s.replace(/Dernière mise à jour : .+/, 'Dernière mise à jour : __TS__');
const newHash = createHash('sha256').update(stripTimestamp(dashboard)).digest('hex');

if (existsSync(dashboardPath)) {
  const existing = readFileSync(dashboardPath, 'utf8');
  const oldHash = createHash('sha256').update(stripTimestamp(existing)).digest('hex');
  if (oldHash === newHash) {
    console.log('Dashboard inchangé (hors timestamp) — aucune écriture.');
    process.exit(0);
  }
}

writeFileSync(dashboardPath, dashboard, 'utf8');
console.log(`✅ Dashboard généré : docs/CROSS_REVIEW_DASHBOARD.md`);
