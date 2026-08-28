# esperado: t91_conventions
# Aresta duplicada soma o peso em vez de ser descartada.
from _lib import troca
troca('dae_csr.c',
      "      if (p > beg && A->colind[p] == A->colind[p - 1]) { ++dropped; continue; }",
      "      if (p > beg && A->colind[p] == A->colind[p - 1]) { A->val[out - 1] += A->val[p]; ++dropped; continue; }")
