# esperado: CEGO (redundante com a quebra de Lanczos)
# Krylov ate dimensao n, sendo que o espaco deflacionado tem dimensao n-1.
# Com a deflacao correta, a quebra do Lanczos (nn < 1e-13) ja para em n-1 antes
# do teto agir: verificado no regime de exaustao de t94_metrics, que roda P_64
# com tolerancia inatingivel e para em 63 passos com ou sem este mutante.
# O teto e a rede que segura quando a deflacao NAO esta correta — e ai quem
# morde e m14.
from _lib import troca
troca('dae_metrics.c', "  if (mmax > n - 1) mmax = n - 1;", "  if (mmax > n) mmax = n;")
