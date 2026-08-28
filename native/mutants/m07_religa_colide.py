# esperado: t93_connectivity
# Religacao aceita cair sobre aresta existente: a dedup da CSR come a aresta e
# |E| encolhe em silencio.
from _lib import troca
troca('dae_graph.c',
      "      if (dae_eset_has(&S, k)) continue;",
      "      if (0 && dae_eset_has(&S, k)) continue;")
