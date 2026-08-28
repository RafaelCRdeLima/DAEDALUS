#!/usr/bin/env node
/* fumaca.mjs — o aplicativo abre, propaga e DESENHA?
 *
 * Os testes de fixture garantem que os números e o mapeamento estão certos.
 * Este garante que a figura existe: mede se o canvas tem pixels não-pretos.
 * Sem essa checagem, um mapa preto com séries corretas passa despercebido —
 * foi exatamente o que aconteceu, e a causa era um closure velho no React, não
 * WebGL nem física.
 *
 * ALCANCE, para ninguém confiar demais: ele verifica que a figura FINAL existe
 * e que a norma se conservou. Não verifica a animação quadro a quadro — se só
 * o desenho por quadro quebrasse, o mapa ficaria parado até o fim da
 * propagação e este teste ainda passaria. Quem garante o CONTEÚDO da figura
 * são as fixtures de src/nucleo/indices.test.ts, não este arquivo.
 */
import { spawn } from 'node:child_process';

const ALVO = process.argv[2] ?? 'http://localhost:4173/';

const EXPR = `(() => {
  const f = document.querySelector('footer')?.innerText ?? '';
  if (!/pronto/.test(f)) return false;
  /* O rodape mostra o desvio da norma como (Δ x): e o diagnostico permanente
     de CONVENTIONS.md 10.3, e o teste le exatamente o que o usuario le. */
  const m = f.match(/Δ ([0-9.eE+-]+)/);
  if (!m) return 'FALHA: rodape sem diagnostico de norma';
  const desvio = Number(m[1]);
  if (!(desvio < 1e-9)) return 'FALHA: |1-norma| = ' + m[1];
  const c = document.querySelector('canvas');
  if (!c) return 'FALHA: sem canvas';
  const gl = c.getContext('webgl2');
  if (!gl) return 'FALHA: sem contexto webgl2';
  const L = 96, px = new Uint8Array(4 * L * L);
  gl.readPixels(0, 0, L, L, gl.RGBA, gl.UNSIGNED_BYTE, px);
  let vivos = 0;
  for (let i = 0; i < px.length; i += 4) if (px[i] + px[i+1] + px[i+2] > 40) ++vivos;
  const frac = vivos / (L * L);
  if (frac < 0.5) return 'FALHA: mapa quase preto (' + (100*frac).toFixed(1) + '% de pixels vivos)';
  return 'ok  |1-norma|=' + m[1] + '  pixels vivos=' + (100*frac).toFixed(1) + '%';
})()`;

/* O navegador considera "pronto" qualquer valor verdadeiro, e "FALHA: ..." é
   uma string verdadeira — o processo saía com codigo 0 anunciando a falha. O
   veredito tem de ser lido, nao herdado. */
const p = spawn(process.execPath, [
  new URL('navegador.mjs', import.meta.url).pathname, ALVO, EXPR,
], { stdio: ['ignore', 'pipe', 'inherit'] });

let saida = '';
p.stdout.on('data', (b) => { saida += b; process.stdout.write(b); });
p.on('exit', (codigo) => {
  const ok = codigo === 0 && /PRONTO: "ok/.test(saida);
  if (!ok) console.error('  fumaca: FALHOU');
  process.exit(ok ? 0 : 1);
});
