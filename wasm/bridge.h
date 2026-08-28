/* bridge.h — a ponte para o navegador.
 *
 * O JS passa o TEXTO do spec.json e quem interpreta e dae_spec.c, exatamente
 * como o .cpp exportado. A versao anterior desta ponte atravessava os
 * parametros do gerador num vetor de double com posicoes fixas — "o indice 7
 * significa ws_p" escrito em dois arquivos — e foi por essa fresta que os
 * padroes do gerador entraram zerados do lado JS. Nao ha mais vetor de
 * parametros. Ver CONVENTIONS.md, parte 2.
 */
#ifndef DAE_BRIDGE_H
#define DAE_BRIDGE_H

#include "dae.h"

#endif /* DAE_BRIDGE_H */
