(*__DAE_BANNER__*)

(* ---------------------------------------------------------------------------
   ORACULO DE VERIFICACAO, nao producao.

   Este arquivo NAO gera o grafo: ele RECEBE a lista de arestas que o nucleo do
   Daedalus gerou. Reimplementar o gerador em Wolfram criaria uma segunda
   implementacao do que a amalgamacao existe para manter unica — e um oraculo
   que reproduz o mesmo engano do gerador nao e oraculo.

   Em compensacao, o alcance dele e limitado e vale dizer em voz alta: ele
   valida o PROPAGADOR e a grade de tempo por diagonalizacao exata. Ele nao
   valida o EMISSOR: um parametro trocado ao serializar produziria um .wl
   internamente consistente resolvendo o problema errado. Quem valida o emissor
   e o .cpp exportado, que regenera tudo a partir do spec.json, e a impressao
   digital do grafo que o teste 7 compara primeiro.

   Roda em segundos para N <~ 2000. Acima disso, use o .cpp.

   Uso:  wolframscript -file __ARQUIVO__ > saida.csv
   --------------------------------------------------------------------------- *)

n         = (*__DAE_N__*);
arestas   = (*__DAE_ARESTAS__*);   (* {{i, j, w}, ...} com i, j em 1..n *)
tipo      = "(*__DAE_HAM__*)";      (* "adjacency" ou "laplacian" *)
gamma     = (*__DAE_GAMMA__*);
escala    = (*__DAE_ESCALA__*);     (* medida pelo nucleo: nao reimplementamos *)
sitio     = (*__DAE_SITIO__*);      (* 1-indexado *)
alvo      = (*__DAE_ALVO__*);       (* 0 = sem alvo *)
t1        = (*__DAE_T1__*);
nt        = (*__DAE_NT__*);
modulos   = (*__DAE_MODULOS__*);    (* modulo de cada sitio, 1-indexado *)
nmod      = (*__DAE_NMOD__*);

regras = Flatten[{{#[[1]], #[[2]]} -> #[[3]], {#[[2]], #[[1]]} -> #[[3]]} & /@ arestas, 1];
A = SparseArray[regras, {n, n}];
grau = Total[A, {2}];
H0 = If[tipo === "adjacency", -A, DiagonalMatrix[SparseArray[grau]] - A];
H = N[gamma H0 / escala];

(* Diagonalizacao exata: e este o ponto do oraculo. *)
{vals, vecs} = Eigensystem[Normal[H]];
vecs = Normalize /@ vecs;

psi0 = Normal[SparseArray[{sitio -> 1.0}, n]];
coef = vecs . psi0;
V = Transpose[vecs];

dt = t1/nt;
Print["#! oracle wolfram"];
Print["#! core_hash (*__DAE_HASH__*)"];
Print["#! n ", n];
Print["#! nmod ", nmod];
Print["#! dt ", CForm[N[dt, 17]]];
Print["#! spec (*__DAE_SPEC_LINHA__*)"];

num[x_] := StringReplace[ToString[CForm[N[x, 17]]], {"`" -> "", "*^" -> "e"}];

Print["t,norm,ipr,coh_l1,p_target" <>
      StringJoin[Table[",pmod" <> ToString[m - 1], {m, nmod}]]];

Do[
  Module[{t = s dt, psi, p, linha},
    psi = V . (Exp[-I vals t] coef);
    p = Abs[psi]^2;
    linha = {num[Total[p]], num[Total[p^2]], num[Total[Abs[psi]]^2 - 1],
             If[alvo > 0, num[p[[alvo]]], "nan"]};
    Print[num[t] <> "," <> StringRiffle[linha, ","] <> "," <>
          StringRiffle[Table[num[Total[p[[Flatten[Position[modulos, m]]]]]], {m, nmod}], ","]];
  ], {s, 1, nt}];

Module[{psi = V . (Exp[-I vals t1] coef)},
  Print[""];
  Print["# estado final"];
  Print["j,re,im"];
  Do[Print[j - 1, ",", num[Re[psi[[j]]]], ",", num[Im[psi[[j]]]]], {j, n}];
];
