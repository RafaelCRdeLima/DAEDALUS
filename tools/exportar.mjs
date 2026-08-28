#!/usr/bin/env node
/* exportar.mjs — spec.json → arquivo autocontido.
 *
 * Usa o MESMO módulo emissor que o navegador (src/export/emissor.ts) e o MESMO
 * núcleo WASM para montar o grafo. Não há caminho de exportação alternativo do
 * lado do Node.
 *
 * Uso: node tools/exportar.mjs <spec.json> <cpp|wl|py> <saida>
 */
import { readFileSync, writeFileSync } from 'node:fs';

const [, , caminhoSpec, alvo, saida] = process.argv;
if (!caminhoSpec || !alvo || !saida) {
  console.error('uso: exportar.mjs <spec.json> <cpp|wl|py> <saida>');
  process.exit(2);
}

const { Daedalus } = await import('../wasm/build/daedalus.mjs');
const { emitirCpp, emitirPython, emitirWolfram } = await import('../src/export/emissor.ts');

const texto = readFileSync(caminhoSpec, 'utf8');
const d = await Daedalus.criar();
const rede = d.carregar(texto);
const canonico = d.specCanonico();
const spec = JSON.parse(texto);
/* Data fixa quando DAE_DATA está definida: o teste 7 compara arquivos gerados
   em momentos diferentes, e a data é informativa, não reprodutiva. */
const quando = process.env.DAE_DATA ?? new Date().toISOString();

const grafo = {
  n: rede.n,
  arestas: d.arestas(),
  modulos: Array.from(d.modulos()),
  nmod: rede.nmod,
  escala: rede.escala,
};

let out;
if (alvo === 'cpp') out = emitirCpp(canonico, quando);
else if (alvo === 'wl') out = emitirWolfram(spec, grafo, canonico, quando);
else if (alvo === 'py') out = emitirPython(spec, grafo, canonico, quando);
else { console.error(`alvo desconhecido: ${alvo}`); process.exit(2); }

writeFileSync(saida, out);
console.error(`  ${alvo}: ${(out.length / 1024).toFixed(0)} KB -> ${saida}` +
              `   (n=${rede.n}, digital=${rede.fingerprint}, alpha=${rede.alpha.toFixed(4)})`);
