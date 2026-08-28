#include "dae_traj.h"
#include "dae_rng.h"

#include <math.h>
#include <stdlib.h>
#include <string.h>

int32_t dae_traj_amostras(const dae_traj_cfg *cfg)
{
  if (!cfg || cfg->nt <= 0 || cfg->rho_stride <= 0) return 0;
  /* Inclui t = 0 e depois um a cada rho_stride passos. */
  return 1 + cfg->nt / cfg->rho_stride;
}

/* splitmix64 sobre (base, idx): fluxo proprio por trajetoria, derivavel do
 * indice e independente da ordem em que as threads executam. Um gerador
 * compartilhado faria o resultado depender do escalonador. */
uint64_t dae_traj_semente(uint64_t base, int32_t idx)
{
  uint64_t z = base + (uint64_t)0x9E3779B97F4A7C15ULL * (uint64_t)(idx + 1);
  z = (z ^ (z >> 30)) * 0xBF58476D1CE4E5B9ULL;
  z = (z ^ (z >> 27)) * 0x94D049BB133111EBULL;
  return z ^ (z >> 31);
}

dae_status dae_rho_acc_init(dae_rho_acc *A, int32_t n, int32_t n_amostras)
{
  size_t tot;
  if (!A || n <= 0 || n_amostras <= 0) return DAE_ERR_PARAM;
  A->n = n; A->n_amostras = n_amostras; A->proxima = 0; A->somadas = 0;
  tot = (size_t)n_amostras * (size_t)n * (size_t)n;
  A->re = (double *)calloc(tot, sizeof(double));
  A->im = (double *)calloc(tot, sizeof(double));
  if (!A->re || !A->im) { dae_rho_acc_free(A); return DAE_ERR_ALLOC; }
  return DAE_OK;
}

void dae_rho_acc_free(dae_rho_acc *A)
{
  if (!A) return;
  free(A->re); free(A->im);
  A->re = NULL; A->im = NULL; A->n = 0; A->n_amostras = 0;
}

dae_status dae_rho_acc_somar(dae_rho_acc *A, int32_t idx,
                             const double *re, const double *im)
{
  int32_t s, i, j;
  if (!A || !A->re || !re || !im) return DAE_ERR_PARAM;
  /* A ORDEM E CONTRATO. Fora de ordem e erro, nao outro numero: soma de ponto
     flutuante nao e associativa, e a igualdade bit a bit entre os dois modos
     depende de as contribuicoes entrarem exatamente nesta sequencia. */
  if (idx != A->proxima) return DAE_ERR_PARAM;

  for (s = 0; s < A->n_amostras; ++s) {
    const double *pr = re + (size_t)s * (size_t)A->n;
    const double *pi = im + (size_t)s * (size_t)A->n;
    double *ar = A->re + (size_t)s * (size_t)A->n * (size_t)A->n;
    double *ai = A->im + (size_t)s * (size_t)A->n * (size_t)A->n;
    for (i = 0; i < A->n; ++i) {
      const double xr = pr[i], xi = pi[i];
      for (j = 0; j < A->n; ++j) {
        /* psi_i psi_j^* */
        ar[(size_t)i * (size_t)A->n + (size_t)j] += xr * pr[j] + xi * pi[j];
        ai[(size_t)i * (size_t)A->n + (size_t)j] += xi * pr[j] - xr * pi[j];
      }
    }
  }
  A->proxima = idx + 1;
  A->somadas += 1;
  return DAE_OK;
}

void dae_rho_acc_finalizar(dae_rho_acc *A)
{
  size_t tot, k;
  double inv;
  if (!A || !A->re || A->somadas <= 0) return;
  tot = (size_t)A->n_amostras * (size_t)A->n * (size_t)A->n;
  inv = 1.0 / (double)A->somadas;
  for (k = 0; k < tot; ++k) { A->re[k] *= inv; A->im[k] *= inv; }
}

/* Colapso: escolhe j com probabilidade |psi_j|^2 e projeta. A busca e linear e
 * acumulativa — a MESMA travessia em qualquer plataforma, porque uma busca
 * binaria sobre soma parcial daria outro j para o mesmo sorteio se a soma
 * parcial fosse calculada em outra ordem. */
static void colapsar(double *re, double *im, int32_t n, double u)
{
  double acc = 0.0;
  int32_t j, escolhido = n - 1;
  for (j = 0; j < n; ++j) {
    acc += re[j] * re[j] + im[j] * im[j];
    if (u < acc) { escolhido = j; break; }
  }
  for (j = 0; j < n; ++j) { re[j] = 0.0; im[j] = 0.0; }
  re[escolhido] = 1.0;
}

dae_status dae_traj_ensemble(const dae_traj_cfg *cfg, uint64_t semente_base,
                             dae_cheb *W, const dae_csr *H,
                             dae_rho_acc *A, dae_traj_sink sink, void *user)
{
  const int32_t n = H ? H->n : 0;
  int32_t na, idx, s;
  double *psre = NULL, *psim = NULL, *amre = NULL, *amim = NULL;
  dae_status st = DAE_OK;

  if (!cfg || !W || !H || n <= 0) return DAE_ERR_PARAM;
  if (cfg->saida == DAE_SAIDA_INDEFINIDA) return DAE_ERR_PARAM;
  if (cfg->n_traj <= 0 || cfg->gamma_deph < 0.0) return DAE_ERR_PARAM;
  if (cfg->sitio_inicial < 0 || cfg->sitio_inicial >= n) return DAE_ERR_PARAM;
  if (cfg->saida == DAE_SAIDA_ACUMULAR_RHO && !A) return DAE_ERR_PARAM;
  if (cfg->saida == DAE_SAIDA_ARQUIVAR_PSI && !sink) return DAE_ERR_PARAM;

  na = dae_traj_amostras(cfg);
  if (na <= 0) return DAE_ERR_PARAM;

  psre = (double *)calloc((size_t)n, sizeof(double));
  psim = (double *)calloc((size_t)n, sizeof(double));
  amre = (double *)calloc((size_t)na * (size_t)n, sizeof(double));
  amim = (double *)calloc((size_t)na * (size_t)n, sizeof(double));
  if (!psre || !psim || !amre || !amim) { st = DAE_ERR_ALLOC; goto fim; }

  for (idx = 0; idx < cfg->n_traj; ++idx) {
    dae_rng g;
    double t = 0.0, t_salto;
    int32_t passo;
    dae_rng_seed(&g, dae_traj_semente(semente_base, idx));

    memset(psre, 0, (size_t)n * sizeof(double));
    memset(psim, 0, (size_t)n * sizeof(double));
    psre[cfg->sitio_inicial] = 1.0;

    /* Tempo do primeiro salto. gamma = 0 nunca salta: -log(u)/0 = +inf, e o
       teste de igualdade entre modos roda tambem nesse caso. */
    t_salto = (cfg->gamma_deph > 0.0)
      ? -log(1.0 - dae_rng_uniform(&g)) / cfg->gamma_deph : (double)INFINITY;

    s = 0;
    memcpy(amre, psre, (size_t)n * sizeof(double));
    memcpy(amim, psim, (size_t)n * sizeof(double));
    s = 1;

    for (passo = 1; passo <= cfg->nt; ++passo) {
      const double t_fim = (double)passo * cfg->dt;
      while (t_salto < t_fim) {
        dae_cheb_info info;
        const double sub = t_salto - t;
        if (sub > 0.0) {
          st = dae_cheb_step(W, H, sub, psre, psim, &info);
          if (st != DAE_OK) goto fim;
        }
        colapsar(psre, psim, n, dae_rng_uniform(&g));
        t = t_salto;
        t_salto = t - log(1.0 - dae_rng_uniform(&g)) / cfg->gamma_deph;
      }
      if (t_fim > t) {
        dae_cheb_info info;
        st = dae_cheb_step(W, H, t_fim - t, psre, psim, &info);
        if (st != DAE_OK) goto fim;
        t = t_fim;
      }
      if (passo % cfg->rho_stride == 0 && s < na) {
        memcpy(amre + (size_t)s * (size_t)n, psre, (size_t)n * sizeof(double));
        memcpy(amim + (size_t)s * (size_t)n, psim, (size_t)n * sizeof(double));
        ++s;
      }
    }

    if (cfg->saida == DAE_SAIDA_ACUMULAR_RHO) {
      st = dae_rho_acc_somar(A, idx, amre, amim);
    } else {
      st = sink(user, idx, amre, amim, na, n);
    }
    if (st != DAE_OK) goto fim;
  }

fim:
  free(psre); free(psim); free(amre); free(amim);
  return st;
}
