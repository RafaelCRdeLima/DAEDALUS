#!/usr/bin/env python3
"""figura_varredura.py — o plano (estrutura x ruido) da fase 2.

Tres decisoes que a figura NAO pode errar, e por que:

  ESCALA DE COR LOGARITMICA. C_inter varre de 4.7e-06 a 176 — sete ordens e
  meia. Numa escala linear todas as celulas menos a maior sairiam na cor do
  zero, e o plano pareceria vazio com um ponto quente. Nao seria erro de
  dado, seria a figura mentindo.

  A LINHA p = 0.5 VAI MARCADA. Ali o grafo tem DOIS componentes e lambda2 = 0:
  a excitacao nao alcanca metade da rede, e a celula mede outra coisa. Plotada
  igual as demais, ela entraria na leitura da crista como se fosse comparavel.

  A INCERTEZA TEM PAINEL PROPRIO. sd + |vies| celula a celula, para que se veja
  onde a superficie e leitura e onde e ruido, sem ter de voltar ao CSV.

Mapa de cor de identity/daedalus_colormaps.py: luminancia monotonica, para
sobreviver a impressao em escala de cinza (identity/README.md).
"""
import csv, math, sys
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.colors import LogNorm, LinearSegmentedColormap

sys.path.insert(0, 'identity')
from daedalus_colormaps import PROB_DARK, PROB_LIGHT

CMAP = LinearSegmentedColormap.from_list('dd', PROB_DARK)
CMAP_INC = LinearSegmentedColormap.from_list('dd_inc', PROB_LIGHT[::-1])
TINTA, MARMORE, CERA = '#0B1219', '#F3EFE5', '#9AA6B0'
TERRACOTA, ICARO = '#A8452C', '#E5A83F'

linhas = [l for l in open('resultados/varredura.csv') if l.strip() and not l.startswith('#')]
D = list(csv.DictReader(linhas))
F = lambda d, k: float(d[k])

PS = sorted({F(d, 'p') for d in D})
GS = sorted({F(d, 'gamma') for d in D})
M = {(round(F(d, 'p'), 5), round(F(d, 'gamma'), 5)): d for d in D}
idx = lambda p, g: M[(round(p, 5), round(g, 5))]

def malha(chave):
    return np.array([[F(idx(p, g), chave) for g in GS] for p in PS])

CI, EF = malha('c_inter'), malha('ef')
INC = malha('sd_c_inter') + np.abs(malha('vies_c_inter'))
L2 = [F(idx(p, GS[0]), 'lambda2') for p in PS]
QQ = [F(idx(p, GS[0]), 'Q') for p in PS]
desconexo = [i for i, p in enumerate(PS) if L2[i] == 0.0]

# Bordas das celulas: gamma em log, p linear.
def bordas_log(v):
    v = np.array(v); r = np.sqrt(v[1] / v[0])
    return np.concatenate([[v[0] / r], np.sqrt(v[:-1] * v[1:]), [v[-1] * r]])
def bordas_lin(v):
    v = np.array(v); h = (v[1] - v[0]) / 2
    return np.concatenate([[v[0] - h], (v[:-1] + v[1:]) / 2, [v[-1] + h]])

GB, PB = bordas_log(GS), bordas_lin(PS)

plt.rcParams.update({
    'figure.facecolor': TINTA, 'axes.facecolor': TINTA,
    'text.color': MARMORE, 'axes.labelcolor': MARMORE,
    'xtick.color': CERA, 'ytick.color': CERA,
    'axes.edgecolor': '#2A3A48', 'font.size': 9,
    'font.family': 'DejaVu Sans',
})

# CELULAS ABAIXO DO PROPRIO RUIDO. O piso nao e escolhido, e medido: ef < 3*sd_ef
# e indistinguivel de zero, e sao 15 das 49. Pintar essas celulas com a mesma
# rampa das outras faria uma escala de 50 ordens de grandeza dominada por
# numeros sem significado, e o painel inteiro sairia claro.
SUB = malha('ef') < 3 * malha('sd_ef')
EF_VIS = np.where(SUB, np.nan, EF)

fig, axs = plt.subplots(1, 3, figsize=(18.0, 5.8))

paineis = [
    (CI, np.zeros_like(CI, dtype=bool),
     r'$C_{\mathrm{inter}}$ — coerência de bloco entre módulos', CMAP),
    (EF_VIS, SUB,
     r'eficiência de transferência $\langle p_{\rm alvo}\rangle_t$', CMAP),
    (INC / np.maximum(CI, 1e-300), np.zeros_like(CI, dtype=bool),
     r'incerteza relativa $(\sigma + |\rm viés|)/C_{\rm inter}$', CMAP_INC),
]
for ax, (Z, marcar, titulo, cmap) in zip(axs, paineis):
    Zp = np.where(Z > 0, Z, np.nan)
    ax.set_facecolor('#1A2430')                 # fundo das celulas sem valor
    norm = LogNorm(vmin=np.nanmin(Zp), vmax=np.nanmax(Zp))
    m = ax.pcolormesh(GB, PB, Zp, cmap=cmap, norm=norm, shading='flat')
    cb = fig.colorbar(m, ax=ax, pad=0.025, fraction=0.045)
    cb.ax.tick_params(colors=CERA, labelsize=8)
    cb.outline.set_edgecolor('#2A3A48')
    ax.set_xscale('log')
    ax.set_xlabel(r'taxa de defasagem $\gamma_{\rm deph}$')
    ax.set_title(titulo, fontsize=10, pad=10, color=MARMORE)
    ax.set_yticks(PS)
    # p e lambda2 no MESMO rotulo: lambda2 e o eixo primario do documento, por
    # ser comparavel entre familias de grafo, e um eixo gemeo a direita
    # colidiria com a barra de cor.
    ax.set_yticklabels(
        [f'{PS[i]:.3f}   ' + ('—' if L2[i] == 0 else f'{L2[i]:.3f}')
         for i in range(len(PS))], fontsize=8, family='DejaVu Sans Mono')
    for i in range(len(PS)):
        for j in range(len(GS)):
            if marcar[i, j]:
                ax.plot([GS[j]], [PS[i]], marker='x', color=CERA,
                        markersize=6, markeredgewidth=1.3, zorder=6)
    for i in desconexo:
        ax.axhspan(PB[i], PB[i + 1], facecolor='none', edgecolor=TERRACOTA,
                   hatch='////', linewidth=1.6, zorder=5)

axs[0].set_ylabel(r'fração religada $p$   ·   $\lambda_2$', labelpad=8)

fig.text(0.5, 0.965, 'DAEDALUS — plano (estrutura × ruído), fase 2   ·   '
         'microtúbulo 40×13, N = 520, 8 módulos   ·   63 000 trajetórias por célula   ·   '
         'estimador Wardle–Kronberg',
         ha='center', fontsize=10.5, color=MARMORE)
fig.text(0.5, 0.055,
         'Faixa hachurada: em p = 0,50 o grafo tem DOIS componentes e λ₂ = 0 — a excitação não alcança '
         'metade da rede, e a célula mede outra coisa.',
         ha='center', fontsize=8.5, color=CERA)
fig.text(0.5, 0.022,
         '×  marca as 15 células em que a eficiência fica abaixo de 3× o próprio desvio, ou seja '
         'indistinguível de zero.   ·   Escala de cor logarítmica nos três painéis.',
         ha='center', fontsize=8.5, color=CERA)
fig.subplots_adjust(left=0.070, right=0.978, top=0.885, bottom=0.175, wspace=0.52)
fig.savefig('resultados/varredura-plano.png', dpi=150, facecolor=TINTA)
print('resultados/varredura-plano.png')
print(f'C_inter: {np.nanmin(CI):.3g} a {np.nanmax(CI):.3g}')
print(f'celulas com ef sob o proprio ruido: {int(SUB.sum())} de {SUB.size}')
