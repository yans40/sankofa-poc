#!/usr/bin/env bash
# Hook Claude — bloque les opérations Git directes sur main/develop et
# impose le namespace de branche feature/claude/* pour les agents Claude.
# Voir docs/CROSS_REVIEW_CONVENTIONS.md.

set -euo pipefail

if ! command -v git >/dev/null 2>&1; then
  exit 0
fi

branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || true)"

if [[ -z "$branch" || "$branch" == "HEAD" ]]; then
  exit 0
fi

# 1. Interdire les opérations sur les branches protégées
if [[ "$branch" == "main" || "$branch" == "master" || "$branch" == "develop" ]]; then
  echo "❌ Travail bloqué : pas d'opération Git directe sur main/master/develop." >&2
  echo "   Crée une branche feature/claude/<slug> avant de continuer." >&2
  exit 1
fi

# 2. Rejeter les branches Cursor (réservées à l'autre camp)
if [[ "$branch" =~ ^feature/cursor/ ]]; then
  echo "❌ Cette branche appartient au camp Cursor." >&2
  echo "   Claude doit travailler sur feature/claude/<slug>." >&2
  exit 1
fi

# 3. Imposer le namespace feature/claude/<slug> (kebab-case)
if [[ ! "$branch" =~ ^feature/claude/[a-z0-9][a-z0-9-]*$ ]]; then
  echo "❌ Format de branche invalide : '$branch'" >&2
  echo "   Attendu : feature/claude/<slug>  (slug = lettres minuscules, chiffres, tirets)" >&2
  exit 1
fi

# OK — silencieux sur succès
exit 0
