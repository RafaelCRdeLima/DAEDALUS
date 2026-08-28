/* daedalus.worker.ts — o núcleo roda aqui; a interface nunca bloqueia.
 *
 * A entrada é o TEXTO do spec.json — o mesmo que o .cpp exportado embute. A
 * propagação avança em BLOCOS e o worker volta ao laço de eventos entre eles:
 * é assim que "cancelar" funciona sem callback atravessando a fronteira do
 * WASM. O que sai daqui é sempre CÓPIA (`slice()`): uma view do heap do WASM
 * não sobrevive a um postMessage nem ao crescimento do heap.
 */
import { emitirCpp, emitirPython, emitirWolfram } from '../export/emissor.ts';
import { Daedalus } from '../../wasm/build/daedalus.mjs';

let dae: any = null;
let cancelado = false;

async function garante() {
  if (!dae) dae = await Daedalus.criar();
  return dae;
}

self.onmessage = async (ev: MessageEvent) => {
  const msg = ev.data;
  try {
    switch (msg.tipo) {
      case 'carregar': {
        const d = await garante();
        const rede = d.carregar(msg.spec);
        self.postMessage({
          tipo: 'rede', rede,
          xy: d.posicoes().slice(), modulos: d.modulos().slice(),
          pop: d.populacao().slice(), canonico: d.specCanonico(),
          versao: d.versao, hashNucleo: d.hashNucleo,
        });
        break;
      }
      case 'propagar': {
        const d = await garante();
        cancelado = false;
        const nt = d.rede().nt;
        const bloco = Math.max(1, Math.min(25, Math.ceil(nt / 40)));
        while (d.cursor() < nt && !cancelado) {
          d.avancar(bloco);
          self.postMessage({ tipo: 'quadro', cursor: d.cursor(), nt, pop: d.populacao().slice() });
          await new Promise((r) => setTimeout(r, 0));
        }
        self.postMessage({
          tipo: cancelado ? 'cancelado' : 'pronto',
          series: d.series().slice(), seriesModulo: d.seriesModulo().slice(),
        });
        break;
      }
      case 'cancelar':
        cancelado = true;
        break;
      case 'exportar': {
        const d = await garante();
        const canonico = d.specCanonico();
        const rede = d.rede();
        const quando = new Date().toISOString();
        const grafo = {
          n: rede.n as number,
          arestas: d.arestas() as Array<[number, number, number]>,
          modulos: Array.from(d.modulos()) as number[],
          nmod: rede.nmod as number,
          escala: rede.escala as number,
          fingerprint: String(rede.fingerprint),
        };
        const spec = JSON.parse(msg.spec);
        const texto = msg.alvo === 'cpp' ? emitirCpp(canonico, quando, grafo, spec)
                    : msg.alvo === 'wl' ? emitirWolfram(spec, grafo, canonico, quando)
                    : emitirPython(spec, grafo, canonico, quando);
        self.postMessage({ tipo: 'exportado', alvo: msg.alvo, texto });
        break;
      }
      case 'csv': {
        const d = await garante();
        self.postMessage({ tipo: 'csv', texto: d.csv(true) });
        break;
      }
      default:
        self.postMessage({ tipo: 'erro', mensagem: `tipo desconhecido: ${msg.tipo}` });
    }
  } catch (e: any) {
    self.postMessage({ tipo: 'erro', mensagem: String(e?.message ?? e) });
  }
};
