# esperado: t02_line_bessel
# Fase (-i)^k dos coeficientes trocada por (+i)^k.
from _lib import troca
troca('dae_cheb.c',
      "case 1:  W->ckre[k] = 0.0; W->ckim[k] = -m;   break;",
      "case 1:  W->ckre[k] = 0.0; W->ckim[k] = m;    break;")
