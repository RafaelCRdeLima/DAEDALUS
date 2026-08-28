# ROADMAP.md — etapas e estado dos testes de aceitação

Regra: **cada etapa só fecha com os seus testes passando.**

## Testes de aceitação

| # | O que verifica | Estado |
|---|---|---|
| 0 | `J_k` contra tabela externa de alta precisão (Wolfram × mpmath) | ✅ `t00_bessel_table.c` |
| 1 | Conservação da norma: desvio `< 1e-12` em 10⁴ passos | ✅ **7,5e-13** (pior de 5 limites espectrais) + envoltória em α |
| 2 | Linha infinita: `ψ_j(t) = i^d J_d(2γt)`, erro `< 1e-10` | ✅ **1,3e-16** |
| 3 | Ciclo `C_N`: espectro `−2γ cos(2πk/N)`, solução fechada | ✅ **5,1e-15** |
| 4 | Grafo completo `K_N`: dinâmica efetiva de dois níveis | ✅ **1,8e-15** |
| 5 | Chebyshev × diagonalização exata, `N = 200`, erro `< 1e-10` | ✅ **4,8e-13** |
| 6 | WASM × nativo: mesma cena, concordância `< 1e-14` | ✅ **0,0 — 100% bit a bit idêntico** em 17 341 números |
| 7 | C++ exportado × navegador: mesmos observáveis | ✅ **0,0 — bit a bit** em 9 casos, α de 0,13 a 100,8 |
| 8 | Determinismo do gerador: mesma semente, mesmo grafo | 🟨 nativo ✅, nativo × WASM ✅ (impressão digital inteira da CSR bate); falta o `.cpp` exportado, etapa 5 |

O teste 0 não estava no plano original. Ele foi acrescentado porque o teste 2
usa a mesma rotina de Bessel nos dois lados da igualdade (`J_k(a·dt)` nos
coeficientes de Chebyshev e `J_j(2γt)` na solução analítica), e um erro de fase
ou de normalização poderia se cancelar parcialmente e passar.

## Etapas

### 1. Núcleo C — ✅ completa

CSR, Chebyshev, observáveis, PRNG, hamiltoniano com escala fixada. Binário
nativo e testes 0–5, mais o 8 parcial.

Entregue além do combinado, porque os testes 2–5 são definidos sobre elas: as
**famílias de referência analítica** (linha, ciclo, `K_N`, hipercubo, grade 2D)
e a importação de lista de arestas. Também `t91_conventions.c`, que segura as
invariantes que quebram em silêncio: deduplicação, concurrence intramódulo,
NaN de `p_alvo`, cota espectral, cache de `dt`.

Desempenho medido (`make -C native bench`, grade de 500 pontos):

| `N` | `dt = 0.1` | `dt = 1.0` | meta |
|---|---|---|---|
| 1 300 | 0,053 s | 0,082 s | `< 0,2 s` ✅ |
| 10 010 | 0,532 s | 0,762 s | `< 3 s` ✅ |
| 50 011 | — | 4,55 s | acima do teto interativo: exportar |

### 2. Geradores de grafo — ✅ completa

Lattice microtubular com `seam_shift` e pontas abertas (CONVENTIONS.md parte 5),
partição em módulos ao longo do eixo longitudinal, religação Watts–Strogatz com
`|E|` invariante, modo de acréscimo, SBM. Métricas: `λ₂` de Fiedler com
critério de convergência, modularidade `Q` de Newman ponderada, grau médio,
`|E|`, número de componentes, comprimento médio de caminho.

Testes novos: `t92_microtubule.c` (contagem de arestas contra fórmula fechada,
localização sítio a sítio dos buracos da costura, módulos, determinismo),
`t93_connectivity.c` (`|E|` invariante sob religação em `p ∈ {0, 0.1, 0.5, 1}`,
crescimento sob acréscimo, casos limite exatos do SBM), `t94_metrics.c` (`λ₂`
contra forma fechada em ciclo/linha/`K_N`/hipercubo, contra Jacobi denso em
três regimes de modularidade, resíduo como cota rigorosa, e o caso de
não-convergência).

Três correções que a medição impôs, todas em CONVENTIONS.md:

- **`K ≈ 1.2α + 20` era teto, e é chute** (parte 6.2). Como teto, truncava a
  série com `|2 J_K|` ainda em 1,9e-11 na faixa `α ≈ 20–100` — 4,2e-13 de
  deriva da norma por passo em `α = 50`, contra 5,5e-17 em `α = 5`. Defeito
  não-monotônico em α, invisível para um teste de um α só. Quem manda agora é
  a cauda.
- **Nenhum Lanczos toca o PRNG compartilhado** (parte 4), por assinatura.
- **A costura não deixa as arestas faltantes numa ponta só** (parte 5): deixa
  `s` sítios órfãos em cada extremidade, em protofilamentos diferentes.

### 3. WASM — ✅ completa

`emcc 6.0.8`, `-O3 -msimd128`, sem pthreads e sem `SharedArrayBuffer`. Módulo
de 52 KB. Ponte em `wasm/bridge.c`, camada JS em `wasm/daedalus.mjs`, Web
Worker em `wasm/dae.worker.mjs` avançando em blocos de 25 passos — o
cancelamento mora no lado JS, sem callback atravessando a fronteira.

**Teste 6 fecha com folga inesperada:** 17 341 números, **100% bit a bit
idênticos** entre WASM e nativo, não apenas dentro de 1e-14. O `-msimd128` não
reassocia soma de ponto flutuante, então o SpMV esparso soma na mesma ordem nos
dois alvos. O comparador passou a exigir um **piso de 99% de identidade bit a
bit** além da tolerância: cair para "dentro da tolerância, mas reassociado" é
sinal de flag de compilação nova e tem de falhar, não virar um número um pouco
pior.

A suíte **inteira** roda sob WASM (`make -C native wasm-test`): 368
verificações, incluindo a que exige `p_alvo = NaN`. É o portão contra
`-ffast-math` herdado — mais barato e mais confiável que auditar flags.

Fronteira de memória: `wasm/teste_memoria.mjs` faz o heap crescer de propósito
e verifica as duas metades — que a view guardada morre (`byteLength = 0`) e que
a refeita continua certa. Ver CONVENTIONS.md, parte 9.1.

Desempenho no alvo real, a ~6% do nativo:

| `N` | WASM `dt=1` | nativo `dt=1` | meta |
|---|---|---|---|
| 1 300 | 0,090 s | 0,081 s | `< 0,2 s` ✅ |
| 10 010 | 0,796 s | 0,754 s | `< 3 s` ✅ |

### 4. Interface mínima — ✅ completa

Vite + React + TypeScript, no mesmo modelo do Tessera. Editor de parâmetros,
heatmap WebGL2 da rede desenrolada, séries temporais em SVG, seleção de sítio
inicial e alvo por clique, transporte com play/pause/scrub, e o núcleo rodando
em Web Worker — a interface nunca bloqueia.

Bundle estático: 211 kB de JS (67 kB comprimido) + 78 kB de worker com o WASM
embutido em base64 (`-sSINGLE_FILE`). Um `import`, um arquivo, nenhuma
configuração de servidor.

As três defesas contra "erro vira imagem plausível" estão em CONVENTIONS.md,
parte 10: mapeamento e paleta isolados e testados, fixtures com resposta
analítica **mais** anti-vacuidade, norma permanente na tela, e `npm run fumaca`
lendo os pixels de volta do canvas.

Dois bugs que a etapa produziu e que valem registro, porque nenhum deles
apareceria como número errado:

- **O wrapper JS zerava `j_par` e `j_perp`**, montando o vetor de parâmetros com
  zeros em vez de partir dos padrões do núcleo. O grafo saía com o número certo
  de arestas, todas de peso nulo, e o estado não se movia — o que na tela parece
  localização. Quem pegou foi o caso de anti-vacuidade da fixture. Corrigido em
  `dae_ws_params_default`: quem sabe os padrões é o C.
- **Closure velho no `onmessage` do worker**: registrado uma vez, congelava o
  `desenhar` do primeiro render, quando `rede` ainda era `null`. Sintoma cruel —
  séries temporais corretas e mapa preto, o que parece problema de WebGL e não
  de React. É o bug que `npm run fumaca` existe para pegar.

### 5. `spec.json` e exportadores — ✅ completa

Parser JSON estrito em C (`dae_spec.c`, ~500 linhas), modos procedimental e
explícito, `dae_run`, escritor de CSV único (`dae_csv.c`), CLI `daedalus run
spec.json`, e os três emissores. O `spec.json` virou a **única** entrada da
ponte WASM: o vetor de parâmetros provisório da etapa 3 foi removido.

**Duas naturezas de exportador**, e a diferença é de projeto:

- **`.cpp`** REGENERA tudo — núcleo amalgamado + spec embutido, reconstruindo o
  grafo a partir da semente. É isso que faz dele um teste do EMISSOR: parâmetro
  serializado errado muda o grafo, e a impressão digital diverge antes de
  qualquer observável.
- **`.py`** RECEBE a lista de arestas explícita. Reimplementar o gerador em
  Python criaria uma segunda implementação do que a amalgamação mantém única.
  Em troca, o alcance dele é o propagador e a grade de tempo.
- **Wolfram** saiu do papel de oráculo e virou **pacote autônomo** — ver abaixo.

**Teste 7**: navegador (WASM) × nativo × `.cpp` exportado, mesmo `spec.json`,
9 casos — **todos bit a bit idênticos**. A impressão digital do grafo é a
primeira linha comparada, e o comparador diz explicitamente "os dois lados
construíram grafos diferentes: isso é o emissor, não o propagador".

A varredura é em **α = a·dt**, não em `dt`: é α que a fórmula da ordem usa, e a
grade exportada tem `dt` livre com `a` dependendo da normalização. Cobertos
0,134 a 100,8 — e a varredura tem sua própria anti-vacuidade, exigindo que a
faixa coberta passe de duas ordens de grandeza.

Dois bugs de buffer encontrados no caminho, ambos na mesma classe: `snprintf`
devolve o tamanho **pretendido**, não o escrito, e copiar esse número de um
buffer truncado é leitura fora de limite. O lixo continha um NUL, o `fwrite`
com `strlen` cortava o CSV logo depois do cabeçalho, e o comparador via "sem
tabela" em vez de "arquivo truncado".

#### O pacote Wolfram — `templates/wolfram/`

O alvo Wolfram mudou de natureza durante a etapa: de oráculo mínimo para
**programa de produção**, porque quem vai recebê-lo é um colaborador de
Mathematica que vai **ler e modificar** o código. LibraryLink foi descartado —
biblioteca compilada é caixa-preta, o oposto de inspeção.

Isso muda o que a concordância prova. Entre `.cpp`, WASM e nativo ela é
**estrutural**: mesmo texto, três compiladores. Aqui ela passa a ser
**empírica**: dois métodos, mesmo resultado. Para valer alguma coisa, o método
tem de ser deliberadamente diferente — o núcleo propaga por Chebyshev, o pacote
por decomposição espectral (`Eigensystem`) e Krylov (`MatrixExp[-I H t, ψ]`).
**Não há Chebyshev no pacote, de propósito.**

Três arquivos na exportação: `Daedalus.wl` verbatim (é o que foi verificado; um
pacote montado por template seria outro programa), `DaedalusDemo.nb` e o
`daedalus_spec.json` do usuário ao lado — o pacote gera a rede a partir dos
**parâmetros**, não de uma lista de arestas, porque um gerador é para ser mexido
e uma lista pronta é dado.

O CSV ganhou `#! implementacao` (`c` ou `wolfram`) e `#! rewire_failed`. O
primeiro responde QUEM calculou, que o `core_hash` não responde; a interface
exibe a origem no selo, e CSV sem o campo aparece como "origem não declarada",
nunca como "núcleo".

Símbolos públicos em **português** — exceção registrada em CONVENTIONS.md 11.1
**com a razão escrita**, porque exceção sem razão vira precedente.

##### Registro da verificação manual

A CI não tem Mathematica; este portão é manual e por isso se registra. Protocolo
e tolerâncias em CONVENTIONS.md 12.1.

| data | core_hash | resultado |
|---|---|---|
| 2026-08-28 | `76a843e583e9bff1` | **12/12 OK.** PRNG idêntico (3 sementes × 100 valores). 12 digitais idênticas. `rewire_failed` bate, inclusive os 30 de `completo-religado`. Pior absoluto 9.4e-12, relativo 9.6e-11, amplitude 1.5e-14. Anti-vacuidade 7/7 detectou. |

O pior caso de amplitude é a **grade 2D** (n = 240), como se esperava de
espectro degenerado — κ(V) maior, mais cancelamento na soma espectral.

Dois achados que valem registro:

- **O erro relativo puro não serve como critério.** Em t = 0 o núcleo escreve
  `p_alvo = 0` **exato** — Chebyshev em α = 0 dá J₀(0) = 1 e J_k(0) = 0, ou seja
  a identidade sem arredondamento — e a soma espectral devolve 3e-32. Erro
  relativo 1, o pior possível, para trinta e duas casas de concordância. A lei é
  ~2δ/√p com δ ≈ 1e-15 na amplitude, e ela explica cinco ordens de grandeza de
  erro relativo com uma única concordância. Daí as três medidas separadas.
- **Onde os dois mais discordam, é a evidência funcionando.** O maior desvio de
  amplitude do conjunto está em `linha`, sítio j = 250, a 250 saltos da origem:
  o núcleo devolve 1.1e-68 e o pacote ~1.3e-14. Nenhum está errado. Chebyshev
  constrói o estado por matvec esparso, então um sítio a 250 saltos só é
  alcançado depois de 250 termos e sai com a cauda exponencial correta; a soma
  espectral é uma soma de n termos O(1) que se cancelam, e o resto é ε. Os dois
  concordam onde há física e discordam onde só há aritmética — se concordassem
  também em 1e-68, o motivo mais provável seria estarem rodando o mesmo
  algoritmo.

E a estimativa de Lanczos do núcleo é **rigorosa mas folgada**: em
`microtubulo-espectral` ela dá ‖H‖ = 5.799 contra o raio exato 3.975, 46% acima.
Não é defeito — superestimar só alarga o intervalo de Chebyshev — mas significa
que γt normalizado não é exatamente γt/ρ(H). A verificação impõe a escala do
núcleo para comparar o propagador e reporta as duas.

### 6. Varredura, reimportação, i18n, tutorial — ✅ completa

**Varredura** de `p` com realizações e barras de erro, rodando no worker um
ponto por vez; a média é **temporal** (`p̄`), não o valor final, que oscila.
Varredura longa continua sendo trabalho do `.cpp` com realizações.

**Reimportação** com procedência obrigatória: o `spec.json` embutido no CSV
passa pelo parser estrito em C antes de qualquer coisa ser plotada, e as
colunas são lidas por nome. `core_hash` diferente é aviso visível na tela, não
bloqueio — e o seletor de modo vira bronze. 10 testes, cada aceitação com o seu
gêmeo de recusa.

**i18n** em português, inglês, francês e italiano, no modelo do Tessera:
catálogo de funções, chave ausente devolve a própria chave, e o teste de
paridade assere que as quatro línguas têm exatamente as mesmas chaves.

**Tutorial** em `/tutorial/`, cobrindo o que muda a leitura de um resultado: as
duas disciplinas metodológicas, o que o rodapé está dizendo, a costura, e por
que azul e bronze não são decoração.

### Terceira vista: o tubo em 3D

Além da rede desenrolada e do layout espectral, o microtúbulo pode ser visto
**enrolado**. O núcleo já previa isso — ele guarda `xy = (m, q)` e o comentário
do gerador diz que "o cilindro 3D a interface deriva de (m, q)". O grafo tem
topologia, não geometria tridimensional; o tubo é uma leitura dela.

**O embutimento é helicoidal**, `z = m + seam·q/n⊥`, e não anéis planos. Com
anéis planos a costura salta `seam` unidades no eixo e aparece como uma cicatriz
atravessando o tubo. Ela não é isso: no microtúbulo a costura é descontinuidade
de **rede** — contato α–α onde o resto tem α–β — não de forma. Com a hélice,
toda ligação lateral fica com o mesmo comprimento, a da costura inclusive, e ela
some da forma permanecendo na topologia. `src/nucleo/tubo.test.ts` mede isso, e
mede junto que o empilhamento ingênuo falharia — senão a afirmação passa
sozinha.

**O eixo é comprimido, e o fator vai para a tela.** No padrão são 160 anéis de
13 protofilamentos: proporção 39:1, um fio de cabelo. Não há ângulo de câmera
que resolva. A compressão quebra de propósito a comparação entre distância
longitudinal e lateral — então ela é declarada em ×N no painel, com uma
alternância para escala métrica. A vista existe para mostrar como a rede se
FECHA, que é pergunta topológica; para a métrica existe o ×1.

**O que codifica profundidade**, e o que não pode: cor e raio já significam
|ψ_j|², então sobram perspectiva na posição, oclusão por teste de profundidade,
e as arestas desbotando com a distância — elas já eram contexto, não conteúdo. E
o giro, que é do usuário: arrastar resolve o que uma projeção estática deixe
ambíguo.

A projeção é feita **em JS uma vez por mudança de orientação**, não no shader:
o clique precisa saber onde cada vértice foi parar, e duas implementações da
mesma conta divergem — a divergência apareceria como "clico num vértice e
seleciona o vizinho", que ninguém lê como erro de matriz.

`tools/fumaca_tubo.mjs` entrou no portão. Ele não pergunta se o tubo aparece —
isso passaria com uma projeção sem profundidade, que faz uma faixa de pontos
parecer um tubo visto de frente. Ele arrasta e exige que a figura **se
reorganize**: 42 de 64 blocos mudam.

#### Um guarda que não podia disparar

Medindo o canvas para calibrar a vista nova, apareceu que o teste de fumaça
antigo contava "pixels vivos" com limiar 40 — e `cor(0)` do mapa soma
16+26+36 = **78**. O mapa desenhado inteiro no zero da rampa media 100% de
pixels vivos, e o guarda de "mapa quase preto" não podia disparar justamente no
caso que ele nomeia.

A primeira correção — exigir fração alta acima de `cor(0)` — estava errada por
motivo físico: no primeiro quadro a excitação está num sítio só e o mapa **deve**
estar quase todo em `cor(0)`. E a fração varia entre execuções (0,29% e 4,4% em
duas corridas iguais), porque depende de qual quadro está na tela; um limiar
sobre ela reprovaria por acaso, que é pior que não reprovar nunca.

O critério é **contraste**: `max` contra `cor(0)`. Estável em 677 contra 78, e um
mapa inteiro no zero dá 78 e reprova.

### Publicação

O compilado está em **https://daedalus-lab.pages.dev**, como bundle estático em
Cloudflare Pages (`wrangler.jsonc`, `npm run publicar`). **Sem `main`**: não há
Worker de código, não há backend, não há API. Isso não é economia — um endpoint
ali seria um caminho por onde dado de pesquisa poderia sair da máquina do
usuário sem ninguém ter pedido.

**Pages e não Workers por causa do endereço.** Uma URL workers.dev é sempre
`<worker>.<subdomínio-da-conta>.workers.dev`, e o subdomínio da conta carrega o
nome de quem a criou — não há como suprimi-lo sem trocar o subdomínio de toda a
conta. Em Pages o endereço é só o nome do projeto.

Conferido no que está publicado, não no que está previsto:

- o teste de fumaça roda contra a URL publicada e passa — Σ|ψ|² = 1 com desvio
  8.0e-14, 100% de pixels vivos, núcleo `9cbcc100c8b73b07`;
- **10 requisições no total, todas para a própria origem, e zero depois de a
  aplicação ficar pronta.** Fontes auto-hospedadas, nenhum CDN, nenhuma
  telemetria. "Eu não escrevi nenhum `fetch`" não é verificação;
- sem sourcemaps e sem `sourceMappingURL`: o repositório é privado e o que sobe
  é o compilado. O núcleo em C aparece no bundle porque o exportador precisa
  dele para emitir o `.cpp` autocontido — é o mesmo texto do arquivo exportado,
  por projeto;
- `/tutorial/` responde, e caminho inexistente devolve **404**.

Esse último ponto custou uma página. Em Pages, sem um `404.html`, qualquer
caminho recebe o `index.html` com status **200**: `/tutoriall` e `/tutorial`
passariam os dois, e o errado abriria o laboratório em vez de avisar — um
endereço digitado errado pareceria ter dado certo. `public/404.html` existe para
que ele falhe, e não faz requisição nenhuma para fora, como o resto do pacote.

### O que fica para depois

- reimportação de **HDF5** (hoje só CSV);
- `pop_stride` exposto na interface, para redes onde guardar todos os quadros
  não cabe;
- defasagem tipo Haken–Strobl, abaixo.

## Fase 2 (arquitetura já preparada, não implementar ainda)

Defasagem tipo Haken–Strobl por **trajetórias quânticas com saltos**, mantendo
vetores `O(N)`. Nunca propagar a matriz densidade densa: `N²` seriam 6,8 M
elementos em `N = 2600`.

#### Os dois modos de saída, e o acervo de ψ

A escolha entre `accumulate_rho` e `archive_psi` está no `spec.json` (bloco
`trajectories`, `format_version` 2) e na interface, como **radio** — são
mutuamente exclusivos, e **não há padrão implícito**: o bloco existir sem
`output_mode` é erro do parser, com mensagem dizendo o que fazer. Escolher por
omissão escolheria por quem não sabia que estava escolhendo, e a escolha errada
só aparece quando o observável mudar e os ψ não existirem mais — o que neste
projeto já aconteceu uma vez.

O custo aparece **ao lado de cada opção**, calculado dos parâmetros de agora e
não de uma nota de rodapé: em N = 520 com 40 amostras, 173 MB por thread para
acumular, 67 MB por célula (6,7 GB no plano de 100) para arquivar. As duas leis
são diferentes — N² contra N — e é essa diferença que faz haver escolha:
`src/nucleo/trajetorias.test.ts` mede o ponto de virada.

**O acervo de ψ é CACHE, não acervo.** Ele carrega o mesmo cabeçalho de
procedência do CSV — `#! spec` canônico, `#! core_hash`, `#! implementacao` — e
mais a `#! semente_base`, que com o índice da trajetória regenera cada fluxo
(`dae_traj_semente`). Consequência prática, e é a que importa:

> **Apagar o acervo é seguro.** Regenerá-lo custa tempo de CPU, não informação.
> Nada nele é irrecuperável a partir do par (spec, semente-base), e é
> exatamente por isso que a semente-base fica explícita no cabeçalho em vez de
> só implícita dentro do spec. Um cache que não se regenera é um acervo, e um
> acervo exige política de backup — que este arquivo não tem e não precisa.

**A ordem da soma é contrato.** `dae_rho_acc_somar` recusa índice fora de
sequência (`DAE_ERR_PARAM`) em vez de devolver outro número: soma de ponto
flutuante não é associativa, e a igualdade bit a bit entre os dois modos morreria
em silêncio se a ordem virasse consequência do laço. Por isso a paralelização é
**por célula da grade**, não por trajetória dentro de uma célula — acumular por
thread e reduzir em ordem de thread pareceria resolver e não resolve, porque o
número de threads entraria no resultado.

`t97_modos_saida` amarra os dois modos com 35 verificações, incluindo as duas
companheiras que o usuário exigiu: os observáveis são não triviais e têm valor de
referência (em γ = 0 o ensemble reproduz o unitário que `dae_obs` calcula por
outro caminho), e sabotagens deliberadas — precisão de f32 no acervo, acervo
truncado, soma fora de ordem — têm de morder. **Duas versões da sabotagem foram
vazias antes de morder**, e o teste documenta as duas: perturbar a amostra t = 0,
onde quase toda amplitude é exatamente zero, e perturbar 1 ULP numa média de 24
trajetórias, que fica abaixo da resolução do próprio acumulado.

#### O portão de Lindblad — ✅ passado antes de qualquer varredura

A média de trajetórias do núcleo **converge para a solução exata de Lindblad**, verificada
pelo pacote Wolfram com o superoperador vetorizado — um método que não é trajetória nenhuma.
Em n = 50, γ = 0,4, com 250 a 16 000 trajetórias, o desvio cai como `n^(-0,476)` contra o
`n^(-0,5)` que Monte Carlo não enviesado prevê. A companheira, resolvendo Lindblad com γ
errado sobre as mesmas trajetórias, dá expoente **0,0026**: o desvio estabiliza, como tem de
estabilizar quando o alvo é outro.

O critério é a **lei**, não um limiar: um limiar sozinho não distingue "convergiu" de
"convergiu para outro lugar". Detalhes e tabela em `docs/daedalus-estado-da-arte.md` 5.7.

`daedalus traj <spec> --saida rho.csv` escreve o ρ médio com procedência completa; os quatro
conjuntos de referência estão em `specs/lindblad/`.

**Ressalva, e ela é sobre o que a regra proíbe.** A regra é sobre PROPAGAR: o
estado continua sendo vetor `O(N)` em cada trajetória. Ela não proíbe usar uma
matriz `N²` como **acumulador de médias** — e a varredura da fase 2 precisa de
uma, porque o observável central é `⟨ψ_i ψ_j*⟩` promediado sobre trajetórias e
só então tomado em módulo. Calcular a coerência por trajetória e promediar
mediria espalhamento de amplitude, não coerência: cada trajetória permanece
pura, e a defasagem não entraria na conta. Ver `docs/daedalus-estado-da-arte.md`
seção 5.1.

A varredura roda em `N = 520` (40 × 13), onde o acumulador ocupa 4,3 MB e a
questão desaparece. O regime de interesse é fixado por `λ₂` e `Q`, não por `N`.
