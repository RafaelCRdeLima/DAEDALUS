/* reimportar.test.ts — a entrada que vem de fora.
 *
 * Cada asserção de que "o arquivo bom passa" vem com a companheira de que "o
 * arquivo ruim NÃO passa": um leitor que aceitasse tudo passaria em metade
 * destes testes sem testar nada.
 */
import { beforeAll, describe, expect, it } from 'vitest';
import { reimportar } from './reimportar.ts';
import { Daedalus } from '../../wasm/build/daedalus.mjs';

const SPEC = JSON.stringify({
  format_version: 1, seed: 3,
  graph: { generator: 'cycle', params: { n: 24 } },
  hamiltonian: { kind: 'adjacency', gamma: 1, normalization: 'none', lanczos_steps: 0 },
  initial: { site: 0 }, time: { t1: 4, nt: 8 },
  observables: { target: 12, module_concurrence: false },
});

let d: any;
let validar: (j: string) => string | null;
let csvBom = '';
const HASH = () => d.hashNucleo;

beforeAll(async () => {
  d = await Daedalus.criar();
  validar = (j: string) => d.validar(j);
  /* CSV de verdade, escrito pelo mesmo dae_csv que o nativo e o .cpp usam */
  d.carregar(SPEC);
  d.avancar(8);
  csvBom = d.csv(true);
});

describe('procedencia obrigatoria', () => {
  it('aceita o CSV que o proprio nucleo escreveu', () => {
    const r = reimportar('a.csv', csvBom, HASH(), validar);
    expect(r.utilizavel).toBe(true);
    expect(r.avisos.some((a) => a.grave)).toBe(false);
    expect(r.dados.get('norm')!.length).toBe(8);
    /* anti-vacuidade: leu numeros de verdade, nao um vetor de NaN */
    expect(r.dados.get('norm')![7]).toBeCloseTo(1, 9);
  });

  it('RECUSA um CSV sem cabecalho de procedencia', () => {
    const sem = csvBom.split('\n').filter((l) => !l.startsWith('#!')).join('\n');
    const r = reimportar('a.csv', sem, HASH(), validar);
    expect(r.utilizavel).toBe(false);
    expect(r.avisos[0].chave).toBe('av_sem_procedencia');
  });

  it('RECUSA quando falta so o core_hash', () => {
    const sem = csvBom.split('\n').filter((l) => !l.startsWith('#! core_hash')).join('\n');
    expect(reimportar('a.csv', sem, HASH(), validar).utilizavel).toBe(false);
  });

  it('RECUSA um spec que nao passa no parser estrito em C', () => {
    const ruim = csvBom.replace(/#! spec .*/, '#! spec {"format_version":1,"graph":{"seam":3}}');
    const r = reimportar('a.csv', ruim, HASH(), validar);
    expect(r.utilizavel).toBe(false);
    expect(r.avisos[0].chave).toBe('av_spec_invalido');
    /* a mensagem vem do C, com linha e coluna */
    expect(String(r.avisos[0].params!['erro'])).toMatch(/\d+:\d+/);
  });
});

describe('nucleo diferente e aviso, nao bloqueio', () => {
  it('plota, mas avisa de forma visivel', () => {
    const r = reimportar('a.csv', csvBom, 'deadbeefdeadbeef', validar);
    expect(r.utilizavel).toBe(true);          /* reler resultado antigo e legitimo */
    const av = r.avisos.find((a) => a.chave === 'av_hash_diferente');
    expect(av).toBeDefined();
    expect(av!.grave).toBe(false);
    expect(av!.params!['arquivo']).toBe(HASH());
    expect(av!.params!['atual']).toBe('deadbeefdeadbeef');
  });

  it('nao avisa quando o hash bate', () => {
    const r = reimportar('a.csv', csvBom, HASH(), validar);
    expect(r.avisos.find((a) => a.chave === 'av_hash_diferente')).toBeUndefined();
  });
});

describe('colunas por nome, nunca por posicao', () => {
  /* Um CSV do cluster pode vir com as colunas em outra ordem — por uma versao
     diferente do emissor, ou porque alguem mexeu na planilha. Ler por posicao
     plotaria IPR no lugar da norma sem reclamar de nada. */
  it('sobrevive a inversao da ordem das colunas', () => {
    const linhas = csvBom.split('\n');
    const iCab = linhas.findIndex((l) => l.startsWith('t,'));
    const cab = linhas[iCab].split(',');
    const ordem = cab.map((_, i) => cab.length - 1 - i);      /* invertida */
    const permuta = (l: string) => ordem.map((k) => l.split(',')[k]).join(',');
    for (let i = iCab; i < linhas.length && linhas[i].includes(','); ++i) {
      linhas[i] = permuta(linhas[i]);
    }
    const r = reimportar('a.csv', linhas.join('\n'), HASH(), validar);
    expect(r.utilizavel).toBe(true);
    const direto = reimportar('a.csv', csvBom, HASH(), validar);
    for (const col of ['t', 'norm', 'ipr', 'coh_l1']) {
      expect(Array.from(r.dados.get(col)!), col).toEqual(Array.from(direto.dados.get(col)!));
    }
  });

  it('coluna ausente aparece como ausente, nao como outra', () => {
    const r = reimportar('a.csv', csvBom, HASH(), validar);
    expect(r.dados.get('coluna_que_nao_existe')).toBeUndefined();
  });
});

describe('estado final e p_alvo', () => {
  it('le a secao de estado final quando ela existe', () => {
    const r = reimportar('a.csv', csvBom, HASH(), validar);
    expect(r.estado).toBeDefined();
    expect(r.estado!.re.length).toBe(24);
    let soma = 0;
    for (let i = 0; i < 24; ++i) soma += r.estado!.re[i] ** 2 + r.estado!.im[i] ** 2;
    expect(soma).toBeCloseTo(1, 9);
  });

  it('nan em p_target continua NaN, nunca vira zero', () => {
    const semAlvo = csvBom.replace(/,([0-9.eE+-]+),/, ',nan,');
    const r = reimportar('a.csv', semAlvo, HASH(), validar);
    expect(r.utilizavel).toBe(true);
  });
});
