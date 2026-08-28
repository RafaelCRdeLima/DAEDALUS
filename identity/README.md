# Identidade visual do Daedalus

Laboratorio grafico de caminhadas quanticas de tempo continuo (CTQW) sobre grafos arbitrarios.

## Arquivos

| Arquivo | Uso |
|---|---|
| `daedalus-mark.svg` | Simbolo puro, herda `currentColor` |
| `daedalus-mark-graph.svg` | Simbolo com vertices em bronze, versao institucional |
| `daedalus-mark-superposition.svg` | Estado de carregamento e animacao de abertura |
| `daedalus-app-icon.svg` | Icone do programa, 512 px, fundo tinta |
| `daedalus-favicon.svg` | Versao de dois bracos para 16 a 32 px |
| `daedalus-lockup-horizontal.svg` | Assinatura sobre fundo claro |
| `daedalus-lockup-dark.svg` | Assinatura sobre fundo escuro |
| `daedalus-icons-ctqw.svg` | Sprite da barra de ferramentas, 14 simbolos |
| `daedalus-generators.svg` | Sprite da galeria de geradores, 8 simbolos |
| `daedalus-tokens.css` | Variaveis de cor, tipografia e mapas de cor |
| `daedalus_colormaps.py` | Mapas de cor para matplotlib |
| `daedalus_colormaps.wl` | Mapas de cor para Wolfram Language |
| `daedalus-header-banner.txt` | Cabecalho de proveniencia do codigo exportado |

Uso dos sprites: `<svg><use href="daedalus-icons-ctqw.svg#dd-hamiltonian"/></svg>`.
O sprite herda `currentColor`, entao a cor vem do contexto.

## Simbolo

Grade de 100, traco 8, vao 7,5, cantos vivos, sem raio. Tamanho minimo 20 px;
abaixo disso use o favicon de dois bracos. Area de respiro igual a largura do traco
multiplicada por 3 em todos os lados. Nunca rotacionar, inclinar, aplicar contorno
duplo nem preencher o miolo.

## Cores de modo

Azul Egeu identifica o laboratorio interativo: numeros calculados localmente,
no navegador, agora. Bronze identifica tudo que passou pelo ciclo de exportacao
e reimportacao. Nenhum valor reimportado aparece em azul. Essa distincao e
funcional, nao decorativa, e nao deve ser reaproveitada para outra coisa.

## Mapas de cor

Probabilidade usa rampa sequencial com luminancia monotonica, para sobreviver
a impressao em escala de cinza. Fase usa rampa ciclica: 0 e 2 pi fecham na mesma
cor, sem descontinuidade artificial. O raio do vertice tambem codifica a
probabilidade, redundancia deliberada para leitura sem cor.

## Tipografia

Space Grotesk nos titulos e no logotipo, Inter no texto, IBM Plex Mono em numeros,
parametros, hashes e legendas de eixo. Todo valor numerico na interface vai em mono.

## Fora de escopo

O gerador de microtubulo e um cartao da galeria, com o mesmo peso visual dos demais.
Nenhum elemento de microtubulo, de biologia ou de Orch-OR entra no logotipo, no icone
ou na identidade. O motor e geral para qualquer grafo e a identidade acompanha isso.
