/* nuvem.ts — vértices como pontos, para grafos sem geometria própria.
 *
 * O layout vem do núcleo (autovetores 2 e 3 da laplaciana). Aqui só se desenha,
 * e a única regra é NORMALIZAR PARA A CAIXA: as coordenadas cruas do embedding
 * têm escala arbitrária, e sem isso a nuvem ocuparia uma fração do canvas.
 *
 * A escala é UNIFORME nos dois eixos, não uma por eixo. Esticar x e y de forma
 * independente encheria a caixa por completo, mas faria a distância no plano
 * mentir — e o ponto do embedding espectral é justamente que distância ali
 * significa alguma coisa. Com escala uniforme, o eixo limitante encosta na
 * margem e o outro fica centrado.
 *
 * O raio do vértice também codifica |ψ_j|², redundância deliberada para leitura
 * sem cor (identity/README.md).
 */
import { lut } from '../nucleo/paleta';

const VS = `#version 300 es
in vec2 aPos;
in float aVal;
uniform vec2 uEscala;
uniform vec2 uCentro;
uniform float uMax;
uniform float uRaio;
out float vT;
void main() {
  vec2 p = (aPos - uCentro) * uEscala;
  gl_Position = vec4(p.x, -p.y, 0.0, 1.0);
  vT = uMax > 0.0 ? clamp(aVal / uMax, 0.0, 1.0) : 0.0;
  /* raio cresce com a raiz da probabilidade: a ÁREA fica proporcional a ela */
  gl_PointSize = uRaio * (0.55 + 1.35 * sqrt(vT));
}`;

const FS = `#version 300 es
precision highp float;
uniform sampler2D uLut;
in float vT;
out vec4 cor;
void main() {
  vec2 d = gl_PointCoord - vec2(0.5);
  float r = length(d);
  if (r > 0.5) discard;                       /* ponto redondo, não quadrado */
  float borda = smoothstep(0.5, 0.42, r);
  cor = vec4(texture(uLut, vec2(vT, 0.5)).rgb, borda);
}`;

const VS_ARESTA = `#version 300 es
in vec2 aPos;
uniform vec2 uEscala;
uniform vec2 uCentro;
void main() {
  vec2 p = (aPos - uCentro) * uEscala;
  gl_Position = vec4(p.x, -p.y, 0.0, 1.0);
}`;

const FS_ARESTA = `#version 300 es
precision highp float;
out vec4 cor;
/* Alfa muito baixo de propósito: com ~10 mil arestas sobrepostas, 0.10 satura
   em branco e a estrutura vira névoa. O tom é o cinza-cera da identidade, não
   o mármore — as arestas são contexto, não conteúdo. */
void main() { cor = vec4(0.486, 0.533, 0.573, 0.055); }`;

function programa(gl: WebGL2RenderingContext, vs: string, fs: string): WebGLProgram {
  const compilar = (tipo: number, fonte: string) => {
    const s = gl.createShader(tipo)!;
    gl.shaderSource(s, fonte);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(`shader: ${gl.getShaderInfoLog(s)}`);
    return s;
  };
  const p = gl.createProgram()!;
  gl.attachShader(p, compilar(gl.VERTEX_SHADER, vs));
  gl.attachShader(p, compilar(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(`programa: ${gl.getProgramInfoLog(p)}`);
  return p;
}

/** Acima disto as arestas viram uma mancha e custam caro; só os vértices. */
export const MAX_ARESTAS_DESENHADAS = 2000;

export class Nuvem {
  private gl: WebGL2RenderingContext;
  private progPto: WebGLProgram;
  private progAre: WebGLProgram;
  private bufPos: WebGLBuffer;
  private bufVal: WebGLBuffer;
  private bufAre: WebGLBuffer;
  private texLut: WebGLTexture;
  private nAre = 0;
  private n = 0;
  private centro: [number, number] = [0, 0];
  private meia: [number, number] = [1, 1];
  private posicoes: Float32Array = new Float32Array(0);

  constructor(private canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl2',
      { antialias: true, alpha: false, preserveDrawingBuffer: true });
    if (!gl) throw new Error('WebGL2 indisponivel neste navegador');
    this.gl = gl;
    this.progPto = programa(gl, VS, FS);
    this.progAre = programa(gl, VS_ARESTA, FS_ARESTA);
    this.bufPos = gl.createBuffer()!;
    this.bufVal = gl.createBuffer()!;
    this.bufAre = gl.createBuffer()!;
    this.texLut = gl.createTexture()!;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texLut);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB8, 256, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, lut(256));
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  /** Recebe o layout e a topologia. Chamar quando o grafo muda, não por quadro.
   *  `arestas` é a mesma lista que o exportador usa — não uma segunda travessia
   *  da CSR aqui dentro. */
  rede(xy: Float32Array, n: number, arestas?: Array<[number, number, number]> | null) {
    const gl = this.gl;
    this.n = n;
    this.posicoes = xy;

    let xlo = Infinity, xhi = -Infinity, ylo = Infinity, yhi = -Infinity;
    for (let i = 0; i < n; ++i) {
      const x = xy[2 * i], y = xy[2 * i + 1];
      if (x < xlo) xlo = x; if (x > xhi) xhi = x;
      if (y < ylo) ylo = y; if (y > yhi) yhi = y;
    }
    if (!Number.isFinite(xlo)) { xlo = ylo = 0; xhi = yhi = 1; }
    this.centro = [(xlo + xhi) / 2, (ylo + yhi) / 2];
    this.meia = [Math.max((xhi - xlo) / 2, 1e-9), Math.max((yhi - ylo) / 2, 1e-9)];

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, xy, gl.STATIC_DRAW);

    this.nAre = 0;
    if (arestas && n <= MAX_ARESTAS_DESENHADAS) {
      const linhas: number[] = [];
      for (const [i, j] of arestas) {
        if (i === j) continue;
        linhas.push(xy[2 * i], xy[2 * i + 1], xy[2 * j], xy[2 * j + 1]);
      }
      this.nAre = linhas.length / 2;
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufAre);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(linhas), gl.STATIC_DRAW);
    }
  }

  desenhar(valores: Float32Array, max: number) {
    const gl = this.gl;
    const cw = this.canvas.clientWidth || 1, ch = this.canvas.clientHeight || 1;
    const dpr = Math.min(2, globalThis.devicePixelRatio || 1);
    if (this.canvas.width !== Math.round(cw * dpr) || this.canvas.height !== Math.round(ch * dpr)) {
      this.canvas.width = Math.round(cw * dpr);
      this.canvas.height = Math.round(ch * dpr);
    }
    const L = this.canvas.width, A = this.canvas.height;
    gl.viewport(0, 0, L, A);
    gl.clearColor(0.063, 0.102, 0.141, 1);      /* --dd-ink */
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (this.n === 0) return;

    /* Margem FIXA em pixels, escala UNIFORME: o eixo limitante encosta na
       margem e o outro fica centrado. Ver o cabeçalho deste arquivo. */
    const margem = 18 * dpr;
    const k = Math.min((L / 2 - margem) / this.meia[0], (A / 2 - margem) / this.meia[1]);
    const escala: [number, number] = [(2 * k) / L, (2 * k) / A];

    if (this.nAre > 0) {
      gl.useProgram(this.progAre);
      gl.uniform2f(gl.getUniformLocation(this.progAre, 'uEscala'), escala[0], escala[1]);
      gl.uniform2f(gl.getUniformLocation(this.progAre, 'uCentro'), this.centro[0], this.centro[1]);
      const a = gl.getAttribLocation(this.progAre, 'aPos');
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufAre);
      gl.enableVertexAttribArray(a);
      gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.LINES, 0, this.nAre);
    }

    gl.useProgram(this.progPto);
    gl.uniform2f(gl.getUniformLocation(this.progPto, 'uEscala'), escala[0], escala[1]);
    gl.uniform2f(gl.getUniformLocation(this.progPto, 'uCentro'), this.centro[0], this.centro[1]);
    gl.uniform1f(gl.getUniformLocation(this.progPto, 'uMax'), max);
    gl.uniform1f(gl.getUniformLocation(this.progPto, 'uRaio'),
                 Math.max(3, Math.min(16, 340 / Math.sqrt(this.n))) * dpr);
    gl.uniform1i(gl.getUniformLocation(this.progPto, 'uLut'), 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texLut);

    const aPos = gl.getAttribLocation(this.progPto, 'aPos');
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const aVal = gl.getAttribLocation(this.progPto, 'aVal');
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufVal);
    gl.bufferData(gl.ARRAY_BUFFER, valores, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(aVal);
    gl.vertexAttribPointer(aVal, 1, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.POINTS, 0, this.n);
  }

  /** Vértice mais próximo do clique, ou -1. */
  sitioNoEvento(ev: { clientX: number; clientY: number }): number {
    const r = this.canvas.getBoundingClientRect();
    const dpr = Math.min(2, globalThis.devicePixelRatio || 1);
    const L = this.canvas.width, A = this.canvas.height;
    const px = ((ev.clientX - r.left) / r.width) * L;
    const py = ((ev.clientY - r.top) / r.height) * A;
    const margem = 18 * dpr;
    const k = Math.min((L / 2 - margem) / this.meia[0], (A / 2 - margem) / this.meia[1]);
    let melhor = -1, dist = Infinity;
    for (let i = 0; i < this.n; ++i) {
      const x = L / 2 + (this.posicoes[2 * i] - this.centro[0]) * k;
      const y = A / 2 + (this.posicoes[2 * i + 1] - this.centro[1]) * k;
      const d = (x - px) ** 2 + (y - py) ** 2;
      if (d < dist) { dist = d; melhor = i; }
    }
    return dist < (28 * dpr) ** 2 ? melhor : -1;
  }
}
