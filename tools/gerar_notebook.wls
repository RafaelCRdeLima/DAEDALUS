(* gerar_notebook.wls — regera templates/wolfram/DaedalusDemo.nb.

   O caderno é artefato VERSIONADO: a CI não tem Mathematica e não pode
   regerá-lo. Este script existe para que ele seja reproduzível, não para rodar
   automaticamente.

   ATENÇÃO À CODIFICAÇÃO. wolframscript lê o arquivo de script como Latin-1, não
   como UTF-8, e este arquivo tem acentos. Rodar direto produz mojibake — e
   mojibake não quebra nada: gera um caderno de aparência normal com "é" virado
   em "Ã©", que é o pior modo de falhar. Por isso:

     python3 -c 'import re,sys; s=open(sys.argv[1],encoding="utf-8").read(); \
       sys.stdout.write(re.sub(r"[^\x00-\x7f]", \
         lambda m: "\\:%04x" % ord(m.group()), s))' \
       tools/gerar_notebook.wls > /tmp/gerar_ascii.wls
     wolframscript -file /tmp/gerar_ascii.wls

   A guarda abaixo torna o erro impossível de ignorar. *)

If[StringLength["é"] =!= 1,
  Print["ERRO: este script foi lido com a codificacao errada (", StringLength["é"],
        " caracteres onde deveria haver 1)."];
  Print["      Passe pelo escape ASCII descrito no cabecalho antes de rodar."];
  Exit[1]];

sec[t_] := Cell[t, "Section"];
txt[t_] := Cell[t, "Text"];
inp[t_] := Cell[t, "Input"];

nb = Notebook[{

Cell["Daedalus — caminhadas quânticas em Wolfram Language", "Title"],

txt["Este caderno é o convite; o conteúdo está em Daedalus.wl, que é onde se mexe. Aqui cada \
seção mostra uma peça do pacote funcionando, na ordem em que se costuma precisar delas."],

txt["O pacote é AUTÔNOMO: gera a rede a partir dos parâmetros, propaga, calcula os observáveis \
e escreve o mesmo CSV do núcleo em C. Não há biblioteca compilada, não há LibraryLink, não há \
caixa-preta — o programa inteiro está à vista."],

txt["E ele não é uma tradução do núcleo. O núcleo propaga por expansão de Chebyshev; aqui a \
propagação é por decomposição espectral, e por Krylov quando N cresce. A diferença é deliberada: \
dois programas que rodam o mesmo algoritmo podem compartilhar o mesmo erro conceitual, e a \
concordância entre eles não provaria nada. É essa diferença que transforma \"os números batem\" \
em evidência."],

sec["1. Carregar o pacote"],
txt["Ajuste o diretório para onde está Daedalus.wl."],
inp["SetDirectory[NotebookDirectory[]];\nGet[\"Daedalus.wl\"]"],
inp["?Daedalus`*"],

sec["2. Um resultado inteiro, em uma linha"],
txt["DaedalusRodar faz tudo: rede, métricas, hamiltoniano, propagação e observáveis. Comece \
pelos padrões do núcleo e mude o que interessar."],
txt["Se este caderno veio exportado da interface, o arquivo daedalus_spec.json ao lado traz \
exatamente o spec que estava na tela. Sem ele, começa-se pelos padrões do núcleo."],
inp["espec = If[FileExistsQ[\"daedalus_spec.json\"],\n   DaedalusEspecLer[\"daedalus_spec.json\"], DaedalusEspecPadrao[]];\nespec[\"graph\"][\"params\"]"],
inp["r = DaedalusRodar[espec];\nKeys[r]"],
inp["{r[\"Rede\"][\"N\"], r[\"Rede\"][\"Digital\"]}\nr[\"Metricas\"]"],

sec["3. A rede vem dos parâmetros, não de uma lista de arestas"],
txt["Isto importa: uma lista pronta seria um dado, e um dado não se mexe. O gerador é código, e \
está em Daedalus.wl para ser alterado. seam_shift é o passo da costura do microtúbulo — muda a \
topologia sem mudar |V| nem |E|, que é exatamente o tipo de mudança invisível a qualquer \
conferência de tamanho."],
inp["rede = DaedalusRede[espec];\nMatrixPlot[Normal[rede[\"A\"]], FrameTicks -> None, PlotLabel -> \"adjacência\"]"],
txt["A impressão digital é FNV-1a de 64 bits sobre a estrutura CSR, os bits IEEE-754 dos pesos e \
a partição em módulos. É idêntica à do núcleo, e é a primeira coisa que a verificação compara: \
\"o gerador discordou\" e \"o propagador discordou\" se corrigem em lugares diferentes, e sem a \
digital as duas chegam como \"os números não batem\"."],
inp["Table[Module[{e = espec},\n   e[\"graph\"][\"params\"][\"seam_shift\"] = s;\n   {s, DaedalusRede[e][\"Digital\"]}], {s, 0, 3}] // TableForm"],

sec["4. Duas disciplinas metodológicas, ligadas por padrão"],
txt["conn_mode = \"rewire\" RELIGA mantendo |E| fixo, em vez de acrescentar arestas. Acrescentar \
mudaria a conectividade média junto com a desordem, e aí não se sabe qual das duas produziu o \
efeito observado."],
txt["normalization = \"spectral\" divide H pelo seu raio espectral, de modo que γt signifique a \
mesma coisa em redes diferentes. Sem isso, comparar dois grafos é comparar dois relógios que \
andam em ritmos diferentes."],
inp["Module[{e = espec},\n  e[\"graph\"][\"params\"][\"ws_p\"] = 0.2;\n  Table[e[\"graph\"][\"params\"][\"conn_mode\"] = m;\n    {m, DaedalusRede[e][\"CSR\"][\"NNZ\"]/2}, {m, {\"rewire\", \"add\"}}]] // TableForm"],

sec["5. O hamiltoniano"],
inp["ham = DaedalusHamiltoniano[rede, espec];\n{ham[\"Escala\"], ham[\"EscalaExata\"]}"],
txt["A escala aqui é o raio espectral EXATO. O núcleo usa poucos passos de Lanczos com margem, e \
obtém um valor maior que o verdadeiro. Os dois discordam por construção, e a verificação reporta \
a diferença em vez de exigir igualdade — impondo a escala do núcleo quando quer comparar o \
propagador sem que a diferença de norma contamine todas as colunas."],

sec["6. Propagar: dois métodos, e a comparação entre eles"],
inp["esp = DaedalusPropagar[ham, espec, Method -> \"Espectral\"];\nkry = DaedalusPropagar[ham, espec, Method -> \"Krylov\"];\nMax[Abs[Last[esp[\"Estados\"]] - Last[kry[\"Estados\"]]]]"],
txt["Espectral usa Eigensystem e soma exata sobre autovalores; Krylov usa MatrixExp[-I H dt, ψ], \
que aplica a exponencial ao vetor sem formar a matriz. O primeiro é legível, o segundo escala. \
Method -> Automatic escolhe pela ordem da matriz."],
txt["Não há Chebyshev aqui, de propósito."],

sec["7. Observáveis"],
inp["obs = DaedalusObservaveis[esp, rede, espec];\nKeys[obs]"],
inp["ListLinePlot[{Transpose[{esp[\"Tempos\"], obs[\"IPR\"]}],\n   Transpose[{esp[\"Tempos\"], obs[\"CoerenciaL1\"]/rede[\"N\"]}]},\n  PlotLegends -> {\"IPR\", \"coerência ℓ1 / N\"},\n  AxesLabel -> {\"γt\", None}, PlotRange -> All]"],
txt["Sem sítio-alvo, PAlvo é Missing[\"NotAvailable\"], nunca zero. Zero é valor fisicamente \
válido, e no gráfico seria plotado como se fosse dado."],
inp["ArrayPlot[Transpose[obs[\"Populacao\"]], ColorFunction -> \"SunsetColors\",\n  FrameLabel -> {\"passo\", \"sítio\"}, AspectRatio -> 1/2, Frame -> True]"],

sec["8. Concurrence por módulo"],
txt["A convenção é C_MM = s_M² − q_M na diagonal e C_MN = 2 s_M s_N fora dela, com \
s_M = Σ_{j∈M} |ψ_j| e q_M = Σ_{j∈M} |ψ_j|². A soma sobre M ≤ N reconstroi exatamente a coerência \
ℓ1, e essa identidade é conferida entre as companheiras da seção 11 — se ela não fecha, a \
decomposição por módulo não é decomposição de coisa nenhuma."],
inp["MatrixForm[Last[obs[\"ConcurrencePorModulo\"]]]"],

sec["9. Varredura na fração religada"],
txt["Média TEMPORAL de p_alvo, não valor final: o valor final oscila, e uma curva de valores \
finais mede a fase do relógio junto com a física."],
inp["v = DaedalusVarredura[espec, {0., 0.5, 6}, 3];\nListPlot[Transpose[{v[[All, \"p\"]], v[[All, \"Media\"]]}],\n  AxesLabel -> {\"p\", \"⟨p_alvo⟩_t\"}, PlotRange -> All, Joined -> True, Mesh -> All]"],

sec["10. Escrever o CSV e reimportar na interface"],
txt["O CSV sai no mesmo formato do núcleo, com o spec canônico e o core_hash no cabeçalho, e com \
a linha #! implementacao wolfram, que diz QUEM calculou — pergunta que o core_hash não responde. \
A interface exibe essa origem na reimportação: um resultado vindo daqui não deve se passar por um \
resultado do núcleo."],
inp["csv = DaedalusCSV[r[\"Espec\"], r[\"Rede\"], r[\"Metricas\"], r[\"Propagacao\"], r[\"Observaveis\"]];\nStringTake[csv, 600]"],
inp["DaedalusExportarCSV[\"saida_wolfram.csv\", r[\"Espec\"], r[\"Rede\"], r[\"Metricas\"],\n  r[\"Propagacao\"], r[\"Observaveis\"]]"],

sec["11. Verificação contra o núcleo, e a companheira que prova que ela pode falhar"],
txt["A verificação confere, nesta ordem: o fluxo do PRNG contra uma tabela de referência, a \
impressão digital do grafo (exigida idêntica, sem tolerância nenhuma), o contador de religações \
que falharam, e só então os observáveis."],
txt["A ordem é o diagnóstico. Se o PRNG divergir, nada abaixo faz sentido. Se a digital divergir, \
os dois construíram grafos diferentes e o propagador não está em questão. E o contador de \
religações falhas pega o caso que a digital não vê: em K_N toda tentativa de religação colide, o \
grafo sai idêntico, e só esse contador testemunha que os dois gastaram o mesmo fluxo de sorteios."],
txt["Os casos de referência ficam no repositório, em specs/oraculo. Se este caderno veio \
exportado, eles não vieram junto — são do projeto, não do seu resultado."],
inp["pastaRef = SelectFirst[{\"../../specs/oraculo\", \"specs/oraculo\"}, DirectoryQ, $Failed]"],
inp["rel = DaedalusVerificarReferencia[pastaRef];\nrel[\"Veredito\"]"],
inp["{rel[\"PiorAbsoluto\"], rel[\"PiorRelativo\"], rel[\"PiorAmplitude\"]}"],
txt["Esta verificação é MANUAL: a integração contínua do projeto não tem Mathematica. O ROADMAP.md \
registra quando foi rodada, com qual core_hash e com que resultado."],
txt["E rode sempre a companheira junto. Ela sabota o grafo, o fluxo de sorteios, os números e o \
próprio arquivo, e exige que cada sabotagem produza o veredito correspondente. Sem ela, \"todos os \
casos passaram\" e \"a verificação está quebrada e sempre verde\" são indistinguíveis pelo \
resultado."],
inp["DaedalusAntiVacuidade[pastaRef][\"Veredito\"]"],
inp["Dataset[DaedalusAntiVacuidade[pastaRef][\"Companheiras\"]]"]

}, WindowSize -> {1000, 800}, WindowMargins -> Automatic];

Export["/home/rafael/Codes/DAEDALUS/templates/wolfram/DaedalusDemo.nb", nb, "NB"];
Print["escrito ", FileByteCount["/home/rafael/Codes/DAEDALUS/templates/wolfram/DaedalusDemo.nb"], " bytes"];
