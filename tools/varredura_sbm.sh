#!/bin/sh
# varredura_sbm.sh — o CONTROLE: mesma grade de gamma, Q casado ao microtubulo,
# geometria nenhuma. Ver docs/pre-analise-fisica.md 5.6 e a ressalva dos dois
# confundimentos: |E| e lambda2 nao podem ser casados ao mesmo tempo que Q.
set -eu
cd "$(dirname "$0")/.."
N=${N:-63000}; BLOCOS=${BLOCOS:-16}; PAR=${PAR:-10}
SAIDA=${SAIDA:-resultados/varredura-sbm.csv}
{
  echo "#! core_hash $(node tools/hash_core.mjs 2>/dev/null | tail -1)"
  echo "#! implementacao c"
  echo "#! conteudo varredura_fase2_CONTROLE_SBM"
  echo "#! n_traj $N"
  echo "#! blocos $BLOCOS"
  echo "#! estimador wardle_kronberg"
  echo "# CONTROLE: Q casado ao microtubulo linha a linha; |E| ~ 2000 (grau 7.7),"
  echo "# que e o minimo em que o SBM CONECTA. Com |E| = 1024 do microtubulo ele"
  echo "# tem 8 a 13 componentes. Os dois confundimentos estao declarados."
  echo "p,gamma,lambda2,Q,N,n_traj,blocos,c_inter,sd_c_inter,vies_c_inter,ef,sd_ef,vies_ef,cov,corr,lambda2_ok,segundos"
} > "$SAIDA"
ls specs/varredura-sbm/*.json | xargs -P "$PAR" -I{} \
  ./native/build/bin/sonda {} --celula --n "$N" --blocos "$BLOCOS" >> "$SAIDA"
echo "SBM-PRONTA"
