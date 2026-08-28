import type { Catalog } from './types.ts';

export const it: Catalog = {
  modo_local: () => 'Laboratorio · locale',
  modo_reimportado: () => 'Reimportato',

  sec_gerador: () => 'Generatore',
  sec_hamiltoniano: () => 'Hamiltoniana',
  sec_tempo: () => 'Tempo',
  sec_sitios: () => 'Siti',
  sec_exportar: () => 'Esporta',
  sec_varredura: () => 'Scansione',
  sec_reimportar: () => 'Reimporta',

  ger_microtubule: () => 'microtubulo',
  ger_sbm: () => 'modello a blocchi stocastici',
  ger_path: () => 'catena',
  ger_cycle: () => 'ciclo',
  ger_grid2d: () => 'griglia 2D',
  ger_hypercube: () => 'ipercubo',
  ger_complete: () => 'completo',

  c_npar: () => 'N∥',
  c_nperp: () => 'N⊥',
  c_costura: () => 'cucitura',
  c_fechar: () => 'chiudere le estremità',
  c_acoplamento: () => 'j∥ / j⊥',
  c_modulos: () => 'moduli',
  c_n: () => 'N',
  c_pinpout: () => 'p_in / p_out',
  c_religacao: () => 'ricablaggio p',
  c_religar_fixo: () => 'ricablare mantenendo |E| fisso',
  c_semente: () => 'seme',
  c_gamma: () => 'γ',
  c_normalizacao: () => 'normalizzazione di ‖H‖',
  c_tfinal: () => 't finale',
  c_pontos: () => 'punti nel tempo',
  c_realizacoes: () => 'realizzazioni',
  c_passos: () => 'passi in p',

  c_passo_quadro: () => 'passo della mappa',
  q_quadros: (p) => `${p['k']} fotogrammi · ${p['mb']} MB`,
  q_incompleto: (p) => `animazione ferma a ${p['tem']} di ${p['esperado']} fotogrammi`,
  ham_adjacency: () => 'Adiacenza',
  ham_laplacian: () => 'Laplaciano',
  norm_spectral: () => 'raggio spettrale',
  norm_mean_degree: () => 'grado medio',
  norm_none: () => 'nessuna',

  a_gerar: () => 'costruisci la rete',
  a_propagar: () => 'propaga',
  a_propagando: () => 'propagazione…',
  a_parar: () => 'ferma',
  a_escala_fixa: () => 'scala fissa',
  a_varrer: () => 'scansiona',
  a_csv: () => 'risultati in CSV',
  a_abrir_csv: () => 'apri un CSV dal cluster',
  a_limpar_alvo: () => 'azzera il bersaglio',

  s_inicial: (p) => `iniziale ${p['j']}`,
  s_alvo: (p) => `bersaglio ${p['j']}`,
  s_dica: () => 'Clicca sulla mappa per fissare il sito selezionato qui sopra.',

  av_acrescentar: () =>
    'Aggiungere archi aumenta |E| e migliora il trasporto in modo banale: il '
    + 'risultato misura allora il numero di archi, non la topologia.',
  av_sem_normalizar: () =>
    'Senza normalizzare, "più coerenza" può essere soltanto "hopping più grande" '
    + 'quando si confrontano topologie diverse.',
  av_nao_lattice: () =>
    'Questo grafo non ha un reticolo srotolato: la mappa mostra i siti in ordine '
    + 'di indice, ripiegati in righe. Non è la geometria del grafo.',
  av_exportar: () =>
    'Il C++ è autonomo e ricostruisce la rete dal spec.json. Wolfram e Python '
    + "ricevono la lista degli archi e fanno da oracolo del propagatore.",
  av_sem_procedencia: () =>
    'Questo CSV non ha intestazione di provenienza (#! spec e #! core_hash). Non '
    + 'si può sapere quale simulazione descriva, quindi non verrà tracciato.',
  av_hash_diferente: (p) =>
    `Questo risultato viene dal nucleo ${p['arquivo']}; qui gira il ${p['atual']}. `
    + 'I numeri restano validi, ma questo binario non può riprodurli — per farlo, '
    + 'usa quella versione del nucleo.',
  av_spec_invalido: (p) => `Il spec.json incorporato nel CSV non supera il parser: ${p['erro']}`,
  av_reimportado: (p) => `${p['arquivo']} · ${p['linhas']} passi`,
  av_scrub_grande: () => 'rete grande: solo dal vivo, senza tornare indietro',

  r_norma: () => 'Σ|ψ|²',
  r_vertices: (p) => `${p['n']} vertici`,
  r_arestas: (p) => `${p['m']} archi`,
  r_grau: () => '⟨d⟩',
  r_lambda2_alto: () => 'non convergito · limite superiore',
  r_componentes: (p) => `${p['k']} componenti`,
  r_duplicadas: (p) => `${p['k']} duplicati scartati`,
  r_religacoes: (p) => `${p['k']} ricablaggi senza bersaglio libero`,

  f_iniciando: () => 'avvio',
  f_gerando: () => 'costruzione della rete',
  f_pronta: () => 'rete pronta',
  f_propagando: () => 'propagazione',
  f_pronto: () => 'fatto',
  f_cancelado: () => 'annullato',
  f_erro: () => 'errore',
  f_varrendo: (p) => `scansione ${p['i']}/${p['n']}`,

  sec_vista: () => 'Vista',
  v_desenrolada: () => 'reticolo srotolato',
  v_espectral: () => 'disposizione spettrale',
  v_propria: () => 'geometria del generatore',
  v_espectral_dica: () => 'Autovettori 2 e 3 della laplaciana come coordinate. Per una rete modulare i moduli si separano nel piano.',
  v_sem_espectral: () => 'rete troppo grande per la disposizione spettrale',
  v_sem_arestas: () => 'archi nascosti oltre 2000 vertici',
  se_ipr: () => 'IPR',
  se_coerencia: () => 'coerenza ℓ₁',
  se_palvo: () => 'p al bersaglio',
  se_passo: () => 'passo',
  v_eixo: () => 'p (frazione ricablata)',
  v_media: () => 'p̄ al bersaglio (media ± dev. std.)',
  v_dica: () => 'Le scansioni piccole girano qui. Per quelle lunghe, esporta il C++ con realizzazioni.',
};
