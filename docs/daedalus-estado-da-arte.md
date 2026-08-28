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

### 5.7 Verificação da fase 2: a companheira que não é trajetória

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
