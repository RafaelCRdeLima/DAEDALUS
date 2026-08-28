(* Mapas de cor do Daedalus para Mathematica *)
daedalusProb = Blend[{RGBColor["#F3EFE5"], RGBColor["#E8D5A6"], RGBColor["#E5A83F"],
   RGBColor["#CE7A2C"], RGBColor["#A8452C"], RGBColor["#5E2438"], RGBColor["#101A24"]}, #] &;

daedalusProbDark = Blend[{RGBColor["#101A24"], RGBColor["#1C3A56"], RGBColor["#17557C"],
   RGBColor["#3F7C74"], RGBColor["#9C9A3E"], RGBColor["#E5A83F"], RGBColor["#FCE9C0"]}, #] &;

(* Ciclico: argumento em [0, 2 Pi) *)
daedalusPhase = Blend[{RGBColor["#17557C"], RGBColor["#2F7D6A"], RGBColor["#7E9A3C"],
   RGBColor["#D2A03A"], RGBColor["#C0632B"], RGBColor["#A8452C"], RGBColor["#7C3C68"],
   RGBColor["#45408F"], RGBColor["#17557C"]}, Mod[#, 2 Pi]/(2 Pi)] &;
