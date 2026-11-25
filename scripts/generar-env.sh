#!/usr/bin/env bash
# Crea .env a partir de .env.example con secretos aleatorios.
# No sobrescribe un .env existente. Telegram se completa a mano (ver README).
set -euo pipefail
cd "$(dirname "$0")/.."

if [ -f .env ]; then
  echo "Ya existe .env: no se modifica. Bórralo si quieres generarlo de nuevo."
  exit 0
fi

rnd() { # $1 = bytes
  if command -v openssl >/dev/null 2>&1; then openssl rand -hex "$1"
  else head -c "$1" /dev/urandom | od -An -tx1 | tr -d ' \n'; fi
}

ADMIN_PASS="AiA-$(rnd 6)"
sed -e "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$(rnd 18)|" \
    -e "s|^JWT_SECRET=.*|JWT_SECRET=$(rnd 32)|" \
    -e "s|^ADMIN_PASSWORD=.*|ADMIN_PASSWORD=${ADMIN_PASS}|" \
    -e "s|^N8N_WEBHOOK_SECRET=.*|N8N_WEBHOOK_SECRET=$(rnd 24)|" \
    .env.example > .env
chmod 600 .env

echo ".env creado."
echo "  Panel:      http://localhost:8080/admin/"
echo "  Usuario:    $(grep '^ADMIN_EMAIL=' .env | cut -d= -f2)"
echo "  Contraseña: ${ADMIN_PASS}"
echo "Completa TELEGRAM_BOT_TOKEN y TELEGRAM_CHAT_ID en .env para recibir los avisos."
