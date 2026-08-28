#!/bin/sh
# Arnes de mutacao. Ver README.md deste diretorio.
set -u
AQUI=$(cd "$(dirname "$0")" && pwd)
RAIZ=$(cd "$AQUI/../.." && pwd)
BKP=$(mktemp -d)
cd "$RAIZ"

cp core/*.c core/*.h "$BKP/"
restaura() { cp "$BKP"/*.c "$BKP"/*.h core/; }
trap 'restaura; rm -rf "$BKP"; exit 130' INT TERM

printf '%-26s %-10s %s\n' MUTANTE VEREDITO "TESTES QUE MORDERAM"
printf '%s\n' "----------------------------------------------------------------------"

cegos=0
for m in "$AQUI"/m*.py; do
  nome=$(basename "$m" .py)
  esperado=$(sed -n 's/^# esperado: //p' "$m")
  restaura
  if ! (cd "$AQUI" && python3 "$m") 2>/dev/null; then
    printf '%-26s %-10s %s\n' "$nome" OBSOLETO "padrao sumiu do codigo: reescreva ou aposente"
    continue
  fi
  if ! make -C native -s all >/dev/null 2>&1; then
    printf '%-26s %-10s %s\n' "$nome" NAOCOMPILA "$esperado"
    continue
  fi
  morderam=""
  for b in native/build/bin/t*; do
    "$b" >/dev/null 2>&1 || morderam="$morderam $(basename "$b")"
  done
  if [ -n "$morderam" ]; then
    printf '%-26s %-10s %s\n' "$nome" COBERTO "$morderam"
  else
    printf '%-26s %-10s %s\n' "$nome" CEGO "esperado: $esperado"
    cegos=$((cegos + 1))
  fi
done

restaura
make -C native -s all >/dev/null 2>&1
rm -rf "$BKP"
printf '%s\n' "----------------------------------------------------------------------"
echo "mutantes cegos: $cegos  (os declarados 'esperado: CEGO' sao conhecidos e documentados)"
