# TRIAGEM — varredura de 28/08/2026

Um veredito por trabalho, justificativa em uma linha. Ver `NOVIDADE.md` para a conclusão.

**Nenhum trabalho recebeu OCUPA.** A instrução era parar e avisar imediatamente se algum
recebesse; nenhum recebeu, e a seção "Consultas" abaixo mostra onde procurei.

## Vereditos

| chave | veredito | por quê, em uma linha |
|---|---|---|
| `kurt2023-transport-smallworld` | **ADJACENTE** | Varre topologia × ruído (4 modelos ambientais), mas o observável é η, captura no sorvedouro — agregado. Metade estrutural feita, metade de coerência não. |
| `adithya2026-stability-ctqw` | **ADJACENTE** | Usa norma ℓ₁ de coerência sob 3 decoerências, mas nenhuma topologia modular e coerência global. Metade de ruído+coerência feita, metade de modularidade não. |
| `tsomokos2011-community-instabilities` | **ADJACENTE** | O mais próximo em **estrutura**: CTQW sobre redes com comunidades. Unitário puro, sem ruído e sem medida de coerência. |
| `gassab2026-microtubule-tryptophan` | **ADJACENTE** | O mais próximo em **geometria**: espiral de 13 dímeros, Lindblad, ℓ₁. Mas ℓ₁ por pares selecionados, sem costura, sem varredura de taxa. |
| `coates2021-localisation-optimal-noise` | **ADJACENTE** | Mostra que a localização determina a taxa ótima — mas em cadeias 1D com desordem, sobre eficiência de transporte. **Afia H2 em vez de ocupá-la.** |
| `mulken2007-smallworld` | **ADJACENTE** | CTQW small-world, transporte rápido sem equipartição. Acrescenta ligações; nossa disciplina de \|E\| fixo é mais rigorosa. |
| `walschaers2013-optimally-designed` | **ADJACENTE** | **Lido inteiro.** Antecessor direto de H2b do lado do transporte: projeto inverso por critério **espectral** (centrossimetria + estrutura de dubletos, 18 ocorrências), controlado por "quantidades de granulação grossa" — o que sustenta λ₂ como eixo. Mas **unitário puro**: `dephasing` 0, `decoherence` 0, `noise` 0, `Lindblad` 0. Uma crista só, sem eixo de ruído. |
| `lawrence2026-site-dependent-noise` | **ADJACENTE** | Otimiza o **ruído** por sítio, não a topologia. Eixo invertido do nosso. |
| `sarkar2023-longrange-dephasing` | **ADJACENTE** | α_c ≈ 1,5 para hopping 1/r^α com defasagem; fixa que α = 3 dipolar é curto alcance. |
| `cheung2026-xxz-toy-microtubule` | **ADJACENTE** | A fonte de H4. Ver item 4 de `NOVIDADE.md`: observável e regime diferentes dos nossos. |
| `dey2019-block-coherence-structure` | **FERRAMENTA** | **A terminologia que faltava**: teoria de recursos da coerência de bloco. `C_inter` é a medida ℓ₁ dela com blocos = módulos. |
| `wang2024-block-coherence-entanglement` | **FERRAMENTA** | Relaciona coerência de bloco a emaranhamento multipartite — vocabulário para dizer o que `C_inter` é como recurso. |
| `dhamapurkar2026-localization-structured` | **FERRAMENTA** | Diagnóstico estrutural de IPR (152 ocorrências) via subespaços degenerados. Unitário, em barbell e estrela-de-cliques. |
| `mulken2011-ctqw-review` | **FERRAMENTA** | Revisão do formalismo de CTQW. |
| `celardo2019-superradiant-microtubules` | **FERRAMENTA** | Supertransfer entre **blocos** do microtúbulo — a linguagem de blocos já existe nesta literatura. |
| `plenio2008-dephasing-assisted` | **CONTEXTO** | O efeito base; "existe um ótimo" não é resultado novo. |
| `maier2019-enaqt-10qubit` | **CONTEXTO** | A travessia Anderson → ENAQT → Zeno, medida. |
| `alterman2023-enaqt-fully-connected` | **CONTEXTO** | ENAQT em rede completa. |
| `skalkin2025-dephasing-2d-lossy` | **CONTEXTO** | Defasagem em rede 2D com perdas. |
| `adithya2026-postselection-heterogeneous` | **CONTEXTO** | Mesma família de modelos, foco em pós-seleção. |

## Correções de fato ao documento de estado da arte

- **`arXiv:2205.10066` não é de "Kilic".** É de **Kurt, Rossi e Piilo** (J. Phys. A 56,
  145301, 2023). A atribuição errada aparece duas vezes na seção 2.2 e uma na tabela da
  seção 3.
- **A autoria pendente da seção 2.6** ("Quantum walks in complex networks with community
  structure", *autoria a confirmar*) é **Tsomokos**, PRA 83, 052315 (2011), arXiv:1012.2405.
- **O artigo do Frontiers 2026 é de autor único, Ngo Cheung**, tipo "Hypothesis and Theory",
  correspondência em endereço de consultório médico. A descrição da seção 2.5 (topologia
  `helical_segment` inspirada em microtúbulo) está correta, mas a escala não estava dita:
  é **N = 6** com nove ligações.

## Consultas, e quantos resultados cada uma devolveu

Consulta com zero resultados é suspeita, não conclusão. Nenhuma destas devolveu zero.

| # | consulta | resultados | achou o alvo? |
|---|---|---|---|
| 1 | **CANÁRIO** Watts-Strogatz + eficiência de transporte quântico + ruído | 8 | ✅ `arXiv:2205.10066` na 2ª posição |
| 2 | **CANÁRIO** coerência ℓ₁ + CTQW + decoerência + Haken-Strobl | 9 | ✅ `arXiv:2507.17880` na 2ª posição |
| 3 | rede modular + estrutura de comunidade + CTQW + defasagem + coerência resolvida por módulo | 9 | ✗ nenhum com a combinação; achou Tsomokos e detecção de comunidades |
| 4 | coerência de bloco + partição + subsistemas + teoria de recursos | 10 | ✅ achou a teoria de recursos de Åberg — **a terminologia que faltava** |
| 5 | coerência de bloco × transporte/defasagem/dinâmica de excitação | 8 | ✗ derivou para ENAQT genérico; **a interseção não existe** |
| 6 | `"block coherence"` + quantum walk OR transport OR dephasing | 10 | ✗ só dinâmica genérica; confirma a #5 |
| 7 | diagrama de fase taxa de defasagem × modularidade, crista, varredura 2D | 10 | ✗ nenhum; a busca reconheceu explicitamente não haver o trabalho |
| 8 | conectividade algébrica / valor de Fiedler como preditor de transporte quântico | 10 | ✗ teoria de grafos estabelecida, mas não como eixo de reporte em transporte |
| 9 | Frontiers 2026 microtúbulo, meia-vida de pureza, DOI 1855963 | 8 | ✅ localizado e lido inteiro |
| 10 | Tsomokos, comunidade, instabilidades de conexão | 9 | ✅ arXiv:1012.2405 |
| 11 | projeto inverso, topologia ótima dada taxa de defasagem | 9 | ✗ projeto inverso existe para transporte, não para coerência entre módulos |
| 12 | `"Localisation determines the optimal noise rate for quantum transport"` | 5 | ✅ arXiv:2106.12567 |
| 13 | Celardo, estados excitônicos superradiantes em microtúbulos | 10 | ✅ arXiv:1809.03438 |

## Contagens em texto completo, não em resumo

Onde afirmo ausência, contei no PDF inteiro com `pdftotext` + `grep -ci`:

| trabalho | `communit` | `modular` | `coherence` | `dephas` | `Lindblad` | `seam` |
|---|---|---|---|---|---|---|
| `kurt2023` | 0 | 0 | 0 | — | — | — |
| `tsomokos2011` | (título) | 0 | **0** | **0** | **0** | 0 |
| `dhamapurkar2026` | 1 | 3 | — | **0** | **0** | — |
| `gassab2026` | **0** | **0** | 22 (ℓ₁) | 2 | 23 | **0** |
| `celardo2019` | — | — | 0 | 1 | 0 | **0** |
| `adithya2026-stability` | 1 (numa referência) | 0 | usa ℓ₁ | sim | sim | — |

A extração de `tsomokos2011` foi conferida antes de eu confiar nos zeros: 6 páginas, 23 939
caracteres de texto. Zero por PDF ilegível e zero por ausência real são indistinguíveis sem
essa conferência.
