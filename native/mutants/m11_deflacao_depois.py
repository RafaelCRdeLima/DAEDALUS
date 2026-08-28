# esperado: CEGO (coberto pelo par: ver m14)
# Some a deflacao DEPOIS das passadas de reortogonalizacao. Sozinha, e coberta
# pela deflacao de antes — o indicador nao mexe. O par das duas e m14.
from _lib import troca
troca('dae_metrics.c',
      "    { double c = 0.0;\n      for (i = 0; i < n; ++i) c += w[i];\n      c /= (double)n;\n      for (i = 0; i < n; ++i) w[i] -= c; }\n",
      "")
