# esperado: t94_metrics  (vazamento da direcao constante)
# Remove as DUAS deflacoes da reortogonalizacao ao mesmo tempo. Cada uma
# sozinha e coberta pela outra (ver m10 e m11); e o par que sustenta o
# indicador. Este mutante existe para provar que o indicador tem dono.
from _lib import troca
troca('dae_metrics.c',
      "      double c = 0.0;\n      for (i = 0; i < n; ++i) c += w[i];\n      c /= (double)n;\n      for (i = 0; i < n; ++i) w[i] -= c;\n      for (q = 0; q <= j; ++q) {",
      "      double c = 0.0; (void)c;\n      for (q = 0; q <= j; ++q) {")
troca('dae_metrics.c',
      "    { double c = 0.0;\n      for (i = 0; i < n; ++i) c += w[i];\n      c /= (double)n;\n      for (i = 0; i < n; ++i) w[i] -= c; }\n",
      "")
