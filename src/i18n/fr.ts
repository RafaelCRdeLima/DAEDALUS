import type { Catalog } from './types.ts';

export const fr: Catalog = {
  modo_local: () => 'Laboratoire · local',
  modo_reimportado: () => 'Réimporté',

  sec_gerador: () => 'Générateur',
  sec_hamiltoniano: () => 'Hamiltonien',
  sec_tempo: () => 'Temps',
  sec_sitios: () => 'Sites',
  sec_exportar: () => 'Exporter',
  sec_varredura: () => 'Balayage',
  sec_reimportar: () => 'Réimporter',

  ger_microtubule: () => 'microtubule',
  ger_sbm: () => 'modèle à blocs stochastiques',
  ger_path: () => 'chaîne',
  ger_cycle: () => 'cycle',
  ger_grid2d: () => 'grille 2D',
  ger_hypercube: () => 'hypercube',
  ger_complete: () => 'complet',

  c_npar: () => 'N∥',
  c_nperp: () => 'N⊥',
  c_costura: () => 'couture',
  c_fechar: () => 'fermer les extrémités',
  c_acoplamento: () => 'j∥ / j⊥',
  c_modulos: () => 'modules',
  c_n: () => 'N',
  c_pinpout: () => 'p_in / p_out',
  c_religacao: () => 'recâblage p',
  c_religar_fixo: () => 'recâbler en gardant |E| fixe',
  c_semente: () => 'graine',
  c_gamma: () => 'γ',
  c_normalizacao: () => 'normalisation de ‖H‖',
  c_tfinal: () => 't final',
  c_pontos: () => 'points en temps',
  c_realizacoes: () => 'réalisations',
  c_passos: () => 'pas en p',

  c_passo_quadro: () => 'pas de la carte',
  q_quadros: (p) => `${p['k']} images · ${p['mb']} Mo`,
  q_incompleto: (p) => `animation arrêtée à ${p['tem']} sur ${p['esperado']} images`,
  ham_adjacency: () => 'Adjacence',
  ham_laplacian: () => 'Laplacien',
  norm_spectral: () => 'rayon spectral',
  norm_mean_degree: () => 'degré moyen',
  norm_none: () => 'aucune',

  a_gerar: () => 'construire le réseau',
  a_propagar: () => 'propager',
  a_propagando: () => 'propagation…',
  a_parar: () => 'arrêter',
  a_escala_fixa: () => 'échelle fixe',
  a_varrer: () => 'balayer',
  a_csv: () => 'résultats en CSV',
  a_abrir_csv: () => 'ouvrir un CSV du cluster',
  a_limpar_alvo: () => 'effacer la cible',

  s_inicial: (p) => `initial ${p['j']}`,
  s_alvo: (p) => `cible ${p['j']}`,
  s_dica: () => 'Cliquez sur la carte pour marquer le site sélectionné ci-dessus.',

  av_acrescentar: () =>
    'Ajouter des arêtes augmente |E| et améliore le transport trivialement : le '
    + "résultat mesure alors le nombre d'arêtes, non la topologie.",
  av_sem_normalizar: () =>
    'Sans normalisation, « plus de cohérence » peut n\'être que « saut plus '
    + 'grand » lorsqu\'on compare des topologies différentes.',
  av_nao_lattice: () =>
    "Ce graphe n'a pas de réseau déroulé : la carte montre les sites dans "
    + "l'ordre des indices, repliés en lignes. Ce n'est pas la géométrie du graphe.",
  av_exportar: () =>
    'Le C++ est autonome et reconstruit le réseau à partir du spec.json. Wolfram '
    + 'et Python reçoivent la liste des arêtes et servent d\'oracle du propagateur.',
  av_sem_procedencia: () =>
    "Ce CSV n'a pas d'en-tête de provenance (#! spec et #! core_hash). Impossible "
    + 'de savoir quelle simulation il décrit ; il ne sera donc pas tracé.',
  av_hash_diferente: (p) =>
    `Ce résultat vient du noyau ${p['arquivo']} ; ici tourne le ${p['atual']}. `
    + 'Les nombres restent valides, mais ce binaire ne peut pas les reproduire — '
    + 'pour cela, utilisez cette version du noyau.',
  av_spec_invalido: (p) => `Le spec.json intégré au CSV échoue à l'analyse : ${p['erro']}`,
  av_reimportado: (p) => `${p['arquivo']} · ${p['linhas']} pas`,
  av_scrub_grande: () => 'grand réseau : en direct seulement, sans retour en arrière',

  r_norma: () => 'Σ|ψ|²',
  r_vertices: (p) => `${p['n']} sommets`,
  r_arestas: (p) => `${p['m']} arêtes`,
  r_grau: () => '⟨d⟩',
  r_lambda2_alto: () => 'non convergé · borne supérieure',
  r_componentes: (p) => `${p['k']} composantes`,
  r_duplicadas: (p) => `${p['k']} doublons écartés`,
  r_religacoes: (p) => `${p['k']} recâblages sans cible libre`,

  f_iniciando: () => 'démarrage',
  f_gerando: () => 'construction du réseau',
  f_pronta: () => 'réseau prêt',
  f_propagando: () => 'propagation',
  f_pronto: () => 'terminé',
  f_cancelado: () => 'annulé',
  f_erro: () => 'erreur',
  f_varrendo: (p) => `balayage ${p['i']}/${p['n']}`,

  sec_vista: () => 'Vue',
  v_desenrolada: () => 'réseau déroulé',
  v_espectral: () => 'disposition spectrale',
  v_propria: () => 'géométrie du générateur',
  v_espectral_dica: () => 'Vecteurs propres 2 et 3 du laplacien comme coordonnées. Pour un réseau modulaire, les modules se séparent dans le plan.',
  v_sem_espectral: () => 'réseau trop grand pour la disposition spectrale',
  v_sem_arestas: () => 'arêtes masquées au-delà de 2000 sommets',
  se_ipr: () => 'IPR',
  se_coerencia: () => 'cohérence ℓ₁',
  se_palvo: () => 'p à la cible',
  se_passo: () => 'pas',
  v_eixo: () => 'p (fraction recâblée)',
  v_media: () => 'p̄ à la cible (moyenne ± écart-type)',
  v_dica: () => 'Les petits balayages tournent ici. Pour les longs, exportez le C++ avec réalisations.',
};
