# esperado: t94_metrics
# Bandeira de convergencia sempre verdadeira.
from _lib import troca
troca('dae_metrics.c',
      "        out->lambda2_converged = (res < tol * normL) ? 1 : 0;",
      "        out->lambda2_converged = (res < tol * normL) ? 1 : 1;")
