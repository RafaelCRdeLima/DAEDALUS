# esperado: t04_complete
# Lanczos ENCOLHE o intervalo espectral em vez de inflar: espectro sai de [-1,1].
from _lib import troca
troca('dae_cheb.c',
      "const double half = 0.5 * (lhi - llo) * 1.05",
      "const double half = 0.5 * (lhi - llo) * 0.80")
