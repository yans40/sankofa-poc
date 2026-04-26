#!/usr/bin/env bash
# Hook Cursor — bloque les opérations Git directes sur main/develop et
# impose le namespace de branche feature/cursor/* pour les agents Cursor.
# Voir docs/CROSS_REVIEW_CONVENTIONS.md.

set -euo pipefail

if ! command -v git >/dev/null 2>&1; then
  echo '{"permission":"allow"}'
  exit 0
fi

branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || true)"

if [[ -z "$branch" ]]; then
  echo '{"permission":"allow"}'
  exit 0
fi

# 1. Interdire les opérations sur les branches protégées
if [[ "$branch" == "main" || "$branch" == "master" || "$branch" == "develop" ]]; then
  cat <<'JSON'
{
  "permission": "deny",
  "user_message": "Travail bloqué : pas d'opération Git directe sur main/master/develop. Crée une branche feature/cursor/<slug> avant de continuer.",
  "agent_message": "Switch vers une branche feature/cursor/<slug> puis relance la commande."
}
JSON
  exit 0
fi

# 2. Imposer le namespace feature/cursor/* (les feature/claude/* sont rejetées côté Cursor)
if [[ "$branch" =~ ^feature/claude/ ]]; then
  cat <<'JSON'
{
  "permission": "deny",
  "user_message": "Branche feature/claude/* détectée — réservée à l'agent Claude. Cursor doit travailler sur feature/cursor/<slug>.",
  "agent_message": "Crée une nouvelle branche feature/cursor/<slug> ou bascule sur la PR Claude pour la review uniquement."
}
JSON
  exit 0
fi

# 3. Recommander le namespace si la branche est en feature/* hors convention
if [[ "$branch" =~ ^feature/ && ! "$branch" =~ ^feature/cursor/ && ! "$branch" =~ ^feature/claude/ ]]; then
  cat <<JSON
{
  "permission": "ask",
  "user_message": "Branche '$branch' hors convention. Format attendu : feature/cursor/<slug>. Continuer quand même ?",
  "agent_message": "Recommandation : renommer la branche en feature/cursor/<slug> via 'git branch -m feature/cursor/<slug>'."
}
JSON
  exit 0
fi

echo '{"permission":"allow"}'
