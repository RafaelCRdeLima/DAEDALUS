#include "dae_spec.h"

/* EMENDA A REGRA 3 DO NUCLEO (CONVENTIONS.md, parte 1): este e o unico arquivo
 * do nucleo que inclui <stdio.h>, e so por snprintf. Formatar para um buffer
 * nao e entrada e saida — nenhum printf, nenhum arquivo. A alternativa seria
 * escrever a serializacao canonica fora do nucleo, e ai ela existiria duas
 * vezes: uma no TypeScript e outra no main do .cpp exportado. Duas versoes do
 * JSON canonico e exatamente a divergencia silenciosa que a amalgamacao existe
 * para impedir. */
#include <stdio.h>

#include <math.h>
#include <stdlib.h>
#include <string.h>

/* ------------------------------------------------------------ varredura -- */

typedef struct {
  const char *s;
  int32_t     i, linha, coluna;
  dae_error  *err;
  int         ok;
} dae_js;

static void js_erro(dae_js *j, const char *msg)
{
  if (!j->ok) return;                       /* guarda o primeiro erro */
  j->ok = 0;
  if (!j->err) return;
  j->err->line = j->linha;
  j->err->col = j->coluna;
  { size_t n = strlen(msg);
    if (n > sizeof(j->err->msg) - 1) n = sizeof(j->err->msg) - 1;
    memcpy(j->err->msg, msg, n);
    j->err->msg[n] = '\0'; }
}

static void js_avanca(dae_js *j)
{
  if (j->s[j->i] == '\n') { ++j->linha; j->coluna = 1; }
  else ++j->coluna;
  ++j->i;
}

static void js_ws(dae_js *j)
{
  for (;;) {
    const char c = j->s[j->i];
    if (c == ' ' || c == '\t' || c == '\n' || c == '\r') js_avanca(j);
    else return;
  }
}

static int js_ch(dae_js *j, char c, const char *msg)
{
  js_ws(j);
  if (j->s[j->i] != c) { js_erro(j, msg); return 0; }
  js_avanca(j);
  return 1;
}

static int js_texto(dae_js *j, char *out, int32_t cap)
{
  int32_t k = 0;
  js_ws(j);
  if (!js_ch(j, '"', "esperava string")) return 0;
  for (;;) {
    const char c = j->s[j->i];
    if (c == '\0') { js_erro(j, "string sem fechamento"); return 0; }
    if (c == '"') { js_avanca(j); break; }
    if (c == '\\') {
      js_avanca(j);
      { const char e = j->s[j->i];
        char d = e;
        if (e == 'n') d = '\n'; else if (e == 't') d = '\t';
        else if (e == 'r') d = '\r'; else if (e == 'b') d = '\b';
        else if (e == 'f') d = '\f';
        else if (e != '"' && e != '\\' && e != '/') { js_erro(j, "escape nao suportado"); return 0; }
        if (k + 1 < cap) out[k++] = d;
        js_avanca(j); }
      continue;
    }
    if (k + 1 < cap) out[k++] = c;
    js_avanca(j);
  }
  out[k] = '\0';
  return 1;
}

static int js_numero(dae_js *j, double *out)
{
  char buf[64];
  int32_t k = 0;
  js_ws(j);
  while (k + 1 < (int32_t)sizeof(buf)) {
    const char c = j->s[j->i];
    if ((c >= '0' && c <= '9') || c == '+' || c == '-' || c == '.' ||
        c == 'e' || c == 'E') { buf[k++] = c; js_avanca(j); }
    else break;
  }
  buf[k] = '\0';
  if (k == 0) { js_erro(j, "esperava numero"); return 0; }
  *out = strtod(buf, NULL);
  if (!(*out == *out)) { js_erro(j, "numero invalido (NaN)"); return 0; }
  return 1;
}

static int js_bool(dae_js *j, int *out)
{
  js_ws(j);
  if (strncmp(j->s + j->i, "true", 4) == 0) {
    int k; for (k = 0; k < 4; ++k) js_avanca(j);
    *out = 1; return 1;
  }
  if (strncmp(j->s + j->i, "false", 5) == 0) {
    int k; for (k = 0; k < 5; ++k) js_avanca(j);
    *out = 0; return 1;
  }
  js_erro(j, "esperava true ou false");
  return 0;
}

/* Iteração de objeto: devolve 0 quando acabou (ou em erro). */
static int js_obj_inicio(dae_js *j) { return js_ch(j, '{', "esperava '{'"); }

static int js_obj_chave(dae_js *j, char *k, int32_t cap, int *primeiro)
{
  js_ws(j);
  if (j->s[j->i] == '}') { js_avanca(j); return 0; }
  if (!*primeiro) { if (!js_ch(j, ',', "esperava ',' ou '}'")) return 0; }
  *primeiro = 0;
  js_ws(j);
  if (j->s[j->i] == '}') { js_avanca(j); return 0; }
  if (!js_texto(j, k, cap)) return 0;
  if (!js_ch(j, ':', "esperava ':'")) return 0;
  return 1;
}

static int js_arr_inicio(dae_js *j) { return js_ch(j, '[', "esperava '['"); }

static int js_arr_item(dae_js *j, int *primeiro)
{
  js_ws(j);
  if (j->s[j->i] == ']') { js_avanca(j); return 0; }
  if (!*primeiro) { if (!js_ch(j, ',', "esperava ',' ou ']'")) return 0; }
  *primeiro = 0;
  js_ws(j);
  if (j->s[j->i] == ']') { js_avanca(j); return 0; }
  return 1;
}

/* --------------------------------------------------------------- enums -- */

typedef struct { const char *nome; int valor; } dae_mapa;

static const dae_mapa MAPA_GER[] = {
  { "microtubule", DAE_G_MICROTUBULE }, { "path", DAE_G_PATH },
  { "cycle", DAE_G_CYCLE }, { "complete", DAE_G_COMPLETE },
  { "hypercube", DAE_G_HYPERCUBE }, { "grid2d", DAE_G_GRID2D },
  { "sbm", DAE_G_SBM }, { "edgelist", DAE_G_EDGELIST }, { 0, 0 }
};
static const dae_mapa MAPA_CONN[] = {
  { "rewire", DAE_REWIRE }, { "add", DAE_ADD }, { 0, 0 }
};
static const dae_mapa MAPA_HAM[] = {
  { "adjacency", DAE_H_ADJACENCY }, { "laplacian", DAE_H_LAPLACIAN }, { 0, 0 }
};
/* Sem entrada para INDEFINIDA: ela nao e escrevivel no arquivo, e sim o estado
   de "o bloco existe e nao disse". */
static const dae_mapa MAPA_SAIDA[] = {
  { "accumulate_rho", DAE_SAIDA_ACUMULAR_RHO },
  { "archive_psi",    DAE_SAIDA_ARQUIVAR_PSI }, { 0, 0 }
};
static const dae_mapa MAPA_NORM[] = {
  { "none", DAE_NORM_NONE }, { "spectral", DAE_NORM_SPECTRAL },
  { "mean_degree", DAE_NORM_MEAN_DEGREE }, { 0, 0 }
};

static const char *nome_de(const dae_mapa *m, int v)
{
  for (; m->nome; ++m) if (m->valor == v) return m->nome;
  return "?";
}

static int js_enum(dae_js *j, const dae_mapa *m, int *out)
{
  char buf[40];
  if (!js_texto(j, buf, (int32_t)sizeof(buf))) return 0;
  for (; m->nome; ++m) {
    if (strcmp(m->nome, buf) == 0) { *out = m->valor; return 1; }
  }
  js_erro(j, "valor desconhecido para este campo");
  return 0;
}

/* --------------------------------------------------------------- spec --- */

void dae_spec_default(dae_spec *S)
{
  if (!S) return;
  memset(S, 0, sizeof(*S));
  S->format_version = DAE_FORMAT_VERSION;
  S->seed = 12345ULL;
  dae_gen_params_default(&S->gen);
  S->ham = DAE_H_ADJACENCY;
  S->gamma = 1.0;
  S->norm = DAE_NORM_SPECTRAL;      /* ligada por padrao: CONVENTIONS 3.2 */
  S->lanczos_steps = 40;
  S->init_site = 0;
  S->t1 = 50.0;
  S->nt = 500;
  S->target = -1;
  S->want_pop = 1;
  S->want_conc_mod = 1;
  S->pop_stride = 1;
  S->realizations = 1;
  S->n_traj = 0;
  S->gamma_deph = 0.0;
  S->rho_stride = 1;
  S->saida_traj = DAE_SAIDA_INDEFINIDA;
}

void dae_spec_free(dae_spec *S)
{
  if (!S) return;
  free(S->ei); free(S->ej); free(S->w);
  free(S->init_re); free(S->init_im);
  S->ei = NULL; S->ej = NULL; S->w = NULL;
  S->init_re = NULL; S->init_im = NULL;
  S->n_edges = 0; S->init_n = 0;
}

int dae_spec_hash_confere(const dae_spec *S)
{
  return S && S->core_hash[0] && strcmp(S->core_hash, DAE_CORE_HASH) == 0;
}

static int le_arestas(dae_js *j, dae_spec *S)
{
  int32_t cap = 64;
  int primeiro = 1;
  S->ei = (int32_t *)malloc((size_t)cap * sizeof(int32_t));
  S->ej = (int32_t *)malloc((size_t)cap * sizeof(int32_t));
  S->w  = (double  *)malloc((size_t)cap * sizeof(double));
  if (!S->ei || !S->ej || !S->w) { js_erro(j, "memoria"); return 0; }
  if (!js_arr_inicio(j)) return 0;
  for (;;) {
    double a, b, p = 1.0;
    int interno = 1;
    if (!js_arr_item(j, &primeiro)) break;
    if (!js_arr_inicio(j)) return 0;
    if (!js_arr_item(j, &interno) || !js_numero(j, &a)) return 0;
    if (!js_arr_item(j, &interno) || !js_numero(j, &b)) return 0;
    if (js_arr_item(j, &interno)) {              /* peso opcional */
      if (!js_numero(j, &p)) return 0;
      if (js_arr_item(j, &interno)) { js_erro(j, "aresta com mais de 3 campos"); return 0; }
    }
    if (S->n_edges == cap) {
      int32_t nc = cap * 2;
      int32_t *ni = (int32_t *)realloc(S->ei, (size_t)nc * sizeof(int32_t));
      int32_t *nj = (int32_t *)realloc(S->ej, (size_t)nc * sizeof(int32_t));
      double  *nw = (double  *)realloc(S->w,  (size_t)nc * sizeof(double));
      if (!ni || !nj || !nw) { js_erro(j, "memoria"); return 0; }
      S->ei = ni; S->ej = nj; S->w = nw; cap = nc;
    }
    S->ei[S->n_edges] = (int32_t)a;
    S->ej[S->n_edges] = (int32_t)b;
    S->w[S->n_edges] = p;
    ++S->n_edges;
  }
  return j->ok;
}

static int le_vetor_inicial(dae_js *j, dae_spec *S)
{
  int32_t cap = 64;
  int primeiro = 1;
  S->init_re = (double *)malloc((size_t)cap * sizeof(double));
  S->init_im = (double *)malloc((size_t)cap * sizeof(double));
  if (!S->init_re || !S->init_im) { js_erro(j, "memoria"); return 0; }
  if (!js_arr_inicio(j)) return 0;
  for (;;) {
    double re, im;
    int interno = 1;
    if (!js_arr_item(j, &primeiro)) break;
    if (!js_arr_inicio(j)) return 0;
    if (!js_arr_item(j, &interno) || !js_numero(j, &re)) return 0;
    if (!js_arr_item(j, &interno) || !js_numero(j, &im)) return 0;
    if (js_arr_item(j, &interno)) { js_erro(j, "amplitude com mais de 2 campos"); return 0; }
    if (S->init_n == cap) {
      int32_t nc = cap * 2;
      double *nr = (double *)realloc(S->init_re, (size_t)nc * sizeof(double));
      double *ni = (double *)realloc(S->init_im, (size_t)nc * sizeof(double));
      if (!nr || !ni) { js_erro(j, "memoria"); return 0; }
      S->init_re = nr; S->init_im = ni; cap = nc;
    }
    S->init_re[S->init_n] = re;
    S->init_im[S->init_n] = im;
    ++S->init_n;
  }
  S->init_site = -1;
  return j->ok;
}

#define CHAVE(x) (strcmp(k, x) == 0)

static int le_params_grafo(dae_js *j, dae_spec *S)
{
  char k[48];
  int primeiro = 1;
  if (!js_obj_inicio(j)) return 0;
  while (js_obj_chave(j, k, (int32_t)sizeof(k), &primeiro)) {
    double v; int b, e;
    if      (CHAVE("n_par"))      { if (!js_numero(j, &v)) return 0; S->gen.n_par = (int32_t)v; }
    else if (CHAVE("n_perp"))     { if (!js_numero(j, &v)) return 0; S->gen.n_perp = (int32_t)v; }
    else if (CHAVE("seam_shift")) { if (!js_numero(j, &v)) return 0; S->gen.seam_shift = (int32_t)v; }
    else if (CHAVE("longitudinal_closed")) { if (!js_bool(j, &b)) return 0; S->gen.longitudinal_closed = b; }
    else if (CHAVE("j_par"))      { if (!js_numero(j, &v)) return 0; S->gen.j_par = v; }
    else if (CHAVE("j_perp"))     { if (!js_numero(j, &v)) return 0; S->gen.j_perp = v; }
    else if (CHAVE("n_modules"))  { if (!js_numero(j, &v)) return 0; S->gen.n_modules = (int32_t)v; }
    else if (CHAVE("ws_p"))       { if (!js_numero(j, &v)) return 0; S->gen.ws_p = v; }
    else if (CHAVE("conn_mode"))  { if (!js_enum(j, MAPA_CONN, &e)) return 0; S->gen.conn_mode = (dae_conn_mode)e; }
    else if (CHAVE("p_in"))       { if (!js_numero(j, &v)) return 0; S->gen.p_in = v; }
    else if (CHAVE("p_out"))      { if (!js_numero(j, &v)) return 0; S->gen.p_out = v; }
    else if (CHAVE("n"))          { if (!js_numero(j, &v)) return 0; S->gen.n = (int32_t)v; }
    else if (CHAVE("dim"))        { if (!js_numero(j, &v)) return 0; S->gen.dim = (int32_t)v; }
    else if (CHAVE("rows"))       { if (!js_numero(j, &v)) return 0; S->gen.rows = (int32_t)v; }
    else if (CHAVE("cols"))       { if (!js_numero(j, &v)) return 0; S->gen.cols = (int32_t)v; }
    else { js_erro(j, "chave desconhecida em graph.params"); return 0; }
  }
  return j->ok;
}

static int le_grafo(dae_js *j, dae_spec *S)
{
  char k[48];
  int primeiro = 1;
  if (!js_obj_inicio(j)) return 0;
  while (js_obj_chave(j, k, (int32_t)sizeof(k), &primeiro)) {
    double v; int e;
    if      (CHAVE("generator")) { if (!js_enum(j, MAPA_GER, &e)) return 0; S->gen.kind = (dae_gen_kind)e; }
    else if (CHAVE("params"))    { if (!le_params_grafo(j, S)) return 0; }
    else if (CHAVE("n"))         { if (!js_numero(j, &v)) return 0; S->gen.n = (int32_t)v; }
    else if (CHAVE("edges"))     { if (!le_arestas(j, S)) return 0; }
    else { js_erro(j, "chave desconhecida em graph"); return 0; }
  }
  return j->ok;
}

dae_status dae_spec_parse(dae_spec *S, const char *json, dae_error *err)
{
  dae_js j;
  char k[48];
  int primeiro = 1;
  int tem_traj = 0;

  if (!S || !json) return DAE_ERR_PARAM;
  dae_spec_default(S);
  if (err) { err->line = 0; err->col = 0; err->msg[0] = '\0'; }

  j.s = json; j.i = 0; j.linha = 1; j.coluna = 1; j.err = err; j.ok = 1;

  if (!js_obj_inicio(&j)) return DAE_ERR_JSON;
  while (js_obj_chave(&j, k, (int32_t)sizeof(k), &primeiro)) {
    double v; int b, e;
    if      (CHAVE("format_version")) { if (!js_numero(&j, &v)) break; S->format_version = (int32_t)v; }
    else if (CHAVE("core_hash"))      { if (!js_texto(&j, S->core_hash, (int32_t)sizeof(S->core_hash))) break; }
    else if (CHAVE("seed"))           { if (!js_numero(&j, &v)) break; S->seed = (uint64_t)v; }
    else if (CHAVE("graph"))          { if (!le_grafo(&j, S)) break; }
    else if (CHAVE("hamiltonian")) {
      int p2 = 1;
      if (!js_obj_inicio(&j)) break;
      while (js_obj_chave(&j, k, (int32_t)sizeof(k), &p2)) {
        if      (CHAVE("kind"))          { if (!js_enum(&j, MAPA_HAM, &e)) break; S->ham = (dae_ham_kind)e; }
        else if (CHAVE("gamma"))         { if (!js_numero(&j, &v)) break; S->gamma = v; }
        else if (CHAVE("normalization")) { if (!js_enum(&j, MAPA_NORM, &e)) break; S->norm = (dae_norm_kind)e; }
        else if (CHAVE("lanczos_steps")) { if (!js_numero(&j, &v)) break; S->lanczos_steps = (int32_t)v; }
        else { js_erro(&j, "chave desconhecida em hamiltonian"); break; }
      }
    }
    else if (CHAVE("initial")) {
      int p2 = 1;
      if (!js_obj_inicio(&j)) break;
      while (js_obj_chave(&j, k, (int32_t)sizeof(k), &p2)) {
        if      (CHAVE("site"))   { if (!js_numero(&j, &v)) break; S->init_site = (int32_t)v; }
        else if (CHAVE("vector")) { if (!le_vetor_inicial(&j, S)) break; }
        else { js_erro(&j, "chave desconhecida em initial"); break; }
      }
    }
    else if (CHAVE("time")) {
      int p2 = 1;
      if (!js_obj_inicio(&j)) break;
      while (js_obj_chave(&j, k, (int32_t)sizeof(k), &p2)) {
        if      (CHAVE("t1")) { if (!js_numero(&j, &v)) break; S->t1 = v; }
        else if (CHAVE("nt")) { if (!js_numero(&j, &v)) break; S->nt = (int32_t)v; }
        else { js_erro(&j, "chave desconhecida em time"); break; }
      }
    }
    else if (CHAVE("observables")) {
      int p2 = 1;
      if (!js_obj_inicio(&j)) break;
      while (js_obj_chave(&j, k, (int32_t)sizeof(k), &p2)) {
        if      (CHAVE("target"))            { if (!js_numero(&j, &v)) break; S->target = (int32_t)v; }
        else if (CHAVE("population"))        { if (!js_bool(&j, &b)) break; S->want_pop = b; }
        else if (CHAVE("module_concurrence")){ if (!js_bool(&j, &b)) break; S->want_conc_mod = b; }
        else if (CHAVE("full_concurrence"))  { if (!js_bool(&j, &b)) break; S->want_conc_full = b; }
        else if (CHAVE("pop_stride"))        { if (!js_numero(&j, &v)) break; S->pop_stride = (int32_t)v; }
        else { js_erro(&j, "chave desconhecida em observables"); break; }
      }
    }
    else if (CHAVE("realizations")) { if (!js_numero(&j, &v)) break; S->realizations = (int32_t)v; }
    else if (CHAVE("trajectories")) {
      int p3 = 1;
      tem_traj = 1;
      if (!js_obj_inicio(&j)) break;
      while (js_obj_chave(&j, k, (int32_t)sizeof(k), &p3)) {
        if      (CHAVE("n_traj"))     { if (!js_numero(&j, &v)) break; S->n_traj = (int32_t)v; }
        else if (CHAVE("gamma_deph")) { if (!js_numero(&j, &v)) break; S->gamma_deph = v; }
        else if (CHAVE("rho_stride")) { if (!js_numero(&j, &v)) break; S->rho_stride = (int32_t)v; }
        else if (CHAVE("output_mode")) {
          if (!js_enum(&j, MAPA_SAIDA, &e)) break;
          S->saida_traj = (dae_saida_traj)e;
        }
        else { js_erro(&j, "chave desconhecida em trajectories"); break; }
      }
    }
    else { js_erro(&j, "chave desconhecida na raiz"); break; }
  }
  if (!j.ok) { dae_spec_free(S); return DAE_ERR_JSON; }

  js_ws(&j);
  if (j.s[j.i] != '\0') { js_erro(&j, "lixo depois do objeto"); dae_spec_free(S); return DAE_ERR_JSON; }

  if (S->format_version != DAE_FORMAT_VERSION) {
    js_erro(&j, "format_version incompativel com este nucleo");
    dae_spec_free(S);
    return DAE_ERR_VERSION;
  }
  S->gen.seed = S->seed;
  if (S->n_edges > 0) S->gen.kind = DAE_G_EDGELIST;
  /* SEM PADRAO IMPLICITO. O bloco existir e nao dizer o modo e erro, e a
     mensagem diz o que fazer — a escolha e do usuario porque as duas saidas
     resolvem problemas diferentes, e escolher por ele so apareceria meses
     depois, quando o observavel mudasse e os psi nao existissem mais. */
  if (tem_traj && S->saida_traj == DAE_SAIDA_INDEFINIDA) {
    js_erro(&j, "trajectories exige output_mode: \"accumulate_rho\" ou \"archive_psi\"");
    dae_spec_free(S);
    return DAE_ERR_JSON;
  }
  if (S->n_traj < 0 || S->gamma_deph < 0.0 || S->rho_stride <= 0) {
    js_erro(&j, "n_traj e gamma_deph nao podem ser negativos, rho_stride precisa ser positivo");
    dae_spec_free(S);
    return DAE_ERR_JSON;
  }
  if (S->nt <= 0 || S->pop_stride <= 0 || S->realizations <= 0) {
    js_erro(&j, "nt, pop_stride e realizations precisam ser positivos");
    dae_spec_free(S);
    return DAE_ERR_PARAM;
  }
  return DAE_OK;
}

/* ----------------------------------------------------------- canonico --- */

typedef struct { char *b; int32_t cap, n; } dae_buf;

/* `m` e o tamanho PRETENDIDO por snprintf: sem o clamp, um truncamento vira
   leitura fora do buffer. Mesma classe de bug que derrubou o dae_csv. */
static void buf_emite(dae_buf *B, const char *tmp, int m, int32_t lim)
{
  int32_t i;
  if (m < 0) return;
  if (m > lim) m = lim;
  for (i = 0; i < m; ++i) {
    if (B->n + 1 < B->cap) B->b[B->n] = tmp[i];
    ++B->n;
  }
}

/* Tres helpers tipados em vez de um so adivinhando pelo formato. A versao
   anterior escolhia entre int e double olhando o ULTIMO caractere de fmt, o que
   errava em ",\"cols\":%d}" — termina em '}', nao em 'd'. */
static void bufs(dae_buf *B, const char *fmt, const char *v)
{ char t[512]; buf_emite(B, t, snprintf(t, sizeof(t), fmt, v), (int32_t)sizeof(t) - 1); }
static void bufi(dae_buf *B, const char *fmt, int32_t v)
{ char t[64]; buf_emite(B, t, snprintf(t, sizeof(t), fmt, (int)v), (int32_t)sizeof(t) - 1); }
static void bufd(dae_buf *B, const char *fmt, double v)
{ char t[64]; buf_emite(B, t, snprintf(t, sizeof(t), fmt, v), (int32_t)sizeof(t) - 1); }

int32_t dae_spec_canonical(const dae_spec *S, char *buf, int32_t cap)
{
  dae_buf B;
  if (!S) return 0;
  B.b = buf; B.cap = cap; B.n = 0;
  if (cap > 0) buf[0] = '\0';

  bufi(&B, "{\"format_version\":%d", S->format_version);
  bufs(&B, ",\"core_hash\":\"%s\"", DAE_CORE_HASH);
  bufd(&B, ",\"seed\":%.0f", (double)S->seed);
  bufs(&B, ",\"graph\":{\"generator\":\"%s\"", nome_de(MAPA_GER, (int)S->gen.kind));
  if (S->n_edges > 0) {
    bufi(&B, ",\"n\":%d", S->gen.n);
    bufs(&B, ",\"edges\":[%s", "");
    { int32_t e;
      for (e = 0; e < S->n_edges; ++e) {
        bufs(&B, "%s", e ? "," : "");
        bufi(&B, "[%d", S->ei[e]);
        bufi(&B, ",%d", S->ej[e]);
        bufd(&B, ",%.17g]", S->w[e]);
      } }
    bufs(&B, "]%s", "");
  } else {
    bufi(&B, ",\"params\":{\"n_par\":%d", S->gen.n_par);
    bufi(&B, ",\"n_perp\":%d", S->gen.n_perp);
    bufi(&B, ",\"seam_shift\":%d", S->gen.seam_shift);
    bufs(&B, ",\"longitudinal_closed\":%s", S->gen.longitudinal_closed ? "true" : "false");
    bufd(&B, ",\"j_par\":%.17g", S->gen.j_par);
    bufd(&B, ",\"j_perp\":%.17g", S->gen.j_perp);
    bufi(&B, ",\"n_modules\":%d", S->gen.n_modules);
    bufd(&B, ",\"ws_p\":%.17g", S->gen.ws_p);
    bufs(&B, ",\"conn_mode\":\"%s\"", nome_de(MAPA_CONN, (int)S->gen.conn_mode));
    bufd(&B, ",\"p_in\":%.17g", S->gen.p_in);
    bufd(&B, ",\"p_out\":%.17g", S->gen.p_out);
    bufi(&B, ",\"n\":%d", S->gen.n);
    bufi(&B, ",\"dim\":%d", S->gen.dim);
    bufi(&B, ",\"rows\":%d", S->gen.rows);
    bufi(&B, ",\"cols\":%d}", S->gen.cols);
  }
  bufs(&B, "}%s", "");
  bufs(&B, ",\"hamiltonian\":{\"kind\":\"%s\"", nome_de(MAPA_HAM, (int)S->ham));
  bufd(&B, ",\"gamma\":%.17g", S->gamma);
  bufs(&B, ",\"normalization\":\"%s\"", nome_de(MAPA_NORM, (int)S->norm));
  bufi(&B, ",\"lanczos_steps\":%d}", S->lanczos_steps);
  if (S->init_site >= 0) bufi(&B, ",\"initial\":{\"site\":%d}", S->init_site);
  else {
    bufs(&B, ",\"initial\":{\"vector\":[%s", "");
    { int32_t i;
      for (i = 0; i < S->init_n; ++i) {
        bufs(&B, "%s", i ? ",[" : "[");
        bufd(&B, "%.17g", S->init_re[i]);
        bufd(&B, ",%.17g]", S->init_im[i]);
      } }
    bufs(&B, "]}%s", "");
  }
  bufd(&B, ",\"time\":{\"t1\":%.17g", S->t1);
  bufi(&B, ",\"nt\":%d}", S->nt);
  bufi(&B, ",\"observables\":{\"target\":%d", S->target);
  bufs(&B, ",\"population\":%s", S->want_pop ? "true" : "false");
  bufs(&B, ",\"module_concurrence\":%s", S->want_conc_mod ? "true" : "false");
  bufs(&B, ",\"full_concurrence\":%s", S->want_conc_full ? "true" : "false");
  bufi(&B, ",\"pop_stride\":%d}", S->pop_stride);
  bufi(&B, ",\"realizations\":%d", S->realizations);
  /* O bloco so entra no canonico quando existe de fato: um spec unitario nao
     deve carregar campos de trajetoria zerados, que pareceriam escolha. */
  if (S->n_traj > 0 || S->saida_traj != DAE_SAIDA_INDEFINIDA) {
    bufi(&B, ",\"trajectories\":{\"n_traj\":%d", S->n_traj);
    bufd(&B, ",\"gamma_deph\":%.17g", S->gamma_deph);
    bufi(&B, ",\"rho_stride\":%d", S->rho_stride);
    bufs(&B, ",\"output_mode\":\"%s\"}", nome_de(MAPA_SAIDA, (int)S->saida_traj));
  }
  bufs(&B, "%s", "}");

  if (cap > 0) buf[B.n < cap ? B.n : cap - 1] = '\0';
  return B.n;
}
