/* daedalus.mjs — camada fina sobre o núcleo WASM.
 *
 * ================= A REGRA ÚNICA DESTE ARQUIVO =================
 *
 * NUNCA guarde uma view do heap entre chamadas.
 *
 * Todo buffer devolvido pelo núcleo vive no heap do WASM. Qualquer `malloc` do
 * lado C que faça o heap crescer TROCA o ArrayBuffer inteiro, e toda view que o
 * JavaScript tenha guardado passa a apontar para memória detached — leitura
 * silenciosa de zeros, sem erro nenhum. Isso passa em teste pequeno e falha
 * quando o usuário aumenta N, que é a pior hora possível de descobrir.
 *
 * Por isso as views aqui saem sempre de `wasmMemory.buffer`, que é o buffer
 * corrente por definição, e são construídas na hora de cada leitura. Construir
 * uma view é criar um objeto, não copiar dados: continua sendo leitura sem
 * cópia. `wasm/teste_memoria.mjs` verifica as duas metades disso.
 *
 * ===============================================================
 *
 * A ENTRADA É O TEXTO DO spec.json, e só ela. Não existe tabela de parâmetros
 * deste lado: quem interpreta é `dae_spec.c`, exatamente o mesmo parser que o
 * `.cpp` exportado usa sobre exatamente o mesmo texto. A versão anterior desta
 * camada montava um vetor de parâmetros com posições fixas, e foi por essa
 * fresta que os padrões do gerador entraram zerados.
 */
import criarNucleo from './daedalus_core.mjs';

export class Daedalus {
  static async criar() {
    return new Daedalus(await criarNucleo());
  }

  constructor(nucleo) {
    this.n_ = nucleo;
    this.s_ = nucleo._dae_ws_nova();
    if (!this.s_) throw new Error('daedalus: falhou ao criar a sessao');
    this.ncol = nucleo._dae_ws_ncol();
    this.versao = nucleo.UTF8ToString(nucleo._dae_ws_versao());
    this.hashNucleo = nucleo.UTF8ToString(nucleo._dae_ws_hash());
  }

  destruir() {
    if (!this.s_) return;
    this.n_._dae_ws_libera(this.s_);
    this.s_ = 0;
  }

  /* --- as únicas fábricas de view do projeto --- */
  f64_(ptr, len) { return new Float64Array(this.n_.wasmMemory.buffer, ptr, len); }
  f32_(ptr, len) { return new Float32Array(this.n_.wasmMemory.buffer, ptr, len); }
  i32_(ptr, len) { return new Int32Array(this.n_.wasmMemory.buffer, ptr, len); }

  texto_(ptr) { return this.n_.UTF8ToString(ptr); }
  erro_(codigo) { return this.texto_(this.n_._dae_ws_erro_texto(codigo)); }

  /** Carrega o spec.json (texto ou objeto) e prepara a propagação. */
  carregar(spec) {
    const texto = typeof spec === 'string' ? spec : JSON.stringify(spec);
    const bytes = this.n_.lengthBytesUTF8(texto) + 1;
    const p = this.n_._malloc(bytes);
    try {
      this.n_.stringToUTF8(texto, p, bytes);
      const st = this.n_._dae_ws_spec(this.s_, p);
      if (st !== 0) {
        const l = this.n_._dae_ws_json_linha(this.s_);
        const c = this.n_._dae_ws_json_coluna(this.s_);
        const m = this.texto_(this.n_._dae_ws_json_msg(this.s_));
        /* line/col vêm do parser em C — a interface não tem validação própria */
        throw new Error(m ? `spec.json ${l}:${c}: ${m}` : `spec: ${this.erro_(st)}`);
      }
    } finally {
      this.n_._free(p);
    }
    return this.rede();
  }

  /** Valida um spec.json sem mexer na sessão — usado pela reimportação. */
  validar(texto) {
    const bytes = this.n_.lengthBytesUTF8(texto) + 1;
    const p = this.n_._malloc(bytes);
    try {
      this.n_.stringToUTF8(texto, p, bytes);
      const st = this.n_._dae_ws_valida(this.s_, p);
      if (st === 0) return null;
      const l = this.n_._dae_ws_json_linha(this.s_);
      const c = this.n_._dae_ws_json_coluna(this.s_);
      const m = this.texto_(this.n_._dae_ws_json_msg(this.s_));
      return m ? `${l}:${c}: ${m}` : this.erro_(st);
    } finally {
      this.n_._free(p);
    }
  }

  rede() {
    const lo = this.n_._dae_ws_fingerprint_lo(this.s_);
    const hi = this.n_._dae_ws_fingerprint_hi(this.s_);
    return {
      n: this.n_._dae_ws_n(this.s_),
      nnz: this.n_._dae_ws_nnz(this.s_),
      nmod: this.n_._dae_ws_nmod(this.s_),
      nPar: this.n_._dae_ws_npar(this.s_),
      nPerp: this.n_._dae_ws_nperp(this.s_),
      arestasDescartadas: this.n_._dae_ws_descartadas(this.s_),
      religacoesFalhas: this.n_._dae_ws_religa_falhas(this.s_),
      /* 64 bits em dois f64 de 32: um Number não guarda 2^64 sem perder bits, e
         a digital só serve se for exata. */
      fingerprint: (BigInt(hi) << 32n) | BigInt(lo),
      escala: this.n_._dae_ws_escala(this.s_),
      dt: this.n_._dae_ws_dt(this.s_),
      alpha: this.n_._dae_ws_alpha(this.s_),
      lambda2: this.n_._dae_ws_lambda2(this.s_),
      lambda2Residuo: this.n_._dae_ws_lambda2_res(this.s_),
      /* Falso significa LIMITE SUPERIOR, não medida. Ver CONVENTIONS.md 6.5. */
      lambda2Convergiu: !!this.n_._dae_ws_lambda2_ok(this.s_),
      Q: this.n_._dae_ws_Q(this.s_),
      grauMedio: this.n_._dae_ws_grau(this.s_),
      caminhoMedio: this.n_._dae_ws_caminho(this.s_),
      caminhoExato: !!this.n_._dae_ws_caminho_exato(this.s_),
      componentes: this.n_._dae_ws_componentes(this.s_),
      arestas: this.n_._dae_ws_arestas(this.s_),
      nt: this.n_._dae_ws_nt(this.s_),
    };
  }

  /* Avança em blocos: quem chama decide se pede o próximo, e é assim que o
     cancelamento funciona sem callback atravessando a fronteira. */
  avancar(quantos = 1) {
    const feitos = this.n_._dae_ws_avanca(this.s_, quantos);
    if (feitos < 0) {
      throw new Error(`daedalus: propagacao abortou — ${this.erro_(this.n_._dae_ws_erro(this.s_))}`);
    }
    return feitos;
  }

  cursor() { return this.n_._dae_ws_cursor(this.s_); }

  /** JSON canônico do núcleo — o mesmo que entra no CSV e no .cpp exportado. */
  specCanonico() { return this.texto_(this.n_._dae_ws_spec_canonico(this.s_)); }

  /** CSV escrito pelo MESMO `dae_csv` que o nativo e o .cpp exportado usam. */
  csv(incluirEstado = false) { return this.texto_(this.n_._dae_ws_csv(this.s_, incluirEstado ? 1 : 0)); }

  /* --- leituras. Cada uma refaz a view. --- */
  populacao() { return this.f32_(this.n_._dae_ws_pop(this.s_), this.n_._dae_ws_n(this.s_)); }
  posicoes()  { return this.f32_(this.n_._dae_ws_xy(this.s_), 2 * this.n_._dae_ws_n(this.s_)); }
  modulos()   { return this.i32_(this.n_._dae_ws_modulos(this.s_), this.n_._dae_ws_n(this.s_)); }
  series()    { return this.f64_(this.n_._dae_ws_scal(this.s_), this.n_._dae_ws_nt(this.s_) * this.ncol); }
  seriesModulo() {
    return this.f64_(this.n_._dae_ws_pmod(this.s_),
                     this.n_._dae_ws_nt(this.s_) * this.n_._dae_ws_nmod(this.s_));
  }

  /** Lista de arestas explícita (triângulo superior), para os oráculos. */
  arestas() {
    const n = this.n_._dae_ws_n(this.s_);
    const nnz = this.n_._dae_ws_nnz(this.s_);
    const rowptr = this.i32_(this.n_._dae_ws_rowptr(this.s_), n + 1);
    const colind = this.i32_(this.n_._dae_ws_colind(this.s_), nnz);
    const val = this.f64_(this.n_._dae_ws_valores(this.s_), nnz);
    const out = [];
    for (let i = 0; i < n; ++i) {
      for (let p = rowptr[i]; p < rowptr[i + 1]; ++p) {
        if (colind[p] >= i) out.push([i, colind[p], val[p]]);
      }
    }
    return out;
  }
}
