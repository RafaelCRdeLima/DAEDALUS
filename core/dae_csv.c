#include "dae_csv.h"

#include <stdio.h>      /* snprintf; ver a emenda em dae_spec.c */
#include <stdlib.h>
#include <string.h>

typedef struct { char *b; int32_t cap, n; } dae_cbuf;

/* `m` e o tamanho PRETENDIDO por snprintf, que pode passar do buffer quando
   houve truncamento — copiar `m` bytes de um buffer de 256 e leitura fora de
   limite. O clamp para `lim` fecha isso; strings longas nao passam por aqui,
   passam por cput. */
static void ce(dae_cbuf *B, const char *t, int m, int32_t lim)
{
  int32_t i;
  if (m < 0) return;
  if (m > lim) m = lim;
  for (i = 0; i < m; ++i) {
    if (B->n + 1 < B->cap) B->b[B->n] = t[i];
    ++B->n;
  }
}

/* Anexa uma string de qualquer tamanho, sem buffer intermediario. O spec
   canonico tem centenas de bytes e nao cabe num temporario de pilha: a versao
   anterior truncava, lia fora do buffer e o lixo continha um NUL — o que fazia
   o `fwrite` com strlen cortar o CSV logo depois do cabecalho. O corpo inteiro
   sumia, e o comparador via "sem tabela" em vez de "arquivo truncado". */
static void cput(dae_cbuf *B, const char *s)
{
  for (; *s; ++s) {
    if (B->n + 1 < B->cap) B->b[B->n] = *s;
    ++B->n;
  }
}
static void cs(dae_cbuf *B, const char *f, const char *v)
{ char t[256]; ce(B, t, snprintf(t, sizeof(t), f, v), (int32_t)sizeof(t) - 1); }
static void ci(dae_cbuf *B, const char *f, int32_t v)
{ char t[64]; ce(B, t, snprintf(t, sizeof(t), f, (int)v), (int32_t)sizeof(t) - 1); }
static void cd(dae_cbuf *B, const char *f, double v)
{ char t[64]; ce(B, t, snprintf(t, sizeof(t), f, v), (int32_t)sizeof(t) - 1); }
static void cu(dae_cbuf *B, const char *f, uint64_t v)
{ char t[64]; ce(B, t, snprintf(t, sizeof(t), f, (unsigned long long)v), (int32_t)sizeof(t) - 1); }

int32_t dae_csv_cabecalho_psi(const dae_spec *S, uint64_t semente_base,
                              int32_t n, int32_t n_amostras, int32_t n_traj,
                              char *buf, int32_t cap)
{
  dae_cbuf B;
  int32_t need;
  char *tmp;
  if (!S) return 0;
  B.b = buf; B.cap = cap; B.n = 0;
  if (cap > 0) buf[0] = '\0';

  cs(&B, "#! daedalus %s\n", DAE_VERSION);
  cs(&B, "#! core_hash %s\n", DAE_CORE_HASH);
  cs(&B, "#! implementacao %s\n", "c");
  cs(&B, "#! conteudo %s\n", "psi_trajetorias");
  /* A semente-base fica EXPLICITA aqui e nao so dentro do spec: e ela, com o
     indice da trajetoria, que gera cada fluxo (dae_traj_semente). Sem ela o
     acervo nao e regeneravel, e um cache que nao se regenera e um acervo. */
  {
    char sb[32];
    int32_t k = 0;
    uint64_t v = semente_base;
    char rev[32];
    if (v == 0) { rev[k++] = '0'; }
    while (v > 0 && k < 20) { rev[k++] = (char)('0' + (int)(v % 10ULL)); v /= 10ULL; }
    { int32_t q; for (q = 0; q < k; ++q) sb[q] = rev[k - 1 - q]; sb[k] = '\0'; }
    cs(&B, "#! semente_base %s\n", sb);
  }
  ci(&B, "#! n %d\n", n);
  ci(&B, "#! n_amostras %d\n", n_amostras);
  ci(&B, "#! n_traj %d\n", n_traj);
  cput(&B, "#! layout f64 re[n_amostras*n] depois im[n_amostras*n], por trajetoria\n");

  need = dae_spec_canonical(S, NULL, 0);
  tmp = (char *)malloc((size_t)need + 1);
  if (tmp) {
    dae_spec_canonical(S, tmp, need + 1);
    cput(&B, "#! spec ");
    cput(&B, tmp);
    cput(&B, "\n");
    free(tmp);
  }
  /* FECHA A STRING. Nem `ce` nem `cput` escrevem o terminador — ele e do
     emissor, e esta funcao o esqueceu na primeira versao. O sintoma foi o mesmo
     que o comentario de `cput` ja descrevia: `strlen` leu fora do buffer, o
     lixo entrou no arquivo, e o cabecalho saiu com bytes binarios no meio.
     O comentario existia e nao bastou: o terminador ser tarefa do chamador
     convida a omissao, e por isso `t97` agora exige strlen == devolvido. */
  if (cap > 0) buf[B.n < cap ? B.n : cap - 1] = '\0';
  return B.n;
}

int32_t dae_csv(const dae_spec *S, const dae_graph *G, const dae_metrics *M,
                const dae_series *R, int incluir_estado, char *buf, int32_t cap)
{
  dae_cbuf B;
  int32_t s, i, m;
  if (!S || !G || !R) return 0;
  B.b = buf; B.cap = cap; B.n = 0;
  if (cap > 0) buf[0] = '\0';

  cs(&B, "#! daedalus %s\n", DAE_VERSION);
  cs(&B, "#! core_hash %s\n", DAE_CORE_HASH);
  /* QUEM CALCULOU, que e outra pergunta que `core_hash` nao responde. O
     core_hash diz de qual spec e de qual versao do projeto o resultado veio; a
     implementacao diz qual programa produziu os numeros. O pacote Wolfram
     escreve "wolfram" aqui. Sem esta linha, um CSV do Wolfram reimportado se
     apresentaria como saida do nucleo em C — procedencia falsa, que e
     exatamente o que o cabecalho existe para impedir. */
  cs(&B, "#! implementacao %s\n", "c");
  cu(&B, "#! graph_fingerprint %llu\n", R->info.fingerprint);
  ci(&B, "#! n %d\n", G->n);
  ci(&B, "#! nnz %d\n", G->A.nnz);
  ci(&B, "#! nmod %d\n", G->nmod);
  cd(&B, "#! scale %.17g\n", R->info.escala);
  cd(&B, "#! spectral_lo %.17g\n", R->info.lo);
  cd(&B, "#! spectral_hi %.17g\n", R->info.hi);
  cd(&B, "#! cheb_a %.17g\n", R->info.a);
  cd(&B, "#! cheb_b %.17g\n", R->info.b);
  cd(&B, "#! dt %.17g\n", R->info.dt);
  /* alpha explícito: é o argumento que a fórmula da ordem usa, e a grade
     exportada o varre numa faixa que os testes do núcleo nunca viram. */
  cd(&B, "#! alpha %.17g\n", R->info.alpha);
  ci(&B, "#! cheb_k %d\n", R->info.k_used);
  ci(&B, "#! lanczos_used %d\n", R->info.lanczos_used);
  if (M) {
    cd(&B, "#! lambda2 %.17g\n", M->lambda2);
    cd(&B, "#! lambda2_residual %.17g\n", M->lambda2_residual);
    ci(&B, "#! lambda2_converged %d\n", M->lambda2_converged);
    cd(&B, "#! modularity_Q %.17g\n", M->modularity_Q);
    cd(&B, "#! mean_degree %.17g\n", M->mean_degree);
    cd(&B, "#! mean_path_len %.17g\n", M->mean_path_len);
    ci(&B, "#! n_edges %d\n", M->n_edges);
    ci(&B, "#! n_components %d\n", M->n_components);
  }
  /* Religacoes que nao acharam destino livre. Sai SEMPRE, inclusive zero: uma
     tentativa que colide consome sorteios extras, entao este contador e a
     unica testemunha externa de quantos sorteios o gerador gastou. Duas
     implementacoes podem chegar a mesma digital por caminhos diferentes de
     sorteio so se este numero tambem bater. */
  ci(&B, "#! rewire_failed %d\n", G->n_rewire_failed);
  { /* o spec canônico entra em linha única: um resultado solto continua
       rastreável até o JSON que o gerou */
    int32_t precisa = dae_spec_canonical(S, NULL, 0) + 1;
    char *tmp = (char *)malloc((size_t)precisa);
    if (tmp) {
      dae_spec_canonical(S, tmp, precisa);
      cput(&B, "#! spec ");
      cput(&B, tmp);
      cput(&B, "\n");
      free(tmp);
    }
  }

  cput(&B, "t,norm,ipr,coh_l1,p_target");
  for (m = 0; m < G->nmod; ++m) ci(&B, ",pmod%d", m);
  cput(&B, "\n");
  for (s = 0; s < R->nt; ++s) {
    const double *r = R->scal + (size_t)s * DAE_S_NCOL;
    cd(&B, "%.17g", R->t[s]);
    cd(&B, ",%.17g", r[DAE_S_NORMA]);
    cd(&B, ",%.17g", r[DAE_S_IPR]);
    cd(&B, ",%.17g", r[DAE_S_COH_L1]);
    /* p_alvo sem alvo é NaN, e sai como "nan" — nunca como 0, que é valor
       fisicamente válido. Ver CONVENTIONS.md, parte 7.2. */
    if (r[DAE_S_P_ALVO] == r[DAE_S_P_ALVO]) cd(&B, ",%.17g", r[DAE_S_P_ALVO]);
    else cput(&B, ",nan");
    for (m = 0; m < G->nmod; ++m)
      cd(&B, ",%.17g", R->pmod[(size_t)s * (size_t)G->nmod + (size_t)m]);
    cput(&B, "\n");
  }

  if (incluir_estado && R->psi_re) {
    cput(&B, "\n# estado final\nj,re,im\n");
    for (i = 0; i < G->n; ++i) {
      ci(&B, "%d", i);
      cd(&B, ",%.17g", R->psi_re[i]);
      cd(&B, ",%.17g\n", R->psi_im[i]);
    }
  }
  if (cap > 0) buf[B.n < cap ? B.n : cap - 1] = '\0';
  return B.n;
}
