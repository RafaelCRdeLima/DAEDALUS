# esperado: t01_norm  (envoltoria da deriva em alpha)
# O teto K ~ 1.2 alpha + 20 volta a ser criterio, em vez de chute inicial.
from _lib import troca
troca('dae_cheb.c',
      "    if (fabs(2.0 * W->jbuf[K]) < DAE_CHEB_TAIL) break;\n    K += (K / 4) + 8;",
      "    break;")
