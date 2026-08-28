# Daedalus

Laboratório gráfico de **caminhadas quânticas de tempo contínuo** (CTQW) sobre
grafos arbitrários, rodando inteiro no navegador.

Uma excitação no espaço de Hilbert de dimensão `N` = número de vértices,
`H = −γA` (adjacência) ou `H = γL` (laplaciana), evolução
`|ψ(t)⟩ = exp(−iHt)|ψ(0)⟩` por **expansão de Chebyshev com produto
matriz–vetor esparso**.

Dois modos de uso:

1. **Laboratório interativo** — construir ou gerar a rede, mexer nos
   parâmetros, ver a dinâmica e os observáveis em tempo quase real, na máquina
   do usuário.
2. **Exportador** — para redes grandes ou varreduras longas, emite código
   autocontido que roda a mesma simulação em outro lugar, e depois reimporta os
   resultados. O **C++** carrega o núcleo amalgamado e reproduz os números
   **bit a bit** — é o mesmo texto, outro compilador. O pacote **Wolfram** é
   outra coisa: um programa autônomo que propaga por decomposição espectral, e
   não por Chebyshev, justamente para que a concordância entre os dois seja
   evidência em vez de tautologia. Ele concorda com o núcleo em ~1e-14 na
   amplitude, e o protocolo dessa verificação está em CONVENTIONS.md 12.1.

A aplicação de interesse imediato é uma rede modular inspirada na organização
estrutural dos microtúbulos, mas **o motor é geral para qualquer grafo**: a
física de microtúbulo entra apenas como um dos geradores, nunca no núcleo.

Leia [CONVENTIONS.md](CONVENTIONS.md) antes de mexer no código. Ele manda.
O estado de cada etapa está em [ROADMAP.md](ROADMAP.md).

## Estado

**As seis etapas completas.** Núcleo em C, geradores, métricas, WebAssembly com Web
Worker, interface na identidade visual do projeto, `spec.json` como moeda
comum, os três exportadores, varredura, reimportação com procedência
obrigatória, quatro línguas e tutorial. Os testes 6 e 7 fecham com **identidade
bit a bit** entre navegador, binário nativo e `.cpp` exportado.

A aparência segue `identity/`: Azul Egeu para o que é calculado localmente,
Bronze para o que passou pelo ciclo de exportação. A distinção é funcional.

## Construir e testar

Não precisa de nada além de um compilador C e do Node (só para gerar o hash do
núcleo e amalgamar).

```sh
npm install                # front-end (só para as etapas 4 em diante)
make -C native test        # testes de aceitação
make -C native bench       # metas de desempenho
make -C native cxx-check   # o núcleo compila limpo em C99 e em C++17
make -C native asan        # ASan + UBSan
make -C native tsan        # ThreadSanitizer
make -C native mutants     # arnês de mutação

source ~/emsdk/emsdk_env.sh
make -C native wasm-test   # a suíte inteira sob WebAssembly
make -C native test6       # WASM contra nativo

npm run dev                # laboratório em http://localhost:5173
npm test                   # fixtures da interface
npm run fumaca             # o aplicativo abre, propaga e desenha
npm run teste7             # navegador × .cpp exportado, varrendo α
```

## Estrutura

```
core/        o núcleo. UM lugar só. Compila para WASM, para nativo e, por
             concatenação (tools/amalgamate.mjs), para o .cpp exportado.
native/      binário de teste, benchmarks e os testes de aceitação
tools/       hash do núcleo e amalgamador
wasm/        ponte emscripten e camada JS sem cópia
templates/   os "mains" dos exportadores C++/WL/Python (etapa 5)
src/nucleo/  mapeamento sítio↔texel, paleta, worker, assinatura
src/gl/      heatmap WebGL2
src/ui/      editor, séries temporais, diagnóstico permanente
specs/       spec.json de exemplo
identity/    identidade visual: marca, cores, mapas de cor, mockup
```

## Distribuição

Repositório privado; código-fonte não distribuído. O programa compilado é
publicado de graça, sem cadastro e sem instalação, como site estático — mesmo
modelo do Tessera e do PATHS. Nenhum dado do usuário sai da máquina dele.
Ver [LICENSE](LICENSE) e [NOTICE](NOTICE).
