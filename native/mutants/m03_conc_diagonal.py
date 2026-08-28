# esperado: t91_conventions
# Bloco diagonal da concurrence com o termo espurio i == j.
from _lib import troca
troca('dae_obs.c',
      "? (O->l1mod[m] * O->l1mod[m] - O->pmod[m])",
      "? (O->l1mod[m] * O->l1mod[m])")
