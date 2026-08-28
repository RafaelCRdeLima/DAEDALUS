/* dae_graph.h — geradores de grafo.
 *
 * ETAPA 1 implementa só as famílias de referência analítica (linha, ciclo,
 * K_N, hipercubo, grade 2D) e a importação de lista de arestas, porque os
 * testes 2, 3, 4 e 5 são definidos sobre elas. Microtúbulo com costura,
 * religação Watts-Strogatz e SBM são a etapa 2 e hoje devolvem
 * DAE_ERR_UNIMPLEMENTED em vez de fingir que existem.
 *
 * DISCIPLINA METODOLÓGICA (ver CONVENTIONS.md, parte 3): o controle de
 * conectividade RELIGA por padrão, mantendo |E| fixo. Acrescentar arestas de
 * longo alcance melhora o transporte trivialmente, porque aumenta |E|.
 */
#ifndef DAE_GRAPH_H
#define DAE_GRAPH_H

#include "dae_csr.h"
#include "dae_rng.h"
#include "dae_types.h"

typedef enum {
  DAE_G_MICROTUBULE = 0,
  DAE_G_PATH,
  DAE_G_CYCLE,
  DAE_G_COMPLETE,
  DAE_G_HYPERCUBE,
  DAE_G_GRID2D,
  DAE_G_SBM,
  DAE_G_EDGELIST
} dae_gen_kind;

typedef enum {
  DAE_REWIRE = 0,   /* padrão: |E| constante */
  DAE_ADD    = 1    /* acrescenta: |E| cresce — a interface avisa */
} dae_conn_mode;

typedef struct {
  dae_gen_kind  kind;
  uint64_t      seed;

  /* microtúbulo */
  int32_t       n_par;                /* dímeros ao longo do eixo            */
  int32_t       n_perp;               /* protofilamentos; padrão 13          */
  int32_t       seam_shift;           /* 0 = periódico ideal; 3 = helicoidal */
  int           longitudinal_closed;  /* padrão 0: pontas abertas (ver docs) */
  double        j_par, j_perp;
  int32_t       n_modules;

  /* conectividade: aplicada a QUALQUER família base */
  double        ws_p;
  dae_conn_mode conn_mode;

  /* SBM */
  double        p_in, p_out;

  /* famílias de referência */
  int32_t       n;                    /* linha, ciclo, K_N        */
  int32_t       dim;                  /* hipercubo: N = 2^dim     */
  int32_t       rows, cols;           /* grade 2D                 */
} dae_gen_params;

typedef struct {
  dae_csr  A;
  int32_t  n;
  int32_t  nmod;
  int32_t *module_of;   /* n */
  float   *xy;          /* 2n, rede desenrolada — só para a interface */
  int32_t  n_par, n_perp;
  int32_t  n_dropped;        /* arestas duplicadas descartadas na montagem  */
  int32_t  n_rewire_failed;  /* religações que não acharam destino livre em
                                100 tentativas; a aresta original ficou. Sai
                                aqui para a interface avisar em vez de |E|
                                mudar em silêncio.                          */
} dae_graph;

/* Impressao digital inteira da estrutura do grafo (FNV-1a sobre rowptr,
 * colind, pesos e particao). Existe no NUCLEO, e nao no programa de teste,
 * porque os tres alvos — navegador, nativo e .cpp exportado — precisam
 * calcula-la com o mesmo codigo.
 *
 * E a primeira coisa que o teste 7 compara, antes de qualquer observavel:
 * "emissor errado" e "numerico divergente" tem causas e correcoes totalmente
 * diferentes, e sem a digital as duas chegam como "os numeros nao batem". */
uint64_t   dae_graph_fingerprint(const dae_graph *G);

void       dae_gen_params_default(dae_gen_params *p);
dae_status dae_graph_build(dae_graph *G, const dae_gen_params *p);
dae_status dae_graph_from_edges(dae_graph *G, int32_t n,
                                const int32_t *ei, const int32_t *ej,
                                const double *w, int32_t ne);
void       dae_graph_free(dae_graph *G);

#endif /* DAE_GRAPH_H */
