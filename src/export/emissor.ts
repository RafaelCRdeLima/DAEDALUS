/* emissor.ts — spec.json → C++, Wolfram Language, Python.
 *
 * DUAS NATUREZAS, e a diferença é de projeto, não de conveniência:
 *
 *   .cpp   REGENERA tudo. Recebe o núcleo amalgamado e o spec.json, e reconstrói
 *          o grafo a partir da semente. É por isso que ele testa o EMISSOR: se
 *          um parâmetro for serializado errado, o grafo sai diferente e a
 *          impressão digital diverge antes de qualquer observável.
 *
 *   .wl    RECEBEM o grafo como lista de arestas explícita. Reimplementar o
 *   .py    gerador em Wolfram criaria uma segunda implementação do que a
 *          amalgamação existe para manter única — e um oráculo que reproduz o
 *          mesmo engano do gerador não é oráculo. Em troca, o alcance deles é
 *          o PROPAGADOR e a grade de tempo, não o emissor.
 */
import { HASH_NUCLEO, NUCLEO_C, TPL_CPP, TPL_PY, TPL_WL } from './recursos.gerado.ts';

export interface Grafo {
  n: number;
  arestas: Array<[number, number, number]>;   /* 0-indexado, triângulo superior */
  modulos: Int32Array | number[];
  nmod: number;
  escala: number;
  fingerprint?: string | bigint;
}

export interface Spec {
  hamiltonian?: { kind?: string; gamma?: number };
  initial?: { site?: number };
  time?: { t1?: number; nt?: number };
  observables?: { target?: number };
  [k: string]: unknown;
}

function quebrar(t: string, n: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < t.length; i += n) out.push(t.slice(i, i + n));
  return out;
}

/* O bloco de procedência de identity/daedalus-header-banner.txt, em ASCII puro
   de propósito: ele atravessa terminal, e-mail e material suplementar de artigo
   sem depender de codificação. A mesma arte em // para C++, # para Python e
   dentro de (* *) para Wolfram. */
function banner(spec: Spec, g: Grafo | null, specCanonico: string,
                quando: string, fingerprint: string, c: string): string {
  const gen = String((spec.graph as any)?.generator ?? 'edgelist');
  const par = (spec.graph as any)?.params ?? {};
  const resumo = Object.entries(par).map(([k, v]) => `${k}=${v}`).join(' ') || '-';
  const ham = spec.hamiltonian?.kind ?? 'adjacency';
  const norm = (spec.hamiltonian as any)?.normalization ?? 'none';
  const psi0 = spec.initial?.site !== undefined ? `vertice ${spec.initial.site}` : 'vetor';
  const esq = [
    '##############', '#            #', '##########   #', '#        #   #',
    '######   #   #', '#        #   #', '##########   #', '#            #',
    '##############',
  ];
  const dir = [
    `DAEDALUS 0.1.0`,
    `continuous-time quantum walks on graphs`,
    ``,
    `graph      : ${gen} ${resumo}`,
    `vertices   : ${g ? g.n : '?'}   edges : ${g ? g.arestas.length : '?'}`,
    `H          : ${ham} (${norm})`,
    `gamma      : ${spec.hamiltonian?.gamma ?? 1}`,
    `t          : 0 .. ${spec.time?.t1 ?? 0}  (${spec.time?.nt ?? 0} amostras)`,
    `psi(0)     : ${psi0}`,
  ];
  const linhas = esq.map((e, i) => `${c} ${e}   ${dir[i] ?? ''}`.trimEnd());
  const cauda = [
    `${c}                  graph hash : ${fingerprint}`,
    `${c}                  core hash  : ${HASH_NUCLEO}`,
    `${c}                  exported   : ${quando}`,
    `${c}`,
    `${c} spec.json canonico (reproduzir exige o par spec + core hash):`,
    ...quebrar(specCanonico, 74).map((l) => `${c}   ${l}`),
  ];
  return [...linhas, ...cauda].join('\n');
}

/** C++ autocontido: núcleo amalgamado + spec embutido. Sem dependências. */
export function emitirCpp(specCanonico: string, quando: string,
                          g: Grafo | null = null, spec: Spec = {}): string {
  return TPL_CPP
    .replace('/*__DAE_BANNER__*/', banner(spec, g, specCanonico, quando, fp(g), '//'))
    .replace('/*__DAE_CORE__*/', NUCLEO_C)
    .replace('/*__DAE_SPEC__*/', specCanonico)
    .replace(/__ARQUIVO__/g, 'daedalus_run.cpp');
}

const num = (x: number) => (Number.isFinite(x) ? String(x) : '0');
const fp = (g: Grafo | null) => (g && g.fingerprint !== undefined ? String(g.fingerprint) : '?');

export function emitirWolfram(spec: Spec, g: Grafo, specCanonico: string, quando: string): string {
  const sitio = (spec.initial?.site ?? 0) + 1;                 /* 1-indexado */
  const alvoC = spec.observables?.target ?? -1;
  return TPL_WL
    .replace('(*__DAE_BANNER__*)', '(*\n' + banner(spec, g, specCanonico, quando, fp(g), '  ') + '\n*)')
    .replace('(*__DAE_N__*)', String(g.n))
    .replace('(*__DAE_ARESTAS__*)',
             '{' + g.arestas.map(([i, j, w]) => `{${i + 1},${j + 1},${w}}`).join(',') + '}')
    .replace('(*__DAE_HAM__*)', spec.hamiltonian?.kind ?? 'adjacency')
    .replace('(*__DAE_GAMMA__*)', num(spec.hamiltonian?.gamma ?? 1))
    .replace('(*__DAE_ESCALA__*)', num(g.escala))
    .replace('(*__DAE_SITIO__*)', String(sitio))
    .replace('(*__DAE_ALVO__*)', String(alvoC >= 0 ? alvoC + 1 : 0))
    .replace('(*__DAE_T1__*)', num(spec.time?.t1 ?? 50))
    .replace('(*__DAE_NT__*)', String(spec.time?.nt ?? 500))
    .replace('(*__DAE_MODULOS__*)', '{' + Array.from(g.modulos, (m) => m + 1).join(',') + '}')
    .replace('(*__DAE_NMOD__*)', String(g.nmod))
    .replace('(*__DAE_HASH__*)', HASH_NUCLEO)
    .replace('(*__DAE_SPEC_LINHA__*)', specCanonico)
    .replace(/__ARQUIVO__/g, 'daedalus_oraculo.wl');
}

export function emitirPython(spec: Spec, g: Grafo, specCanonico: string, quando: string): string {
  return TPL_PY
    .replace('#__DAE_BANNER_PY__', banner(spec, g, specCanonico, quando, fp(g), '#'))
    .replace('__DAE_N__', String(g.n))
    .replace('__DAE_ARESTAS__',
             '[' + g.arestas.map(([i, j, w]) => `[${i},${j},${w}]`).join(',') + ']')
    .replace('__DAE_HAM__', spec.hamiltonian?.kind ?? 'adjacency')
    .replace('__DAE_GAMMA__', num(spec.hamiltonian?.gamma ?? 1))
    .replace('__DAE_ESCALA__', num(g.escala))
    .replace('__DAE_SITIO__', String(spec.initial?.site ?? 0))
    .replace('__DAE_ALVO__', String(spec.observables?.target ?? -1))
    .replace('__DAE_T1__', num(spec.time?.t1 ?? 50))
    .replace('__DAE_NT__', String(spec.time?.nt ?? 500))
    .replace('__DAE_MODULOS__', '[' + Array.from(g.modulos).join(',') + ']')
    .replace('__DAE_NMOD__', String(g.nmod))
    .replace('__DAE_HASH__', HASH_NUCLEO)
    .replace('__DAE_SPEC_LINHA__', specCanonico)
    .replace(/__ARQUIVO__/g, 'daedalus_oraculo.py');
}
