#!/bin/sh
# ---------------------------------------------------------------------------
# Arranque de PostgreSQL para Campuslands (Reto 4).
#
# La imagen oficial solo aplica POSTGRES_PASSWORD la PRIMERA vez (al crear el
# volumen). Si después cambias la contraseña en .env, el backend ya no podría
# conectarse. Este script arranca PostgreSQL con el entrypoint oficial y, en
# cuanto acepta conexiones, sincroniza la contraseña del usuario con la de .env
# (por el socket local, que no pide contraseña dentro del contenedor).
# ---------------------------------------------------------------------------

docker-entrypoint.sh postgres &
PG_PID=$!

# Al detener el contenedor, apagado rápido y ordenado de PostgreSQL.
trap 'kill -INT "$PG_PID" 2>/dev/null' INT TERM

(
  i=0
  while [ "$i" -lt 180 ]; do
    i=$((i + 1))
    sleep 1
    pg_isready -q -h /var/run/postgresql -U "$POSTGRES_USER" -d "$POSTGRES_DB" || continue
    if printf '%s\n' "ALTER ROLE :\"usr\" WITH PASSWORD :'pw';" |
       psql -q -h /var/run/postgresql -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
            -v ON_ERROR_STOP=1 -v usr="$POSTGRES_USER" -v pw="$POSTGRES_PASSWORD" >/dev/null 2>&1; then
      echo "[campuslands] Contraseña de «$POSTGRES_USER» sincronizada con POSTGRES_PASSWORD."
      exit 0
    fi
  done
  echo "[campuslands] AVISO: no se pudo sincronizar la contraseña de PostgreSQL."
) &

wait "$PG_PID"
STATUS=$?
wait "$PG_PID" 2>/dev/null
exit "$STATUS"
