#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Carga DATOS FICTICIOS para la demo, usando la API real (como un usuario más):
#   - 6 interesados ficticios (correos @example.com, dominio reservado para ejemplos).
#     Cada registro pasa por el flujo completo: PostgreSQL → n8n → Telegram.
#   - Una segunda cuenta de administrador («Coordinación de admisiones»).
#   - Seguimiento hecho por las DOS personas: notas y cambios de estado, para ver en
#     el historial cómo un administrador retoma el trabajo del otro.
#
# Requisitos: el stack levantado (docker compose up -d), bash, curl y python3.
# Uso:
#   ADMIN_PASSWORD='<contraseña del panel>' ./scripts/cargar-datos-demo.sh
#   (si ADMIN_PASSWORD está en .env, basta con ./scripts/cargar-datos-demo.sh)
# Opcional: SEGUNDO_ADMIN_PASSWORD='<clave>' para elegir la de la segunda cuenta.
# Las contraseñas solo se muestran en la consola; no se guardan en ningún archivo.
# ---------------------------------------------------------------------------
set -u
cd "$(dirname "$0")/.."
B="${BASE_URL:-http://localhost:${FRONTEND_PORT:-8080}}"
envval() { grep "^$1=" .env 2>/dev/null | cut -d= -f2- | tr -d '\r'; }
ADMIN_EMAIL="${ADMIN_EMAIL:-$(envval ADMIN_EMAIL)}"; ADMIN_EMAIL="${ADMIN_EMAIL:-admin@campuslands.com}"
PASS="${ADMIN_PASSWORD:-$(envval ADMIN_PASSWORD)}"
ADMIN2_EMAIL="coordinacion@example.com"
ADMIN2_PASS="${SEGUNDO_ADMIN_PASSWORD:-Demo-$(head -c 6 /dev/urandom | od -An -tx1 | tr -d ' \n')}"

if [ -z "$PASS" ]; then
  echo "Falta la contraseña del panel. Ejecuta:  ADMIN_PASSWORD='<la del log>' ./scripts/cargar-datos-demo.sh"
  echo "(la ves con: docker compose logs backend | grep -A3 CONTRASE)"
  exit 2
fi
command -v python3 >/dev/null || { echo "Se necesita python3"; exit 2; }

j() { python3 -c "import json,sys; d=json.load(sys.stdin); print($1)"; }
login() { curl -s -X POST "$B/api/auth/login" -H 'Content-Type: application/json' \
  -d "$(python3 -c 'import json,sys; print(json.dumps({"correo":sys.argv[1],"password":sys.argv[2]}))' "$1" "$2")" | j "d.get('token','')"; }

echo "1) Registro de interesados ficticios (formulario público)"
declare -A ID
registrar() { # clave nombre correo telefono programa
  local body r id
  body=$(python3 -c 'import json,sys; a=sys.argv; print(json.dumps({"nombre":a[1],"correo":a[2],"telefono":a[3] or None,"programaInteres":a[4]}))' "$2" "$3" "$4" "$5")
  r=$(curl -s -w '\n%{http_code}' -X POST "$B/api/leads" -H 'Content-Type: application/json' -d "$body")
  if [ "$(tail -1 <<<"$r")" = 201 ]; then
    id=$(head -1 <<<"$r" | j "d['id']"); echo "   #$id  $2 · $5"
  else
    id=""; echo "   (ya existía) $2 · $5"
  fi
  ID[$1]="$id"
  sleep 1 # da tiempo a que cada aviso de Telegram llegue en orden
}
registrar mariana "Mariana Ortiz Vega"     "mariana.ortiz@example.com"     "+57 300 000 0101" BOOSTER
registrar andres  "Andrés Felipe Rueda"    "andres.rueda@example.com"      "+57 300 000 0102" LIFTOFF
registrar camila  "Camila Duarte Pinto"    "camila.duarte@example.com"     ""                 NEBULA
registrar jorge   "Jorge Iván Castaño"     "jorge.castano@example.com"     "+57 300 000 0104" ODYSSEY
registrar valeria "Valeria Montes Ríos"    "valeria.montes@example.com"    "+57 300 000 0105" IGNITION
registrar tomas   "Tomás Herrera Lozano"   "tomas.herrera@example.com"     "+57 300 000 0106" BOOSTER

T1=$(login "$ADMIN_EMAIL" "$PASS")
[ -n "$T1" ] || { echo "No se pudo iniciar sesión como $ADMIN_EMAIL. Revisa ADMIN_PASSWORD."; exit 1; }
H1="Authorization: Bearer $T1"

# Si un registro ya existía, se busca su id por correo.
for k in mariana andres camila jorge valeria tomas; do
  if [ -z "${ID[$k]}" ]; then
    ID[$k]=$(curl -s -H "$H1" "$B/api/leads?q=$k" | j "d['content'][0]['id'] if d['content'] else ''")
  fi
done

estado() { # token id estado nota
  curl -s -o /dev/null -X PATCH -H "Authorization: Bearer $1" -H 'Content-Type: application/json' "$B/api/leads/$2/status" \
    -d "$(python3 -c 'import json,sys; print(json.dumps({"estado":sys.argv[1],"nota":sys.argv[2] or None}))' "$3" "$4")"
}
nota() { # token id nota
  curl -s -o /dev/null -X POST -H "Authorization: Bearer $1" -H 'Content-Type: application/json' "$B/api/leads/$2/notes" \
    -d "$(python3 -c 'import json,sys; print(json.dumps({"nota":sys.argv[1]}))' "$3")"
}

echo "2) Seguimiento del administrador principal ($ADMIN_EMAIL)"
estado "$T1" "${ID[mariana]}" CONTACTADO "Llamada de 10 min. Lidera un equipo comercial de 6 personas; quiere Booster en enero."
nota   "$T1" "${ID[mariana]}" "Pendiente: enviar propuesta con fechas de enero y precio por persona."
estado "$T1" "${ID[andres]}"  CONTACTADO "Respondió por WhatsApp. Le interesa automatizar cotizaciones con Make."
estado "$T1" "${ID[jorge]}"   CONTACTADO "Gerente de operaciones. Pide diagnóstico para 3 áreas antes de decidir."
estado "$T1" "${ID[jorge]}"   INTERESADO "Agendada reunión de diagnóstico Odyssey para el martes 10 a. m."
estado "$T1" "${ID[valeria]}" DESCARTADO "Ya tomó un curso similar este año. Volver a contactar en 6 meses."
echo "   listo"

echo "3) Segunda cuenta de administrador"
code=$(curl -s -o /dev/null -w '%{http_code}' -X POST -H "$H1" -H 'Content-Type: application/json' "$B/api/admins" \
  -d "$(python3 -c 'import json,sys; print(json.dumps({"nombre":"Coordinación de admisiones","correo":sys.argv[1],"password":sys.argv[2]}))' "$ADMIN2_EMAIL" "$ADMIN2_PASS")")
if [ "$code" = 201 ]; then
  echo "   Creada: $ADMIN2_EMAIL  ·  contraseña: $ADMIN2_PASS   (guárdala fuera de los archivos compartidos)"
elif [ "$code" = 409 ]; then
  echo "   Ya existía $ADMIN2_EMAIL. Para continuar con ella, ejecuta con SEGUNDO_ADMIN_PASSWORD='<su clave>'."
fi

T2=$(login "$ADMIN2_EMAIL" "$ADMIN2_PASS")
if [ -n "$T2" ]; then
  echo "4) La segunda persona retoma los casos"
  nota   "$T2" "${ID[mariana]}" "Retomo el caso. Envié la propuesta de Booster para enero por correo."
  estado "$T2" "${ID[mariana]}" INTERESADO "Confirmó que la revisa con su gerente esta semana."
  estado "$T2" "${ID[andres]}"  INTERESADO "Le compartí el temario de Liftoff y un ejemplo de flujo en Make."
  estado "$T2" "${ID[andres]}"  INSCRITO   "Pago confirmado. Cohorte de febrero."
  echo "   listo"
else
  echo "4) (omitido) no se pudo iniciar sesión con la segunda cuenta"
fi

echo
echo "Datos de demo cargados. Abre $B/admin/ y revisa, por ejemplo, el historial de Mariana Ortiz Vega (#${ID[mariana]})."
echo "Camila Duarte y Tomás Herrera quedan en estado NUEVO para que el evaluador haga el seguimiento."
