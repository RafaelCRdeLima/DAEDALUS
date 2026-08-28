/* dae_run.h — do spec.json à série temporal.
 *
 * É o que o navegador, o binário nativo e o .cpp exportado chamam. Reentrante e
 * sem estado: o template exportado roda realizações sob `#pragma omp parallel
 * for`, e cada thread traz o seu próprio spec, grafo e séries.
 */
#ifndef DAE_RUN_H
#define DAE_RUN_H

#include "dae_metrics.h"
#include "dae_spec.h"
#include "dae_types.h"

/* Colunas de dae_series.scal, uma linha por passo. Definidas AQUI e usadas
 * também pela ponte do WASM: duas listas de colunas em arquivos diferentes
 * seria a mesma divergência silenciosa de sempre, só que em índices. */
enum { DAE_S_NORMA = 0, DAE_S_IPR, DAE_S_COH_L1, DAE_S_P_ALVO, DAE_S_NCOL };

typedef struct {
  double   escala;       /* fator de normalização de ||H|| aplicado          */
  double   lo, hi, a, b; /* intervalo espectral e a transformação de Chebyshev */
  double   dt;
  /* alpha = a*dt. É ELE que a fórmula da ordem usa, e é nele que o defeito
     não-monotônico do K vivia (CONVENTIONS.md, parte 6.2). A grade exportada
     tem dt livre e `a` dependendo da normalização, então alpha varre uma faixa
     que a etapa 1 nunca viu — por isso ele sai daqui e entra no cabeçalho do
     CSV, em vez de ficar implícito. */
  double   alpha;
  int32_t  k_used;
  uint64_t fingerprint;
  int      lanczos_used;
} dae_run_info;

typedef struct {
  int32_t  nt, n, nmod, npop;
  double  *t;         /* nt                    */
  double  *scal;      /* nt * DAE_S_NCOL       */
  double  *pmod;      /* nt * nmod             */
  double  *pop;       /* npop * n  (opcional)  */
  double  *conc_mod;  /* nt * nmod^2 (opcional)*/
  double  *psi_re;    /* n: estado final. Os observáveis são funções de |psi|,
                         então um erro de FASE não apareceria em nenhum deles —
                         e é justamente o tipo de erro que o fator (-i)^k pode
                         introduzir. O teste 7 compara o estado, não só o que
                         se deriva dele. */
  double  *psi_im;
  dae_run_info info;
} dae_series;

/* Devolve 0 para cancelar. */
typedef int (*dae_progress_fn)(void *user, int32_t passo, int32_t total);

/* A semente vai SEPARADA do spec, e não dentro dele, porque a varredura de
 * realizações precisa variá-la sem clonar a estrutura (que tem ponteiros de
 * heap e não sobrevive a uma cópia rasa que alguém depois libere duas vezes).
 * Execução única passa S->seed. */
dae_status dae_run(const dae_spec *S, uint64_t seed,
                   dae_graph *G, dae_metrics *M, dae_series *R,
                   dae_progress_fn cb, void *user);

void dae_series_free(dae_series *R);

#endif /* DAE_RUN_H */
