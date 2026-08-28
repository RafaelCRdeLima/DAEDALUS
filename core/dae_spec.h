/* dae_spec.h — o spec.json, interpretado SÓ aqui.
 *
 * O TypeScript monta o texto; quem interpreta é este arquivo. O .cpp exportado
 * embute o mesmo texto num raw string literal e usa este mesmo parser. Não há
 * validação paralela em JavaScript: a interface chama isto via WASM e exibe
 * dae_error.line/col. Ver CONVENTIONS.md, parte 2.
 *
 * ESTRITO DE PROPÓSITO: chave desconhecida é ERRO, não campo ignorado. Um
 * emissor que escreva "seam" onde o formato diz "seam_shift" produziria, com um
 * parser tolerante, um arquivo internamente consistente que resolve o problema
 * ERRADO — e o oráculo de verificação não pegaria, porque ele valida o
 * propagador, não o emissor. Com parser estrito, o erro aparece na linha e na
 * coluna. Campo novo exige subir format_version.
 */
#ifndef DAE_SPEC_H
#define DAE_SPEC_H

#include "dae_graph.h"
#include "dae_version.generated.h"
#include "dae_ham.h"
#include "dae_obs.h"
#include "dae_types.h"

typedef struct {
  int32_t        format_version;
  char           core_hash[24];      /* "" se ausente no arquivo */
  uint64_t       seed;

  dae_gen_params gen;                /* modo procedimental                    */
  int32_t        n_edges;            /* modo explícito: 0 = procedimental     */
  int32_t       *ei, *ej;
  double        *w;

  dae_ham_kind   ham;
  double         gamma;
  dae_norm_kind  norm;
  int32_t        lanczos_steps;

  int32_t        init_site;          /* -1 quando há vetor explícito          */
  double        *init_re, *init_im;
  int32_t        init_n;

  double         t1;
  int32_t        nt;

  int32_t        target;
  int            want_pop, want_conc_mod, want_conc_full;
  int32_t        pop_stride;
  int32_t        realizations;       /* varredura de semente; 1 = execução única */
} dae_spec;

void       dae_spec_default(dae_spec *S);
dae_status dae_spec_parse(dae_spec *S, const char *json, dae_error *err);
void       dae_spec_free(dae_spec *S);

/* 1 se o core_hash do arquivo bate com o núcleo que está executando. Ausente
 * conta como "não confere" e o chamador decide o que fazer: um resultado sem
 * hash não é rastreável, mas também não está errado. */
int        dae_spec_hash_confere(const dae_spec *S);

/* JSON canônico: ordem de chaves fixa, números com 17 dígitos. É o que entra no
 * cabeçalho do CSV e no bloco de reprodutibilidade dos arquivos exportados.
 * Devolve quantos bytes escreveria (como snprintf); trunca se não couber. */
int32_t    dae_spec_canonical(const dae_spec *S, char *buf, int32_t cap);

#endif /* DAE_SPEC_H */
