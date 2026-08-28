/* Series.tsx — séries temporais em SVG. */
export interface Serie {
  nome: string;
  cor: string;
  valores: Float64Array | number[];
  faixa?: [number, number];
}

export function Series({ series, nt, cursor, aoClicar }: {
  series: Serie[];
  nt: number;
  cursor: number;
  aoClicar?: (passo: number) => void;
}) {
  const L = 720, A = 190, ml = 46, mr = 10, mt = 10, mb = 22;
  const largura = L - ml - mr, altura = A - mt - mb;

  const caminho = (s: Serie) => {
    const vs = s.valores;
    let lo = Infinity, hi = -Infinity;
    for (let i = 0; i < nt; ++i) {
      const v = vs[i];
      if (!Number.isFinite(v)) continue;
      if (v < lo) lo = v;
      if (v > hi) hi = v;
    }
    if (s.faixa) [lo, hi] = s.faixa;
    if (!Number.isFinite(lo) || !Number.isFinite(hi)) return { d: '', lo: 0, hi: 1 };
    if (hi - lo < 1e-12) { hi = lo + 1e-12; }
    let d = '';
    let abriu = false;
    for (let i = 0; i < nt; ++i) {
      const v = vs[i];
      if (!Number.isFinite(v)) { abriu = false; continue; }  /* NaN: buraco, não zero */
      const x = ml + (largura * i) / Math.max(1, nt - 1);
      const y = mt + altura - (altura * (v - lo)) / (hi - lo);
      d += `${abriu ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`;
      abriu = true;
    }
    return { d, lo, hi };
  };

  const traçados = series.map((s) => ({ s, ...caminho(s) }));
  const xCursor = ml + (largura * Math.max(0, cursor - 1)) / Math.max(1, nt - 1);

  return (
    <svg viewBox={`0 0 ${L} ${A}`} className="series" role="img"
         onClick={(e) => {
           if (!aoClicar) return;
           const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
           const f = ((e.clientX - r.left) / r.width * L - ml) / largura;
           aoClicar(Math.round(Math.min(1, Math.max(0, f)) * (nt - 1)) + 1);
         }}>
      <rect x={ml} y={mt} width={largura} height={altura} className="quadro" />
      {traçados.map(({ s, d }) => (
        <path key={s.nome} d={d} fill="none" stroke={s.cor} strokeWidth={1.6} />
      ))}
      <line x1={xCursor} x2={xCursor} y1={mt} y2={mt + altura} className="cursor" />
      <text x={ml} y={A - 6} className="eixo">passo 0</text>
      <text x={ml + largura} y={A - 6} textAnchor="end" className="eixo">{nt}</text>
      {traçados.map(({ s, lo, hi }, i) => (
        <text key={s.nome} x={4} y={mt + 12 + i * 13} className="legenda" fill={s.cor}>
          {s.nome} [{lo.toPrecision(3)}, {hi.toPrecision(3)}]
        </text>
      ))}
    </svg>
  );
}
