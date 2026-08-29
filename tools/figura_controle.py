#!/usr/bin/env python3
"""figura_controle.py — microtubulo contra o controle SBM, no eixo lambda2.

O eixo lambda2 existe justamente para isto: parametros de construcao ("religamos
8%", "p_in = 0.05") nao sao comparaveis entre familias de grafo. lambda2 e.

E o grafico mostra por que o controle nao pode ser um casamento exato: as duas
familias ocupam regioes DISJUNTAS do eixo. Nao existe SBM de N = 520 conectado
com lambda2 na faixa do microtubulo.
"""
import csv, sys
import matplotlib; matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

TINTA, MARMORE, CERA = '#0B1219', '#F3EFE5', '#9AA6B0'
EGEU, BRONZE, ICARO, TERRACOTA = '#17557C', '#B5813C', '#E5A83F', '#A8452C'

def ler(f):
    L=[l for l in open(f) if l.strip() and not l.startswith('#')]
    return list(csv.DictReader(L))
F=lambda d,k: float(d[k])
MT=ler('resultados/varredura.csv'); SB=ler('resultados/varredura-sbm.csv')
GS=sorted({F(d,'gamma') for d in MT})

plt.rcParams.update({
    'figure.facecolor': TINTA, 'axes.facecolor': TINTA, 'text.color': MARMORE,
    'axes.labelcolor': MARMORE, 'xtick.color': CERA, 'ytick.color': CERA,
    'axes.edgecolor': '#2A3A48', 'font.size': 9.5, 'font.family': 'DejaVu Sans',
    'grid.color': '#1B2833', 'legend.frameon': False,
})
fig, axs = plt.subplots(1, 2, figsize=(13.4, 5.6))

# --- painel 1: C_inter contra lambda2, no gamma mais baixo ---
ax = axs[0]
for D, cor, nome, mk in ((MT, ICARO, 'microtúbulo  (|E| = 1024)', 'o'),
                         (SB, EGEU,  'SBM controle  (|E| ≈ 2000)', 's')):
    pts = [(F(d,'lambda2'), F(d,'c_inter'), F(d,'sd_c_inter'))
           for d in D if abs(F(d,'gamma')-GS[0]) < 1e-9 and F(d,'lambda2') > 0]
    pts.sort()
    x=[p[0] for p in pts]; y=[p[1] for p in pts]; e=[p[2] for p in pts]
    ax.errorbar(x, y, yerr=e, marker=mk, color=cor, lw=1.6, ms=7,
                capsize=3, label=nome, mec=TINTA, mew=.8)
ax.axhline(172, color=CERA, lw=.9, ls=':', zorder=0)
ax.annotate('platô ≈ 172', xy=(0.55, 172), xytext=(0.30, 143),
            color=CERA, fontsize=9,
            arrowprops=dict(arrowstyle='->', color=CERA, lw=.8))
ax.annotate('microtúbulo sem religação\nλ₂ = 0,006 — 5,5× abaixo',
            xy=(0.0065, 30.2), xytext=(0.016, 62), color=ICARO, fontsize=9,
            arrowprops=dict(arrowstyle='->', color=ICARO, lw=.9))
ax.set_xscale('log'); ax.set_xlabel(r'conectividade algébrica  $\lambda_2$')
ax.set_ylabel(r'$C_{\rm inter}$  em  $\gamma_{\rm deph} = 0{,}02$')
ax.set_title('A saturação vale nas DUAS famílias', fontsize=11, color=MARMORE, pad=10)
ax.grid(True, lw=.5, alpha=.6); ax.legend(loc='lower right', fontsize=9)
ax.axvspan(0.0035, 0.40, color=ICARO, alpha=.06, zorder=0)
ax.axvspan(0.45, 1.0, color=EGEU, alpha=.10, zorder=0)
ax.text(0.0055, 100, 'região que só o\nmicrotúbulo alcança',
        color=ICARO, fontsize=8.5, va='center', ha='left')
ax.text(0.47, 100, 'região que só o\nSBM conectado ocupa',
        color='#6FA8CE', fontsize=8.5, va='center', ha='left')

# --- painel 2: C_inter contra gamma, as duas familias ---
ax = axs[1]
MM={(round(F(d,'p'),5),round(F(d,'gamma'),5)):d for d in MT}
SM={(round(F(d,'Q'),3),round(F(d,'gamma'),5)):d for d in SB}
for (p,Q),alfa in zip([(0.0,0.772),(0.25,0.583),(0.41667,0.433)], (1.0,.72,.45)):
    ax.plot(GS, [F(MM[(round(p,5),round(g,5))],'c_inter') for g in GS],
            'o-', color=ICARO, alpha=alfa, lw=1.6, ms=5, mec=TINTA, mew=.6,
            label=f'microtúbulo  Q={F(MM[(round(p,5),round(GS[0],5))],"Q"):.2f}')
    ax.plot(GS, [F(SM[(Q,round(g,5))],'c_inter') for g in GS],
            's--', color=EGEU, alpha=alfa, lw=1.6, ms=5, mec=TINTA, mew=.6,
            label=f'SBM  Q={Q:.2f}')
ax.set_xscale('log'); ax.set_yscale('log')
ax.set_xlabel(r'taxa de defasagem  $\gamma_{\rm deph}$   (adimensional)')
ax.set_ylabel(r'$C_{\rm inter}$')
ax.set_title('Decaimento monótono em ambas — sem ENAQT para coerência',
             fontsize=11, color=MARMORE, pad=10)
ax.grid(True, lw=.5, alpha=.6); ax.legend(fontsize=8, ncol=2, loc='lower left')

fig.text(0.5, 0.965,
         'DAEDALUS — microtúbulo contra o controle SBM   ·   N = 520, 8 módulos   ·   '
         '63 000 trajetórias por célula   ·   estimador Wardle–Kronberg',
         ha='center', fontsize=10.5, color=MARMORE)
fig.text(0.5, 0.062,
         'O controle casa Q linha a linha, mas NÃO pode casar λ₂: com o |E| = 1024 do microtúbulo o SBM tem 8 a 13 componentes.',
         ha='center', fontsize=8.5, color=CERA)
fig.text(0.5, 0.026,
         'Usa-se |E| ≈ 2000, a densidade mínima que conecta — e aí λ₂ já salta acima de toda a faixa do microtúbulo.',
         ha='center', fontsize=8.5, color=CERA)
fig.subplots_adjust(left=0.065, right=0.985, top=0.865, bottom=0.175, wspace=0.24)
fig.savefig('resultados/controle-sbm.png', dpi=150, facecolor=TINTA)
print('resultados/controle-sbm.png')
