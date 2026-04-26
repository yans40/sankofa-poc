#!/usr/bin/env bash
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

if [[ "$branch" == "main" || "$branch" == "master" || "$branch" == "develop" ]]; then
  cat <<'JSON'
{
  "permission": "deny",
  "user_message": "Travail bloqué: évite de faire des opérations Git directes sur main/master/develop. Crée une branche feature/* avant de continuer.",
  "agent_message": "Switch vers une branche feature/* puis relance la commande."
}
JSON
  exit 0
fi

echo '{"permission":"allow"}'
