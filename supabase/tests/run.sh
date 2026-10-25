#!/usr/bin/env bash
# Crea una base de datos desechable, emula Supabase, aplica las migraciones en orden
# y ejecuta las pruebas SQL. Sale con error si algo falla.
#
# Uso:   supabase/tests/run.sh
# Config (variables de entorno de psql): PGHOST, PGPORT, PGUSER (superusuario), PGPASSWORD.
# La base `math_arcade_test` se BORRA y se vuelve a crear en cada ejecución.
set -euo pipefail
cd "$(dirname "$0")/.."

DB="${TEST_DB:-math_arcade_test}"
psql -v ON_ERROR_STOP=1 -q -d postgres -c "drop database if exists ${DB} with (force)" -c "create database ${DB}"
export PGDATABASE="$DB"

# Las migraciones corren en silencio (solo avisos); en las pruebas se descarta la salida
# de cada `select t.…` y quedan visibles los avisos de fallo y el resumen (stderr).
run() { PGOPTIONS='-c client_min_messages=warning' psql -v ON_ERROR_STOP=1 -q --no-psqlrc -f "$1"; }
run_test() { PGOPTIONS='-c client_min_messages=notice' psql -v ON_ERROR_STOP=1 -q --no-psqlrc -o /dev/null -f "$1"; }

echo "→ bootstrap (emulación de Supabase)"
run tests/bootstrap.sql
for f in migrations/*.sql; do
  echo "→ $f"
  run "$f"
done
run tests/helpers.sql
for f in tests/*.test.sql; do
  echo "→ $f"
  run_test "$f"
done

# Actualización desde v1: esquema original + datos de v1, luego las migraciones nuevas.
echo "→ actualización desde v1"
UPGRADE_DB="${DB}_upgrade"
psql -v ON_ERROR_STOP=1 -q -d postgres -c "drop database if exists ${UPGRADE_DB} with (force)" -c "create database ${UPGRADE_DB}"
export PGDATABASE="$UPGRADE_DB"
run tests/bootstrap.sql
baseline=(migrations/*.sql)
run "${baseline[0]}"
run tests/upgrade_seed.sql
for f in "${baseline[@]:1}"; do run "$f"; done
run tests/helpers.sql
run_test tests/upgrade.check.sql

echo "✓ Migraciones y pruebas SQL correctas"
