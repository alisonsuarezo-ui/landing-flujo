#!/bin/sh
# ---------------------------------------------------------------------------
# Arranque de n8n para Campuslands (Reto 4).
# 1. Resuelve la clave de cifrado sin bloquear el arranque.
# 2. Importa el workflow versionado en /workflows (n8n/workflows del repositorio).
# 3. Lo publica/activa, para que el webhook de producción quede escuchando.
# 4. Arranca n8n con el entrypoint oficial de la imagen.
# Desactiva los pasos 2 y 3 con N8N_AUTO_IMPORT=false si prefieres la interfaz.
# ---------------------------------------------------------------------------
set -e

WORKFLOW_ID="CampusLeadsTg001"
CONFIG_FILE="/home/node/.n8n/config"

# Sin N8N_ENCRYPTION_KEY, n8n genera una clave y la guarda en su volumen.
# Si ya hay una guardada y la del .env es distinta, n8n se negaría a arrancar
# («Mismatching encryption keys»): en ese caso se conserva la guardada.
if [ -z "${N8N_ENCRYPTION_KEY:-}" ]; then
  unset N8N_ENCRYPTION_KEY
elif [ -f "$CONFIG_FILE" ]; then
  GUARDADA=$(sed -n 's/.*"encryptionKey"[^"]*"\([^"]*\)".*/\1/p' "$CONFIG_FILE")
  if [ -n "$GUARDADA" ] && [ "$GUARDADA" != "$N8N_ENCRYPTION_KEY" ]; then
    echo "[campuslands] AVISO: N8N_ENCRYPTION_KEY no coincide con la clave guardada en el volumen de n8n; se usa la guardada."
    unset N8N_ENCRYPTION_KEY
  fi
fi

if [ "${N8N_AUTO_IMPORT:-true}" = "true" ]; then
  for f in /workflows/*.json; do
    [ -f "$f" ] || continue
    echo "[campuslands] Importando workflow: $f"
    n8n import:workflow --input="$f"
  done
  node /opt/campuslands/publicar-workflow.cjs "$WORKFLOW_ID" || true
fi

if [ -z "${TELEGRAM_BOT_TOKEN:-}" ] || [ -z "${TELEGRAM_CHAT_ID:-}" ]; then
  echo "[campuslands] AVISO: TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID vacíos. n8n recibirá los registros, pero Telegram los rechazará hasta configurarlos en .env."
fi

exec /docker-entrypoint.sh
