# CONVENTIONS.md — as regras do Daedalus

Especificação normativa do laboratório de caminhadas quânticas de tempo
contínuo. **Este documento manda no código.** Se o código discordar daqui, o
código está errado.

Cada regra abaixo existe porque quebrá-la produz resultado *plausível e
errado*, não erro visível. Onde há um teste que segura a regra, ele está
nomeado.

---

## 1. Um único núcleo

Existe **um** núcleo, em `core/`. Ele vira três coisas:

1. **WebAssembly**, por `emcc`, para o navegador;
2. **binário nativo**, por `gcc`/`clang`, para testes e benchmarks;
3. o **`.cpp` exportado**, por concatenação do mesmo núcleo com um `main` de
   template.

`tools/amalgamate.mjs` lê `core/amalgam.list`, remove os `#include "dae_*.h"`
internos e emite um tradutor único. É esse texto — e não uma segunda
implementação — que vai para dentro do WASM e para dentro do `.cpp`. Por isso o
teste de aceitação 7 compara **o mesmo código sob dois compiladores**, e não
duas implementações que concordam hoje e divergem no mês que vem.

Consequências obrigatórias, verificadas por `make cxx-check`:

- o núcleo é **C99 que também é C++17 válido**: sem `_Complex`, sem VLA, sem
  inicializador designado, sem literal composto, todo `malloc` convertido
  explicitamente;
- **zero estado global mutável** — o template exportado roda realizações sob
  `#pragma omp parallel for`, e qualquer estado compartilhado seria corrida.
  Toda função do núcleo é reentrante e recebe seu contexto por argumento;
- sem `<stdio.h>` no núcleo. Impressão só em `native/` e nos templates;
- **`-ffast-math` é proibido**. Quebraria o NaN de `p_alvo` (parte 6) e a
  reprodutibilidade bit a bit.

## 2. O `spec.json` é analisado só em C

O TypeScript **monta** o texto JSON; quem o **interpreta** é `dae_spec.c`, do
lado C. O `.cpp` exportado embute o mesmo texto num *raw string literal* e usa
o mesmo parser.

A interface valida chamando o parser via WASM — é barato — e exibe
`dae_error.line/col`. **Não existe validação paralela em TypeScript.** Se
existisse, um valor-padrão divergiria entre os dois lados, e a divergência
apareceria como discrepância física meses depois.

O parser (`core/dae_spec.c`) é **estrito**: chave desconhecida é ERRO, com
linha e coluna. Um emissor que escrevesse `seam` onde o formato diz
`seam_shift` produziria, com um parser tolerante, um arquivo internamente
consistente resolvendo o problema **errado** — e o oráculo de verificação não
pegaria, porque ele valida o propagador, não o emissor. Campo novo exige subir
`format_version`.

O `spec.json` é a única entrada da ponte WASM. A versão anterior atravessava os
parâmetros do gerador num vetor de `double` com posições fixas, e foi por essa
fresta que os padrões entraram zerados (parte 10.2).

**Emenda à regra 3 do núcleo:** `dae_spec.c` e `dae_csv.c` incluem `<stdio.h>`,
só por `snprintf`. Formatar para um buffer não é entrada e saída — nenhum
`printf`, nenhum arquivo. A alternativa seria serializar fora do núcleo, e aí o
JSON canônico existiria duas vezes: uma no TypeScript e outra no `main` do
`.cpp`. Duas versões do canônico é exatamente a divergência que a amalgamação
existe para impedir.

## 3. As duas disciplinas metodológicas

Não são conforto de interface. Sem elas os resultados são artefato.

### 3.1 Religar, não acrescentar

Acrescentar arestas de longo alcance aumenta `|E|` e melhora o transporte
trivialmente — o resultado mede o número de arestas, não a topologia. O modo
padrão do controle de conectividade (`DAE_REWIRE`) mantém `|E|` **fixo** e
religa. `DAE_ADD` existe, e a interface avisa explicitamente quando está ligado.

### 3.2 Fixar a escala de energia

Ao comparar topologias diferentes é obrigatório normalizar `‖H‖`, senão "mais
coerência" pode ser apenas "hopping maior". A normalização vem **ligada** por
padrão (`DAE_NORM_SPECTRAL` ou `DAE_NORM_MEAN_DEGREE`); desligar é escolha
explícita e fica registrada no `spec.json`.

Semântica da escala: o fator é medido em `H_cru` com `gamma = 1`, e então
`H = gamma · H_cru / escala`. Assim `gamma` continua sendo o botão físico e a
normalização remove só a escala imposta pela topologia. O fator aplicado sai em
`scale_out`, aparece na interface e entra no cabeçalho do CSV.

## 4. Reprodutibilidade

- **O PRNG mora no núcleo** (`dae_rng`, xoshiro256++ semeado por splitmix64).
  Nunca `Math.random()` do JavaScript: o grafo visto na tela tem de ser o grafo
  que o cluster rodou.
- **Nada de numérica consome o fluxo compartilhado.** Todo Lanczos do projeto
  — `dae_csr_lanczos_bounds`, a normalização espectral em `dae_hamiltonian`, o
  `λ₂` em `dae_metrics_compute` — usa vetor inicial DETERMINÍSTICO, gerado
  internamente por splitmix64 sobre uma constante fixa
  (`dae_csr_lanczos_start`). Nenhuma delas recebe `dae_rng*`, e isso é imposto
  pela assinatura, não pela disciplina.

  > Duas razões. **Reprodutibilidade:** se o Lanczos puxasse do mesmo fluxo que
  > os geradores de grafo, a ordem das chamadas viraria parte do contrato de
  > forma invisível — bastaria o `.cpp` exportado montar o Hamiltoniano antes
  > (ou depois) da religação para o grafo mudar. **Física:** com
  > `DAE_NORM_SPECTRAL`, a escala de energia passaria a depender de uma
  > estimativa estocástica, e dois grafos comparados com sementes ou
  > `lanczos_steps` diferentes receberiam γ efetivo diferente — contaminando
  > exatamente a comparação a escala fixa que a parte 3.2 existe para
  > garantir.
- **A ordem das chamadas faz parte do contrato**, não só a semente. Todo
  sorteio varre índices em ordem crescente. Nenhum gerador pode sortear
  iterando sobre tabela de dispersão ou `Set` — a ordem mudaria entre alvos e a
  semente deixaria de reproduzir o grafo.
- `spec.json` **mais** `DAE_CORE_HASH` determinam o resultado bit a bit.
  `tools/hash_core.mjs` calcula o hash sobre todos os fontes de
  `core/amalgam.list` (menos o próprio arquivo gerado) e o grava em
  `core/dae_version.generated.h`.
- **Todo arquivo exportado e todo CSV de saída carrega, no cabeçalho, o
  `spec.json` canônico e o `core_hash`.** Um arquivo de resultado solto, achado
  num diretório seis meses depois, continua rastreável até o que o gerou. Cada
  figura de artigo tem de poder voltar ao JSON que a produziu.

Testes: `t90_determinism.c` (mesma semente reproduz a mesma CSR bit a bit;
sementes vizinhas divergem; a semente 0 não colapsa o estado do xoshiro).

## 5. O microtúbulo: costura e pontas

*(Gerador: etapa 2. A convenção fica registrada aqui desde já.)*

Índice `j = m·N⊥ + n`, com `m ∈ [0, N∥)` ao longo do eixo e `n ∈ [0, N⊥)` entre
protofilamentos, `N⊥ = 13` por padrão.

O acoplamento transversal liga `n → n+1`. Ao dar a volta, o sítio `(m, N⊥−1)`
liga com `(m + seam_shift, 0)`. `seam_shift = 0` é o cilindro periódico ideal;
`seam_shift = 3` é o deslocamento helicoidal realista, que quebra a simetria
translacional transversal e muda o espectro.

**As pontas longitudinais são abertas por padrão** (`longitudinal_closed = 0`),
e isso é física, não conveniência: o microtúbulo real tem extremidades abertas
e **inequivalentes** (plus end e minus end).

> **Por que as duas pontas não são iguais.** Com `seam_shift = s` e pontas
> abertas, as `s` arestas de costura com `m + s ≥ N∥` são descartadas. O
> resultado, medido sítio a sítio em `t92_microtubule.c`, é: **`s` sítios
> deficientes na coluna `0`, na ponta de `m` baixo, e `s` sítios deficientes na
> coluna `N⊥−1`, na ponta de `m` alto.** As duas extremidades perdem ligação,
> mas em **protofilamentos diferentes** — e é essa a inequivalência plus/minus
> end, não uma ponta intacta e outra defeituosa.
>
> (Uma versão anterior deste documento dizia que as arestas faltantes ficavam
> "todas numa ponta só". A contagem por grau mostrou que não: cada aresta
> descartada deixa um sítio órfão em cada extremidade, em colunas distintas.)
>
> A assimetria é consequência da costura helicoidal, não defeito da montagem.
> Quem quiser as pontas equivalentes usa `longitudinal_closed = 1`, e aí perde
> a fisiologia das extremidades.

## 6. Numérica

### 6.1 O limite espectral tem de ser garantido, não estimado

Este é o modo de falha clássico do propagador de Chebyshev, e ele é
**silencioso**. Se `a` ficar menor que a semi-largura verdadeira, `H̃` tem
autovalores fora de `[−1, 1]`, os `T_k` crescem exponencialmente e o resultado
vira lixo sem que nada avise.

O erro é **assimétrico**: subestimar `a` destrói o resultado; superestimar
custa alguns termos a mais em `K`. As regras seguem essa assimetria:

- **Gershgorin é cota rigorosa e é o teto.** O intervalo final nunca a excede.
- **Lanczos só aperta por dentro.** Os valores de Ritz são interiores ao
  espectro (`θ_max ≤ λ_max` sempre), e `β_m = ‖r‖` é a margem rigorosa em
  aritmética exata. Em ponto flutuante a ortogonalidade se perde, então há
  ainda **5% de inflação da semi-largura** e o recorte final contra Gershgorin.
- **Rede de segurança em tempo de execução.** `dae_cheb_step` compara a norma
  antes e depois e devolve `DAE_ERR_NORM` se ela variar mais que `1e-10`.
  Custa duas reduções `O(N)` contra `K` produtos matriz–vetor: ruído no
  orçamento. Vale para qualquer estado de entrada, normalizado ou não, porque
  compara a razão e não o valor absoluto.

Testes: `t04_complete.c` (em `K_50` Gershgorin dá `a = 49` e Lanczos aperta
para `25,6`, ainda contendo o espectro `{−49, +1}`); `t91_conventions.c`
(sabota `a` pela metade e exige `DAE_ERR_NORM`).

### 6.2 Quem decide a ordem é a cauda, não a fórmula

`K ≈ 1.2·(a·Δt) + 20` é **chute inicial**, não teto. A ordem que o propagador
usa cresce até `|2·J_K(α)| < 1e-16`, com `α = a·Δt`.

Usar a fórmula como teto é um defeito silencioso e **não-monotônico em α**, o
que o esconde de qualquer teste feito num único α. A margem que ela deixa acima
do ponto de retorno é `0.2α + 20`; a transição de Airy de `J_k(α)` em `k = α`
tem largura `~α^{1/3}`, de modo que a margem é suficiente para α pequeno,
**insuficiente para α ≈ 20–100**, e volta a sobrar para α grande. Medido, com o
teto valendo:

| α | K do teto | último `|2 J_K|` retido | deriva da norma por passo |
|---|---|---|---|
| 5 | 27 | 9e-16 | −5,5e-17 |
| 20 | 45 | **1,8e-12** | −3,6e-15 |
| 50 | 81 | **1,9e-11** | **+4,2e-13** |
| 120 | 165 | — | +3,9e-14 |
| 300 | 373 | — | ok |

Em `α = 50` isso dá 4,2e-9 em 10⁴ passos: violaria o critério de aceitação por
quatro mil vezes, com uma escolha de `Δt` perfeitamente legítima. Deixando a
cauda mandar, a mesma medida cai para 4,2e-16 por passo.

Corrigido isso, a deriva passa a obedecer

```
|norma − 1| ≈ n_passos · K · 5e-18
```

com `deriva/(passo·K)` constante dentro de um fator 5 ao longo de α ∈ [1, 120]
— o piso de arredondamento do `f64`. Baixar o limiar da cauda abaixo de `1e-16`
não melhora mais nada, e somação compensada de Kahan no acumulador também não
(testada: sem efeito, 38% mais lenta). **Consequência a saber:** o critério
"< 1e-12 em 10⁴ passos" só é alcançável para `K` moderado; com `K ≈ 174` a
deriva em 10⁴ passos é ~2e-11, e não há o que fazer em precisão dupla.

`t01_norm.c` guarda essa lei como **envoltória** varrendo α: é o teste que pega
um truncamento cedo demais, e é o que teria pego este.

### 6.3 Bessel por recorrência regressiva

`J_0..J_K` saem por Miller com a normalização `J_0 + 2ΣJ_{2m} = 1`. A
recorrência progressiva é instável para `k > x`: a solução `Y_k`, que cresce,
contamina e destrói a cauda — que é exatamente onde o truncamento decide o
erro.

A rotina é validada contra tabela externa (`t00_bessel_table.c`), gerada no
Wolfram com 30 dígitos e conferida de forma independente contra `mpmath`; as
duas fontes concordam em 2,2e-29. **Isso não é zelo excessivo**: no teste 2,
`J_k(a·dt)` aparece nos coeficientes de Chebyshev *e* `J_j(2γt)` aparece na
solução analítica da linha — a mesma rotina dos dois lados da igualdade. Um
erro de fase ou de normalização se cancelaria parcialmente e passaria.

### 6.4 Grade uniforme é premissa do cache

Os `c_k` dependem só de `dt` e ficam em cache. Uma **grade logarítmica** anula
esse cache e recalcula Bessel a cada passo: funciona, mas custa. Quem for
adicionar "escala log no eixo do tempo" na etapa 6 precisa saber disso. Teste:
`t91_conventions.c` verifica que alternar `dt` recalcula os coeficientes.

### 6.5 `λ₂` não é "rodou m passos e pronto"

`λ₂` é reportado contra `p` e vira resultado de manchete. O regime que
interessa — rede fortemente modular — tem `λ₂ → 0`, e é exatamente onde a
convergência é mais lenta. Um número **fixo** de passos devolve `λ₂`
**superestimado** ali, achatando a curva na região mais interessante; e um
platô numérico é indistinguível de um platô físico quando se olha só a curva.

Por isso `dae_metrics_compute` tem critério de convergência, teto de passos,
**resíduo devolvido** e bandeira. Se `lambda2_converged` for 0, o valor é um
**limite superior** (quociente de Rayleigh de um vetor em `1⊥`), não uma
medida, e a interface tem de dizer isso. `lambda2_residual = ‖Lx − λx‖` é cota
rigorosa: existe autovalor de `L` a menos disso.

Quanto isso importa, medido em SBM `n = 200`, `M = 4`, `p_in = 0.35`,
`p_out = 0.002`: com o critério de convergência, `λ₂ = 0,178453`, batendo com
Jacobi denso em `1e-8`; com **2 passos fixos**, `λ₂ = 10,36` — 58× maior.

A deflação do vetor constante aparece em quatro pontos de `dae_fiedler`, e três
deles são **mutuamente redundantes de propósito**. Está escrito no cabeçalho da
função, junto com a medida que motivou cada um; não os "simplifique" achando
que são a mesma coisa repetida.

## 7. Observáveis

### 7.1 Concurrence: a convenção, e o termo espúrio do bloco diagonal

Para estado puro, `C_ij = 2|ψ_i||ψ_j|`. Com `s_M = Σ_{i∈M}|ψ_i|` e
`q_M = Σ_{i∈M}|ψ_i|²`, somando sobre **pares não-ordenados** `{i,j}`, `i ≠ j`:

```
C_MN = 2 s_M s_N        (M ≠ N)
C_MM = s_M² − q_M       (o produto externo incluiria i == j, que não é par;
                         o termo espúrio é exatamente q_M)
```

A matriz é armazenada simétrica, e **a soma do triângulo superior *com* a
diagonal reproduz `C_ℓ1` = `(Σ|ψ_j|)² − 1`**. Essa identidade é o teste da
convenção (`t91_conventions.c`), e é ela que amarra a concurrence agregada à
coerência `ℓ1`.

Custo: `O(N + M²)`, não `O(N²)` — a versão agregada por módulo é um produto
externo. Só a matriz completa é cara, e ela é oferecida apenas para
`N ≤ DAE_FULL_CONC_MAX` (2000).

### 7.2 Sem alvo, `p_alvo` é NaN

`target = −1` produz `p_alvo = NaN`, **nunca zero**. Zero é um valor
fisicamente válido — o alvo pode simplesmente estar vazio — e acabaria plotado
como se fosse dado.

## 8. Montagem da CSR: duplicata é descartada

`dae_csr_from_edges` **descarta** aresta repetida; não soma os pesos. Com
`seam_shift` e `N⊥` pequeno dá para gerar duplicata legítima, e somar dobraria
`j_perp` em alguns sítios sem nenhum aviso. O número de entradas descartadas
sai em `n_dropped`, para a interface poder avisar.

Invariante: dentro de cada linha, `colind` é estritamente crescente.

## 9. Layout de memória

- Matriz esparsa em **CSR**; grau típico ~4, `nnz ≈ 4N`.
- `H` é **real simétrica** (adjacência ou laplaciana com pesos reais), então o
  SpMV aplica a mesma matriz a `re[]` e a `im[]` — metade do tráfego de
  memória.
- Complexos como **dois arrays reais separados** (`re[]`, `im[]`). Nunca
  `double complex` intercalado: o SIMD do WASM só rende no layout SoA.
- `f64` na propagação; `f32` apenas no buffer que alimenta a textura WebGL.
- Índices em `int32_t`.

### 9.1 A fronteira WASM: nunca guarde uma view

Todo buffer que o núcleo devolve ao JavaScript vive no heap do WASM. **Qualquer
`malloc` do lado C que faça o heap crescer troca o `ArrayBuffer` inteiro**, e
toda view que o JavaScript tenha guardado passa a apontar para memória
*detached* — leitura silenciosa de zeros, sem exceção, sem aviso.

O modo de falha é o pior possível: funciona em toda rede pequena, e quebra
quando o usuário aumenta `N`.

A regra, em `wasm/daedalus.mjs`: as views saem sempre de `wasmMemory.buffer`,
que é o buffer corrente por definição, e são construídas **na hora de cada
leitura**. Construir uma view é criar um objeto, não copiar dados — continua
sendo leitura sem cópia, que é o ponto do contrato. Existem exatamente três
fábricas de view no projeto (`f64_`, `f32_`, `i32_`); nada mais constrói uma.

O que atravessa `postMessage` do worker para a interface é **cópia** (`slice()`),
porque uma view do heap do WASM não sobrevive nem ao `postMessage` nem ao
crescimento. O caminho sem cópia é o de dentro do worker, do WASM para a
textura WebGL.

`wasm/teste_memoria.mjs` verifica as **duas** metades: que a view guardada de
fato morre (senão o contrato seria superstição) e que a refeita continua certa.

## 10. A interface: erro deixa de ser número errado

Até a etapa 3, todo erro aparecia como número errado, e havia oráculo analítico
para comparar. A partir da interface, erro aparece como **imagem plausível**:
um heatmap com os eixos `m`/`n` trocados, ou com o colormap invertido, é
indistinguível de física interessante para quem está olhando — e vira figura de
artigo.

Três defesas, e nenhuma delas é "olhar e achar bonito".

### 10.1 O mapeamento e a escala de cor moram sozinhos, e são testados

A transposição sítio→texel está em `src/nucleo/indices.ts`, sozinha e
exportada. A escala de cor está em `src/nucleo/paleta.ts`, e o shader monta a
LUT a partir dela em vez de ter uma cópia. Os testes atacam essas duas funções
diretamente, não o pixel na tela: `paleta.test.ts` exige monotonicidade em
luminosidade (senão "mais claro = mais população" vira convenção, não verdade)
e `indices.test.ts` exige que um delta caia num texel específico — com
`N∥ ≠ N⊥`, uma transposição muda esse índice na hora.

### 10.1.5 Toda invariância precisa de uma companheira

Regra geral, e não um caso particular das fixtures: **toda asserção de que algo
se conserva precisa de uma companheira que prove que aquilo pode ser
quebrado.** A pergunta a fazer de cada teste novo é *existe um estado
degenerado em que isto passa sem testar nada?* — e quase sempre existe:

| asserção | passa trivialmente quando |
|---|---|
| o padrão é simétrico | o estado não evoluiu (um delta é simétrico) |
| a norma se conserva | nada evoluiu |
| `p_alvo` bate nos dois lados | é zero dos dois lados |
| os dois CSV são idênticos | os dois estão vazios ou truncados |
| a varredura cobre o parâmetro | todos os pontos caíram no mesmo valor |
| o leitor aceitou o arquivo | o leitor aceita qualquer coisa |

As companheiras estão no código: `seam_shift = 3` tem de QUEBRAR a simetria
transversal; o comparador de CSV exige norma em 1 **e** pacote espalhado; a
varredura de α falha se a faixa coberta não passar de duas ordens de grandeza;
cada teste de aceitação do reimportador tem um gêmeo de recusa.

### 10.1.6 Ausência não se afirma sem provar que a sonda enxerga

Regra de **método**, e não só de código: vale para busca em texto, para varredura
bibliográfica, para consulta a banco, e para qualquer lugar onde "não achei" vire
conclusão.

**Nenhuma afirmação de ausência sem a medida que prova que a sonda enxerga.**

Uma sonda quebrada e uma ausência real produzem exatamente o mesmo resultado — vazio — e
a diferença entre as duas é toda a diferença entre um achado e um engano. É a mesma
classe do fundo `#101A24` que era igual a `cor(0)`: o mapa estava correto, a rede estava
lá, e a medida não a enxergava.

Na prática, duas exigências:

1. **Consulta-canário.** Antes de confiar num "não encontrei", rode uma consulta cuja
   resposta você já conhece e exija que ela apareça. Se o canário não volta, a busca está
   quebrada e todo "não encontrei" dela é ruído.
2. **A sonda é conferida no próprio alvo.** Contar zero ocorrências num PDF só vale depois
   de conferir que o PDF produziu texto: 6 páginas e 23 939 caracteres extraídos é medida;
   `grep -c` devolvendo zero num arquivo que não extraiu nada é o mesmo zero, e não quer
   dizer nada.

Registre quantos resultados cada consulta devolveu. **Consulta com zero resultados é
suspeita, não conclusão** — e uma afirmação de "ninguém fez X" precisa listar as consultas
que procuraram X e falharam, senão a ausência de evidência não mostra onde procurou.

Aplicado em `bibliografia/TRIAGEM.md`, que traz as duas coisas: a tabela das 13 consultas
com o número de resultados de cada uma, e a conferência da extração antes das contagens.

### 10.2 Fixtures com resposta conhecida, e anti-vacuidade junto

Com `seam_shift = 0` a rede é o produto cartesiano `P_41 × C_13`: a dinâmica
fatoriza e o padrão é simétrico nos dois eixos, com `Var(m) = 2(γt)²` exato da
caminhada livre e centroide longitudinal igual em **todos** os anéis.

Isso é previsão analítica, não instantâneo medido — mas sozinho seria **vácuo**:
um estado parado também é simétrico. Por isso todo teste de simetria vem
acompanhado de (a) uma verificação explícita de que o pacote se espalhou e (b)
o caso `seam_shift = 3`, que tem de QUEBRAR a simetria transversal.

> Não é hipotético. O wrapper JavaScript zerava `j_par` e `j_perp` porque
> montava o vetor de parâmetros com zeros em vez de partir dos padrões do
> núcleo. O grafo saía com o número certo de arestas, todas de peso nulo, `H`
> era a matriz nula e o estado não se movia. **Na tela, isso não parece bug —
> parece localização.** Quem pegou foi o caso de anti-vacuidade.
>
> A correção é a mesma regra da parte 2: quem sabe os padrões é o C
> (`dae_ws_params_default`), e o JavaScript parte deles.

Sobre a assinatura congelada: ela precisa ser **conjunta**, não marginal. Duas
tentativas erradas ficaram registradas em `src/nucleo/assinatura.ts` — um único
número que era o primeiro momento (ou seja, o centroide, cego a qualquer
rearranjo simétrico) e depois estatística circular no eixo `q`, correta e ainda
assim cega, porque a costura ACOPLA `m` e `q` e marginalizar sobre `m` destrói
exatamente a informação que ela cria.

### 10.2.5 Layout: desenhar a rede, não a rotulagem

Grafo sem geometria própria — SBM, hipercubo, `K_N`, lista importada — não tem
coordenada nenhuma que o gerador saiba dar. A primeira versão desenhava os
sítios **em ordem de índice**, dobrados em linhas. Isso desenha a ORDEM DE
ROTULAGEM, não a rede: para um SBM a numeração é arbitrária, e a figura
resultante não diz nada sobre topologia enquanto parece que diz.

O recurso é o **layout espectral**: autovetores 2 e 3 da laplaciana como
coordenadas `(x, y)`. Ele reaproveita o Lanczos deflacionado do `λ₂` — é
literalmente o vetor de Fiedler que já se calcula, mais o próximo — e, para
rede modular, separa os módulos no plano, que é o que se quer enxergar.

`dae_graph.geom` diz o que o gerador soube dar: rede desenrolada (microtúbulo),
geometria própria (linha, ciclo, grade) ou nenhuma. O padrão da vista sai daí,
e **o nome do layout em uso fica visível na interface** — a figura muda de
significado conforme ele, e adivinhar qual está ativo é o começo de ler errado.

A fixture (`t95_layout.c`) mede a razão entre a distância média ENTRE módulos e
DENTRO de um módulo. Com `p_in = 0.35`, `p_out = 0.004`: **20,5**. A companheira
usa `p_in = p_out`, onde não existe módulo — a partição continua rotulando os
vértices, mas não corresponde a estrutura nenhuma — e ali a razão tem de ser
**0,996**. Sem esse par, a asserção de separação estaria medindo a numeração
dos vértices, não a topologia.

Normalização para a caixa do canvas: margem fixa em pixels e escala
**uniforme** nos dois eixos. Esticar `x` e `y` de forma independente encheria a
caixa por completo, mas faria a distância no plano mentir — e o ponto do
embedding é justamente que distância ali significa alguma coisa.

### 10.3 A norma fica na tela, sempre

O diagnóstico de norma não mora num painel de depuração: fica no rodapé,
permanente, com `|1 − norma|` em notação científica e o rodapé inteiro em
vermelho quando passa de `1e-9`. É o único indicador que o usuário — você,
daqui a um ano, ajustando `dt` num regime novo — pode olhar para saber se o que
está vendo é confiável. Junto dele ficam `λ₂` com o aviso de não-convergência,
`Q`, `|E|`, componentes, arestas duplicadas descartadas e religações sem
destino livre.

### 10.4 Teste de fumaça mede pixel, não intenção

`npm run fumaca` abre o aplicativo num Chrome sem cabeça pelo protocolo
DevTools, espera a propagação terminar e lê os pixels de volta do canvas. Sem
isso, um mapa preto com séries corretas passa despercebido — e foi o que
aconteceu: a causa era um closure velho no React, não WebGL nem física.

O alcance está escrito no próprio arquivo: ele garante que a figura final
existe, não a animação quadro a quadro. Quem garante o conteúdo são as
fixtures.

> Nota de ferramenta, que custou caro: `--dump-dom` e `--virtual-time-budget`
> do Chrome sem cabeça **não esperam trabalho assíncrono em Web Worker**. Eles
> devolvem silêncio, e silêncio é indistinguível de falha — passei um bom tempo
> depurando um travamento que não existia. `tools/navegador.mjs` fala o
> protocolo DevTools direto, com o WebSocket embutido do Node e zero
> dependências, e espera em tempo real.

## 11. Código

Comentários em **português**, identificadores em **inglês** (convenção do
Tessera). Prefixo `dae_` em tudo que é público.

Comentário explica **por que**, não o que. As regras deste documento aparecem
citadas no ponto do código em que valem.

### 11.1 Exceção: o pacote Wolfram tem símbolos públicos em português

`templates/wolfram/Daedalus.wl` exporta `DaedalusRede`, `DaedalusPropagar`,
`DaedalusObservaveis`, `DaedalusVarredura`, `DaedalusVerificarReferencia` e o
resto em **português**, CamelCase com prefixo `Daedalus`. É a única exceção à
regra de identificadores em inglês, e a razão fica registrada porque uma
exceção sem razão escrita vira precedente.

O núcleo em C é lido por quem trabalha no motor, e ali o inglês é a convenção do
campo. Este pacote é lido e **modificado** por um colaborador de Mathematica —
ele não é um oráculo que se roda e se confere, é código que se altera. Os
comentários que explicam a física estão em português; ter os símbolos em inglês
no meio deles produziria um texto que muda de língua a cada linha, e a fricção
recairia justamente sobre quem mais precisa entender o que está lendo.

O prefixo `Daedalus` não é decorativo: Wolfram tem um único espaço de nomes
global por contexto, e um símbolo curto colide com o caderno do usuário.

A regra do resto do projeto **não muda**. Esta exceção vale para
`templates/wolfram/` e só para ele.

### 11.1.1 Por que o pacote Wolfram não é uma tradução do núcleo

Entre `.cpp` exportado, WASM e binário nativo a concordância é **estrutural**:
mesmo texto, três compiladores, não há o que divergir (parte 3). Com o Wolfram
isso é impossível — Wolfram não inclui C, e uma biblioteca compilada por
LibraryLink seria caixa-preta, o oposto de inspeção.

Então a garantia muda de natureza e passa a ser **empírica**: dois métodos,
mesmo resultado. Para isso valer alguma coisa o método tem de ser
**deliberadamente diferente**. O núcleo propaga por expansão de Chebyshev; o
pacote propaga por decomposição espectral (`Eigensystem`) e por Krylov
(`MatrixExp[-I H t, psi]`) quando N cresce. **Não há Chebyshev no pacote, de
propósito**: duas implementações do mesmo algoritmo podem compartilhar o mesmo
erro conceitual, e a concordância entre elas não provaria nada.

O que TEM de bater exatamente, sem tolerância, é o que não é numérico: o fluxo
do PRNG, a impressão digital do grafo e o contador de religações que falharam.
Ver parte 12.1.

## 11.2 Reimportação: a única entrada que não nasce aqui

O CSV que volta do cluster é a única entrada do sistema que não passa pelo
parser estrito por construção — e por isso é a que mais precisa desconfiar. Um
arquivo de uma versão anterior do núcleo, ou com as colunas em outra ordem,
plotaria e plotaria **errado**, sem nada quebrar.

Três defesas, em `src/nucleo/reimportar.ts`:

1. **Procedência obrigatória.** Sem `#! spec` e `#! core_hash` o arquivo é
   recusado. Não dá para saber que simulação ele descreve, e um gráfico sem
   essa resposta é pior que nenhum gráfico.
2. **O spec passa pelo parser estrito em C**, via WASM (`dae_ws_valida`), o
   mesmo do resto do sistema. Se não passa, o CSV não entra — e a mensagem que
   aparece na tela é a do parser, com linha e coluna.
3. **Colunas por nome, nunca por posição.** Ordem diferente tem de funcionar;
   coluna ausente tem de aparecer como ausente, não como outra coluna.

`core_hash` diferente é **aviso, não bloqueio**: reler resultado antigo é
legítimo. Mas o aviso vai para a **tela**, não para o console, e o seletor de
modo vira bronze — o número deixou de ser calculado aqui.

**`#! implementacao` diz QUEM calculou**, que é outra pergunta e o `core_hash`
não responde: o mesmo core_hash pode ter produzido o número pelo núcleo em C
(`c`) ou pelo pacote Wolfram (`wolfram`), que usa outro método. A interface
exibe a origem no selo, ao lado de "Reimportado". Ausência do campo — CSV de
versão anterior — aparece como **"origem não declarada"**, nunca como "núcleo":
supor a origem seria atribuir ao arquivo uma procedência que ele não afirma.

## 11.3 Internacionalização

Quatro línguas, mesmo modelo do Tessera: cada entrada do catálogo é uma
**função**, não um texto com marcadores, para que cada língua resolva a própria
gramática sem biblioteca de pluralização no meio. Chave ausente devolve a
própria chave — o buraco aparece na tela em vez de virar string vazia.

`src/i18n/catalog.test.ts` assere que as quatro línguas têm **exatamente** o
mesmo conjunto de chaves, que toda chave usada na interface existe no catálogo,
e que nenhuma tradução devolve string vazia. São dez linhas e pegam o modo de
falha inteiro na CI. O teste que varre o código em busca de `t('chave')` tem
sua própria anti-vacuidade: falha se encontrar menos de dez chaves, porque um
varredor quebrado acharia zero e passaria.

## 11.5 Identidade visual

`identity/` manda na aparência, e uma das regras é **funcional, não decorativa**:
**Azul Egeu** identifica o laboratório interativo — números calculados
localmente, no navegador, agora. **Bronze** identifica tudo que passou pelo
ciclo de exportação e reimportação. Nenhum valor reimportado aparece em azul, e
a distinção não se reaproveita para outra coisa.

O mapa de cor de probabilidade tem luminância monotônica para sobreviver à
impressão em escala de cinza; o de fase é cíclico, porque 0 e 2π são a mesma
coisa e um mapa sequencial inventaria uma descontinuidade que a física não tem.
Os dois vivem em `src/nucleo/paleta.ts`, com os mesmos valores que
`identity/daedalus_colormaps.py` dá ao matplotlib e ao Wolfram — a figura da
tela e a figura do artigo têm de ter a mesma leitura. Todo valor numérico da
interface vai em IBM Plex Mono.

Nenhum elemento de microtúbulo, de biologia ou de Orch-OR entra no logotipo ou
na identidade: o motor é geral para qualquer grafo, e a identidade acompanha
isso. O microtúbulo é um cartão da galeria de geradores, com o mesmo peso
visual dos demais.

## 12. Portões de qualidade

```
make -C native test        # todos os testes de aceitação
make -C native cxx-check   # o núcleo amalgamado compila limpo em C99 e C++17
make -C native asan        # ASan + UBSan
make -C native tsan        # ThreadSanitizer (setarch -R por causa do ASLR)
make -C native bench       # metas de desempenho
make -C native mutants     # arnês de mutação (manual, não entra na CI)

source ~/emsdk/emsdk_env.sh
make -C native wasm        # módulo + artefatos de linha de comando
make -C native test6       # ACEITAÇÃO 6: WASM contra nativo
npm run teste7             # ACEITAÇÃO 7: navegador × .cpp exportado, varrendo α
make -C native wasm-test   # a suíte INTEIRA sob WASM + fronteira de memória
make -C native wasm-bench  # desempenho no alvo real

npm test                   # fixtures da interface (mapeamento, paleta)
npm run fumaca             # o aplicativo abre, propaga e DESENHA
npm run build              # bundle estático
```

### 12.1 Verificação do pacote Wolfram: manual, e por quê

A CI **não tem Mathematica**. Este portão é manual, e por isso ele registra a si
mesmo: cada execução vai para o ROADMAP.md com **data, `core_hash` e
resultado**. Verificação manual sem registro é verificação que ninguém sabe se
aconteceu.

```
wolframscript -e 'Get["templates/wolfram/Daedalus.wl"];
  DaedalusVerificarReferencia["specs/oraculo"]'
wolframscript -e 'Get["templates/wolfram/Daedalus.wl"];
  DaedalusAntiVacuidade["specs/oraculo"]'
```

**A ordem da conferência é o diagnóstico**, e é ela que separa causas que se
corrigem em lugares diferentes:

1. **PRNG contra tabela de referência** (`specs/oraculo/prng.json`, gerada por
   `native/tests/t96_prng_tabela.c`). Barata e a mais diagnóstica: se o
   xoshiro256++ divergir, redes estocásticas saem diferentes e a discordância
   não aparece como erro numérico, aparece como **física diferente**. Mesmo
   raciocínio do teste 0 contra a tabela de Bessel.
2. **Impressão digital do grafo**, exigida **idêntica**, sem tolerância nenhuma.
3. **Contador de religações que falharam** (`#! rewire_failed`). A digital não
   vê isto: uma tentativa que colide consome 100 sorteios e não muda aresta
   nenhuma. O caso `completo-religado` existe só para isso — em K₁₂ **toda**
   tentativa colide, o grafo sai idêntico ao original, e esse contador é a única
   testemunha de que os dois gastaram o mesmo fluxo. Um caso com
   `rewire_failed = 0` compararia zero com zero e não provaria nada.
4. **Observáveis**, com tolerância declarada.

**Três medidas, e nenhuma sozinha.** Erro relativo puro não serve: em t = 0 o
núcleo escreve `p_alvo = 0` exato (Chebyshev em α = 0 dá a identidade sem
arredondamento) e a soma espectral devolve 3e-32; o erro relativo é 1, o pior
possível, para uma concordância de trinta e duas casas. Há uma lei por trás: se
as amplitudes diferem de δ em valor absoluto, p = |ψ|² difere relativamente de
~2δ/√p, o que explica cinco ordens de grandeza de erro relativo com uma única
concordância de ~1e-15 na amplitude. Então:

| medida | pior observado | declarada | margem |
|---|---|---|---|
| absoluta (tabela de escalares) | 9.4e-12 — `linha`, `coh_l1` que é O(n) | 1e-10 | 10× |
| relativa (só acima do piso 1e-10) | 9.6e-11 — `microtubulo-seam0` | 1e-9 | 10× |
| amplitude (estado final) | 1.5e-14 — **grade 2D**, n = 240 | 1e-12 | 68× |

O piso **não afrouxa** o teste: abaixo dele o critério absoluto continua valendo
e é ele que reprova discordância real. E os dois critérios se dividem o trabalho
sem sobra — `norm`, `ipr` e `coh_l1` estão sempre muito acima do piso e caem no
relativo; `p_alvo` e as populações por módulo atravessam caudas de 1e-30 e caem
no absoluto.

A grade 2D é mesmo o pior em amplitude, como se espera de espectro muito
degenerado. O piso de ruído da soma espectral escala com n (≈ nε/4): quem rodar
N ≫ 300 deve esperar a tolerância de amplitude subir junto — e reajustar sabendo
por quê, não para fazer passar.

**A escala é imposta.** O núcleo normaliza por estimativa de Lanczos com margem,
o pacote pelo raio espectral exato, e os dois discordam por construção (em
`microtubulo-espectral`, 5.799 contra 3.975). A verificação impõe a escala do
núcleo para comparar o **propagador**, e reporta a diferença das duas escalas
como número — senão uma discordância de norma contaminaria todas as colunas e
esconderia qualquer discordância de propagador atrás dela.

**Anti-vacuidade obrigatória.** `DaedalusAntiVacuidade` sabota o grafo
(`seam_shift` 3→2), o fluxo de sorteios (`rewire_failed` 30→29 com a digital
intacta), os números (deslocamento de 1e-6 **e** de 1e-15, para mostrar que o
limiar tem dois lados), o arquivo (truncado, e sem o bloco de estado), e confere
a identidade Σ_{M≤N} C_MN = C_ℓ1, que é álgebra da convenção e não comparação
com o núcleo. Cada sabotagem tem de produzir **o veredito correspondente**: sem
isso, "os 12 casos passaram" e "a verificação está quebrada e sempre verde" são
indistinguíveis pelo resultado.

**`make -C native mutants`** aplica um defeito deliberado por vez e imprime
quem mordeu. Comentário não roda na CI; este roda. Onde o projeto tem defesa
redundante de propósito, o mutante fica lá marcado `esperado: CEGO` — a
cegueira aparece na tabela em vez de ficar escondida num cabeçalho.

**`make -C native wasm-test`** é o portão que pega `-ffast-math` herdado por
flag: `t91_conventions` exige que `p_alvo` seja NaN sem alvo, e `-ffast-math`
transformaria isso em zero silenciosamente. Rodar a suíte inteira no alvo real
é mais barato e mais confiável do que auditar flags.

Compilação com `-Wall -Wextra -Werror -pedantic`. O `tsan` só ganha sentido de
verdade na etapa 5, quando o template exportado passar a usar OpenMP nas
realizações — mas o alvo já existe para que a regra de "zero estado global
mutável" não se perca no caminho.
