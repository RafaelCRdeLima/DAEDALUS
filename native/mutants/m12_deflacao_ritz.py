# esperado: CEGO
# Some a deflacao do vetor de Ritz. Redundante com (A), (B) e (C) enquanto elas
# existem; o papel dela e converter resposta silenciosamente errada em resposta
# visivelmente errada QUANDO as outras falham. Nenhum indicador a pega sozinha,
# e este mutante existe para que essa cegueira apareca na tabela toda vez.
from _lib import troca
troca('dae_metrics.c',
      "      { double c = 0.0, xnp = 0.0, leak;       /* o vetor de Ritz VIVE em 1-perp */",
      "      if (0) { double c = 0.0, xnp = 0.0, leak;")
