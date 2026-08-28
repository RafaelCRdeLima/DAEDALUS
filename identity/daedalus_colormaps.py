"""Mapas de cor do Daedalus para matplotlib."""
from matplotlib.colors import LinearSegmentedColormap

PROB_LIGHT = ["#F3EFE5", "#E8D5A6", "#E5A83F", "#CE7A2C", "#A8452C", "#5E2438", "#101A24"]
PROB_DARK  = ["#101A24", "#1C3A56", "#17557C", "#3F7C74", "#9C9A3E", "#E5A83F", "#FCE9C0"]
PHASE      = ["#17557C", "#2F7D6A", "#7E9A3C", "#D2A03A", "#C0632B",
              "#A8452C", "#7C3C68", "#45408F", "#17557C"]

daedalus_prob      = LinearSegmentedColormap.from_list("daedalus_prob", PROB_LIGHT)
daedalus_prob_dark = LinearSegmentedColormap.from_list("daedalus_prob_dark", PROB_DARK)
daedalus_phase     = LinearSegmentedColormap.from_list("daedalus_phase", PHASE)  # ciclico
