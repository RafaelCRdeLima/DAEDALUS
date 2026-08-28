/* cli.c — `daedalus run spec.json`.
 *
 * O mesmo núcleo, o mesmo parser, o mesmo CSV que o navegador e o .cpp
 * exportado. Este binário existe para o teste 7 ter um dos lados da comparação
 * e para rodar um spec.json à mão sem abrir o navegador.
 */
#include "dae.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static char *le_arquivo(const char *caminho)
{
  FILE *f = fopen(caminho, "rb");
  long n;
  char *b;
  if (!f) return NULL;
  fseek(f, 0, SEEK_END);
  n = ftell(f);
  fseek(f, 0, SEEK_SET);
  if (n < 0) { fclose(f); return NULL; }
  b = (char *)malloc((size_t)n + 1);
  if (!b) { fclose(f); return NULL; }
  if (fread(b, 1, (size_t)n, f) != (size_t)n) { free(b); fclose(f); return NULL; }
  b[n] = '\0';
  fclose(f);
  return b;
}

static int escreve_csv(const dae_spec *S, const dae_graph *G, const dae_metrics *M,
                       const dae_series *R, int estado, const char *saida)
{
  const int32_t precisa = dae_csv(S, G, M, R, estado, NULL, 0) + 1;
  char *buf = (char *)malloc((size_t)precisa);
  FILE *f;
  if (!buf) return 0;
  dae_csv(S, G, M, R, estado, buf, precisa);
  if (saida) {
    f = fopen(saida, "wb");
    if (!f) { free(buf); return 0; }
    fwrite(buf, 1, strlen(buf), f);
    fclose(f);
  } else {
    fwrite(buf, 1, strlen(buf), stdout);
  }
  free(buf);
  return 1;
}

/* `daedalus traj` — roda o ensemble de trajetorias e escreve rho.
 *
 * Existe para o PORTAO DA FASE 2: a media de trajetorias tem de reproduzir a
 * solucao exata de Lindblad, e quem calcula a solucao exata e o pacote Wolfram,
 * por um metodo que nao e trajetoria nenhuma. Sem este arquivo os dois lados
 * nao se encontram, e "as trajetorias convergiram" fica indistinguivel de "as
 * trajetorias convergiram para a coisa errada" — com barra de erro respeitavel
 * nos dois casos. */
static int rodar_trajetorias(const dae_spec *S, const char *saida)
{
  dae_graph G;
  dae_csr H;
  dae_cheb W;
  dae_traj_cfg cfg;
  dae_rho_acc A;
  dae_status st;
  FILE *f = NULL;
  int32_t na, s2, i, j, precisa;
  char *cab;
  double escala = 1.0;

  if (S->n_traj <= 0) {
    fprintf(stderr, "este spec nao pede trajetorias (trajectories.n_traj = 0)\n");
    return 1;
  }
  if (S->saida_traj != DAE_SAIDA_ACUMULAR_RHO) {
    fprintf(stderr, "`traj` escreve rho, entao exige output_mode accumulate_rho\n");
    return 1;
  }
  { dae_gen_params gp = S->gen; gp.seed = S->seed;
    st = dae_graph_build(&G, &gp); }
  if (st != DAE_OK) { fprintf(stderr, "grafo: %s\n", dae_strerror(st)); return 1; }
  st = dae_hamiltonian(&H, &G.A, S->ham, S->gamma, S->norm, S->lanczos_steps, &escala);
  if (st != DAE_OK) { fprintf(stderr, "H: %s\n", dae_strerror(st)); return 1; }
  st = dae_cheb_init(&W, &H, S->lanczos_steps);
  if (st != DAE_OK) { fprintf(stderr, "cheb: %s\n", dae_strerror(st)); return 1; }

  cfg.gamma_deph = S->gamma_deph;
  cfg.n_traj = S->n_traj;
  cfg.rho_stride = S->rho_stride;
  cfg.nt = S->nt;
  cfg.dt = S->t1 / (double)S->nt;
  cfg.sitio_inicial = S->init_site >= 0 ? S->init_site : 0;
  cfg.saida = DAE_SAIDA_ACUMULAR_RHO;
  na = dae_traj_amostras(&cfg);

  st = dae_rho_acc_init(&A, G.n, na);
  if (st != DAE_OK) { fprintf(stderr, "acumulador: %s\n", dae_strerror(st)); return 1; }
  st = dae_traj_ensemble(&cfg, S->seed, &W, &H, &A, NULL, NULL);
  if (st != DAE_OK) { fprintf(stderr, "ensemble: %s\n", dae_strerror(st)); return 1; }
  dae_rho_acc_finalizar(&A);

  f = saida ? fopen(saida, "wb") : stdout;
  if (!f) { fprintf(stderr, "nao consegui abrir %s\n", saida); return 1; }
  precisa = dae_csv_cabecalho_psi(S, S->seed, G.n, na, S->n_traj, NULL, 0) + 1;
  cab = (char *)malloc((size_t)precisa);
  dae_csv_cabecalho_psi(S, S->seed, G.n, na, S->n_traj, cab, precisa);
  fwrite(cab, 1, strlen(cab), f);
  free(cab);
  fprintf(f, "#! conteudo rho_medio\n");
  fprintf(f, "#! dt %.17g\n", cfg.dt);
  /* A escala do nucleo vai JUNTO: ela e estimativa de Lanczos, e o Wolfram
     calcularia o raio espectral exato. Sem impo-la, os dois compararao
     dinamicas de hamiltonianos diferentes e a discordancia apareceria como
     desdobramento errado. */
  fprintf(f, "#! scale %.17g\n", escala);
  fprintf(f, "#! gamma_deph %.17g\n", cfg.gamma_deph);
  fprintf(f, "s,t,i,j,re,im\n");
  for (s2 = 0; s2 < na; ++s2) {
    const double tt = (double)(s2 * cfg.rho_stride) * cfg.dt;
    const size_t off = (size_t)s2 * (size_t)G.n * (size_t)G.n;
    for (i = 0; i < G.n; ++i)
      for (j = 0; j < G.n; ++j)
        fprintf(f, "%d,%.17g,%d,%d,%.17g,%.17g\n", s2, tt, i, j,
                A.re[off + (size_t)i * (size_t)G.n + (size_t)j],
                A.im[off + (size_t)i * (size_t)G.n + (size_t)j]);
  }
  if (saida) fclose(f);
  fprintf(stderr, "  traj: n=%d  amostras=%d  trajetorias=%d  gamma=%g -> %s\n",
          G.n, na, S->n_traj, S->gamma_deph, saida ? saida : "(stdout)");

  dae_rho_acc_free(&A);
  dae_cheb_free(&W); dae_csr_free(&H); dae_graph_free(&G);
  return 0;
}

int main(int argc, char **argv)
{
  dae_spec S;
  dae_error err;
  dae_graph G;
  dae_metrics M;
  dae_series R;
  char *texto;
  const char *saida = NULL;
  int estado = 0, i, realizacoes = -1;
  dae_status st;

  if (argc < 3 || (strcmp(argv[1], "run") != 0 && strcmp(argv[1], "traj") != 0)) {
    fprintf(stderr,
      "daedalus %s (nucleo %s)\n"
      "uso: daedalus run  <spec.json> [--saida arq.csv] [--estado] [--realizacoes N]\n"
      "     daedalus traj <spec.json> [--saida rho.csv]\n",
      DAE_VERSION, DAE_CORE_HASH);
    return 2;
  }
  for (i = 3; i < argc; ++i) {
    if (strcmp(argv[i], "--saida") == 0 && i + 1 < argc) saida = argv[++i];
    else if (strcmp(argv[i], "--estado") == 0) estado = 1;
    else if (strcmp(argv[i], "--realizacoes") == 0 && i + 1 < argc) realizacoes = atoi(argv[++i]);
    else { fprintf(stderr, "argumento desconhecido: %s\n", argv[i]); return 2; }
  }

  texto = le_arquivo(argv[2]);
  if (!texto) { fprintf(stderr, "nao consegui ler %s\n", argv[2]); return 1; }

  st = dae_spec_parse(&S, texto, &err);
  free(texto);
  if (st != DAE_OK) {
    fprintf(stderr, "%s:%d:%d: %s\n", argv[2], (int)err.line, (int)err.col, err.msg);
    return 1;
  }
  if (S.core_hash[0] && !dae_spec_hash_confere(&S)) {
    fprintf(stderr, "aviso: spec gerado pelo nucleo %s, executando com %s — "
                    "o resultado nao e rastreavel ate aquele codigo\n",
            S.core_hash, DAE_CORE_HASH);
  }
  if (realizacoes > 0) S.realizations = realizacoes;

  if (strcmp(argv[1], "traj") == 0) {
    const int r = rodar_trajetorias(&S, saida);
    dae_spec_free(&S);
    return r;
  }

  for (i = 0; i < S.realizations; ++i) {
    const uint64_t semente = S.seed + (uint64_t)i;
    char nome[512];
    st = dae_run(&S, semente, &G, &M, &R, NULL, NULL);
    if (st != DAE_OK) {
      fprintf(stderr, "realizacao %d falhou: %s\n", i, dae_strerror(st));
      dae_spec_free(&S);
      return 1;
    }
    if (S.realizations > 1 && saida) {
      snprintf(nome, sizeof(nome), "%s.r%04d.csv", saida, i);
      escreve_csv(&S, &G, &M, &R, estado, nome);
    } else {
      escreve_csv(&S, &G, &M, &R, estado, saida);
    }
    dae_series_free(&R);
    dae_graph_free(&G);
  }
  dae_spec_free(&S);
  return 0;
}
