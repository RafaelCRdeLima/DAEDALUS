#!/usr/bin/env python3
"""figura_serie.py — emaranhamento TOTAL da rede ao longo do tempo.

No setor de uma excitacao a concurrence par a par vale C_ij = 2|rho_ij|
exatamente, entao o emaranhamento total da rede e sum_{i!=j} |rho_ij| — a mesma
soma que a coerencia l1. Aqui ela sai em funcao de gamma*t, para sete taxas de
defasagem, em duas estruturas.

Duas coisas que a figura precisa dizer e nao pode errar:

  A CURVA COMECA EM ZERO EXATO. Em t = 0 o estado e uma delta e nao ha
  emaranhamento nenhum. Isso e conferencia, nao enfeite: sem a correcao de vies
  de Wardle-Kronberg o ponto inicial sairia num patamar positivo — o vies do
  |.| e MAXIMO onde rho_ij verdadeiro e zero, que e exatamente ali — e a curva
  desceria do falso patamar, invertendo a leitura. Como t = 0 nao cabe em eixo
  logaritmico, o valor vai dito na legenda.

  ESCALA LOGARITMICA EM y. As curvas varrem de 0,09 a 263, tres ordens e meia.
  Em escala linear as sete curvas de defasagem alta virariam uma linha colada no
  eixo, e o painel diria que nada acontece la.
"""
import csv, glob, os, sys
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.colors import LinearSegmentedColormap, LogNorm
from matplotlib.cm import ScalarMappable

sys.path.insert(0, 'identity')
from daedalus_colormaps import PROB_DARK

TINTA, MARMORE, CERA = '#0B1219', '#F3EFE5', '#9AA6B0'
# Recorta o inicio da rampa: o extremo escuro dela e quase a cor do fundo, e uma
# curva dessa cor some. Mesmo defeito do canvas que ja mordeu a etapa 4.
CM = LinearSegmentedColormap.from_list('dd', PROB_DARK[2:])

series = {}
for f in sorted(glob.glob('resultados/serie/*.csv')):
    nome = os.path.basename(f)[:-4]
    p = float(nome.split('-')[0][1:]); g = float(nome.split('-g')[1])
    D = list(csv.DictReader(open(f)))
    series[(p, g)] = {k: np.array([float(d[k]) for d in D])
                      for k in ('gamma_t', 'c_total', 'sd_total', 'c_inter')}

PS = sorted({p for p, _ in series}); GS = sorted({g for _, g in series})
norm = LogNorm(vmin=min(GS), vmax=max(GS))

plt.rcParams.update({
    'figure.facecolor': TINTA, 'axes.facecolor': TINTA,
    'text.color': MARMORE, 'axes.labelcolor': MARMORE,
    'xtick.color': CERA, 'ytick.color': CERA,
    'axes.edgecolor': '#2A3A48', 'font.size': 9, 'font.family': 'DejaVu Sans',
    'grid.color': '#1E2B38',
})
fig, axs = plt.subplots(2, 2, figsize=(13.5, 8.2), sharex=True)

for col, p in enumerate(PS):
    for g in GS:
        d = series[(p, g)]
        cor = CM(norm(g))
        m = d['gamma_t'] > 0            # t = 0 vale ZERO e nao cabe em log
        axs[0, col].plot(d['gamma_t'][m], d['c_total'][m], color=cor, lw=1.7)
        axs[0, col].fill_between(d['gamma_t'][m],
                                 d['c_total'][m] - d['sd_total'][m],
                                 d['c_total'][m] + d['sd_total'][m],
                                 color=cor, alpha=0.25, lw=0)
        frac = np.divide(d['c_inter'], d['c_total'],
                         out=np.zeros_like(d['c_total']), where=d['c_total'] > 0)
        axs[1, col].plot(d['gamma_t'][m], frac[m], color=cor, lw=1.7)
    axs[0, col].set_yscale('log')
    axs[0, col].set_title(
        ('$p = 0$ — microtúbulo puro' if p == 0 else f'$p = {p:g}$ — religado') +
        r'   ($\lambda_2 = $' + ('0,006' if p == 0 else '0,204') + ')',
        fontsize=10.5, color=MARMORE, pad=8)
    axs[1, col].set_xlabel(r'$\gamma t$')
    axs[1, col].set_ylim(-0.02, 1.02)
    for ax in (axs[0, col], axs[1, col]):
        ax.grid(True, lw=0.5, alpha=0.5)

axs[0, 0].set_ylabel(r'emaranhamento total  $\sum_{i \neq j} C_{ij}$')
axs[1, 0].set_ylabel(r'fração ENTRE módulos  $C_{\rm inter}/C_{\rm total}$')

fig.subplots_adjust(left=0.075, right=0.865, top=0.895, bottom=0.135,
                    hspace=0.13, wspace=0.16)
sm = ScalarMappable(norm=norm, cmap=CM); sm.set_array([])
cax = fig.add_axes([0.885, 0.135, 0.016, 0.76])
cb = fig.colorbar(sm, cax=cax)
cb.set_label(r'taxa de defasagem  $\gamma_{\rm deph}$', color=MARMORE)
cb.ax.tick_params(colors=CERA, labelsize=8); cb.outline.set_edgecolor('#2A3A48')

fig.text(0.5, 0.965, 'DAEDALUS — emaranhamento da rede ao longo do tempo, fase 2   ·   '
         'microtúbulo 40×13, N = 520, 8 módulos   ·   8 000 trajetórias, 8 blocos   ·   '
         'estimador Wardle–Kronberg',
         ha='center', fontsize=10.5, color=MARMORE)
fig.text(0.5, 0.055,
         'Em $\\gamma t = 0$ o emaranhamento vale ZERO exato — o estado é uma delta — e o ponto não cabe '
         'no eixo logarítmico.',
         ha='center', fontsize=8.5, color=CERA)
fig.text(0.5, 0.022,
         'Que ele dê zero é a conferência de que a correção de viés funciona: é ali que o viés do '
         '$|\\cdot|$ é máximo.   ·   Faixa sombreada: ±1 desvio da média.',
         ha='center', fontsize=8.5, color=CERA)
fig.savefig('resultados/emaranhamento-tempo.png', dpi=150, facecolor=TINTA)
print('resultados/emaranhamento-tempo.png')
