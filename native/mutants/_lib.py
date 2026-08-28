"""Utilitário comum dos mutantes: troca exigindo que o padrão exista."""
import sys, os

CORE = os.path.join(os.path.dirname(__file__), '..', '..', 'core')

def troca(arquivo, antigo, novo):
    caminho = os.path.join(CORE, arquivo)
    with open(caminho) as f:
        texto = f.read()
    if antigo not in texto:
        sys.exit(f"OBSOLETO: padrao nao encontrado em {arquivo}")
    with open(caminho, 'w') as f:
        f.write(texto.replace(antigo, novo, 1))
