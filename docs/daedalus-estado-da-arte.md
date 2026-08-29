# DAEDALUS — Estado da arte e a próxima pergunta

Documento de trabalho. Consolida o levantamento bibliográfico feito em 28/08/2026, o
diagnóstico do que já está ocupado na literatura, e a formulação precisa da pergunta que
queremos investigar. Termina com o prompt de varredura para o Claude Code.

---

## 1. Como chegamos até aqui

O Daedalus nasceu para responder à pergunta da Seção 2 do projeto original: se uma rede
modular inspirada na organização estrutural dos microtúbulos apresenta um regime
intermediário de conectividade em que a comunicação entre módulos é facilitada sem que a
excitação se delocalize completamente.

O laboratório está construído e funciona. As primeiras medidas confirmam o efeito no caso
unitário: com religação de 2% mantendo `|E|` fixo, `λ₂` sobe 69× (4,06e-4 → 0,0280) e a
coerência `ℓ₁` sobe 6,6× (194 → 1,29e3), enquanto `Q` cai apenas 1,9%.

Três problemas de enquadramento apareceram no caminho, e todos foram encarados:

**A religação uniforme não tem correspondente biológico.** Watts-Strogatz sorteia o parceiro
uniformemente na rede inteira. Não há mecanismo conhecido que ligue o dímero 20 ao dímero
180 dentro de um único microtúbulo com a mesma intensidade do acoplamento entre vizinhos.

**A ressonância com ritmos cerebrais não fecha.** Acoplamento dipolar entre dímeros fica na
faixa de meV, dando frequências de ~10¹² Hz. Ritmos cerebrais são de 1 a 100 Hz. São dez a
doze ordens de grandeza. Nenhum valor de expoente de decaimento traz o espectro de THz
para Hz — a lei de potência redistribui autovalores dentro da mesma escala, fixada por γ.

**Emaranhamento não é aresta.** Aresta é termo do Hamiltoniano; emaranhamento é propriedade
do estado, produzida pela dinâmica. A causalidade é numa direção só. A concurrence
`C_ij = 2|ψ_i ψ_j*|` que o Daedalus calcula é saída, nunca entrada.

Daí a reformulação que motiva este documento: **a pergunta deixa de ser biológica e passa a
ser tecnológica** — "dada uma taxa de defasagem, qual arquitetura de rede maximiza a
coerência de longo alcance?" É bem posta, falseável, e não depende de nada ser verdade
sobre microtúbulos.

---

## 2. O que a literatura já estabeleceu

### 2.1 ENAQT — o efeito base é antigo e está medido

O fenômeno central (ruído aumenta a eficiência de transporte) está estabelecido desde
Plenio & Huelga, *Dephasing-assisted transport: quantum networks and biomolecules*,
NJP 10, 113019 (2008).

A travessia completa já foi observada experimentalmente em dez íons aprisionados: dinâmica
coerente e localização de Anderson em ruído baixo, depois ENAQT, e supressão pelo efeito
Zeno em ruído alto. No regime onde o ENAQT é mais eficaz o transporte é essencialmente
difusivo, com coerências apenas em tempos muito curtos.
→ Maier et al., *Environment-Assisted Quantum Transport in a 10-qubit Network*,
PRL 122, 050501 (2019).

Mecanismo: a eficiência máxima ocorre quando a taxa de decoerência é comparável às escalas
de energia coerentes do sistema.
→ Rebentrost, Mohseni, Kassal, Lloyd, Aspuru-Guzik, *Environment-assisted quantum transport*.
→ Kassal & Aspuru-Guzik, *Environment-assisted quantum transport in ordered systems*, NJP (2012).
→ Zerah-Harush & Dubi, *Universal Origin for ENAQT in Exciton Transfer Networks*, JPCL (2018).
→ Shabani, Mohseni, Rabitz, Lloyd, *Numerical Evidence for Robustness of ENAQT*, arXiv:1405.2623.
→ *Optimal Conditions for ENAQT on the Fully Connected Network*, arXiv:2309.00164.
→ *Dephasing enhanced transport of spin excitations in a 2D lossy lattice*, arXiv:2502.10854.

**Consequência para nós:** "existe um ótimo de defasagem" não é resultado novo. Precisamos
de algo mais específico.

### 2.2 Topologia × ruído — aqui está o problema para a hipótese original

**Este é o trabalho que mais ocupa o nosso terreno.** Kurt, Rossi e Piilo estudaram o
papel da topologia de grafo na eficiência de transporte em redes de remoção aleatória e
Watts-Strogatz, com quatro modelos ambientais (sem ruído, ruído telegráfico clássico, banho
quântico térmico, banho + RTN). Concluíram que mudanças pequenas e específicas na topologia
são mais eficazes que manipulações ambientais, e classificaram a dependência de ruído da
eficiência em redes Watts-Strogatz em seis classes.
→ Kurt, Rossi & Piilo, *Quantum transport efficiency in noisy random-removal and small-world
networks*, J. Phys. A 56, 145301 (2023), arXiv:2205.10066.
Conferido na varredura: `community`, `modular` e `coherence` aparecem **zero** vezes no texto
completo. O observável é η, probabilidade de captura no sorvedouro.

Do lado unitário, CTQW em redes small-world construídas adicionando ligações aleatórias a
um anel: transporte muito rápido, mas sem equipartição — em média o éxciton continua mais
provável no sítio inicial.
→ Mülken, Pernice, Blumen, *Quantum transport on small-world networks*, arXiv:0705.1608.
Nota: eles **adicionam** ligações. Nossa disciplina de `|E|` fixo é mais rigorosa.

Revisão geral do formalismo:
→ Mülken & Blumen, *CTQWs: Models for Coherent Transport on Complex Networks*, arXiv:1101.2572.

### 2.3 Coerência ℓ₁ e topologia — o mais próximo dos nossos observáveis

Estudo de 2026 sobre estabilidade de CTQWs em topologias ciclo, completa, estrela,
Erdős-Rényi, small-world e scale-free, sob decoerência intrínseca, ruído de Haken-Strobl e
quantum stochastic walk, caracterizada por probabilidades de nó, norma ℓ₁ de coerência,
fidelidade, distância quântico-clássica e entropia de von Neumann.

Achado central: redes densamente conectadas e dominadas por hubs são estáveis sob
Haken-Strobl mas vulneráveis sob QSW, e essas mesmas redes exibem **menor** coerência no
regime sem ruído devido à localização inerente — um compromisso fundamental entre
localização e coerência.
→ *Stability of Continuous Time Quantum Walks in Complex Networks*, arXiv:2507.17880,
Phys. Scr. (2026).

**Consequência:** o compromisso localização-coerência que postulamos já foi identificado.
Mas a lista de topologias deles **não inclui redes modulares**.

Relacionado (mesma família de modelos de decoerência, foco em pós-seleção):
→ *Postselection induced localization and coherence in quantum walks on heterogeneous
networks*, arXiv:2603.17629.

### 2.4 Acoplamento de longo alcance — a lei de potência

Numa nanoestrutura 1D desordenada com hopping de longo alcance, a eficiência primeiro decai
exponencialmente com a desordem, depois é *aumentada* por ela (regime DET), até atingir um
regime independente da desordem (DIT) que persiste por várias ordens de magnitude.
→ Chávez, Mattiotti, Méndez-Bermúdez, Borgonovi, Celardo, PRL 126, 153201 (2021).
→ Continuação: *Disorder enhanced transport as a general feature of long-range hopping
models*, arXiv:2601.07787.

Expoente crítico já localizado em contexto próximo: para hopping `1/r^α` em cadeia 1D com
defasagem, `α_c ≈ 1,5`. Abaixo, transporte superdifusivo e rapidamente independente da
defasagem; acima, no limite `α ≫ 1`, transporte difusivo.
→ Sarkar et al., *Impact of dephasing on non-equilibrium steady-state transport in fermionic
chains with long-range hopping*, arXiv:2310.01323.

**Consequência:** `α = 3` dipolar cai claramente do lado do curto alcance. O gerador de lei
de potência provavelmente mostrará que o valor fisicamente realista **não** produz o regime
interessante. Isso é resultado negativo publicável, mas já sabemos qual é.

Alerta adicional: no limite de alcance infinito, interferência destrutiva entre caminhos
suprime a transferência; para alcance grande mas finito o efeito enfraquece, e desordem
fraca contraria essa interferência, melhorando a transferência.
→ *Trapped-ion quantum simulation of excitation transport: disordered, noisy, and long-range
connected quantum networks*, arXiv:1710.09408.

### 2.5 Microtúbulos — campo mais ativo do que se esperava

Triptofanos na configuração nativa do microtúbulo exibem um estado excitônico de menor
energia superradiante, completamente estendido sobre a rede de cromóforos.
→ Celardo, Angeli, Craddock, Kurian, *On the existence of superradiant excitonic states in
microtubules*, NJP 21 (2019).

Trabalho de 2026 muito próximo do nosso: como inserir uma tubulina em dímeros e segmentos
contendo espirais (uma espiral = uma volta circunferencial de 13 dímeros) redireciona
caminhos de correlação. Evolução por Lindblad, com medida de não-Markovianidade.
Componentes superradiantes exportam correlações rapidamente; subradiantes as retêm.
Desordem estática e estrutural suprime transporte de longo alcance.
→ *Quantum Information Flow in Microtubule Tryptophan Networks*, Entropy 28(2), 204 (2026),
arXiv:2602.02868.

→ Craddock et al., *Oxidative species-induced excitonic transport in tubulin aromatic
networks*, arXiv:1709.03828 (Haken-Strobl em rede de triptofanos).
→ *Molecular Dynamics-Derived Coloured Noise Mediates Anderson Localisation and
Environment-Assisted Transport of Tryptophan Excitons in Tubulin*, arXiv:2607.11135.

**O achado mais importante deste levantamento para nós.** Um artigo de 2026 usou topologia
"helical_segment", explicitamente descrita como inspirada em microtúbulo apenas em sentido
estrutural e heurístico — o mesmo enquadramento da nossa Seção 1. O resultado deles
argumenta contra a interpretação de que "mais conectividade é sempre melhor": sob ruído
markoviano local, aumentar conectividade ou tamanho **encurtou** a meia-vida de pureza,
porque cada sítio ou ligação adicional traz canais de decaimento extras. Só com ruído
amortecido por estrutura de memória ou subradiante é que conectividade maior permaneceu
tolerável.
→ **Cheung, N.** (2026), *Transient entanglement in minimal open XXZ spin chains: a toy-model
analogy for microtubule-inspired quantum biology*, Front. Psychiatry 17, 1855963,
doi 10.3389/fpsyt.2026.1855963. Autor único, tipo "Hypothesis and Theory". **A escala importa e
não estava dita: N = 4, 6, com varredura até 10** — o `helical_segment` deles é um grafo de
**seis sítios com nove ligações**. Ver `bibliografia/NOVIDADE.md` item 4: o observável é pureza
global sob amortecimento de amplitude, não coerência entre módulos sob defasagem pura.

Isso parecia **contrariar diretamente a nossa hipótese central no regime com ruído**. Foi lido
inteiro na varredura, e **não contraria**: mede pureza global com amortecimento de amplitude em
N ≤ 10, e a "conectividade" que encurta a meia-vida é em boa parte o acoplamento J. Ver
`bibliografia/NOVIDADE.md` item 4 — H4 fica, reescrita como hipótese sobre pureza sob perda.

Nota de contexto que também importa: esse artigo saiu numa revista de psiquiatria. É onde
trabalhos com enquadramento "microtubule-inspired" tendem a cair. Vale considerar ao
escolher onde submeter.

### 2.6 Redes modulares e CTQW — pouco, e é aqui que há abertura

Localização é governada pela interação entre subespaços degenerados e hibridização entre
subespaços invariantes; valores de IPR conectam-se ao número efetivo de vértices visitados,
dando diagnóstico estrutural para prever transporte em redes modulares. Conectividade
sozinha determina onde e quão fortemente uma caminhada quântica localiza.
→ *Localization Without Disorder: Quantum Walks on Structured Graphs*, arXiv:2603.05643.
Mas: unitário, em grafos barbell e estrela-de-cliques. Sem defasagem, sem costura.

Detecção de comunidades usando probabilidade de transporte quântico e fidelidade de estado
como medidas de proximidade:
→ Faccin, Migdał, Johnson, Bergholm, Biamonte, *Community Detection in Quantum Complex
Networks*, PRX 4, 041012 (2014).
Nota: usa transporte para **encontrar** comunidades. Nós queremos o inverso — como a
comunidade afeta o transporte.

→ **Tsomokos**, *Quantum walks on complex networks with connection instabilities and community
structure*, PRA 83, 052315 (2011), arXiv:1012.2405. CTQW em redes com estrutura de comunidade,
foco em falhas de ligação. **Unitário puro**: `dephasing`, `decoherence`, `Lindblad` e
`coherence` aparecem zero vezes. É o mais próximo em estrutura, e não tem ruído.

---

## 3. O que está ocupado — diagnóstico honesto

A hipótese original, como está na Seção 2 do projeto, está em grande parte tomada:

| O que pensávamos ser novo | Onde já está |
|---|---|
| Varredura em `p` de Watts-Strogatz com decoerência | Kurt, Rossi & Piilo 2023, arXiv:2205.10066 |
| Existência de ótimo de defasagem | Plenio & Huelga 2008; Maier 2019 |
| Compromisso localização × coerência | arXiv:2507.17880 (2026) |
| CTQW em small-world, transporte rápido sem equipartição | Mülken 2007 |
| Lei de potência `1/r^α` com defasagem, expoente crítico | Sarkar arXiv:2310.01323 |
| Conectividade maior ajuda sob ruído | **Contrariado** por Frontiers 2026 |

---

## 4. O que sobra de genuinamente novo

**O plano bidimensional com modularidade explícita.** Ninguém varreu simultaneamente um
parâmetro de modularidade e a taxa de defasagem medindo *coerência resolvida por módulo*.
Kurt, Rossi & Piilo varreram topologia × ruído, mas com eficiência de transporte agregada, não com
correlações entre blocos. O estudo de 2026 mediu coerência ℓ₁, mas em topologias não
modulares. A nossa `ConcurrencePorModulo` é o observável que ninguém está usando.

**λ₂ como eixo em vez de `p`.** Toda a literatura reporta contra parâmetros de construção.
Reportar contra o valor de Fiedler torna os resultados comparáveis entre famílias de grafo —
e nós já temos a máquina que o calcula corretamente, com o cuidado de convergência que
custou caro na etapa 2.

**A costura helicoidal.** Não encontrei nenhum trabalho de CTQW que trate o deslocamento de
3 dímeros como parâmetro. É quebra de simetria translacional transversal numa geometria
específica.

**A pergunta invertida.** Em vez de "essa arquitetura produz coerência?", perguntar "dada
uma taxa de defasagem, qual é a arquitetura ótima?". Projeto inverso, nunca feito para redes
modulares.

---

## 5. A pergunta que queremos investigar agora

> **O plano bidimensional com modularidade explícita.**
>
> Existe uma crista no plano (estrutura × ruído) onde a coerência de longo alcance entre
> módulos é máxima, e essa crista se move com a modularidade da rede?

### 5.1 O observável, e a ordem das operações

Esta subseção existe porque a primeira formulação estava errada de um jeito que não
aparecia, e o erro era de definição, não de código.

**Nomenclatura, fixada pela varredura.** `C_inter` não é definição nossa: é a medida ℓ₁ da
teoria de recursos de **coerência de bloco** (Åberg), com blocos = módulos da rede. Os
estados *block-incoherent* são os que só têm blocos diagonais, a operação livre é o
*block-dephasing* que zera o resto, e `Σ_M C_MM + Σ_{M<N} C_MN = C_ℓ1` é a decomposição
canônica dessa teoria. Usar o vocabulário dela dá ao observável monotonicidade demonstrada
sob operações livres, em vez de o apresentar como conveniência. Ver
`bibliografia/NOVIDADE.md` item 5.

O núcleo calcula hoje, em `dae_obs.c`:

```
C_ℓ1   = (Σ_j |ψ_j|)² − 1
C_MM   = s_M² − q_M          C_MN = 2 s_M s_N        s_M = Σ_{j∈M} |ψ_j|
```

Tudo depende só dos **módulos** |ψ_j|. Para estado **puro** isso está exatamente certo — a
coerência ℓ₁ de um estado puro é Σ_{i≠j}|ψ_i||ψ_j|, e não vê fase relativa nenhuma. As
medidas unitárias já obtidas continuam válidas sem ressalva.

Sob trajetórias, não. **Cada trajetória permanece pura.** Calcular esses observáveis por
trajetória e tirar a média mede o espalhamento da amplitude, não a coerência do ensemble: a
defasagem que a fase 2 inteira existe para estudar simplesmente não entra na conta. A curva
sairia, teria forma, e responderia outra pergunta.

**A ordem correta é acumular primeiro, tomar o módulo depois:**

```
ρ_ij = ⟨ ψ_i ψ_j* ⟩_trajetórias          (média sobre realizações de ruído)
C_ℓ1(ρ) = Σ_{i≠j} |ρ_ij|
```

E a decomposição por módulo, com o módulo **dentro** do bloco:

```
C_MM = Σ_{i,j∈M, i≠j} |ρ_ij|
C_MN = 2 Σ_{i∈M, j∈N} |ρ_ij|      (M < N; o fator 2 vem de ρ ser hermitiana)

C_inter = Σ_{M<N} C_MN            ← o observável central
```

Duas propriedades que importam:

**A identidade sobrevive.** `Σ_M C_MM + Σ_{M<N} C_MN = Σ_{i≠j}|ρ_ij| = C_ℓ1(ρ)`. É a mesma
identidade que o pacote Wolfram já confere entre as companheiras anti-vacuidade, e ela
continua servindo de conferência de sanidade dentro da varredura: se não fechar, a
acumulação está errada.

**A convenção atual é o limite puro da definição correta.** Com ρ_ij = ψ_i ψ_j* temos
|ρ_ij| = a_i a_j, e daí C_MN = 2 s_M s_N e C_MM = s_M² − q_M — exatamente o que o núcleo já
calcula. Não é convenção nova; é a mesma, com a ordem das operações consertada. O que muda é
onde a média entra.

**Correção de fator.** A formulação anterior dizia `C_inter = Σ_{M≠N} C_MN`. Como `C_MN` é
simétrico, isso conta cada par duas vezes e não fecha com C_ℓ1. O certo é `Σ_{M<N}`, sobre
pares **não ordenados** — o fator 2 já está dentro de `C_MN`.

**A variante barata foi considerada e REPROVADA.** Com o módulo **fora** do bloco,

```
C̃_MN = | Σ_{i∈M, j∈N} ρ_ij | = | ⟨ S_M S_N* ⟩ |      S_M = Σ_{i∈M} ψ_i
```

custaria O(n_mod²) em vez de O(N²). Mas ela **não é uma medida de coerência de bloco**, e a
razão é estrutural, não de precisão.

Unitárias que agem **dentro** de um bloco são operações livres da partição: preservam o
conjunto dos estados block-incoherent e são reversíveis, logo toda medida legítima tem de
ser **invariante** sob elas. `C̃_MN` não é. Contraexemplo mínimo, dois módulos de dois
sítios, verificado numericamente:

```
ψ  = ( 1,  1,  1,  1)/2   →   C_01 (dentro) = 2.0     C̃_01 (fora) = 1.0
ψ' = ( 1, -1,  1,  1)/2   →   C_01 (dentro) = 2.0     C̃_01 (fora) = 0.0
```

A inversão de fase é uma unitária dentro do módulo 0. Nenhum `|ρ_ij|` muda, a coerência de
bloco continua exatamente 2,0 — e a variante barata cai a **zero**. Ela relataria "nenhuma
coerência entre os módulos" para um estado de coerência de bloco máxima.

O que `C̃_MN` mede é a coerência entre dois **modos coletivos específicos** — as
superposições uniformes de cada módulo — e isso mistura coerência de bloco com a estrutura
de fase interna. É grandeza legítima, e é outra: se for reportada, tem de ser com outro nome
e sem ser chamada de coerência entre módulos.

**Consequência prática:** o caminho denso não é preferência, é requisito. E é isso que fixa
a escala da varredura em 5.3 — N = 520 não é economia, é o que torna o observável correto
acessível.

**Bônus da escala escolhida.** Com ρ denso disponível, também cabe a medida **canônica** da
teoria de recursos, a entropia relativa de coerência de bloco,

```
C_rel(ρ) = S(Δ[ρ]) − S(ρ)          Δ = mapa de block-dephasing (zera os blocos fora da diagonal)
```

que exige os autovalores de ρ — O(N³) uma vez por ponto da grade, não por trajetória, e
instantâneo em N = 520. Reportar `C_inter` (ℓ₁) e `C_rel` juntas põe o resultado dentro da
teoria de recursos em vez de ao lado dela.

#### `C_inter` JÁ É EMARANHAMENTO — a identificação é exata neste setor

Não é uma analogia nem uma cota: no setor de **uma excitação**, a concurrence par a par entre
os sítios `i` e `j` vale

```
C_ij = 2 |ρ_ij|
```

**exatamente**, para estado puro ou misto. O motivo é estrutural. O estado reduzido de dois
sítios é um estado X na base {|00⟩, |01⟩, |10⟩, |11⟩}, e para ele a fórmula de Wootters dá
`C = 2 max(0, |z| − √(ρ₀₀ ρ₁₁))`. Como o setor **nunca popula |11⟩** — não existem duas
excitações — a subtração `√(ρ₀₀ ρ₁₁)` é identicamente zero e sobra `2|z| = 2|ρ_ij|`.

Verificado numericamente contra a fórmula de Wootters completa em 4 200 pares de estados
mistos aleatórios do setor: **discrepância relativa máxima 1,7e-08**, que é o arredondamento
da própria rota por autovalores. E a companheira: com população em |11⟩ a identidade
**quebra**, como tem de quebrar — Wootters dá 0 onde `2|ρ_ij|` dá 0,3.

**Consequência.** `C_inter = Σ_{i∈M, j∈N, M≠N} |ρ_ij|` soma cada par não ordenado duas vezes,
então ela é **exatamente `Σ C_ij` sobre pares de sítios em módulos diferentes**: a soma das
concurrences entre módulos. As duas leituras são o mesmo número:

| leitura | o que é |
|---|---|
| teoria de recursos | medida ℓ₁ de **coerência de bloco**, blocos = módulos |
| emaranhamento | soma das **concurrences par a par** entre módulos |

A correção de Wardle–Kronberg vale igual nas duas, porque o viés está em `|ρ_ij|`.

**E a identidade tem prazo de validade, que convém escrever antes de alguém esbarrar nele.**
Ela depende de `ρ₁₁ = 0`. Se a fase 2 ganhar amortecimento de amplitude com reexcitação, ou
mais de uma excitação, `C_ij` volta a ser `2 max(0, |ρ_ij| − √(ρ₀₀ρ₁₁))` e o número plotado
deixa de ser concurrence sem que nada quebre. É exatamente a classe de erro que este projeto
persegue, e por isso fica registrado aqui.

**O que NÃO temos**, e é informação diferente: emaranhamento na bipartição *módulo contra o
resto*, que é multipartite e não par a par. Ele é computável do mesmo ρ — no setor de uma
excitação a bipartição colapsa num problema efetivo de dois modos — mas é outro observável,
com outra interpretação, e não sai de graça dos números já medidos.

### 5.2 Formulação precisa

**Eixo horizontal — estrutura.** Parâmetro de controle `p` (fração religada, `|E|` fixo),
reportado contra `λ₂` (valor de Fiedler) e `Q` (modularidade de Newman). `λ₂` é o eixo
primário nas figuras: é comparável entre famílias de grafo, `p` não é.

**Eixo vertical — ruído.** Taxa de defasagem `γ_deph` do modelo de Haken-Strobl, varrida em
escala logarítmica, do regime coerente ao regime Zeno.

**Superfície — observáveis**, todos calculados sobre ρ acumulado:

1. **`C_inter = Σ_{M<N} C_MN`** — coerência de longo alcance entre módulos. Central, e o que
   ninguém está reportando. Com `C̃_inter` (variante de modo coletivo) ao lado.
2. **IPR**, para saber se a coerência veio acompanhada de delocalização completa, o que
   invalidaria a hipótese. Sob ruído o IPR é `Σ_i ρ_ii²`, que **não** precisa de ρ fora da
   diagonal e pode ser acumulado por trajetória sem armadilha.
3. **Eficiência de transferência**: `p_alvo` integrado no tempo, ou tempo até um limiar.
   Também diagonal, também livre da armadilha.

Só o observável 1 exige a matriz. Isso é o que fixa a escala da varredura.

### 5.3 Escala da varredura: N = 520, e por que isso está certo

**A varredura da fase 2 roda numa rede menor que a do laboratório.** `N_∥ = 40 × 13 = 520`,
contra 2080 do padrão interativo.

A matriz ρ tem 520² = 270 400 elementos complexos, ou **4,3 MB** — o caminho denso fica
trivial, as duas variantes do observável ficam disponíveis, e a identidade continua
conferível. Em N = 2080 seriam 69 MB por ponto da grade, multiplicados pelo número de
threads, e a escolha entre as variantes deixaria de ser livre.

O regime que interessa é definido por **λ₂ e Q, não por N**. Com 8 módulos, N = 520 ainda dá
65 dímeros por módulo — folgado para que "dentro" e "fora" do módulo signifiquem alguma
coisa. Se em algum momento quisermos confirmar que o resultado não depende de N, isso é uma
varredura reduzida em N maior, **depois, e como controle** — não como escala principal.

Isto não contraria a regra do ROADMAP ("nunca propagar a matriz densidade densa"): a regra
foi escrita para N = 2600 rodando no navegador, onde ela continua valendo. Aqui é varredura
exportada, em rede pequena, com a matriz servindo de **acumulador de médias**, não de estado
propagado — o estado continua sendo vetor O(N) em cada trajetória.

**A acumulação é amostrada no tempo.** Somar ρ a cada um dos `nt` passos custa O(N²) por
passo, contra O(N) dos observáveis diagonais. Com ~20 tempos amostrados em vez de 400, o
custo do acumulador cai 20× e a crista no plano (p, γ) continua perfeitamente resolvida. É o
mesmo raciocínio do `pop_stride` que já existe, aplicado a uma grandeza vinte vezes mais
cara por amostra.

### 5.4 λ₂ por LAPACK denso na varredura

Na varredura, `λ₂` sai de decomposição densa, não do Lanczos deflacionado. O motivo é que a
convergência do Lanczos é pior exatamente onde a física interessa — rede fortemente modular,
λ₂ pequeno — e foi o defeito caro da etapa 2. O núcleo emite `lambda2_converged`, e **falso
significa limite superior, não medida**: um limite superior plotado como se fosse medida
desloca a crista inteira.

E o custo não justifica administrar isso: λ₂ é propriedade **do grafo**, não da trajetória.
São ~2 000 grafos (10 valores de `p` × 200 realizações), não 20 000, e em N = 520 a
decomposição densa é instantânea. Elimina a questão em vez de gerenciá-la.

O Lanczos permanece no navegador, onde o custo importa e onde a bandeira já está na tela.

### 5.5 Hipóteses testáveis, na ordem em que queremos responder

- **H1.** Existe `γ*_deph` que maximiza `C_inter` a `p` fixo — ENAQT no observável de
  coerência, não só no de transporte. Com ρ acumulado esta hipótese passa a ser testável;
  com a definição anterior ela era vazia, porque o observável não via a defasagem.
- **H2.** `γ*_deph` **depende de `p`**: o ótimo de ruído se move com a modularidade. Se a
  crista for horizontal no plano, H2 é falsa e o resultado é que arquitetura e ruído
  desacoplam. **Deixou de ser a pergunta nova**: Coates, Lovett & Gauger (NJP 2021) mostram
  que a localização dos autoestados determina a taxa ótima, e a modularidade muda a
  localização — então H2 tem previsão mecanística, e confirmá-la é extensão, não descoberta.
  O peso desloca-se para **quanto** a crista se move, e com que lei.
- **H2b — a pergunta forte, e é esta.** A crista de **coerência** coincide com a crista de
  **transporte**? Não há razão para coincidirem, e ninguém mediu as duas no mesmo plano.
  Se não coincidirem, "projetar para o transporte chegar" e "projetar para coerência como
  recurso" são objetivos **distintos, com ótimos distintos** — que é exatamente a pergunta
  tecnológica da reformulação da Seção 1, agora com forma mensurável. Antecedente direto do
  lado do transporte: Walschaers et al. (PRL 2013) projetam a rede ótima por critério
  **espectral** (centrossimetria + estrutura de dubletos), mas no limite **unitário**: uma
  crista só, sem eixo de ruído, e sem coerência como recurso.

  **Exigência operacional, e ela não é detalhe.** As duas superfícies têm de sair do
  **mesmo conjunto de execuções**, não de duas rodadas. Se `C_inter` e `p_alvo` integrado
  vierem de trajetórias diferentes, a distância entre as cristas fica contaminada por ruído
  estatístico independente, e a conclusão passa a ser sobre a barra de erro em vez de sobre
  a física. Com o mesmo ensemble, a diferença é correlacionada e a comparação é honesta.
- **H3.** Existe região onde `C_inter` é alta **e** o IPR permanece acima de um limiar: o
  "regime intermediário" da Seção 2 original, agora com ruído.
- **H4, reescrita.** O achado de Cheung (2026) é sobre **pureza global sob perda de
  excitação**, não sobre coerência entre módulos sob defasagem pura — ver
  `bibliografia/NOVIDADE.md` item 4. Reescrita: *acrescentando amortecimento de amplitude ao
  modelo, a crista de `C_inter` sobrevive?* Se sobreviver, temos a delimitação de quando cada
  comportamento vale; se não, temos o mecanismo. É barato e responde de frente.

  **Cuidado de implementação, desde o primeiro dia.** Com amortecimento de amplitude a norma
  deixa de se conservar por um **segundo** motivo além do salto de defasagem, e o diagnóstico
  de norma — o indicador mais confiável do projeto, que atravessou seis etapas — para de
  distinguir "a trajetória saltou" de "a excitação foi perdida". São **dois contadores
  separados** desde o início, não um só interpretado depois: caso contrário o instrumento
  fica ambíguo exatamente onde a física fica interessante.

### 5.6 Geometria de referência

Microtúbulo `40 × 13` com `seam_shift ∈ {0, 3}`, pontas abertas. Comparado contra SBM de
mesma `Q` e mesma `λ₂`, para separar o que é da costura do que é da modularidade.

A costura é quebra de simetria translacional transversal, e é parâmetro de **rede**, não de
forma: no embutimento helicoidal do laboratório (`z = m + seam·q/n⊥`) toda ligação lateral
tem o mesmo comprimento, a da costura inclusive, e ela é geometricamente invisível. Invisível
na geometria, visível no espectro — é esse o argumento, e a vista 3D serve de figura para
ele.

### 5.7 Verificação da fase 2: a companheira que não é trajetória — ✅ FEITA

A média de trajetórias precisa reproduzir a solução exata de Lindblad. Sem essa conferência,
200 realizações produzem barra de erro respeitável tanto na convergência certa quanto na
errada — e o desvio padrão entre trajetórias não distingue as duas.

Em `N ≈ 50` o Liouvilliano vetorizado é 2500 × 2500, trivial em Mathematica, e o pacote
`Daedalus.wl` já tem `MatrixExp` e `Eigensystem`. Estende a disciplina de concordância
empírica para a fase 2 sem construir nada novo: dois métodos, **e um deles não é trajetória
nenhuma**.

Anti-vacuidade obrigatória, como em todo o resto: a conferência tem de ser vista falhando.
Um número de trajetórias deliberadamente baixo, ou uma taxa de defasagem trocada, tem de
reprovar — senão "bateu" e "o comparador está quebrado" são indistinguíveis.

#### Resultado, 28/08/2026, núcleo `76a843e583e9bff1`

**O desdobramento do núcleo converge para Lindblad, nos cinco regimes de ruído e nas duas
topologias.** `daedalus traj` escreve o ρ médio; `DaedalusLindblad` monta o superoperador
vetorizado e o exponencia. `n = 50`, quatro conjuntos de trajetórias por caso (250 a 16 000),
40 execuções ao todo, 92 s de CPU.

| caso | rms (250) | rms (16 000) | p | p sabotado |
|---|---|---|---|---|
| microtúbulo γ = 0,02 | 2,7e-4 | 2,4e-5 | **0,579** | 0,013 |
| microtúbulo γ = 0,09 | 2,0e-4 | 5,4e-5 | **0,331** | 0,017 |
| microtúbulo γ = 0,4 | 4,0e-4 | 5,3e-5 | **0,476** | 0,003 |
| microtúbulo γ = 1,8 | 3,5e-4 | 5,0e-5 | **0,501** | 0,010 |
| microtúbulo γ = 8 | 2,1e-4 | 2,2e-5 | **0,546** | −0,003 |
| SBM γ = 0,02 | 1,9e-4 | 2,1e-5 | **0,546** | 0,003 |
| SBM γ = 0,09 | 2,0e-4 | 4,8e-5 | **0,363** | 0,015 |
| SBM γ = 0,4 | 4,2e-4 | 5,1e-5 | **0,494** | −0,003 |
| SBM γ = 1,8 | 4,6e-4 | 7,0e-5 | **0,471** | 0,005 |
| SBM γ = 8 | 2,3e-4 | 3,1e-5 | **0,483** | 0,000 |

O SBM tem λ₂ = 2,11 e Q = 0,33 — modular de verdade, e é a segunda metade do alvo da
Seção 5.6, onde o microtúbulo é comparado contra SBM de mesma Q e mesmo λ₂.

**O critério é a LEI, não um limiar de desvio.** Ajustando `desvio ~ n^(-p)` sobre a faixa
inteira, Monte Carlo não enviesado prevê p = 1/2. Um desdobramento enviesado converge — para
outro lugar — e o desvio estabiliza.

**A companheira é o γ dobrado**, resolvendo Lindblad com a taxa errada sobre AS MESMAS
trajetórias. Ela dá p entre −0,003 e 0,017 nos dez casos: o desvio para de cair, como tem de
parar quando o alvo é outro.

#### O limiar foi calibrado pela medida, depois de dar falso alarme

A primeira versão do portão usava `p > 0,35` — "0,5 menos uma folga", tirado da teoria. Ele
**reprovou um caso correto**: microtúbulo γ = 0,09 mediu 0,331. Com quatro pontos o expoente
tem variância própria, e um limiar encostado no valor teórico reprova por sorte, que é a mesma
falha das razões consecutivas uma iteração antes.

A medida sobre os dez casos dá a calibração honesta:

| | p |
|---|---|
| pior caso correto | 0,331 |
| pior caso sabotado | 0,017 |
| **separação** | **20×** |

O limiar declarado é **0,15**: 2,2× abaixo do pior correto e 8,8× acima do pior sabotado.
É a aplicação direta de `CONVENTIONS.md` 10.1.7 — a resolução da comparação foi medida antes
de o limiar ser fixado.

Duas escolhas de método que valem registro:

- **RMS sobre as entradas, não o máximo.** O máximo sobre 2500 entradas é estatística de
  extremo: cai como 1/√n igual, mas com dispersão grande. O máximo continua reportado, porque
  responde a outra pergunta — qual o pior erro em qualquer entrada.
- **O superoperador é montado, não atalhado.** Para defasagem pura dá para escrever direto que
  as coerências decaem como `exp(-γt)`. Não se escreve: o atalho usa o mesmo raciocínio que se
  quer conferir, e duas contas com o mesmo raciocínio concordam mesmo quando o raciocínio está
  errado.

Isto libera a varredura. Sem este portão, 20 000 execuções de uma dinâmica não verificada
produziriam um plano com aparência de resultado, e a barra de erro pareceria respeitável do
mesmo jeito.

### 5.9 O ESTIMADOR É ENVIESADO, e o viés quase decidiu a física

Achado de 28/08/2026, na sonda de dimensionamento. É o mais grave desde o defeito
não-monotônico do `K`, e pelo mesmo motivo: o observável produzia um número plausível e
sistematicamente errado.

#### O que quase aconteceu

`C_inter = Σ|ρ̂_ij|` medido de um ensemble finito **não converge para o valor verdadeiro pela
média**: ele converge por cima. Medido na sonda A (γ = 0,05), em seis níveis:

```
C_inter(n) = C∞ + B·n^(-1/2)        C∞ = 10,74      B = 42,9      resíduo < 2%
```

Em `n = 400` o viés vale **2,15** sobre um valor verdadeiro de 10,74 — 20%. Os passos entre
células vizinhas que a grade precisa resolver valem **1,21** (em `p`) e **0,98** (em `γ`).

**O viés é maior que a diferença que a grade precisa resolver.** E como ele depende de σ, que
varia com γ, ele **não cancela entre vizinhas**: deslocaria a crista em vez de apenas
levantar o nível. O resultado teria superfície, teria crista, teria barra de erro
respeitável, e a crista estaria no lugar errado. Nada no plano indicaria isso.

#### Por que, e é garantido

`|·|` é convexo. Por Jensen, `E[Σ|ρ̂_ij|] ≥ Σ|E ρ̂_ij| = Σ|ρ_ij|`: viés **positivo, sempre**.
Nas entradas onde `ρ_ij ≈ 0` — a esmagadora maioria das `N² = 270 400` — o módulo de uma
estimativa ruidosa tem média `σ_ij √(π/2)/√n` mesmo quando o valor verdadeiro é zero. Somado
sobre N², domina.

Não é defeito de código. É propriedade do estimador, e ela estava lá desde que o observável
foi definido.

#### O fenômeno tem nome, em três literaturas

**Radioastronomia — "polarization bias".** A intensidade polarizada `√(Q²+U²)` é enviesada
para cima pelo ruído em Q e U. O estimador de correção padrão é o de **Wardle & Kronberg
(ApJ 194, 249, 1974)**:

```
P_corrigido = √( Q² + U² − ½(δQ² + δU²) )
```

que é exatamente *subtraia a variância do quadrado antes de tirar a raiz*.

**Ressonância magnética — "viés Riciano".** `|·|` de um complexo ruidoso é Rice; em SNR baixo
a magnitude é enviesada. Gudbjartsson & Patz, MRM 34, 910 (1995).

**A ressalva que mais nos afeta: Simmons & Stewart (A&A 142, 100, 1985)** compararam os
métodos de correção e concluíram que **todos deixam viés residual em SNR baixo** — e é
justamente em SNR baixo que vivem quase todas as nossas N² entradas.

#### E a física quântica evita o problema por construção

A literatura de medidas aleatorizadas estima **pureza** e **Rényi-2**, não somas de módulos, e
o motivo é estrutural: U-estatísticas dão estimadores **exatamente não enviesados** de
funcionais **polinomiais** de ρ, e só deles. Nas palavras do trabalho de U-estatísticas de
2026: *"Estimation of purities, Rényi entropies, and other polynomial spectral functionals
instead requires products of independent shadows."*

`Σ|ρ_ij|` não é polinomial. **Não existe estimador não enviesado dele a partir de amostras
finitas.**

#### A tensão é estrutural, e vale enunciá-la

| medida | monótona de coerência? | polinomial? | estimador não enviesado? |
|---|---|---|---|
| ℓ₁ (`C_inter`) | **sim** | não | **não existe** |
| entropia relativa (`C_rel`) | **sim** | não | não existe |
| ℓ₂ / Hilbert–Schmidt | **não** | **sim** | sim, por U-estatística |

Baumgratz, Cramer & Plenio (PRL 113, 140401, 2014) provam no Apêndice G, por contraexemplo,
que `C_ℓ2` **não** satisfaz a monotonicidade (C2b). Trocar ℓ₁ por ℓ₂ compraria um estimador
limpo ao preço do estatuto de recurso que a Seção 5.1 acabou de estabelecer. Não é troca boa.

#### O que fazer, então

1. **Manter ℓ₁ e `C_rel`** — a física decide o observável, não a conveniência estatística.
2. **Corrigir o viés explicitamente, e declarar a correção.** A correção de ordem principal é
   a de Wardle–Kronberg aplicada por entrada: subtrair a variância estimada de `|ρ̂_ij|²`
   antes da raiz. Ela é a U-estatística do grau 2, custa **um acumulador real N² a mais**
   (metade da memória de um complexo) e é exata na ordem principal — melhor que a
   extrapolação de Richardson que a sonda usou, que dobra a variância.
3. **Manter a extrapolação em `n` como verificação**, não como correção: pela ressalva de
   Simmons & Stewart, sobra viés residual em SNR baixo, e a única forma de ver quanto sobrou
   é variar `n` e olhar se o resultado corrigido é plano.
4. **`C_rel` também é enviesado**, e mais: na mesma sonda ele derivou 132% contra os 51% do
   `C_inter`. Estimação de entropia a partir de amostras finitas tem literatura própria
   (Miller–Madow e sucessores) e precisa do mesmo tratamento antes de ser reportado.

#### Como o achado apareceu, porque o método é replicável

O desvio de `C_inter` não caía como `1/√n` (`p = 0,16`). A conclusão óbvia seria correlação
entre trajetórias, e o suspeito seria o PRNG — a peça mais cara de auditar do projeto.

O que separou as causas foi rodar o **mesmo diagnóstico sobre um estimador linear nas mesmas
amostras**: a população de um módulo, `Σ_{i∈M} ρ_ii`, que é linear em ρ e portanto não
enviesada por construção. Ela deu `p = 0,56`. O gerador estava bom; o problema era a
não linearidade do `|·|`.

Virou regra em `CONVENTIONS.md` 10.1.8.

### 5.10 Dimensionamento da grade — sonda de 28/08/2026

Nenhuma célula desta seção é resultado de física.

**Anti-vacuidade, as duas.** `C_inter` varia entre as três sondas por um fator de **17 200**
(12,14 no regime coerente, 1,18 no intermediário, 0,00071 no Zeno): o observável responde. E
com `n_modules = 1` ele dá **zero exato**, sem erro de indexação na soma sobre `M < N`.

**Custos medidos**, N = 520, 21 amostras: **25,5 ms por trajetória**; **101 MB por thread**
(176 MB com o segundo acumulador da correção de viés). `C_rel` custava 135 s por avaliação
com Jacobi e passou a **5,4 s** com Householder mais bissecção de Sturm — 25× — com os dois
métodos concordando em 12 dígitos.

**Passos entre células vizinhas**, com a grade de teste: `|Δ C_inter|` = 1,21 em `p` (102%) e
0,98 em `γ` (83%). São diferenças grandes; a grade não precisa ser mais grossa por causa
delas.

**Quantas realizações.** Com o estimador corrigido (`sd` = 1,74 em n = 800) e o critério
`sd = Δ/5`, são **~63 000 trajetórias por célula** — duas ordens de grandeza acima das 400
que se poderia supor. Com 12 réplicas o `sd` tem ~21% de incerteza, então esse número carrega
~40%: é ordem de grandeza, não precisão.

#### A sonda D: a variação entre realizações do grafo NÃO domina

A sonda principal fixa o grafo e varia só o ruído. A varredura real tem também a variação
entre realizações da religação, e em `p` alto ela poderia dominar — o que mudaria a decisão
de grade inteira. Medido em `p = 0,40`, γ = 0,5, com 12 réplicas em quatro níveis, cada
réplica com **outro grafo**:

| | razão de `sd` (grafo varia / grafo fixo) | fator nos `n` |
|---|---|---|
| `C_inter` bruto | **1,13×** | ~1,3× |
| `C_inter` corrigido | **1,01×** | ~1,0× |

O observável é uma soma global sobre 520 vértices e se auto-promedia; a religação muda ~410
das 1024 arestas e quase não move a dispersão. **A grade escolhida continua cabendo.**

#### E a sonda D mostrou um limite da correção de Richardson

Em `p = 0,40` o estimador corrigido por `2C(n) − C(n/4)` **não estabiliza**: 8,07 → 3,97 →
1,24 → 0,83 de n = 100 a 800, com `sd` de 4,3 no primeiro nível. Onde o viés é grande e o
valor verdadeiro é pequeno, a extrapolação amplifica ruído em vez de remover viés.

Isso reforça a recomendação da Seção 5.9: a correção de produção deve ser a de
**Wardle–Kronberg por entrada** — subtrair a variância estimada de `|ρ̂_ij|²` antes da raiz,
que é a U-estatística de grau 2 — e não a extrapolação em `n`. Richardson fica como
*verificação*, que é o papel para o qual ele serve bem.

#### Grade escolhida

**7 × 7 com n = 63 000 por célula**, ~22 h de CPU, ~1,8 h em 12 núcleos. A razão não é o
relógio: os `n` estimados são **piso**, e a grade menor entrega o plano inteiro rápido, mostra
se a crista existe, e deixa a decisão de refinar ser tomada com informação em vez de com
extrapolação.

Descartadas: 10 × 10 com os mesmos `n` (45 h, comprometendo demais antes de saber se há
crista) e a de tolerância afrouxada para `sd = Δ/3`, que economiza pouco e mexe justamente no
fator que separa "há crista" de "há superfície irregular".

#### A correção implementada e verificada — a varredura está liberada

`|ρ_ij|²` sem viés, pela U-estatística de grau 2, que é a correção de Wardle–Kronberg
escrita como estimador:

```
|ρ_ij|²_U = ( n·|ρ̂_ij|² − m2_ij ) / (n − 1)        m2_ij = ⟨ |ψ_i|² |ψ_j|² ⟩_k
```

Exatamente não enviesada: `E[n|ρ̂|²] = (n−1)|ρ|² + E|X|²`, e `m2` estima `E|X|²`. Custa **um
acumulador REAL N² por amostra** — metade da memória do complexo, 45 MB contra os 91 MB de ρ.

Verificada exigindo que ela seja **plana em n**, nas duas células onde os regimes são mais
diferentes:

| | bruto | Richardson | **Wardle–Kronberg** |
|---|---|---|---|
| deriva, A (γ = 0,05) | +26,0% | +8,8% | **+7,1%** |
| `sd` em n = 800, A | 0,934 | 1,735 | **0,954** |
| deriva, D (p = 0,40) | +127,4% | **+546,6%** | **+65,5%** |
| `sd` em n = 800, D | 0,291 | 0,711 | **0,189** |

Wardle–Kronberg ganha nos dois eixos: menos deriva **e** menos variância. Richardson colapsa
em `p` alto, como a sonda D já indicava.

**E o resíduo é quantificado, não ignorado.** Ajustando `C(n) = C∞ + B/√n`:

| célula | estimador | B | C∞ | viés em n = 63 000 | `sd` em n = 63 000 |
|---|---|---|---|---|---|
| A | bruto | 48,7 | 10,34 | 0,194 | 0,105 |
| A | **Wardle–Kronberg** | **12,1** | 10,67 | **0,048** | 0,108 |
| D | bruto | 84,2 | 1,25 | 0,336 | 0,019 |
| D | **Wardle–Kronberg** | **19,8** | 1,20 | **0,079** | 0,014 |

A correção derruba o coeficiente de viés por **4×**, os dois estimadores extrapolam para o
mesmo `C∞` (10,34 contra 10,67; 1,25 contra 1,20), e no orçamento da grade o viés residual
vale 0,05 a 0,08 contra o critério de Δ/5 = 0,196. **Passa com folga de 2,5×**, e a variância
também.

O resíduo que sobra é o corte em zero do `|ρ|²` negativo — precisamente o viés que Simmons &
Stewart mostraram que nenhum método elimina em SNR baixo. Ele não é ignorado: a extrapolação
em `n` existe para medi-lo, e é esse o papel dela daqui em diante. **Dois métodos, um deles
usado só para auditar o outro** — o mesmo arranjo do Wolfram contra o Chebyshev.

#### `C_rel` fica fora do plano, e há um número que decide isso

`C_rel` derivou 132% na sonda contra os 51% do `C_inter`, e a literatura explica por quê: a
entropia envolve o logaritmo do espectro, e os autovalores pequenos de `ρ̂` são justamente os
mais contaminados por ruído de amostragem.

**Miller–Madow não serve** — foi desenhado para distribuições discretas com contagens. O caso
aqui é entropia de von Neumann de uma matriz densidade estimada, que é literatura própria. E
ela dá um número que decide o escopo: **o estimador plug-in tem barreira quadrática, Ω(d²)
amostras** ([AISW20], e o trabalho de 2026 que a quebra parcialmente). Com `d = N = 520`,

```
d² = 270 400        contra        n = 63 000 da grade
```

Estamos a **23% do necessário**. O `C_rel` calculado por plug-in no orçamento da varredura
está provadamente fora de alcance, e os 132% de deriva medidos são o sintoma disso.

**Decisão:** `C_rel` não vai no plano. Ele entra em **algumas células selecionadas**, com `n`
muito maior, como verificação de que as duas medidas **ordenam do mesmo jeito**. Isso preserva
o argumento de teoria de recursos sem pendurar 49 células num estimador que não se sustenta
no orçamento.

#### Isto vira seção do artigo

Não é detalhe de método. **"Estimação de medidas de coerência não polinomiais a partir de
trajetórias, e por que o viés não cancela numa varredura"** conecta o trabalho a
Wardle–Kronberg, ao viés Riciano e à barreira quadrática da entropia de von Neumann —
literaturas que ninguém em transporte quântico cita. É mais um pedaço de ponte, no mesmo
espírito da coerência de bloco: o objeto tem estatuto de um lado e o fenômeno tem estatuto do
outro, e o trabalho é ligá-los.

### 5.8 Custo computacional

~10 pontos em `p` × ~10 em `γ_deph` × ~200 realizações = **~20 000 execuções**. A contagem
não muda com N; o custo por execução, sim: o matvec é O(nnz) com nnz ∝ N, e a ordem de
Chebyshev não depende de N depois da normalização, então 2080 → 520 é cerca de 4× mais
barato por execução.

O acumulador domina a memória, não o tempo: 4,3 MB por ponto da grade, e a paralelização
natural é **por ponto da grade** (cada thread com o seu acumulador), não por trajetória
dentro de um ponto — que exigiria redução sobre um array de 4,3 MB.

Sob OpenMP, cada realização precisa de **fluxo de PRNG próprio e reproduzível** —
splitmix64 de (semente-base, índice da realização) — e não de um gerador compartilhado.
Com fluxo compartilhado o número de threads entra no resultado, e entra em silêncio.

Isto é exportação para C++, não navegador. É onde a arquitetura do Daedalus ganha o
propósito para o qual foi desenhada.

---

## 6. Prompt para o Claude Code — varredura bibliográfica

> ## Tarefa: varredura bibliográfica sobre o plano modularidade × defasagem
>
> Antes de implementarmos a fase 2 do Daedalus (Haken-Strobl por trajetórias quânticas),
> preciso saber se a pergunta que queremos investigar já foi respondida. As seções 1 a 5
> deste documento têm o levantamento preliminar e a formulação exata da pergunta — leia-as
> antes de começar.
>
> **O que estamos investigando:** existe uma crista no plano (modularidade da rede × taxa de
> defasagem) onde a coerência de longo alcance **entre módulos** é máxima, e essa crista se
> move com a modularidade? O observável central é a coerência resolvida por módulo somada
> sobre pares não ordenados,
>
> ```
> ρ_ij = ⟨ψ_i ψ_j*⟩_trajetórias        C_MN = 2 Σ_{i∈M, j∈N} |ρ_ij|
> C_inter = Σ_{M<N} C_MN
> ```
>
> reportada contra `λ₂` e não contra parâmetros de construção. **A ordem importa e é parte
> do que define o alvo da busca**: a média entra ANTES do módulo. Um trabalho que calcule
> coerência por trajetória e depois promedie está medindo espalhamento de amplitude, não
> coerência — e um trabalho que acumule a matriz densidade antes está medindo exatamente o
> que queremos, mesmo que chame por outro nome. Ver a Seção 5.1: essa distinção decide
> vereditos, e classificá-la errado inverte a triagem.
>
> **A pergunta específica que a varredura precisa responder:** alguém já varreu
> simultaneamente um parâmetro estrutural de modularidade e uma taxa de defasagem, medindo
> correlações resolvidas por módulo? Se sim, o trabalho está tomado e preciso saber já. Se
> não, preciso do mapa exato do que existe ao redor.
>
> ### Escopo da busca
>
> Combine termos destes grupos, e não se limite a eles:
>
> - **Estrutura**: modular network, community structure, block model, Watts-Strogatz,
>   small-world, algebraic connectivity, Fiedler value, spectral gap, modularity Q
> - **Dinâmica**: continuous-time quantum walk, CTQW, excitation transport, exciton
>   transport, quantum transport, coherent transport
> - **Ruído**: dephasing, Haken-Strobl, ENAQT, environment-assisted, noise-assisted,
>   quantum stochastic walk, Lindblad, quantum trajectories, quantum jumps, unravelling,
>   stochastic Schrödinger equation, pure dephasing, telegraph noise
> - **Observáveis**: l1-norm coherence, concurrence, pairwise entanglement, IPR,
>   participation ratio, transfer efficiency, long-range correlations, block coherence,
>   coherence between subsystems, ensemble-averaged density matrix, trajectory-averaged
>   coherence, off-diagonal density matrix elements
> - **Projeto inverso**: optimal network design, network optimization quantum transport,
>   inverse design, architecture optimization
> - **Geometria**: microtubule, tubulin, helical lattice, seam, protofilament, cylindrical
>   lattice
>
> Cubra também a literatura adjacente que pode ter feito isso sob outra terminologia:
> arquitetura de processadores quânticos, redes de comunicação quântica, transferência de
> estado em spin chains, e complexos fotossintéticos (FMO, LHCII).
>
> ### Download e organização
>
> Baixe os PDFs **apenas de fontes de acesso aberto**: arXiv, PMC, bioRxiv, DOAJ, páginas
> pessoais dos autores, repositórios institucionais. **Não** tente contornar paywall de
> editora nem usar agregadores piratas — para artigo fechado, registre a referência
> completa, o DOI e o abstract, e me avise que preciso do acesso pela biblioteca.
>
> Organize em `bibliografia/`:
>
> ```
> bibliografia/
> ├── daedalus.bib              # BibTeX, chaves autor-ano-palavra
> ├── pdf/                      # os PDFs baixados, nome = chave do BibTeX
> ├── TRIAGEM.md                # tabela de veredito, uma linha por trabalho
> ├── FECHADOS.md               # os que não consegui baixar, com DOI
> └── NOVIDADE.md               # a conclusão
> ```
>
> ### Triagem
>
> Cada trabalho recebe **um** veredito, e a justificativa em uma linha:
>
> - **OCUPA** — faz o que queremos fazer. Se aparecer algum, pare a varredura e me avise
>   imediatamente, com o trecho relevante.
> - **ADJACENTE** — faz metade: ou varre estrutura sem ruído, ou ruído sem modularidade, ou
>   usa observável agregado em vez de resolvido por módulo. Diga qual metade.
> - **FERRAMENTA** — método, algoritmo ou medida que podemos usar (por exemplo, estimadores
>   de λ₂, medidas de coerência, esquemas de trajetória eficientes).
> - **CONTEXTO** — pano de fundo, entra na introdução do artigo.
> - **IRRELEVANTE** — não entra no `.bib`.
>
> ### Leituras obrigatórias, na ordem
>
> 1. **Frontiers in Psychiatry 2026, doi 10.3389/fpsyt.2026.1855963** — o achado deles
>    (conectividade maior encurta a meia-vida de pureza sob ruído markoviano local) contraria
>    diretamente a nossa hipótese H3. Leia inteiro, extraia o modelo de ruído exato, a
>    definição de conectividade que usaram, e em que condições o efeito se inverteu.
> 2. **arXiv:2205.10066** (Kurt, Rossi & Piilo 2023) — o que mais ocupa o nosso terreno. Preciso
>    saber exatamente: quais observáveis, se há qualquer resolução por comunidade, e o que
>    são as "seis classes" de dependência de ruído.
> 3. **arXiv:2507.17880** (estabilidade de CTQW, 2026) — usa coerência ℓ₁ como nós.
>    Confirme que a lista de topologias não inclui redes modulares.
> 4. **arXiv:2603.05643** (localização sem desordem em grafos estruturados) — o diagnóstico
>    estrutural de IPR deles pode ser ferramenta direta para nós.
> 5. **arXiv:2602.02868** (Entropy 2026, microtúbulo) — geometria de 13 dímeros por espiral,
>    Lindblad, correlações. É o mais próximo em geometria.
>
> ### Disciplina de anti-vacuidade — obrigatória
>
> Vale aqui a mesma regra do `CONVENTIONS.md`: uma busca que não retorna nada é
> indistinguível de uma busca quebrada, e uma sonda que nunca foi vista falhando não é
> evidência.
>
> - **Consulta-canário:** a busca por Watts-Strogatz + transporte quântico + ruído **tem**
>   que retornar `arXiv:2205.10066`. Se não retornar, a busca está quebrada — conserte antes
>   de confiar em qualquer "não encontrei nada".
> - **Segundo canário:** a busca por coerência ℓ₁ + CTQW + decoerência tem que retornar
>   `arXiv:2507.17880`.
> - Registre em `TRIAGEM.md` quantos resultados cada consulta devolveu. Consulta com zero
>   resultados é suspeita, não conclusão.
> - `NOVIDADE.md` não pode afirmar "ninguém fez X" sem listar as consultas que procuraram X
>   e falharam. Ausência de evidência precisa mostrar onde procurou.
>
> ### O que quero em `NOVIDADE.md`
>
> Curto, direto, com veredito explícito:
>
> 1. A pergunta do plano bidimensional está ocupada, parcialmente ocupada, ou livre?
> 2. Se parcialmente: qual eixo já foi percorrido e por quem, e o que exatamente sobra.
> 3. Os três trabalhos mais próximos, com a distância de cada um em uma frase.
> 4. Se H4 (o achado do Frontiers) se aplica ao nosso regime ou não, e por quê.
> 5. Terminologia que a literatura usa e nós não estamos usando — pode haver trabalho
>    idêntico sob outro nome. Em particular, procure como a literatura nomeia a coerência
>    entre blocos/subsistemas de uma partição: se existir nome consagrado, é por ele que o
>    trabalho equivalente estaria indexado, e é o termo que nos falta.
> 6. Onde este trabalho caberia: liste 3 a 5 periódicos com o argumento de encaixe.
>
> Não escreva a introdução do artigo. Quero o mapa, não a prosa.
