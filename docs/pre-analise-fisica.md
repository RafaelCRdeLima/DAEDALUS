# Pré-análise física — varredura da fase 2

Documento de trabalho de 29/08/2026, sobre `resultados/varredura.csv` (49 células),
`resultados/serie/` (14 séries temporais) e as figuras em `resultados/`.

**Isto é pré-análise, não resultado.** Os números são de uma única realização de grafo por
`p`, num modelo de brinquedo, e a lista de ressalvas da Seção 0 não é formalidade — vários
itens dela podem inverter conclusões. O que este documento faz é dizer o que os dados
sugerem e o que precisaria ser feito para que sugestão virasse afirmação.

---

## 0. O que estes dados são, e o que não são

**São:** uma caminhada quântica de tempo contínuo de **uma excitação** sobre uma rede de
microtúbulo 40 × 13 (N = 520, 8 módulos, costura 3), com religação de Watts–Strogatz a |E|
fixo, sob **defasagem pura de Haken–Strobl**, resolvida por trajetórias quânticas verificadas
contra Lindblad exato em dez regimes.

**Não são:**

- **Um microtúbulo.** É uma rede com a topologia de conectividade de um microtúbulo e
  acoplamentos uniformes. Não há triptofanos, não há geometria atômica, não há dipolos
  calculados.
- **Um sistema com perda.** Não há amortecimento de amplitude, nem temperatura, nem
  desordem estática. A excitação nunca desaparece.
- **Uma média de ensemble sobre grafos.** Cada linha `p` usa **uma** realização da religação.
  A sonda D mediu que a variação entre grafos acrescenta ~13% ao desvio, mas a *média* pode
  se deslocar, e isso não foi medido.
- **Utilizáveis na linha `p = 0,50`**, onde o grafo tem **dois componentes** e λ₂ = 0.
- **Um plano completo em γ.** O máximo de `C_inter` cai na **borda** da grade em todas as
  linhas, então a faixa varrida não contém o ótimo — ver Seção 1.

E uma identidade que sustenta tudo o que segue: no setor de uma excitação a concurrence par a
par vale `C_ij = 2|ρ_ij|` **exatamente**, então `C_inter` é simultaneamente a medida ℓ₁ de
coerência de bloco e a soma das concurrences entre módulos. Verificado em 4 200 pares contra
Wootters, discrepância 1,7e-08.

---

## 1. O achado central, e ele é negativo

**Não há ENAQT para emaranhamento entre módulos.** `C_inter` é máximo na **menor** taxa de
defasagem em todas as sete linhas da grade, sem exceção — e o limite unitário exato (γ = 0,
sem salto nenhum) é ainda maior:

| p | λ₂ | `C_inter` unitário | em γ = 0,02 | em γ = 8 |
|---|---|---|---|---|
| 0 | 0,006 | **59,0** | 30,2 | 4,7e-06 |
| 0,083 | 0,137 | **327** | 160,4 | 3,5e-04 |
| 0,25 | 0,204 | **362** | 175,8 | 9,4e-03 |

A defasagem apenas **subtrai**. Isso não é surpresa depois de dito — defasagem destrói
coerência por construção — mas era a hipótese H1 do documento de estado da arte, e a resposta
é não. O ENAQT da literatura é sobre **transporte de população**, e não se transfere para o
observável de coerência.

**Consequência para o desenho da grade:** a faixa 0,02 ≤ γ ≤ 8 não contém o ótimo de
`C_inter`, e não vai conter — o ótimo é o limite unitário. Varrer γ para baixo não acrescenta
informação nova sobre onde ele está; acrescenta sobre **com que lei** ele decai.

---

## 2. Mas as duas cristas NÃO coincidem — H2b tem resposta

O transporte se comporta de outro jeito, e é aí que o resultado fica interessante.

**Em `p = 0,083` há ENAQT clássico e forte:** a eficiência de transferência tem máximo
**interior** em γ = 0,147, com **19,9 σ** sobre o valor na borda (3,75e-03 contra 2,93e-03).
Em `p = 0,417` há um segundo, mais fraco, em γ = 0,4 com 2,6 σ. Nas outras cinco linhas o
máximo fica na borda.

Ou seja, na mesma célula estrutural `p = 0,083`:

| objetivo | γ ótimo |
|---|---|
| máxima coerência entre módulos | 0,02 (ou menor) |
| máximo transporte até o alvo | 0,147 |

**Um fator de 7 entre os dois pontos de operação, e ambos significativos.** Projetar para a
excitação chegar e projetar para coerência como recurso são objetivos distintos, com ótimos
distintos, no mesmo sistema. Esta é a resposta a H2b, e é afirmativa.

Vale a ressalva estatística: nas cinco linhas onde o máximo de eficiência cai na borda, isso
pode ser porque não há ótimo interior **ou** porque ele está abaixo de γ = 0,02. O contraste
entre as linhas é que é robusto, não a ausência em cada uma.

---

## 3. A estrutura importa, e satura

`C_inter` contra λ₂, na menor defasagem:

| p | λ₂ | Q | `C_inter` |
|---|---|---|---|
| 0 | 0,006 | 0,766 | 30,2 |
| 0,083 | 0,137 | 0,704 | **160,4** |
| 0,167 | 0,188 | 0,650 | 170,5 |
| 0,25 | 0,204 | 0,580 | 175,8 |
| 0,333 | 0,242 | 0,510 | 173,3 |
| 0,417 | 0,336 | 0,432 | 169,5 |

**Religar 8,3% das arestas multiplica o emaranhamento entre módulos por 5,3×** — e religar
mais não acrescenta quase nada. A saturação acontece assim que λ₂ passa de ~0,1.

O mesmo salto aparece no transporte, e maior: a eficiência vai de 1,6e-06 em `p = 0` para
2,9e-03 em `p = 0,083`, **três ordens de grandeza**. No microtúbulo sem religação a excitação
praticamente não chega ao sítio-alvo a 260 sítios de distância.

Este é o efeito mais forte de todo o conjunto, e ele é **estrutural, não de ruído**.

E a decomposição temporal (`resultados/emaranhamento-tempo.png`, painel inferior) mostra o
mesmo por outro caminho: a fração do emaranhamento que atravessa módulos satura em **0,87**
em `p = 0,25` contra **0,61** em `p = 0`, e chega lá muito mais cedo.

---

## 4. Ponto de vista 1 — microtúbulos e Orch-OR

### 4.1 Onde a biologia cai no plano

`γ_deph` é adimensional, medido contra ‖H‖ = 1. Para converter, com ħ = 6,58e-16 eV·s:

- acoplamento dipolar entre dímeros da ordem de **1 a 4 meV** → ‖H‖ ~ **1,5e12 a 6e12 rad/s**;
- defasagem de éxciton molecular em proteína a temperatura ambiente, com T₂ de dezenas a uma
  centena de femtossegundos → **1e13 a 1e14 s⁻¹**.

Isso põe a biologia em **γ_deph ≈ 2 a 20** nas nossas unidades — a **borda direita** da grade,
dentro do regime de Zeno.

### 4.2 E ali o emaranhamento é desprezível

| p | unitário | γ = 8 | fator |
|---|---|---|---|
| 0 | 59,0 | 4,7e-06 | **1,3e7** |
| 0,083 | 327 | 3,5e-04 | **9,3e5** |
| 0,25 | 362 | 9,4e-03 | **3,9e4** |

Quatro a sete ordens de grandeza abaixo do limite coerente. E o pouco que sobra é
majoritariamente **intra**-módulo: a fração entre módulos cai de 0,87 para ~0,10 no mesmo
percurso.

**Leitura honesta.** Isto não refuta Orch-OR, porque Orch-OR não é uma afirmação sobre este
modelo. Mas remove um degrau específico do argumento: *se* o mecanismo depender de
emaranhamento de longo alcance entre regiões distintas de um microtúbulo, sustentado por
acoplamento dipolar contra defasagem térmica, então na faixa de parâmetros fisicamente
plausível esse emaranhamento é **quatro a sete ordens de grandeza** menor do que no limite
coerente, e quase todo ele é local.

Isso é consistente com o que a literatura já dizia por outros caminhos, e acrescenta a
**resolução por módulo**: não é só que a coerência total cai — a parte dela que atravessa
módulos cai desproporcionalmente. Um regime de "coerência local sobrevive, coerência global
não" é diferente de "tudo decai junto", e é o segundo que se costuma assumir.

### 4.3 O que a costura NÃO fez

A geometria específica do microtúbulo — 13 protofilamentos, costura de 3 dímeros — não
aparece como efeito distinguível em nenhum lugar destes dados. O que domina é a
**modularidade e a conectividade algébrica**, e o salto de 5,3× ao religar 8,3% das arestas é
muito maior que qualquer coisa atribuível à costura.

Isto é um resultado, e é o tipo de resultado que precisa ser dito: **a especificidade
biológica da geometria não se mostrou necessária para nada do que foi medido.** Um SBM de
mesmo λ₂ e mesmo Q provavelmente reproduziria o essencial — e essa comparação está feita no
portão de Lindblad mas **não** na varredura, o que é a lacuna mais importante a fechar.

### 4.4 O que seria novo, se sobreviver

Duas coisas, e as duas são condicionais:

1. **A saturação em λ₂ ~ 0,1** como limiar de emaranhamento entre módulos. Não encontrei isso
   na varredura bibliográfica, e o formato — reportar contra o valor de Fiedler em vez de
   contra o parâmetro de construção — é justamente o que a literatura não faz.
2. **A queda desproporcional da fração inter-módulo** no regime de Zeno. É consequência da
   resolução por bloco, que a literatura de transporte não usa.

Nenhuma das duas está estabelecida com estes dados. Ver Seção 6.

---

## 5. Ponto de vista 2 — tecnológico

### 5.1 O resultado com maior chance de interessar

**A separação dos dois ótimos.** Num mesmo dispositivo, com a mesma topologia, o ponto de
operação que maximiza a chegada da excitação **não** é o que maximiza a coerência de longo
alcance disponível — e o afastamento medido é de um fator 7 em taxa de ruído, com 19,9 σ.

Para quem projeta rede de transporte quântico isso tem consequência direta: **eficiência de
transferência e coerência como recurso são objetivos que competem**, e otimizar um degrada o
outro. A literatura de ENAQT otimiza transporte; a de teoria de recursos quantifica coerência;
não achei quem tivesse medido as duas no mesmo plano — é justamente a ponte que a varredura
bibliográfica identificou como o valor do trabalho.

**Como isso vira engenharia:** se um dispositivo tem um botão de ruído — e muitos têm,
via temperatura, campo de controle ou acoplamento a um banho — então há um botão que troca
transporte por coerência. Ele não é hipotético: está no plano medido.

### 5.2 O mais barato de explorar: religar 8% muda tudo

Três ordens de grandeza no transporte e 5,3× na coerência entre módulos, **a |E| fixo** — sem
gastar uma ligação a mais, só mudando onde elas estão. Numa arquitetura em que ligações custam
(fotônica integrada, íons aprisionados, qubits supercondutores), isso é um ganho estrutural de
graça.

E satura: religar 8% entrega quase todo o ganho, e religar 42% não entrega mais. **Um projeto
que gastasse religação até o limite estaria pagando por nada.** O limiar em λ₂ ~ 0,1 é o
número de projeto, e ele é comparável entre famílias de grafo, o que é o ponto de reportar
contra λ₂.

### 5.3 O que NÃO é promissor, e convém dizer

- **Ruído como recurso para coerência: não.** A esperança de "existe um ótimo de defasagem
  que maximiza coerência de longo alcance" está morta nestes dados. Só o transporte tem ótimo
  interior.
- **Regime de Zeno: nada a extrair.** Com γ_deph acima de ~3 o emaranhamento cai a 1e-2 do
  valor coerente e a fração inter-módulo colapsa. Não há janela útil ali.
- **Escala.** Todos os números são de N = 520 com um alvo específico. A eficiência depende
  fortemente da escolha do alvo, e nada aqui diz como as conclusões escalam com N.

---

## 6. O que precisaria ser feito para isto virar resultado

Em ordem de importância:

1. **SBM de mesma Q e mesmo λ₂ na varredura inteira.** É a única forma de separar o que é da
   costura do que é da modularidade — e a Seção 4.3 suspeita que seja tudo modularidade. Sem
   isso não se pode afirmar nada específico de microtúbulo. **Custo: outras 49 células.**
2. **Ensemble de grafos por célula.** Uma realização por `p` não sustenta a afirmação de
   saturação em λ₂. Com ~8 grafos por célula o custo multiplica por 8, ou reduz-se `n` na
   mesma proporção — e a sonda D diz que o desvio só cresce 13%, então reduzir `n` é aceitável.
3. **Estender γ para baixo**, para medir a **lei** com que `C_inter` decai a partir do unitário.
   Barato, e é o que transforma "não há ótimo" em "decai como tal".
4. **Refazer `p = 0,50`** ou encurtar a faixa: aquela linha está sobre grafo desconectado.
5. **IPR na varredura.** H3 — "coerência alta com localização preservada" — não pode ser
   testada porque o IPR não foi medido no plano. É barato: o IPR é diagonal em ρ e não sofre
   o viés do `|·|`.
6. **`C_rel` em células selecionadas**, com `n` muito maior, só para verificar que as duas
   medidas ordenam igual. A barreira Ω(d²) impede o plano inteiro.

---

## 7. Resumo em cinco linhas

- Não há ENAQT para emaranhamento entre módulos: a defasagem só subtrai, e o ótimo é o limite
  unitário.
- **As cristas de coerência e de transporte não coincidem** — fator 7 em γ, 19,9 σ. É o
  resultado com maior chance de interessar, e responde H2b.
- Religar 8,3% das arestas a |E| fixo dá 5,3× em coerência entre módulos e três ordens de
  grandeza em transporte, e **satura** em λ₂ ~ 0,1.
- Na faixa de defasagem fisicamente plausível para biologia, o emaranhamento entre módulos
  está 4 a 7 ordens abaixo do coerente, e a fração inter-módulo colapsa de 0,87 para 0,10.
- **Nada nestes dados exigiu a geometria do microtúbulo**, e a comparação contra SBM na
  varredura é a lacuna mais importante.
