# native/mutants — documento executável

Comentário não roda na CI. Este diretório roda.

Cada `m*.py` introduz **um** defeito deliberado no núcleo e declara qual teste
deveria morder. `make -C native mutants` aplica um por vez, reconstrói, roda a
suíte inteira e imprime quem mordeu.

Serve para duas coisas:

1. **Provar que a suíte testa em vez de decorar.** Um teste que passa com o
   código quebrado não é teste.
2. **Registrar as cegueiras conhecidas.** Onde o projeto tem defesas
   redundantes de propósito — as deflações de `dae_fiedler` são o caso — a
   remoção de uma só não muda resultado nenhum. Em vez de esconder isso num
   comentário de cabeçalho, o mutante fica aqui com `esperado: CEGO`, e a
   tabela mostra a cegueira toda vez que alguém rodar.

Se um mutante imprimir **OBSOLETO**, o padrão que ele procura sumiu do código:
alguém refatorou e o mutante precisa ser reescrito ou aposentado. Isso é sinal,
não ruído — é o mecanismo que impede o arnês de apodrecer em silêncio.
