#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Prueba de punta a punta contra el stack levantado con Docker Compose.
# Requisitos: bash, curl y python3. Uso:  ./scripts/prueba-e2e.sh
# Crea interesados de prueba con correos únicos (sufijo con la hora actual).
# ---------------------------------------------------------------------------
set -u
cd "$(dirname "$0")/.."
B="${BASE_URL:-http://localhost:${FRONTEND_PORT:-8080}}"
N8N="${N8N_URL:-http://localhost:${N8N_PORT:-5678}}"
envval() { grep "^$1=" .env 2>/dev/null | cut -d= -f2- | tr -d '\r'; }
EMAIL="$(envval ADMIN_EMAIL)"; EMAIL="${EMAIL:-admin@campuslands.com}"
PASS="${ADMIN_PASSWORD:-$(envval ADMIN_PASSWORD)}"; SEC="${N8N_WEBHOOK_SECRET:-$(envval N8N_WEBHOOK_SECRET)}"
if [ -z "$PASS" ]; then
  echo "Falta la contraseña del panel. Ejecuta así:  ADMIN_PASSWORD='<la del log>' ./scripts/prueba-e2e.sh"
  echo "(la ves con: docker compose logs backend | grep -A3 CONTRASE)"
  exit 2
fi
RUN="$(date +%s)"; BODY="$(mktemp)"; FAILS=0; TOTAL=0
trap 'rm -f "$BODY"' EXIT

ok() { TOTAL=$((TOTAL+1)); printf "  [OK] %s\n" "$1"; }
ko() { TOTAL=$((TOTAL+1)); FAILS=$((FAILS+1)); printf "  [FALLA] %s → %s\n" "$1" "$2"; }
chk() { [ "$2" = "$3" ] && ok "$1 ($3)" || ko "$1" "esperado $2, obtenido $3"; }
code() { curl -s -o "$BODY" -w "%{http_code}" "$@"; }
json() { python3 -c "import json,sys; d=json.load(open('$BODY')); print($1)"; }
post_lead() { code -X POST "$B/api/leads" -H 'Content-Type: application/json' -d "$1"; }

echo "1) Registro público (POST /api/leads)"
chk "Registro con teléfono" 201 "$(post_lead "{\"nombre\":\"Carlos Gómez\",\"correo\":\"carlos.$RUN@example.com\",\"telefono\":\"3159876543\",\"programaInteres\":\"LIFTOFF\"}")"
ID="$(json "d['id']")"
chk "Registro sin teléfono" 201 "$(post_lead "{\"nombre\":\"Diana Pérez\",\"correo\":\"diana.$RUN@example.com\",\"programaInteres\":\"NEBULA\"}")"
chk "Duplicado (mismo correo y programa) → 409" 409 "$(post_lead "{\"nombre\":\"Carlos Gómez\",\"correo\":\"CARLOS.$RUN@example.com\",\"programaInteres\":\"LIFTOFF\"}")"
chk "Datos inválidos → 400" 400 "$(post_lead '{"nombre":"","correo":"x@","programaInteres":"OTRO"}')"
python3 -c "import json; d=json.load(open('$BODY'))['fieldErrors']; assert {'nombre','correo','programaInteres'} <= set(d)" \
  && ok "El 400 detalla nombre, correo y programa" || ko "fieldErrors" "$(cat "$BODY")"

echo "2) Seguridad"
for u in /api/leads "/api/leads/$ID" "/api/leads/$ID/history" /api/dashboard/metrics; do chk "GET $u sin token → 401" 401 "$(code "$B$u")"; done
chk "Login con contraseña incorrecta → 401" 401 "$(code -X POST "$B/api/auth/login" -H 'Content-Type: application/json' -d "{\"correo\":\"$EMAIL\",\"password\":\"incorrecta-$RUN\"}")"
chk "Login correcto" 200 "$(code -X POST "$B/api/auth/login" -H 'Content-Type: application/json' -d "{\"correo\":\"$EMAIL\",\"password\":\"$PASS\"}")"
TOKEN="$(json "d.get('token','')" 2>/dev/null)"; H="Authorization: Bearer $TOKEN"

echo "3) Operaciones administrativas"
chk "Listar" 200 "$(code -H "$H" "$B/api/leads")"
chk "Buscar por correo" 200 "$(code -H "$H" "$B/api/leads?q=diana.$RUN")"
[ "$(json "d['totalElements']")" = 1 ] && ok "La búsqueda devuelve 1 resultado" || ko "búsqueda" "$(cat "$BODY")"
chk "Filtrar por estado y programa" 200 "$(code -H "$H" "$B/api/leads?estado=NUEVO&programa=LIFTOFF")"
chk "Detalle" 200 "$(code -H "$H" "$B/api/leads/$ID")"
chk "Detalle inexistente → 404" 404 "$(code -H "$H" "$B/api/leads/999999999")"
chk "Estado → CONTACTADO con nota" 200 "$(code -X PATCH -H "$H" -H 'Content-Type: application/json' "$B/api/leads/$ID/status" -d '{"estado":"CONTACTADO","nota":"Primera llamada"}')"
chk "Mismo estado → 422" 422 "$(code -X PATCH -H "$H" -H 'Content-Type: application/json' "$B/api/leads/$ID/status" -d '{"estado":"CONTACTADO"}')"
chk "Agregar nota" 201 "$(code -X POST -H "$H" -H 'Content-Type: application/json' "$B/api/leads/$ID/notes" -d '{"nota":"Pidió propuesta para 8 personas"}')"
chk "Nota vacía → 400" 400 "$(code -X POST -H "$H" -H 'Content-Type: application/json' "$B/api/leads/$ID/notes" -d '{"nota":"  "}')"
chk "Editar datos (PUT)" 200 "$(code -X PUT -H "$H" -H 'Content-Type: application/json' "$B/api/leads/$ID" -d "{\"nombre\":\"Carlos Andrés Gómez\",\"correo\":\"carlos.$RUN@example.com\",\"telefono\":\"+57 315 987 6543\",\"programaInteres\":\"ODYSSEY\"}")"
chk "Estado → INSCRITO" 200 "$(code -X PATCH -H "$H" -H 'Content-Type: application/json' "$B/api/leads/$ID/status" -d '{"estado":"INSCRITO","nota":"Pago confirmado"}')"
chk "Historial" 200 "$(code -H "$H" "$B/api/leads/$ID/history")"
python3 - "$BODY" <<'PY'
import json, sys
for s in json.load(open(sys.argv[1])):
    print(f"       {s['fecha'][:19]}  {s['tipo']:<13} {str(s['estadoAnterior'] or ''):>10} → {str(s['estadoNuevo'] or ''):<10} | {s['responsable']} | {(s['nota'] or '')[:60]}")
PY
chk "Métricas del dashboard" 200 "$(code -H "$H" "$B/api/dashboard/metrics")"
echo "       $(json "f\"total={d['total']} nuevos={d['nuevos']} contactados={d['contactados']} inscritos={d['inscritos']} conversión={d['tasaConversion']}%\"")"

echo "4) n8n"
chk "Webhook con secreto incorrecto → 401" 401 "$(code -X POST "$N8N/webhook/campuslands-nuevo-interesado" -H 'Content-Type: application/json' -H 'X-Webhook-Secret: incorrecto' -d '{"id":0}')"
c="$(code -X POST "$N8N/webhook/campuslands-nuevo-interesado" -H 'Content-Type: application/json' -H "X-Webhook-Secret: $SEC" \
  -d "{\"id\":0,\"nombre\":\"Prueba E2E\",\"correo\":\"prueba.$RUN@example.com\",\"programaNombre\":\"Booster (8 h · En vivo)\",\"fechaRegistroTexto\":\"$(date '+%d/%m/%Y %H:%M')\",\"panelUrl\":\"$B/admin/\"}")"
case "$c" in
  200) ok "Webhook con secreto correcto → Telegram enviado (200)";;
  502) ok "Webhook con secreto correcto → n8n OK, Telegram rechazó (502: revisa TELEGRAM_BOT_TOKEN/CHAT_ID)";;
  *)   ko "Webhook n8n" "HTTP $c";;
esac
echo "       respuesta de n8n: $(cat "$BODY")"
sleep 3
chk "Historial del lead incluye el resultado de n8n" 200 "$(code -H "$H" "$B/api/leads/$ID/history")"
grep -q 'Sistema · n8n' "$BODY" && ok "Nota «Sistema · n8n» registrada" || ko "Nota de n8n" "no aparece todavía"

echo "5) Frontend"
chk "Landing /" 200 "$(code "$B/")"
grep -q 'id="inscripcion"' "$BODY" && ok "La landing contiene el formulario #inscripcion" || ko "formulario" "no encontrado"
chk "Panel /admin/" 200 "$(code "$B/admin/")"
chk "Healthcheck /health" 200 "$(code "$B/health")"

echo
echo "Resultado: $((TOTAL-FAILS))/$TOTAL verificaciones correctas."
[ "$FAILS" -eq 0 ]
