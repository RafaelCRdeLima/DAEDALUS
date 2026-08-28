/* dae_csv.h — o formato de saída, e o único.
 *
 * O navegador, o binário nativo e o .cpp exportado emitem EXATAMENTE o mesmo
 * texto. Se cada um serializasse do seu jeito, o teste 7 estaria comparando
 * duas serializações e não duas simulações — e uma diferença de formato
 * apareceria como discordância física.
 *
 * DUAS CLASSES DE COMENTÁRIO, e a distinção importa:
 *
 *   `#!`  reprodutibilidade. Tem de bater byte a byte entre alvos: versão,
 *         hash do núcleo, impressão digital do grafo, spec.json canônico,
 *         alpha, a, b, escala. É o que o comparador confere primeiro.
 *   `#`   informativo. Data, linha de comando, quem gerou. Muda entre execuções
 *         por construção, e o comparador ignora.
 *
 * Sem essa separação, ou o CSV não carrega a data (e perde rastreabilidade) ou
 * o comparador precisa de uma lista de exceções por nome de campo, que apodrece.
 */
#ifndef DAE_CSV_H
#define DAE_CSV_H

#include "dae_metrics.h"
#include "dae_run.h"
#include "dae_spec.h"

/* Escreve em buf e devolve quantos bytes escreveria (como snprintf): chame com
 * cap = 0 para dimensionar, aloque, chame de novo. */
int32_t dae_csv(const dae_spec *S, const dae_graph *G, const dae_metrics *M,
                const dae_series *R, int incluir_estado, char *buf, int32_t cap);

#endif /* DAE_CSV_H */
