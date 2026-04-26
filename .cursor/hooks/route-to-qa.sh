#!/usr/bin/env bash
set -euo pipefail

input="$(cat)"
command_text="$(printf '%s' "$input" | python3 -c 'import json,sys; data=json.load(sys.stdin); print(data.get("command",""))' 2>/dev/null || true)"

if [[ "$command_text" =~ gh[[:space:]]+pr[[:space:]]+create ]]; then
  cat <<'JSON'
{
  "permission": "allow",
  "user_message": "Checklist QA: générer un plan de test (happy path, edge cases, régression), exécuter lint/test/build, puis publier le verdict QA dans la PR.",
  "agent_message": "Après création PR, ping l’agent Testeur pour produire plan + exécution + verdict."
}
JSON
  exit 0
fi

if [[ "$command_text" =~ git[[:space:]]+push ]]; then
  cat <<'JSON'
{
  "permission": "allow",
  "user_message": "Push détecté: pense à lancer la boucle QA (plan, exécution, verdict) avant merge.",
  "agent_message": "Déclenche le flux testeur si cette branche vise une PR active."
}
JSON
  exit 0
fi

echo '{"permission":"allow"}'
