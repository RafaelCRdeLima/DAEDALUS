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

### 4.1 Onde a biologia cai no plano — CORRIGIDO

A primeira versão desta seção estimou a defasagem por analogia (T₂ de dezenas de fs) e
colocou a biologia em γ_deph ≈ 2 a 20. **A estimativa estava alta por até 10×.** A literatura
de triptofanos em tubulina reporta uma taxa de defasagem pura **medida** de **50 cm⁻¹**, com
batimentos coerentes durando ~600 fs.

Convertendo: 50 cm⁻¹ = 9,4e12 rad/s = 6,2 meV. Como γ_deph é adimensional contra ‖H‖, o que
falta é o acoplamento — e **é ele o número incerto**:

| acoplamento J | ‖H‖ ≈ 4J | γ_deph adimensional |
|---|---|---|
| 5 cm⁻¹ | 20 cm⁻¹ | 2,5 |
| 20 cm⁻¹ | 80 cm⁻¹ | 0,62 |
| 50 cm⁻¹ | 200 cm⁻¹ | 0,25 |
| 100 cm⁻¹ | 400 cm⁻¹ | 0,12 |

A janela plausível é **γ_deph ≈ 0,1 a 2,5**, uma ordem de grandeza de incerteza, e ela cai no
**meio-direita** da grade — não no extremo de Zeno, como a primeira versão dizia.

### 4.2 E ali o emaranhamento entre módulos está 2 a 4 ordens abaixo do coerente

Em `p = 0,25`, com o unitário exato valendo **362**:

| γ_deph | `C_inter` | % do unitário |
|---|---|---|
| 0,02 | 175,8 | 48,6% |
| 0,147 | 4,87 | **1,3%** |
| 0,40 | 1,79 | **0,50%** |
| 1,086 | 0,393 | **0,11%** |
| 2,947 | 0,059 | **0,016%** |
| 8,0 | 0,0094 | 0,003% |

Na janela `0,1 ≤ γ_deph ≤ 2,5` isso é **0,02% a ~2% do valor coerente** — duas a quase quatro
ordens de grandeza abaixo. Menos extremo do que a primeira versão afirmava, e ainda assim
grande.

E a fração que atravessa módulos cai mais rápido que o total: de 0,87 para ~0,10 ao longo do
mesmo percurso (`resultados/emaranhamento-tempo.png`, painel inferior).

**Leitura honesta.** Isto não refuta Orch-OR, que não é uma afirmação sobre este modelo. Remove
um degrau específico: *se* o mecanismo depender de emaranhamento de longo alcance entre regiões
distintas de um microtúbulo, sustentado por acoplamento dipolar contra defasagem térmica, então
na faixa plausível esse emaranhamento é duas a quatro ordens menor que no limite coerente, e
quase todo o que resta é local.

**A incerteza dominante não é estatística, é do acoplamento.** Uma ordem de grandeza em J move
a conclusão entre "1% do coerente" e "0,02% do coerente". Fechar essa incerteza vale mais que
qualquer refinamento da varredura.

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

## 5.5 REVISÃO BIBLIOGRÁFICA DOS ACHADOS — o que é mesmo novidade

A varredura de 28/08 buscou contra a **pergunta**. Esta busca é contra os **achados**, que é
outra coisa: um resultado pode ser novo como pergunta e velho como resposta. Cinco consultas
dirigidas, e o saldo é mais modesto do que a primeira redação deste documento sugeria.

### 5.5.1 "Não há ENAQT para coerência" — é esperado por TEOREMA

Defasagem é uma **operação incoerente**, e monótonas de coerência não crescem sob operações
livres: `C(Λ[ρ]) ≤ C(ρ)`. Isso é o alicerce da teoria de recursos, e vale para a norma ℓ₁.

Então a afirmação "a defasagem só subtrai" **não é descoberta**. O que não decorre do teorema
é o comportamento da dinâmica **completa**: aqui a evolução é `H + dissipador`, e `H` NÃO é
incoerente — ele gera coerência. A defasagem redistribui população, e a população realimenta
coerência via `H`. Nada impede, a priori, que mais ruído produza mais coerência num tempo
posterior. **É exatamente esse mecanismo indireto que faz o ENAQT existir para transporte.**

A contribuição, então, é ter **testado** se ele opera aqui. Não opera: `C_total` e `C_inter`
decrescem monotonicamente em γ_deph em **30 de 30** verificações (dois valores de `p` × cinco
tempos × as duas grandezas). A expectativa ingênua sobrevive à interação com um hamiltoniano
que gera coerência — e sobrevive **precisamente onde a expectativa análoga para transporte
falha**. É essa assimetria que separa os dois ótimos.

Estatuto: **confirmação medida, não descoberta.** Vale meia frase num artigo, não uma seção.

### 5.5.2 O compromisso transporte × coerência — JÁ ESTÁ NA LITERATURA

Este é o achado que mais me obriga a recuar. **Sgroi, Zicari, Imparato & Paternostro**
(arXiv:2211.09079) estudam "the interplay between optimal transport and different instances of
dephasing noise affecting the system's coherence", usam **a norma ℓ₁** — a mesma medida — e
concluem que as soluções ótimas sob defasagem "exhibit a higher loss of coherence in the
quantum network state".

Ou seja: **o compromisso qualitativo está publicado.** A primeira redação deste documento
chamou a separação dos ótimos de "o resultado com maior chance de interessar". Isso precisa ser
reescrito.

O que resta de diferente, e é preciso ser específico porque a diferença é o que sobra:

| | Sgroi et al. 2023 | aqui |
|---|---|---|
| tamanho | N = 7 | N = 520 |
| topologia | completamente conectada, fixa | microtúbulo com religação a \|E\| fixo |
| variável de projeto | energias de sítio | **topologia** |
| coerência | ℓ₁ **global** | ℓ₁ **resolvida por bloco** |
| eixo de reporte | — | **λ₂** |
| separação dos ótimos | qualitativa | **fator 7 em γ, 19,9 σ** |

A diferença que mais importa é a **variável de projeto**: otimizar energias de sítio e otimizar
topologia são alavancas experimentais distintas, e a segunda é a que custa em arquitetura. E a
resolução por bloco, que é onde vive o resto do trabalho.

Estatuto: **extensão quantificada de um resultado conhecido**, não resultado novo. Escrever
como "confirmamos e quantificamos em rede grande e com a topologia como variável", citando
Sgroi.

### 5.5.3 A saturação em λ₂ — não achei, com a ressalva de sempre

Procurei por limiar/saturação de transporte quântico contra conectividade algébrica,
atalhos de small-world com retorno decrescente, e o efeito da religação no gap espectral. O que
apareceu de mais próximo foi **arXiv:2608.19130** (2026), que reporta transporte coerente
**máximo em probabilidade de ligação intermediária** e decrescente ao aproximar da conexão
total — um ótimo não monotônico em conectividade, que é parente mas não é o mesmo que
saturação a partir de um limiar em λ₂.

Não encontrei o enunciado "o ganho satura quando λ₂ passa de um valor, e o valor é comparável
entre famílias de grafo". **Mas ausência aqui é fraca**: com uma realização de grafo por `p` eu
não tenho o direito de afirmar a saturação, então a novidade é de uma afirmação que ainda não
está estabelecida. Ver Seção 6, item 2.

Estatuto: **candidato a novidade, sem dado que o sustente ainda.**

### 5.5.4 A resolução por módulo no regime de defasagem alta — o mais provável de ser novo

A afirmação é: não é só que a coerência total cai com a defasagem — a **fração dela que
atravessa módulos** cai desproporcionalmente, de 0,87 para ~0,10.

As consultas de 28/08 já haviam estabelecido que a teoria de recursos de coerência de bloco e a
literatura de transporte **não se encontraram** (consultas 5 e 6, 8 e 10 resultados, nenhum
fazendo o cruzamento). Esta afirmação está desse lado da lacuna: ela exige a partição, e é a
partição que ninguém está usando.

Estatuto: **o mais provável de ser novo dos quatro**, e é o que sustenta a ponte identificada
como o valor do trabalho.

### 5.5.5 O lado biológico — o quadro geral é conhecido, o detalhe não

A dinâmica excitônica de triptofanos em microtúbulo é campo ativo, e vários dos números aqui
já estão publicados: a taxa de defasagem de 50 cm⁻¹, os batimentos coerentes de ~600 fs, o
ruído colorido derivado de dinâmica molecular, os estados superradiantes. O que este trabalho
**não** acrescenta é qualquer coisa sobre a estrutura eletrônica ou o acoplamento — nós os
tomamos como parâmetro.

E há um resultado nosso que é **negativo sobre a especificidade biológica**: a costura e os 13
protofilamentos não produziram efeito distinguível em lugar nenhum. Isso é publicável e é
desconfortável para o enquadramento "inspirado em microtúbulo" — mas é o que o dado diz, e a
comparação contra SBM na varredura (Seção 6, item 1) é o que confirma ou derruba.

Estatuto: **contexto conhecido; a contribuição é a resolução por módulo aplicada a essa
geometria, e o resultado nulo sobre a geometria em si.**

### 5.5.6 Saldo

| achado | estatuto |
|---|---|
| defasagem só subtrai coerência | esperado por teorema; **medido**, não descoberto |
| os dois ótimos se separam | **já publicado** (Sgroi 2023); aqui é extensão quantificada |
| saturação em λ₂ ~ 0,1 | não encontrado, **e ainda não sustentado pelo dado** |
| colapso da fração inter-módulo | **o mais provável de ser novo** |
| geometria do microtúbulo é dispensável | resultado nulo, e o mais fácil de contestar sem o SBM |

**Conclusão de escrita:** o artigo não se sustenta sobre a separação dos ótimos, que tem dono.
Ele se sustenta sobre a **coerência resolvida por bloco como observável de transporte** — a
ponte — e os outros achados entram como o que ela permite ver.

## 5.6 POR QUE MICROTÚBULOS, ALÉM DA BIOLOGIA

A pergunta é justa e fica mais aguda depois da Seção 4.3: se a costura e os 13 protofilamentos
não produziram efeito distinguível, o que justifica investigá-los?

### 5.6.1 O que existe de tecnologia real, e é mecânica

Microtúbulos **já são** plataforma de engenharia, com literatura madura e financiada — mas
como **objetos mecânicos**, não quânticos:

- **Lançadeiras moleculares**: microtúbulos transportados por cinesina fixada em trilhos
  litografados, carregando carga em escala nanométrica.
- **Biossensores**: "smart dust" movido a cinesina, com microtúbulos funcionalizados capturando
  e separando analitos marcados.
- **Lab-on-chip**: redes de trilhos com junções, separadores direcionais e concentradores.
- **Automontagem dirigida**: cinesina transportando nanofios de ouro sobre microtúbulos
  imobilizados.

Nada disso usa propriedade quântica alguma. É relevante mesmo assim, e por um motivo indireto
que a Seção 5.6.3 desenvolve: **a infraestrutura existe**.

### 5.6.2 O que existe de proposta quântica, e é contestado

Há uma linha ativa, e em 2025–2026:

- **Computação quântica escalável em microtúbulos** (arXiv:2505.20364, EPJ Plus 2025): o
  interior do microtúbulo tratado como cavidade de QED de alto Q, com quDits codificados no
  estado de dipolo da tubulina e **tempos de decoerência da ordem de 10⁻⁶ s** em condições
  fisiológicas.
- **Superradiância ultravioleta** em redes de triptofano, reportada experimentalmente, com
  estados excitônicos super e subradiantes previstos por hamiltonianos efetivos não hermitianos.
- **Engenharia de resposta óptica** de microtúbulos por simulação da rede de triptofanos mais
  espectroscopia UV (arXiv:2604.18604, 2026) — enquadramento explicitamente de engenharia.

**E há uma discrepância de sete ordens de grandeza que convém apontar.** O tempo de decoerência
de 10⁻⁶ s afirmado no trabalho de computação quântica contrasta com a taxa de defasagem
**medida** de 50 cm⁻¹ para éxcitons de triptofano, que corresponde a **~1e-13 s**. São graus de
liberdade diferentes — dipolo de tubulina numa cavidade contra éxciton de triptofano — então
não é contradição direta. Mas quem for construir argumento tecnológico precisa dizer **em qual
dos dois** está apostando, porque a diferença entre eles é de 10⁷.

Este trabalho aposta no éxciton, que é o que tem número medido.

### 5.6.3 A justificativa honesta, e ela NÃO é que a topologia seja especial

O argumento forte não é "microtúbulos são redes especiais". Nossos próprios dados dizem o
contrário. O argumento forte é de **substrato**:

1. **É uma rede modular de centenas de sítios que se automonta, monodispersa e idêntica.**
   Não há rota de fabricação que produza, em escala, uma rede de 520 sítios com simetria de
   ordem 13 e uma costura helicoidal controlada. A natureza produz aos bilhões, e tubulina
   purificada se automonta *in vitro*. Como substrato, isso não tem concorrente nessa escala.
2. **A infraestrutura de manipulação já existe** — purificação, padronização de superfície,
   funcionalização, imageamento — construída pela linha mecânica da Seção 5.6.1. Um uso
   excitônico a herda em vez de criá-la.
3. **A rede de triptofanos é um sistema excitônico real**, com superradiância UV já medida.
   Não é um modelo de brinquedo esperando realização; é a realização física da rede simulada.

### 5.6.4 E o resultado nulo sobre a geometria AJUDA, em vez de atrapalhar

Se a costura e os 13 protofilamentos não importam, e o que importa é λ₂ e Q, então o resultado
**não fica preso ao microtúbulo** — ele vale para a classe de redes modulares com aqueles
valores, e o microtúbulo passa a ser **um membro fisicamente realizável da classe**, não o
objeto de estudo.

Isso é exatamente o princípio declarado do projeto — *"o motor é geral para qualquer grafo, e a
física de microtúbulo entra apenas como um dos geradores"* — chegando por via experimental em
vez de por decisão de projeto.

E dá a forma de escrita mais defensável: **o trabalho é sobre coerência resolvida por bloco em
redes modulares; o microtúbulo entra como o caso em que a rede existe de fato.** Um referee que
duvide de Orch-OR não tem por onde recusar isso, e um que trabalhe com microtúbulos ganha um
resultado transferível.

### 5.6.45 A GEOMETRIA IMPORTA — mas num nível mais básico do que eu supunha

Ao montar o controle SBM, apareceu um fato estrutural que **derruba a suspeita da Seção 4.3**
por um caminho que eu não tinha previsto.

Com `N = 520`, 8 módulos e `|E| = 1024` — os mesmos do microtúbulo — o SBM com Q casado tem
**8 a 13 componentes**. Grau médio 3,94 está abaixo do limiar de conectividade de um grafo
aleatório, que é `ln(520) ≈ 6,25`. O microtúbulo, com exatamente as mesmas contagens, é
conectado, porque numa rede toda vértice tem grau ≥ 2 por construção.

E quando se aumenta a densidade até conectar, o λ₂ passa direto por cima da faixa toda:

| SBM, grau médio | componentes | λ₂ (Q = 0,77) | λ₂ (Q = 0,43) |
|---|---|---|---|
| 3,99 | 12 | 0 | 0 |
| 5,78 | 4 | 0 | 0 |
| **7,81** | **1** | **0,494** | **0,870** |
| 10,1 | 1 | 0,718 | 0,909 |
| 15,6 | 1 | 1,379 | 4,511 |

**Microtúbulo: λ₂ de 0,006 a 0,336, com grau médio 3,94.**

As duas famílias **não se sobrepõem em λ₂**. Não existe SBM de N = 520 e 8 módulos que seja
conectado e tenha λ₂ na faixa do microtúbulo — porque λ₂ baixo com conectividade exige
estrutura **longa e quase unidimensional**, e grafos aleatórios não têm isso: eles são
small-world por construção, com diâmetro ~log N.

**A conclusão correta não é "a geometria não importa".** É:

> Dado (λ₂, Q), a geometria pode não acrescentar nada — isso continua sem teste. Mas a
> geometria **determina que combinações de (λ₂, Q, grau) são alcançáveis**, e o microtúbulo
> alcança uma região que redes modulares aleatórias não alcançam de jeito nenhum na mesma
> densidade.

Isso reforça a justificativa da Seção 5.6.3 em vez de enfraquecê-la, e por um argumento melhor
que o de substrato: o microtúbulo não é um membro qualquer da classe — ele é um membro de uma
sub-região da classe que a construção aleatória não produz.

**E torna impossível o controle que a Seção 5.6 pedia.** "SBM de mesma Q e mesmo λ₂" não
existe. O controle que está rodando casa **Q** e usa a densidade mínima que conecta
(|E| ≈ 2000, grau 7,7), com **dois confundimentos declarados**: o dobro das arestas e λ₂ três a
dez vezes maior. Ele responde a uma pergunta mais fraca — "o comportamento em γ é o mesmo em
outra região do espaço estrutural?" — e não à pergunta original, que não tem controle possível.

### 5.6.5 O que seria preciso para a justificativa virar programa

- **A comparação contra SBM** (Seção 6, item 1) é o que converte "a geometria não importou" de
  suspeita em resultado. Sem ela o argumento de classe fica sem base.
- **Um número de acoplamento confiável** para a rede de triptofanos. É a incerteza dominante da
  Seção 4.1, e ela vale mais que qualquer refinamento numérico deste lado.
- **Decidir em qual grau de liberdade se aposta** — éxciton ou dipolo de tubulina. Os dois têm
  literatura; a diferença entre os tempos de coerência é de sete ordens.

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
- **As cristas de coerência e de transporte não coincidem** — fator 7 em γ, 19,9 σ. Responde
  H2b, mas o compromisso qualitativo **já está publicado** (Sgroi et al. 2023, N = 7, ℓ₁
  global); aqui é extensão quantificada com a topologia como variável de projeto.
- Religar 8,3% das arestas a |E| fixo dá 5,3× em coerência entre módulos e três ordens de
  grandeza em transporte, e **satura** em λ₂ ~ 0,1.
- Na faixa plausível para biologia — **γ_deph ≈ 0,1 a 2,5**, corrigida com a taxa medida de
  50 cm⁻¹ — o emaranhamento entre módulos está **2 a 4 ordens** abaixo do coerente, e a fração
  inter-módulo colapsa de 0,87 para 0,10. A incerteza dominante é o acoplamento, não a
  estatística.
- **O que mais provavelmente é novo é a resolução por bloco**, não a separação dos ótimos.
- **Nada nestes dados exigiu a geometria do microtúbulo**, e a comparação contra SBM na
  varredura é a lacuna mais importante.
