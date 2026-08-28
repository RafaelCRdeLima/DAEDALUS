# esperado: t91_conventions
# p_alvo = 0 em vez de NaN quando nao ha alvo.
from _lib import troca
troca('dae_obs.c', "O->p_target = NAN;", "O->p_target = 0.0;")
