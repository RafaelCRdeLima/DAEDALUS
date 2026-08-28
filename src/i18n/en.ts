import type { Catalog } from './types.ts';

export const en: Catalog = {
  modo_local: () => 'Laboratory · local',
  modo_reimportado: () => 'Re-imported',

  sec_gerador: () => 'Generator',
  sec_hamiltoniano: () => 'Hamiltonian',
  sec_sitios: () => 'Sites',
  sec_exportar: () => 'Export',
  sec_varredura: () => 'Sweep',
  sec_reimportar: () => 'Re-import',

  ger_microtubule: () => 'microtubule',
  ger_sbm: () => 'stochastic block model',
  ger_path: () => 'path',
  ger_cycle: () => 'cycle',
  ger_grid2d: () => '2D grid',
  ger_hypercube: () => 'hypercube',
  ger_complete: () => 'complete',

  c_npar: () => 'N∥',
  c_nperp: () => 'N⊥',
  c_costura: () => 'seam',
  c_fechar: () => 'close the ends',
  c_acoplamento: () => 'j∥ / j⊥',
  c_modulos: () => 'modules',
  c_n: () => 'N',
  c_pinpout: () => 'p_in / p_out',
  c_religacao: () => 'rewiring p',
  c_religar_fixo: () => 'rewire, keeping |E| fixed',
  c_semente: () => 'seed',
  c_gamma: () => 'γ',
  c_normalizacao: () => '‖H‖ normalisation',
  c_tfinal: () => 'final t',
  c_pontos: () => 'time points',
  c_realizacoes: () => 'realisations',
  c_passos: () => 'steps in p',

  ham_adjacency: () => 'Adjacency',
  ham_laplacian: () => 'Laplacian',
  norm_spectral: () => 'spectral radius',
  norm_mean_degree: () => 'mean degree',
  norm_none: () => 'none',

  a_gerar: () => 'build network',
  a_propagar: () => 'propagate',
  a_propagando: () => 'propagating…',
  a_parar: () => 'stop',
  a_escala_fixa: () => 'fixed scale',
  a_varrer: () => 'sweep',
  a_csv: () => 'results as CSV',
  a_abrir_csv: () => 'open CSV from the cluster',
  a_limpar_alvo: () => 'clear target',

  s_inicial: (p) => `initial ${p['j']}`,
  s_alvo: (p) => `target ${p['j']}`,
  s_dica: () => 'Click the map to set the site selected above.',

  av_acrescentar: () =>
    'Adding edges raises |E| and improves transport trivially: the result then '
    + 'measures the number of edges, not the topology.',
  av_sem_normalizar: () =>
    'Without normalising, "more coherence" may be nothing but "larger hopping" '
    + 'when comparing different topologies.',
  av_nao_lattice: () =>
    'This graph has no unrolled lattice: the map shows sites in index order, '
    + 'wrapped into rows. It is not the graph layout.',
  av_exportar: () =>
    'The C++ is self-contained and rebuilds the network from spec.json. Wolfram '
    + 'and Python receive the edge list and act as an oracle for the propagator.',
  av_sem_procedencia: () =>
    'This CSV has no provenance header (#! spec and #! core_hash). There is no '
    + 'way to tell which simulation it describes, so it will not be plotted.',
  av_hash_diferente: (p) =>
    `This result came from core ${p['arquivo']}; the running core is `
    + `${p['atual']}. The numbers remain valid, but this binary cannot reproduce `
    + 'them — to reproduce, use that version of the core.',
  av_spec_invalido: (p) => `The spec.json embedded in the CSV fails the parser: ${p['erro']}`,
  av_reimportado: (p) => `${p['arquivo']} · ${p['linhas']} steps`,
  av_scrub_grande: () => 'large network: live only, no scrubbing back',

  r_norma: () => 'Σ|ψ|²',
  r_vertices: (p) => `${p['n']} vertices`,
  r_arestas: (p) => `${p['m']} edges`,
  r_grau: () => '⟨d⟩',
  r_lambda2_alto: () => 'not converged · upper bound',
  r_componentes: (p) => `${p['k']} components`,
  r_duplicadas: (p) => `${p['k']} duplicates dropped`,
  r_religacoes: (p) => `${p['k']} rewirings with no free target`,

  f_iniciando: () => 'starting',
  f_gerando: () => 'building network',
  f_pronta: () => 'network ready',
  f_propagando: () => 'propagating',
  f_pronto: () => 'done',
  f_cancelado: () => 'cancelled',
  f_erro: () => 'error',
  f_varrendo: (p) => `sweeping ${p['i']}/${p['n']}`,

  sec_vista: () => 'View',
  v_desenrolada: () => 'unrolled lattice',
  v_espectral: () => 'spectral layout',
  v_propria: () => 'generator geometry',
  v_espectral_dica: () => 'Eigenvectors 2 and 3 of the Laplacian as coordinates. For a modular network the modules separate in the plane.',
  v_sem_espectral: () => 'network too large for the spectral layout',
  v_sem_arestas: () => 'edges hidden above 2000 vertices',
  se_ipr: () => 'IPR',
  se_coerencia: () => 'ℓ₁ coherence',
  se_palvo: () => 'p at target',
  se_passo: () => 'step',
  v_eixo: () => 'p (rewired fraction)',
  v_media: () => 'p̄ at target (mean ± s.d.)',
  v_dica: () => 'Small sweeps run here. For long sweeps, export the C++ with realisations.',
};
