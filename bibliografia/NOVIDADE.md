# NOVIDADE — a conclusão da varredura

Rodada em 28/08/2026. Mapa, não prosa. Ver `TRIAGEM.md` para os vereditos e as consultas.

---

## 1. A pergunta do plano bidimensional está ocupada, parcialmente ocupada ou livre?

**Parcialmente ocupada, e a parte que sobra é a que interessa.**

Nenhum trabalho recebeu OCUPA. Os dois eixos foram percorridos separadamente, por grupos
que em parte se sobrepõem (Piilo aparece em `kurt2023` e em `adithya2026-stability`), e o
cruzamento **com observável resolvido por módulo não existe** na literatura que encontrei.

O achado que mais muda o quadro não é um artigo — é uma **terminologia**. Ver item 5.

## 2. Que eixo já foi percorrido, por quem, e o que exatamente sobra

**Eixo estrutura × ruído — percorrido.** `kurt2023` (Kurt, Rossi, Piilo) varre remoção
aleatória e Watts-Strogatz contra quatro modelos ambientais. É o que mais ocupa o terreno.
Mas o observável é η, a probabilidade de captura no sorvedouro: **agregada, e sem coerência
nenhuma**. Contagem no texto completo: `community` 0, `modular` 0, `coherence` 0. As "seis
classes" que a seção 2.2 do documento mencionava são classes de forma da curva η(Ω) —
decaimento monotônico, decresce-e-cresce, cresce-e-decresce, e assim por diante.

**Eixo coerência × ruído — percorrido.** `adithya2026-stability` usa a norma ℓ₁ de coerência
sob decoerência intrínseca, Haken-Strobl e quantum stochastic walk. Confirmado como o
documento previa: a lista de topologias é **ciclo, completa, estrela, Erdős–Rényi,
small-world e scale-free — nenhuma modular**. A única ocorrência de `community` no PDF
inteiro está num título da bibliografia, e é a citação de Tsomokos. E a coerência é
**global**, não resolvida por partição.

**Eixo estrutura modular × dinâmica — percorrido, mas sem ruído.** `tsomokos2011` faz CTQW
sobre redes com estrutura de comunidade. É o trabalho mais próximo em estrutura, e é
**unitário puro**: `dephasing` 0, `decoherence` 0, `Lindblad` 0, `coherence` 0 no texto
completo (conferido contra extração válida de 6 páginas). Mede probabilidade de ocupação por
nó sob falhas de ligação.

**O que sobra, exatamente:**

1. O **cruzamento** dos dois eixos numa mesma varredura.
2. O observável **resolvido por partição** — ninguém decompõe a coerência pelos blocos da
   estrutura modular. `gassab2026` chega mais perto e reporta ℓ₁ **por pares selecionados**
   ("os quatro pares mais coerentes"), que é outra coisa.
3. `λ₂` como **eixo de reporte**. A consulta 8 não achou ninguém reportando eficiência ou
   coerência contra o valor de Fiedler; a literatura reporta contra parâmetros de construção
   (`p`, `k`, densidade), que não são comparáveis entre famílias de grafo.
4. A **costura** como parâmetro. `seam` = 0 ocorrências em `gassab2026` e em `celardo2019`,
   que são os dois trabalhos de microtúbulo mais próximos em geometria.

## 3. Os três trabalhos mais próximos, e a distância de cada um

| trabalho | distância, em uma frase |
|---|---|
| `kurt2023` (Kurt, Rossi, Piilo, J. Phys. A 2023) | Tem os dois eixos que queremos varrer, e mede a coisa errada: probabilidade de captura, sem nenhuma coerência e sem nenhuma partição. |
| `adithya2026-stability` (Adithya, Nokkala, Piilo, Meena, Phys. Scr. 2026) | Tem o observável quase certo — norma ℓ₁ — e a topologia errada: seis famílias, nenhuma modular, e a coerência é global em vez de decomposta por bloco. |
| `gassab2026` (Gassab, Pusuluk, Craddock, Entropy 2026) | Tem a geometria certa — espiral de 13 dímeros, empilhada ao longo do eixo — e não varre taxa de ruído nenhuma, não tem costura, e reporta ℓ₁ de pares escolhidos a dedo em vez de somada sobre uma partição. |

Menção obrigatória, porque muda uma hipótese: **`coates2021`** (Coates, Lovett, Gauger, NJP
2021) mostra que **a localização dos autoestados determina a taxa ótima de defasagem**, em
cadeias 1D com desordem. Isso não ocupa H2 — não há modularidade e o observável é transporte
— mas **converte H2 de hipótese cega em previsão mecanística**: se a localização fixa γ*, e
a modularidade muda a localização, então γ* *deve* se mover com a modularidade. Duas
consequências:

- H2 verdadeira passa a ser confirmação-e-extensão, não descoberta. O peso do resultado
  desloca-se para **quanto** a crista se move e com que lei.
- A pergunta genuinamente aberta vira outra, e é melhor: **a crista de coerência coincide com
  a crista de transporte?** Não há razão para coincidirem — `adithya2026-stability` já
  observa redes que são estáveis num modelo de ruído e vulneráveis noutro — e ninguém mediu
  as duas no mesmo plano. Sugiro promover isso a H2b.

## 4. H4 (o achado do Frontiers) se aplica ao nosso regime?

**Não diretamente, e a distância é grande o bastante para desarmar a ameaça — sem
desqualificar o trabalho.**

Li o artigo inteiro. É Cheung, N. (2026), *Transient entanglement in minimal open XXZ spin
chains: a toy-model analogy for microtubule-inspired quantum biology*, Front. Psychiatry 17,
1855963. Autor único; tipo do artigo **"Hypothesis and Theory"**; o próprio texto se
apresenta como "deliberately hypothetical analogy" e como pergunta de "Level-A".

Quatro diferenças, em ordem de peso:

1. **O observável é outro.** Eles medem **pureza global** Tr(ρ²) e a "meia-vida de pureza"
   (primeiro instante em que a pureza cai abaixo de 0,5). Nós medimos coerência **entre
   blocos** de uma partição. Pureza global cai com qualquer decoerência, inclusive a que
   redistribui coerência entre módulos sem destruí-la.
2. **O modelo tem perda de excitação.** O banho markoviano local deles inclui
   **amortecimento de amplitude** com γ_amp = 0,12 além da defasagem γ_dep = 0,25. O nosso
   Haken-Strobl é **defasagem pura**: a excitação nunca é perdida, a norma se conserva. O
   canal dominante do resultado deles não existe no nosso modelo — e é justamente o canal
   pelo qual "mais sítios" significa "mais decaimento".
3. **A escala é outra.** N = 4, 6, com varredura até N = 10. O "helical_segment" deles é um
   grafo de **6 sítios com nove ligações**, descrito como "lateral ring with Fibonacci-step
   helical pathways" — não é uma rede de microtúbulo em nenhum sentido estrutural. A nossa
   varredura roda em N = 520 com 8 módulos.
4. **"Conectividade" está em parte conflada com acoplamento.** O efeito de encurtamento é
   relatado sobretudo ao aumentar **J** (0,5 → 8,0), e o escalonamento com tamanho é
   `meia-vida ~ N^(-1,04)` — que é aproximadamente o que se espera de N canais de
   amortecimento independentes, e diz pouco sobre topologia.

E a reversão que eles relatam é ambiental, não estrutural: a condição de **envelope de
memória** (não-markoviana) deu as janelas de coerência mais longas.

**Recomendação:** manter H4 no documento, mas reescrita como **hipótese sobre pureza global
sob perda**, não sobre coerência entre módulos sob defasagem pura. E vale testá-la de frente
justamente por ser barata: acrescentar um canal de amortecimento de amplitude à fase 2 e
verificar se a crista de `C_inter` sobrevive. Se sobreviver, temos a delimitação; se não,
temos o mecanismo.

## 5. Terminologia que a literatura usa e nós não — o achado mais útil da rodada

**`C_inter` já tem nome, e é `block coherence`.**

Existe uma teoria de recursos estabelecida (originada em Åberg) em que o espaço de Hilbert é
particionado em subespaços ortogonais e um estado é *block-incoherent* quando só tem blocos
diagonais. A operação livre é o *block-dephasing*, que zera tudo fora dos blocos diagonais.
Nossa `C_inter` é exatamente a medida ℓ₁ dessa teoria, com **blocos = módulos da rede**, e
`Σ_M C_MM` é a parte block-incoherent. A identidade `Σ_M C_MM + Σ_{M<N} C_MN = C_ℓ1` é a
decomposição canônica dessa teoria, não uma conveniência nossa.

Referências: `dey2019-block-coherence-structure`, `wang2024-block-coherence-entanglement`.

**E a interseção com dinâmica não existe.** As consultas 5 e 6 procuraram coerência de bloco
cruzada com transporte, defasagem e quantum walks, e devolveram 8 e 10 resultados, nenhum
fazendo o cruzamento: os resultados são ou teoria de recursos estática, ou dinâmica de
transporte sem linguagem de bloco. **A teoria de recursos e a literatura de transporte não
se encontraram.** É aí que o trabalho cabe, e isso é uma afirmação mais forte e mais
defensável do que "ninguém varreu modularidade e ruído juntos".

Consequências práticas, e são imediatas:

- **Reescrever a seção 5.1** em linguagem de coerência de bloco. Isso põe o observável numa
  teoria de recursos com resultados de monotonicidade prontos, em vez de o apresentar como
  definição ad hoc — e um referee de teoria quântica vai reconhecer o objeto.
- **A variante "módulo fora do bloco"** — `|⟨S_M S_N*⟩|` — provavelmente também tem nome
  nessa literatura. Vale uma consulta dirigida antes de batizá-la.
- Nota histórica útil: `celardo2019` já usa "block" 44 vezes para os blocos do microtúbulo
  (supertransfer entre blocos). A linguagem de blocos **já existe na literatura de
  microtúbulos**, por outro motivo. As duas se encaixam.

Outros termos que a literatura usa e nós não: *transfer efficiency* η com *trapping rate* no
sorvedouro (Kurt); *quantum-classical distance* (Adithya); *supertransfer* (Celardo);
*non-Markovian backflow* (Gassab).

## 6. Onde este trabalho caberia

Em ordem de encaixe, com o argumento:

1. **New Journal of Physics** — publicou `coates2021` (o mecanismo que afia H2) e
   `celardo2019` (o microtúbulo). É o lugar onde as duas metades do nosso argumento já
   convivem, e aceita trabalho computacional longo com apêndices de método.
2. **Physical Review E** — publicou `alterman2023`. Redes complexas + dinâmica quântica é
   escopo central, e um plano (estrutura × ruído) com métricas de grafo é exatamente o tipo
   de figura que a revista publica.
3. **Journal of Physics A** — publicou `kurt2023`, o trabalho mais próximo. Submeter para a
   mesma revista põe o nosso resultado em diálogo direto com o dele, e o contraste
   ("observável agregado" contra "resolvido por bloco") fica explícito para o mesmo corpo
   de referees.
4. **Physica Scripta** — publicou `adithya2026-stability`. Menor impacto, mas é a revista
   que aceitou o trabalho de coerência ℓ₁ × topologia, e o nosso é a continuação natural
   dele com a família de grafos que falta.
5. **Quantum Information Processing** ou **Physical Review A** — se a ênfase final for a
   coerência de bloco como recurso, e não o transporte. Escolha que depende de qual metade
   ganhar peso na escrita.

**Não** recomendo Frontiers in Psychiatry nem revista de biologia quântica. A observação da
seção 2.5 do documento está certa e a varredura a confirma: é onde trabalhos com
enquadramento "microtubule-inspired" caem, e o custo é serem lidos como especulação. A
reformulação tecnológica da Seção 1 — "dada uma taxa de defasagem, qual arquitetura maximiza
a coerência de longo alcance?" — só ajuda se a revista for de física.

---

## Veredito em uma linha

O terreno está **livre no cruzamento e ocupado nas margens**; o observável central tem nome
consagrado (`block coherence`) que ainda não foi levado à dinâmica de transporte; H4 não se
aplica ao nosso regime pelo observável e pelo modelo de ruído; e a pergunta mais forte
mudou de "a crista se move?" para **"a crista de coerência coincide com a de transporte?"**.
