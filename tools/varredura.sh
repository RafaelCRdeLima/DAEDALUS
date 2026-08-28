#!/bin/sh
# varredura.sh — a grade B da fase 2: 7 x 7, n = 63 000 por celula.
#
# Cada celula e um PROCESSO, e a paralelizacao e por celula e nao por
# trajetoria dentro de uma celula: assim cada acumulador e privado, a soma
# interna e serial e ordenada por indice, e o resultado nao depende do
# escalonador. Ver CONVENTIONS.md 11.6.
set -eu
cd "$(dirname "$0")/.."
N=${N:-63000}
BLOCOS=${BLOCOS:-16}
PAR=${PAR:-10}
SAIDA=${SAIDA:-resultados/varredura.csv}

{
  echo "#! daedalus $(./native/build/bin/daedalus 2>&1 | head -1 | awk '{print $2}')"
  echo "#! core_hash $(node tools/hash_core.mjs 2>/dev/null | tail -1)"
  echo "#! implementacao c"
  echo "#! conteudo varredura_fase2"
  echo "#! grade 7x7"
  echo "#! n_traj $N"
  echo "#! blocos $BLOCOS"
  echo "#! estimador wardle_kronberg"
  echo "# valor no n cheio; sd e o DESVIO DA MEDIA; vies e o residual estimado"
  echo "# cov e corr sao entre C_inter e ef NO MESMO conjunto de execucoes"
  echo "p,gamma,lambda2,Q,N,n_traj,blocos,c_inter,sd_c_inter,vies_c_inter,ef,sd_ef,vies_ef,cov,corr,lambda2_ok,segundos"
} > "$SAIDA"

ls specs/varredura/*.json | xargs -P "$PAR" -I{} \
  ./native/build/bin/sonda {} --celula --n "$N" --blocos "$BLOCOS" >> "$SAIDA"

echo "VARREDURA-PRONTA  $(grep -c '^0\|^[0-9]' "$SAIDA") linhas -> $SAIDA"
