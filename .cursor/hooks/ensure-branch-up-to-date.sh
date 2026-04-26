#!/usr/bin/env bash
set -euo pipefail

if ! command -v git >/dev/null 2>&1; then
  echo '{"permission":"allow"}'
  exit 0
fi

branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || true)"

if [[ -z "$branch" || "$branch" == "HEAD" ]]; then
  echo '{"permission":"allow"}'
  exit 0
fi

base_branch="develop"
if ! git show-ref --verify --quiet "refs/heads/${base_branch}" && ! git show-ref --verify --quiet "refs/remotes/origin/${base_branch}"; then
  base_branch="main"
fi

if ! git fetch origin "${base_branch}" --quiet 2>/dev/null; then
  echo '{"permission":"allow"}'
  exit 0
fi

behind_count="$(git rev-list --count "${branch}..origin/${base_branch}" 2>/dev/null || echo 0)"

if [[ "${behind_count}" =~ ^[0-9]+$ ]] && [[ "${behind_count}" -gt 0 ]]; then
  cat <<JSON
{
  "permission": "ask",
  "user_message": "Ta branche est en retard de ${behind_count} commit(s) sur origin/${base_branch}. Rebase/sync recommandé avant push/PR.",
  "agent_message": "Exécute git fetch origin ${base_branch} puis git rebase origin/${base_branch} (ou merge) avant de continuer."
}
JSON
  exit 0
fi

echo '{"permission":"allow"}'
