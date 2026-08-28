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

  if (argc < 3 || strcmp(argv[1], "run") != 0) {
    fprintf(stderr,
      "daedalus %s (nucleo %s)\n"
      "uso: daedalus run <spec.json> [--saida arq.csv] [--estado] [--realizacoes N]\n",
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
