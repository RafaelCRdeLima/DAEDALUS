# esperado: t92_microtubule
# A costura passa a fechar por modulo mesmo com pontas abertas.
from _lib import troca
troca('dae_graph.c',
      "        } else if (ms >= 0 && ms < np) {\n          st = dae_edges_push(E, j, ms * nq, p->j_perp);",
      "        } else if (1) {\n          st = dae_edges_push(E, j, (((ms % np) + np) % np) * nq, p->j_perp);")
