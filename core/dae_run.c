#include "dae_run.h"

#include "dae_cheb.h"
#include "dae_csr.h"
#include "dae_ham.h"
#include "dae_obs.h"

#include <math.h>
#include <stdlib.h>
#include <string.h>

void dae_series_free(dae_series *R)
{
  if (!R) return;
  free(R->t); free(R->scal); free(R->pmod); free(R->pop); free(R->conc_mod);
  free(R->psi_re); free(R->psi_im);
  memset(R, 0, sizeof(*R));
}

dae_status dae_run(const dae_spec *S, uint64_t seed,
                   dae_graph *G, dae_metrics *M, dae_series *R,
                   dae_progress_fn cb, void *user)
{
  dae_csr H;
  dae_cheb W;
  dae_cheb_info ci;
  dae_obs_cfg cfg;
  dae_obs O;
  double *re = NULL, *im = NULL, dt;
  int32_t i, s, npop = 0;
  dae_status st;

  if (!S || !G || !R) return DAE_ERR_PARAM;
  memset(G, 0, sizeof(*G));
  memset(R, 0, sizeof(*R));
  memset(&H, 0, sizeof(H));
  memset(&W, 0, sizeof(W));
  memset(&O, 0, sizeof(O));

  /* --- grafo --- */
  if (S->n_edges > 0) {
    if (S->gen.n <= 0) return DAE_ERR_PARAM;
    st = dae_graph_from_edges(G, S->gen.n, S->ei, S->ej, S->w, S->n_edges);
  } else {
    dae_gen_params p = S->gen;
    p.seed = seed;
    st = dae_graph_build(G, &p);
  }
  if (st != DAE_OK) return st;
  R->info.fingerprint = dae_graph_fingerprint(G);

  if (M) {
    dae_metrics_cfg mc;
    dae_metrics_cfg_default(&mc);
    st = dae_metrics_compute(G, &mc, M);
    if (st != DAE_OK) goto falhou;
  }

  /* --- hamiltoniano e propagador --- */
  st = dae_hamiltonian(&H, &G->A, S->ham, S->gamma, S->norm,
                       S->lanczos_steps, &R->info.escala);
  if (st != DAE_OK) goto falhou;
  st = dae_cheb_init(&W, &H, S->lanczos_steps);
  if (st != DAE_OK) goto falhou;

  dt = S->t1 / (double)S->nt;
  R->info.lo = W.lo; R->info.hi = W.hi; R->info.a = W.a; R->info.b = W.b;
  R->info.dt = dt;
  R->info.alpha = W.a * dt;
  R->info.lanczos_used = W.lanczos_used;

  /* --- estado inicial --- */
  re = (double *)calloc((size_t)G->n, sizeof(double));
  im = (double *)calloc((size_t)G->n, sizeof(double));
  if (!re || !im) { st = DAE_ERR_ALLOC; goto falhou; }
  if (S->init_site >= 0) {
    if (S->init_site >= G->n) { st = DAE_ERR_PARAM; goto falhou; }
    re[S->init_site] = 1.0;
  } else {
    double nrm = 0.0;
    if (S->init_n != G->n) { st = DAE_ERR_PARAM; goto falhou; }
    for (i = 0; i < G->n; ++i) {
      re[i] = S->init_re[i]; im[i] = S->init_im[i];
      nrm += re[i] * re[i] + im[i] * im[i];
    }
    nrm = sqrt(nrm);
    if (!(nrm > 0.0)) { st = DAE_ERR_PARAM; goto falhou; }
    for (i = 0; i < G->n; ++i) { re[i] /= nrm; im[i] /= nrm; }
  }

  /* --- observáveis e buffers --- */
  cfg.module_of = G->module_of;
  cfg.nmod = G->nmod;
  cfg.target = (S->target < G->n) ? S->target : -1;
  cfg.want_pop = S->want_pop;
  cfg.want_conc_mod = S->want_conc_mod;
  cfg.want_conc_full = S->want_conc_full;
  st = dae_obs_alloc(&O, &cfg, G->n);
  if (st != DAE_OK) goto falhou;

  if (S->want_pop) npop = (S->nt + S->pop_stride - 1) / S->pop_stride;
  R->nt = S->nt; R->n = G->n; R->nmod = G->nmod; R->npop = npop;
  R->psi_re = (double *)malloc((size_t)G->n * sizeof(double));
  R->psi_im = (double *)malloc((size_t)G->n * sizeof(double));
  if (!R->psi_re || !R->psi_im) { st = DAE_ERR_ALLOC; goto falhou; }
  R->t    = (double *)malloc((size_t)S->nt * sizeof(double));
  R->scal = (double *)malloc((size_t)S->nt * DAE_S_NCOL * sizeof(double));
  R->pmod = (double *)malloc((size_t)S->nt * (size_t)G->nmod * sizeof(double));
  if (!R->t || !R->scal || !R->pmod) { st = DAE_ERR_ALLOC; goto falhou; }
  if (npop > 0) {
    R->pop = (double *)malloc((size_t)npop * (size_t)G->n * sizeof(double));
    if (!R->pop) { st = DAE_ERR_ALLOC; goto falhou; }
  }
  if (S->want_conc_mod) {
    R->conc_mod = (double *)malloc((size_t)S->nt * (size_t)G->nmod
                                   * (size_t)G->nmod * sizeof(double));
    if (!R->conc_mod) { st = DAE_ERR_ALLOC; goto falhou; }
  }

  /* --- propagação --- */
  for (s = 0; s < S->nt; ++s) {
    st = dae_cheb_step(&W, &H, dt, re, im, &ci);
    if (st != DAE_OK) goto falhou;
    st = dae_obs_eval(re, im, G->n, &cfg, &O);
    if (st != DAE_OK) goto falhou;

    R->t[s] = (double)(s + 1) * dt;
    { double *r = R->scal + (size_t)s * DAE_S_NCOL;
      r[DAE_S_NORMA]  = O.norm;
      r[DAE_S_IPR]    = O.ipr;
      r[DAE_S_COH_L1] = O.coh_l1;
      r[DAE_S_P_ALVO] = O.p_target; }
    for (i = 0; i < G->nmod; ++i)
      R->pmod[(size_t)s * (size_t)G->nmod + (size_t)i] = O.pmod[i];
    if (R->conc_mod) {
      const size_t m2 = (size_t)G->nmod * (size_t)G->nmod;
      memcpy(R->conc_mod + (size_t)s * m2, O.conc_mod, m2 * sizeof(double));
    }
    if (R->pop && (s % S->pop_stride) == 0) {
      const int32_t k = s / S->pop_stride;
      memcpy(R->pop + (size_t)k * (size_t)G->n, O.pop,
             (size_t)G->n * sizeof(double));
    }
    if (cb && ((s & 31) == 0 || s == S->nt - 1)) {
      if (!cb(user, s + 1, S->nt)) { st = DAE_ERR_CANCELLED; goto falhou; }
    }
  }
  R->info.k_used = ci.k_used;
  memcpy(R->psi_re, re, (size_t)G->n * sizeof(double));
  memcpy(R->psi_im, im, (size_t)G->n * sizeof(double));

  free(re); free(im);
  dae_obs_free(&O); dae_cheb_free(&W); dae_csr_free(&H);
  return DAE_OK;

falhou:
  free(re); free(im);
  dae_obs_free(&O); dae_cheb_free(&W); dae_csr_free(&H);
  dae_series_free(R);
  dae_graph_free(G);
  return st;
}
