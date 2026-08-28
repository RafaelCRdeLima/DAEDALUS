import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Heatmap } from '../gl/heatmap';
import { empacotarLattice, empacotarTira, formaDaTira, sitioNoTexel } from '../nucleo/indices';
import { gradienteCss } from '../nucleo/paleta';
import { Series } from './Series';

const GERADORES: Array<[string, string]> = [
  ['microtubule', 'microtúbulo'], ['sbm', 'blocos estocásticos'],
  ['path', 'linha'], ['cycle', 'ciclo'], ['grid2d', 'grade 2D'],
  ['hypercube', 'hipercubo'], ['complete', 'completo'],
];

/* Teto de quadros guardados para o scrub. Acima disso a animação segue ao vivo,
   sem voltar no tempo — e a interface diz isso em vez de comer memória calada. */
const TETO_QUADROS = 6_000_000;

interface Rede {
  n: number; nnz: number; nmod: number; nPar: number; nPerp: number;
  arestasDescartadas: number; religacoesFalhas: number; fingerprint: bigint;
  escala: number; dt: number; alpha: number;
  lambda2: number; lambda2Residuo: number; lambda2Convergiu: boolean;
  Q: number; grauMedio: number; caminhoMedio: number; caminhoExato: boolean;
  componentes: number; arestas: number; nt: number;
}

function baixar(nome: string, texto: string) {
  const url = URL.createObjectURL(new Blob([texto], { type: 'text/plain' }));
  const a = document.createElement('a');
  a.href = url; a.download = nome;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heatRef = useRef<Heatmap | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const quadrosRef = useRef<Float32Array[]>([]);
  const desenharRef = useRef<(p: Float32Array) => void>(() => {});
  const redeRef = useRef<Rede | null>(null);
  const primeira = useRef(true);

  const [gerador, setGerador] = useState('microtubule');
  const [nPar, setNPar] = useState(160);
  const [nPerp, setNPerp] = useState(13);
  const [seam, setSeam] = useState(3);
  const [fechado, setFechado] = useState(false);
  const [modulos, setModulos] = useState(8);
  const [jPar] = useState(1);
  const [jPerp, setJPerp] = useState(1);
  const [wsP, setWsP] = useState(0);
  const [religar, setReligar] = useState(true);
  const [semente, setSemente] = useState(2026);
  const [pIn, setPIn] = useState(0.3);
  const [pOut, setPOut] = useState(0.01);
  const [nGen, setNGen] = useState(400);

  const [ham, setHam] = useState('adjacency');
  const [gamma, setGamma] = useState(1);
  const [norm, setNorm] = useState('spectral');
  const [t1, setT1] = useState(80);
  const [nt, setNt] = useState(400);
  const [sitio, setSitio] = useState(0);
  const [alvo, setAlvo] = useState(-1);
  const [modoClique, setModoClique] = useState<'inicial' | 'alvo'>('inicial');

  const [rede, setRede] = useState<Rede | null>(null);
  const [versao, setVersao] = useState('');
  const [series, setSeries] = useState<Float64Array | null>(null);
  const [cursor, setCursor] = useState(0);
  const [total, setTotal] = useState(0);
  const [rodando, setRodando] = useState(false);
  const [tocando, setTocando] = useState(false);
  const [temScrub, setTemScrub] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [fase, setFase] = useState('iniciando');
  const [autoPropagar, setAutoPropagar] = useState(false);
  const [escalaFixa, setEscalaFixa] = useState(false);

  /* O spec.json É a interface: a mesma moeda que o WASM lê, que o CSV carrega e
     que o .cpp exportado embute. Não existe caminho paralelo de parâmetros. */
  const spec = useMemo(() => {
    const params: Record<string, unknown> =
      gerador === 'microtubule'
        ? { n_par: nPar, n_perp: nPerp, seam_shift: seam, longitudinal_closed: fechado,
            j_par: jPar, j_perp: jPerp, n_modules: modulos,
            ws_p: wsP, conn_mode: religar ? 'rewire' : 'add' }
        : gerador === 'sbm'
        ? { n: nGen, n_modules: modulos, p_in: pIn, p_out: pOut,
            ws_p: wsP, conn_mode: religar ? 'rewire' : 'add' }
        : gerador === 'grid2d'
        ? { rows: 20, cols: 20, ws_p: wsP, conn_mode: religar ? 'rewire' : 'add' }
        : gerador === 'hypercube'
        ? { dim: 9, ws_p: wsP, conn_mode: religar ? 'rewire' : 'add' }
        : { n: nGen, ws_p: wsP, conn_mode: religar ? 'rewire' : 'add' };
    return {
      format_version: 1, seed: semente,
      graph: { generator: gerador, params },
      hamiltonian: { kind: ham, gamma, normalization: norm, lanczos_steps: 40 },
      initial: { site: sitio },
      time: { t1, nt },
      observables: { target: alvo, population: false, module_concurrence: true, pop_stride: 1 },
      realizations: 1,
    };
  }, [gerador, nPar, nPerp, seam, fechado, jPar, jPerp, modulos, wsP, religar,
      semente, pIn, pOut, nGen, ham, gamma, norm, t1, nt, sitio, alvo]);

  const forma = useMemo(() => {
    if (!rede) return { largura: 1, altura: 1, ehLattice: false };
    if (rede.nPerp > 0) return { largura: rede.nPar, altura: rede.nPerp, ehLattice: true };
    const t = formaDaTira(rede.n);
    return { largura: t.largura, altura: t.altura, ehLattice: false };
  }, [rede]);

  const [maxQuadro, setMaxQuadro] = useState(0);
  const desenhar = useCallback((pop: Float32Array) => {
    const h = heatRef.current;
    if (!h || !rede) return;
    const tex = forma.ehLattice
      ? empacotarLattice(pop, forma.largura, forma.altura)
      : empacotarTira(pop, forma.largura, forma.altura);
    let max = 0;
    for (let i = 0; i < tex.length; ++i) if (tex[i] > max) max = tex[i];
    const usado = escalaFixa ? Math.min(1, 8 / rede.n) : max;
    setMaxQuadro(usado);
    h.desenhar(tex, forma.largura, forma.altura, usado);
  }, [forma, rede, escalaFixa]);
  desenharRef.current = desenhar;

  useEffect(() => {
    if (canvasRef.current && !heatRef.current) {
      try { heatRef.current = new Heatmap(canvasRef.current); }
      catch (e: any) { setErro(String(e?.message ?? e)); }
    }
  }, []);

  const worker = useCallback(() => {
    if (!workerRef.current) {
      const w = new Worker(new URL('../nucleo/daedalus.worker.ts', import.meta.url),
                           { type: 'module' });
      /* Erro na CARGA do módulo acontece antes de qualquer onmessage e não vira
         mensagem: sem isto o worker morre e a interface espera para sempre. */
      w.onerror = (ev: ErrorEvent) => {
        setErro(`worker falhou ao carregar: ${ev.message || 'erro desconhecido'}`);
        setRodando(false);
      };
      w.onmessage = (ev) => {
        const m = ev.data;
        if (m.tipo === 'erro') { setErro(m.mensagem); setRodando(false); setFase('erro'); return; }
        if (m.tipo === 'rede') {
          redeRef.current = m.rede;
          setRede(m.rede); setVersao(`${m.versao} · núcleo ${m.hashNucleo}`);
          setSeries(null); setCursor(0); setTotal(m.rede.nt);
          quadrosRef.current = [m.pop];
          setTemScrub(m.rede.nt * m.rede.n <= TETO_QUADROS);
          setErro(null); setFase('rede pronta');
          if (primeira.current) { primeira.current = false; setAutoPropagar(true); }
        } else if (m.tipo === 'quadro') {
          if (m.nt * (redeRef.current?.n ?? 1) <= TETO_QUADROS) quadrosRef.current.push(m.pop);
          else quadrosRef.current = [m.pop];
          setCursor(m.cursor);
          desenharRef.current(m.pop);
        } else if (m.tipo === 'pronto' || m.tipo === 'cancelado') {
          setSeries(m.series); setRodando(false); setFase(m.tipo);
          const ultimo = quadrosRef.current[quadrosRef.current.length - 1];
          if (ultimo) desenharRef.current(ultimo);
        } else if (m.tipo === 'exportado') {
          baixar(m.alvo === 'cpp' ? 'daedalus_run.cpp'
               : m.alvo === 'wl' ? 'daedalus_oraculo.wl' : 'daedalus_oraculo.py', m.texto);
        } else if (m.tipo === 'csv') {
          baixar('daedalus.csv', m.texto);
        }
      };
      workerRef.current = w;
    }
    return workerRef.current;
  }, []);

  const carregar = () => {
    setErro(null); setFase('gerando rede');
    worker().postMessage({ tipo: 'carregar', spec: JSON.stringify(spec) });
  };
  const propagar = () => {
    setErro(null); setRodando(true); setSeries(null); setCursor(0); setFase('propagando');
    worker().postMessage({ tipo: 'propagar' });
  };

  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);
  useEffect(() => {
    if (autoPropagar && rede) { setAutoPropagar(false); propagar(); }
    /* eslint-disable-next-line */
  }, [autoPropagar, rede]);

  useEffect(() => {
    if (!tocando || quadrosRef.current.length < 2) return;
    const id = setInterval(() => {
      setCursor((c) => {
        const prox = c + 1 > quadrosRef.current.length - 1 ? 0 : c + 1;
        const q = quadrosRef.current[prox];
        if (q) desenharRef.current(q);
        return prox;
      });
    }, 40);
    return () => clearInterval(id);
  }, [tocando]);

  const irPara = (passo: number) => {
    setTocando(false);
    const i = Math.max(0, Math.min(quadrosRef.current.length - 1, passo));
    setCursor(i);
    const q = quadrosRef.current[i];
    if (q) desenharRef.current(q);
  };

  const clicarCanvas = (ev: React.MouseEvent<HTMLCanvasElement>) => {
    const h = heatRef.current;
    if (!h || !rede) return;
    const t = h.texelDoEvento(ev);
    if (!t) return;
    const j = forma.ehLattice ? sitioNoTexel(t.m, t.q, forma.largura, forma.altura)
                              : t.q * forma.largura + t.m;
    if (j < 0 || j >= rede.n) return;
    if (modoClique === 'inicial') setSitio(j); else setAlvo(j);
  };

  const passo = Math.max(0, Math.min(total - 1, cursor - 1));
  const norma = series && total > 0 ? series[passo * 4 + 0] : NaN;
  const desvio = Number.isFinite(norma) ? Math.abs(norma - 1) : NaN;
  const normaOk = !Number.isFinite(desvio) || desvio < 1e-9;

  const listaSeries = useMemo(() => {
    if (!series || total === 0) return [];
    const col = (k: number) => {
      const v = new Float64Array(total);
      for (let i = 0; i < total; ++i) v[i] = series[i * 4 + k];
      return v;
    };
    const s = [
      { nome: 'IPR', cor: '#E5A83F', valores: col(1) },
      { nome: 'coerência ℓ₁', cor: '#3F7C74', valores: col(2) },
    ];
    const pa = col(3);
    if (Number.isFinite(pa[0])) s.push({ nome: 'p no alvo', cor: '#A8452C', valores: pa });
    return s;
  }, [series, total]);

  const exportar = (alvoExp: string) =>
    worker().postMessage({ tipo: 'exportar', alvo: alvoExp, spec: JSON.stringify(spec) });

  return (
    <div className="app">
      <header className="topo">
        <svg width="22" height="22" viewBox="0 0 100 100" className="marca" aria-hidden="true">
          <path d="M19 19 V81 M19 19 H81 V81 H19 M19 34.5 H65.5 V65.5 H19 M19 50 H50"
                fill="none" stroke="currentColor" strokeWidth="9"
                strokeLinecap="square" strokeLinejoin="miter" />
        </svg>
        <span className="nome">DAEDALUS</span>
        {/* Azul Egeu: calculado aqui, agora. Ver identity/README.md. */}
        <span className="selo">Laboratório · local</span>
        <span className="espaco" />
        <span className="arquivo mono">
          {gerador}{rede ? ` · ${rede.n} vértices` : ''}
        </span>
      </header>

      <div className="corpo">
        <main className="palco">
          {erro && <div className="erro">{erro}</div>}
          <canvas ref={canvasRef} onClick={clicarCanvas} />
          <div className="escala">
            <span>0.00</span>
            <div className="rampa" style={{ background: gradienteCss() }} />
            <span>{maxQuadro ? maxQuadro.toPrecision(3) : '—'}</span>
            <span>|ψⱼ|²</span>
          </div>
          {!forma.ehLattice && rede && (
            <p className="dica">Este grafo não tem rede desenrolada: o mapa mostra os sítios
              em ordem de índice, dobrados em linhas. Não é o layout do grafo.</p>
          )}
          <div className="transporte">
            <button onClick={() => setTocando((t) => !t)}
                    disabled={quadrosRef.current.length < 2}>{tocando ? '❚❚' : '▶'}</button>
            <input type="range" min={0} max={Math.max(1, total)} value={cursor}
                   onChange={(e) => irPara(+e.target.value)} disabled={!temScrub} />
            <span className="num">{cursor} / {total}</span>
            <label className="caixa"><input type="checkbox" checked={escalaFixa}
                   onChange={(e) => setEscalaFixa(e.target.checked)} /> escala fixa</label>
          </div>
          {listaSeries.length > 0 && (
            <Series series={listaSeries} nt={total} cursor={cursor} aoClicar={irPara} />
          )}
        </main>

        <aside className="painel">
          <h2>Gerador</h2>
          <select value={gerador} onChange={(e) => setGerador(e.target.value)}>
            {GERADORES.map(([v, n]) => <option key={v} value={v}>{n}</option>)}
          </select>

          {gerador === 'microtubule' && (<>
            <div className="campo"><label>N∥</label><span className="num">{nPar}</span></div>
            <input type="range" min={4} max={600} value={nPar} onChange={(e) => setNPar(+e.target.value)} />
            <div className="campo"><label>N⊥</label><span className="num">{nPerp}</span></div>
            <input type="range" min={3} max={26} value={nPerp} onChange={(e) => setNPerp(+e.target.value)} />
            <div className="campo"><label>costura</label><span className="num">{seam}</span></div>
            <input type="range" min={0} max={12} value={seam} onChange={(e) => setSeam(+e.target.value)} />
            <label className="caixa"><input type="checkbox" checked={fechado}
              onChange={(e) => setFechado(e.target.checked)} /> fechar as pontas</label>
            <div className="campo"><label>j∥ / j⊥</label>
              <span className="num">{jPar.toFixed(2)} / {jPerp.toFixed(2)}</span></div>
            <input type="range" min={0.1} max={2} step={0.05} value={jPerp}
                   onChange={(e) => setJPerp(+e.target.value)} />
          </>)}
          {gerador === 'sbm' && (<>
            <div className="campo"><label>N</label><span className="num">{nGen}</span></div>
            <input type="range" min={20} max={2000} step={10} value={nGen}
                   onChange={(e) => setNGen(+e.target.value)} />
            <div className="campo"><label>p_in / p_out</label>
              <span className="num">{pIn.toFixed(2)} / {pOut.toFixed(3)}</span></div>
            <input type="range" min={0} max={1} step={0.01} value={pIn} onChange={(e) => setPIn(+e.target.value)} />
            <input type="range" min={0} max={0.2} step={0.002} value={pOut} onChange={(e) => setPOut(+e.target.value)} />
          </>)}
          {(gerador === 'path' || gerador === 'cycle' || gerador === 'complete') && (<>
            <div className="campo"><label>N</label><span className="num">{nGen}</span></div>
            <input type="range" min={4} max={2000} step={2} value={nGen}
                   onChange={(e) => setNGen(+e.target.value)} />
          </>)}
          {(gerador === 'microtubule' || gerador === 'sbm') && (
            <><div className="campo"><label>módulos</label><span className="num">{modulos}</span></div>
              <input type="range" min={1} max={24} value={modulos}
                     onChange={(e) => setModulos(+e.target.value)} /></>
          )}

          <div className="campo"><label>religação p</label><span className="num">{wsP.toFixed(2)}</span></div>
          <input type="range" min={0} max={1} step={0.01} value={wsP} onChange={(e) => setWsP(+e.target.value)} />
          <label className="caixa"><input type="checkbox" checked={religar}
            onChange={(e) => setReligar(e.target.checked)} /> religar mantendo |E| fixo</label>
          {!religar && <p className="aviso">Acrescentar arestas aumenta |E| e melhora o
            transporte trivialmente: o resultado passa a medir o número de arestas, não a
            topologia.</p>}

          <div className="campo"><label>semente</label><span className="num">{semente}</span></div>
          <input type="number" value={semente} onChange={(e) => setSemente(+e.target.value)} />
          <button className="primario" style={{ width: '100%', marginTop: 10 }}
                  onClick={carregar}>gerar rede</button>

          <h2>Hamiltoniano</h2>
          <div className="segmentado">
            <button className={ham === 'adjacency' ? 'sel' : ''}
                    onClick={() => setHam('adjacency')}>Adjacência</button>
            <button className={ham === 'laplacian' ? 'sel' : ''}
                    onClick={() => setHam('laplacian')}>Laplaciano</button>
          </div>
          <div className="campo"><label>γ</label><span className="num">{gamma.toFixed(2)}</span></div>
          <input type="range" min={0.05} max={4} step={0.05} value={gamma}
                 onChange={(e) => setGamma(+e.target.value)} />
          <div className="campo"><label>normalização de ‖H‖</label></div>
          <select value={norm} onChange={(e) => setNorm(e.target.value)}>
            <option value="spectral">raio espectral</option>
            <option value="mean_degree">grau médio</option>
            <option value="none">nenhuma</option>
          </select>
          {norm === 'none' && <p className="aviso">Sem normalizar, "mais coerência" pode ser
            apenas "hopping maior" ao comparar topologias diferentes.</p>}
          <div className="campo"><label>t final</label><span className="num">{t1.toFixed(1)}</span></div>
          <input type="range" min={1} max={400} step={1} value={t1} onChange={(e) => setT1(+e.target.value)} />
          <div className="campo"><label>pontos no tempo</label><span className="num">{nt}</span></div>
          <input type="range" min={20} max={2000} step={20} value={nt}
                 onChange={(e) => setNt(+e.target.value)} />
          <div className="transporte" style={{ marginTop: 10 }}>
            <button className="primario" style={{ flex: 1 }} onClick={propagar}
                    disabled={rodando || !rede}>{rodando ? 'propagando…' : 'propagar'}</button>
            <button onClick={() => worker().postMessage({ tipo: 'cancelar' })}
                    disabled={!rodando}>parar</button>
          </div>

          <h2>Sítios</h2>
          <div className="segmentado">
            <button className={modoClique === 'inicial' ? 'sel' : ''}
                    onClick={() => setModoClique('inicial')}>inicial {sitio}</button>
            <button className={modoClique === 'alvo' ? 'sel' : ''}
                    onClick={() => setModoClique('alvo')}>alvo {alvo < 0 ? '—' : alvo}</button>
          </div>
          <p className="dica">Clique no mapa para marcar o sítio selecionado acima.
            {alvo >= 0 && <> <a href="#" onClick={(e) => { e.preventDefault(); setAlvo(-1); }}
              style={{ color: '#8FC2E4' }}>limpar alvo</a></>}</p>

          {/* Bronze: tudo que sai daqui e volta de fora. Distinção funcional. */}
          <h2>Exportar</h2>
          <div className="exportar">
            <button onClick={() => exportar('cpp')} disabled={!rede}>C++</button>
            <button onClick={() => exportar('wl')} disabled={!rede}>Wolfram</button>
            <button onClick={() => exportar('py')} disabled={!rede}>Python</button>
          </div>
          <div className="exportar">
            <button onClick={() => worker().postMessage({ tipo: 'csv' })}
                    disabled={!series}>CSV dos resultados</button>
          </div>
          <p className="dica">O C++ é autocontido e regenera a rede a partir do spec.json.
            Wolfram e Python recebem a lista de arestas e servem como oráculo do propagador.</p>
        </aside>
      </div>

      <footer className={normaOk ? 'rodape' : 'rodape ruim'}>
        <span>Σ|ψ|² = <b>{Number.isFinite(norma) ? norma.toFixed(12) : '—'}</b>
          {Number.isFinite(desvio) && ` (Δ ${desvio.toExponential(1)})`}</span>
        {rede && <>
          <span><b>{rede.n}</b> vértices</span>
          <span><b>{rede.arestas}</b> arestas</span>
          <span>⟨d⟩ <b>{rede.grauMedio.toFixed(3)}</b></span>
          <span>λ₂ <b>{rede.lambda2.toPrecision(5)}</b>
            {!rede.lambda2Convergiu && <span className="alerta"> não convergiu · limite superior</span>}</span>
          <span>Q <b>{rede.Q.toFixed(4)}</b></span>
          <span>α <b>{rede.alpha.toFixed(3)}</b></span>
          <span>hash <b>{rede.fingerprint.toString(16).slice(0, 8)}</b></span>
          {rede.componentes > 1 && <span className="alerta">{rede.componentes} componentes</span>}
          {rede.arestasDescartadas > 0 && <span className="alerta">{rede.arestasDescartadas} duplicadas descartadas</span>}
          {rede.religacoesFalhas > 0 && <span className="alerta">{rede.religacoesFalhas} religações sem destino</span>}
        </>}
        <span className="espaco" />
        <span>{fase}</span>
        <span>{versao}</span>
      </footer>
    </div>
  );
}
