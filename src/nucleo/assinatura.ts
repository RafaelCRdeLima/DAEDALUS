/* assinatura.ts — resumo posicional de um buffer de textura.
 *
 * Um instantâneo congelado só serve se for SENSÍVEL ao que ele deveria vigiar.
 * A primeira versão deste arquivo usava um único número, `soma de (i+1)*t[i]`,
 * que é o primeiro momento — ou seja, o CENTROIDE. Para qualquer distribuição
 * simétrica em torno da origem ele vale exatamente o índice de origem, esteja
 * o pacote espalhado ou completamente parado. Congelar aquilo era congelar uma
 * quantidade cega justamente ao que o teste existe para pegar.
 *
 * Aqui a assinatura são grandezas com significado, cada uma com o seu papel:
 * os centroides pegam transposição e off-by-one, as variâncias pegam pacote
 * parado, e o pico pega deslocamento de origem.
 *
 * E são CONJUNTAS, não marginais. Isto custou duas tentativas erradas:
 *
 *   1. média e variância lineares em `q` — sem sentido num eixo periódico
 *      assim que o pacote dá a volta;
 *   2. estatística circular em `q` — correta, e ainda assim cega: saturou
 *      idêntica para seam_shift 0 e 3 (8 dígitos iguais).
 *
 * O motivo é físico: a costura ACOPLA m e q, ligando (m, N⊥-1) a (m+s, 0).
 * Marginalizar sobre m destrói exatamente a informação que ela cria. Por isso
 * a assinatura é o perfil longitudinal POR PROTOFILAMENTO: com costura, cada
 * anel vê massa chegar deslocada em m, e o perfil deixa de ser uniforme.
 */
export interface Assinatura {
  soma: number;
  centroM: number;          /* eixo longitudinal, global               */
  varM: number;
  centroPorLinha: number[]; /* centroide longitudinal de cada anel     */
  massaPorLinha: number[];  /* fração da população em cada anel        */
  maxValor: number; maxM: number; maxQ: number;
}

export function assinatura(tex: Float32Array, largura: number, altura: number): Assinatura {
  let soma = 0, sm = 0, smm = 0;
  let maxValor = -Infinity, maxM = -1, maxQ = -1;
  const linhaSm = new Array<number>(altura).fill(0);
  const linhaMassa = new Array<number>(altura).fill(0);
  for (let q = 0; q < altura; ++q) {
    for (let m = 0; m < largura; ++m) {
      const v = tex[q * largura + m];
      if (!(v >= 0)) continue;
      soma += v;
      sm += m * v; smm += m * m * v;
      linhaSm[q] += m * v; linhaMassa[q] += v;
      if (v > maxValor) { maxValor = v; maxM = m; maxQ = q; }
    }
  }
  const centroM = soma > 0 ? sm / soma : 0;
  return {
    soma, centroM,
    varM: soma > 0 ? smm / soma - centroM * centroM : 0,
    centroPorLinha: linhaSm.map((v, q) => (linhaMassa[q] > 0 ? v / linhaMassa[q] : 0)),
    massaPorLinha: linhaMassa.map((v) => (soma > 0 ? v / soma : 0)),
    maxValor, maxM, maxQ,
  };
}
