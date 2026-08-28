#!/usr/bin/env python3
"""analisar_sonda.py — dimensionamento da grade da fase 2.

Le as saidas de `native/build/bin/sonda` e responde a pergunta que decide a
grade: quantas realizacoes sao precisas para que o desvio do estimador seja
pelo menos 5x menor que a variacao de C_inter entre celulas vizinhas.

O DESVIO E O DO ESTIMADOR, medido entre REPLICAS independentes. C_inter e
funcao nao linear de rho, entao dispersao de lotes dentro de um ensemble nao
serve; cada replica e um ensemble inteiro com outra semente-base.
"""
import math, sys, os, glob

SC = sys.argv[1] if len(sys.argv) > 1 else '.'

def ler(caminho):
    linhas = [l.strip() for l in open(caminho) if l.strip()]
    cab = [l for l in linhas if l.startswith('#')]
    dados = [l for l in linhas if not l.startswith('#')][1:]
    rss = next((int(l.split()[-1]) for l in cab if 'pico_rss_kb' in l), None)
    linhas_dados = []
    for l in dados:
        c = l.split(',')
        linhas_dados.append({
            'n': int(c[0]), 'rep': int(c[1]),
            'c_inter': float(c[2]), 'c_intra': float(c[3]), 'c_l1': float(c[4]),
            'ef': float(c[5]), 'c_rel': float(c[6]),
            'pmod0': float(c[7]) if len(c) > 8 else float('nan'),
            'ci_deb': float(c[8]) if len(c) > 9 else float('nan'),
            'seg': float(c[-1]),
        })
    return {'cab': cab[0] if cab else '', 'rss_kb': rss, 'linhas': linhas_dados}

def estat(vals):
    n = len(vals)
    if n == 0: return float('nan'), float('nan')
    m = sum(vals) / n
    if n < 2: return m, 0.0
    var = sum((v - m) ** 2 for v in vals) / (n - 1)
    return m, math.sqrt(var)

def ajuste_lei(ns, sds):
    """sd ~ n^(-p): ajuste linear de log(sd) contra log(n)."""
    pares = [(math.log(n), math.log(s)) for n, s in zip(ns, sds) if s > 0]
    if len(pares) < 2: return float('nan')
    mx = sum(x for x, _ in pares) / len(pares)
    my = sum(y for _, y in pares) / len(pares)
    num = sum((x - mx) * (y - my) for x, y in pares)
    den = sum((x - mx) ** 2 for x, _ in pares)
    return -num / den if den else float('nan')

def resumo(nome, d):
    por_n = {}
    for l in d['linhas']:
        por_n.setdefault(l['n'], []).append(l)
    saida = {}
    for n in sorted(por_n):
        g = por_n[n]
        ci_m, ci_s = estat([x['c_inter'] for x in g])
        cr_m, cr_s = estat([x['c_rel'] for x in g if not math.isnan(x['c_rel'])])
        ef_m, ef_s = estat([x['ef'] for x in g])
        p0 = [x['pmod0'] for x in g if not math.isnan(x['pmod0'])]
        p0_m, p0_s = estat(p0) if p0 else (float('nan'), float('nan'))
        db = [x['ci_deb'] for x in g if not math.isnan(x['ci_deb'])]
        db_m, db_s = estat(db) if db else (float('nan'), float('nan'))
        seg = sum(x['seg'] for x in g) / len(g)
        saida[n] = dict(ci_m=ci_m, ci_s=ci_s, cr_m=cr_m, cr_s=cr_s,
                        ef_m=ef_m, ef_s=ef_s, p0_m=p0_m, p0_s=p0_s,
                        db_m=db_m, db_s=db_s,
                        seg=seg, reps=len(g))
    return saida

arquivos = sorted(glob.glob(os.path.join(SC, 'sonda-*.csv')))
celulas = {}
for a in arquivos:
    nome = os.path.basename(a)[len('sonda-'):-len('.csv')]
    d = ler(a)
    celulas[nome] = {'r': resumo(nome, d), 'rss_kb': d['rss_kb'], 'cab': d['cab']}

print('=' * 96)
print('SONDA DE DIMENSIONAMENTO — nenhuma celula aqui e resultado de fisica')
print('=' * 96)
for nome, c in celulas.items():
    print(f"\n## {nome}")
    print(f"   {c['cab']}")
    print(f"   {'n_traj':>7} {'reps':>5} {'C_inter':>12} {'sd(C_inter)':>12} {'sd/media':>9}"
          f" {'C_rel':>11} {'sd(C_rel)':>10} {'ef_transf':>11} {'sd(ef)':>10} {'s/ens':>8}")
    for n, v in c['r'].items():
        rel = v['ci_s'] / v['ci_m'] if v['ci_m'] else float('nan')
        print(f"   {n:>7} {v['reps']:>5} {v['ci_m']:>12.5f} {v['ci_s']:>12.3e} {100*rel:>8.2f}%"
              f" {v['cr_m']:>11.5f} {v['cr_s']:>10.2e} {v['ef_m']:>11.4e} {v['ef_s']:>10.2e}"
              f" {v['seg']:>8.2f}")
    ns = sorted(c['r'])
    if len(ns) >= 3:
        p_ci = ajuste_lei(ns, [c['r'][n]['ci_s'] for n in ns])
        p_cr = ajuste_lei(ns, [c['r'][n]['cr_s'] for n in ns])
        p_ef = ajuste_lei(ns, [c['r'][n]['ef_s'] for n in ns])
        p_p0 = ajuste_lei(ns, [c['r'][n]['p0_s'] for n in ns])
        print(f"   lei de convergencia  sd ~ n^(-p):  C_inter p={p_ci:.3f}"
              f"   C_rel p={p_cr:.3f}   ef p={p_ef:.3f}   (1/sqrt(n) preve 0.500)")
        print(f"   DISCRIMINADOR, observavel LINEAR pmod0: p={p_p0:.3f}"
              f"   media {c['r'][ns[-1]]['p0_m']:.6f}  sd {c['r'][ns[-1]]['p0_s']:.2e}")
        # vies: C_inter(n) = C_inf + B n^(-q). Ajusta q sobre a DERIVA da media.
        difs = [(ns[i], abs(c['r'][ns[i]]['ci_m'] - c['r'][ns[-1]]['ci_m']))
                for i in range(len(ns) - 1)]
        q = ajuste_lei([d[0] for d in difs], [d[1] for d in difs])
        deriva = 100 * (c['r'][ns[0]]['ci_m'] - c['r'][ns[-1]]['ci_m']) / c['r'][ns[-1]]['ci_m']
        print(f"   VIES: a MEDIA de C_inter deriva {deriva:+.1f}% de n={ns[0]} a n={ns[-1]}"
              f"   (deriva ~ n^(-{q:.2f}))")
        dbs = [c['r'][n]['db_m'] for n in ns]
        if not any(math.isnan(x) for x in dbs):
            dv = 100 * (dbs[0] - dbs[-1]) / dbs[-1]
            p_db = ajuste_lei(ns, [c['r'][n]['db_s'] for n in ns])
            print(f"   CORRIGIDO 2C(n)-C(n/4): " +
                  "  ".join(f"n={n}:{c['r'][n]['db_m']:.3f}" for n in ns))
            print(f"                          deriva residual {dv:+.1f}%"
                  f"   sd(corrigido) em n={ns[-1]}: {c['r'][ns[-1]]['db_s']:.3e}"
                  f"   lei p={p_db:.3f}")
    if c['rss_kb']:
        print(f"   pico de RSS medido: {c['rss_kb']/1024:.0f} MB")

# ---- anti-vacuidade: C_inter VARIA entre as sondas? ----
print('\n' + '=' * 96)
print('ANTI-VACUIDADE — C_inter varia entre as tres sondas?')
print('=' * 96)
sondas = [n for n in ('A-coerente', 'B-intermediaria', 'C-zeno') if n in celulas]
vals = {}
for n in sondas:
    top = max(celulas[n]['r'])
    vals[n] = celulas[n]['r'][top]['ci_m']
    print(f"   {n:<18} C_inter = {vals[n]:.5f}   (n_traj = {top})")
if len(vals) >= 2:
    lo, hi = min(vals.values()), max(vals.values())
    print(f"   faixa: {lo:.5f} a {hi:.5f}   razao {hi/lo:.2f}x   variacao {100*(hi-lo)/lo:.1f}%")
    if hi / lo < 1.05:
        print("   >>> PARE. C_inter e praticamente constante entre as sondas: 'nao ha crista'")
        print("   >>> e 'o observavel nao responde' sao indistinguiveis. O problema e o")
        print("   >>> observavel ou o desdobramento, nao a fisica.")
    else:
        print("   >>> ok: o observavel RESPONDE. A sonda mede alguma coisa.")

# ---- variacao entre celulas vizinhas ----
print('\n' + '=' * 96)
print('VARIACAO ENTRE CELULAS VIZINHAS — o que a barra de erro precisa resolver')
print('=' * 96)
base = 'B-intermediaria'
if base in celulas:
    top = max(celulas[base]['r'])
    ref = celulas[base]['r'][top]
    for viz, eixo in (('B-vizinha-p', 'p'), ('B-vizinha-gama', 'gama')):
        if viz not in celulas: continue
        t2 = max(celulas[viz]['r'])
        v = celulas[viz]['r'][t2]
        d_ci = abs(v['ci_m'] - ref['ci_m'])
        d_ef = abs(v['ef_m'] - ref['ef_m'])
        print(f"   passo em {eixo:<5}: C_inter {ref['ci_m']:.5f} -> {v['ci_m']:.5f}"
              f"   |delta| = {d_ci:.4e}  ({100*d_ci/ref['ci_m']:.2f}%)")
        print(f"                  ef      {ref['ef_m']:.4e} -> {v['ef_m']:.4e}"
              f"   |delta| = {d_ef:.3e}  ({100*d_ef/ref['ef_m']:.2f}%)")
        # quantas realizacoes para sd = delta/5, usando sd ~ n^(-1/2)
        sd_ref, n_ref = ref['ci_s'], top
        alvo = d_ci / 5.0
        if sd_ref > 0 and alvo > 0:
            n_nec = n_ref * (sd_ref / alvo) ** 2
            print(f"                  para sd(C_inter) = |delta|/5: "
                  f"n_traj ~ {n_nec:,.0f}".replace(',', ' '))
