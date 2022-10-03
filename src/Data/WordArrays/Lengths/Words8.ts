const Words8 = [
  { word: "aardvark", canBeTargetWord: true },
  { word: "aardwolf", canBeTargetWord: true },
  { word: "aaronite", canBeTargetWord: true },
  { word: "aasvogel", canBeTargetWord: true },
  { word: "abacisci", canBeTargetWord: true },
  { word: "abaction", canBeTargetWord: true },
  { word: "abaculus", canBeTargetWord: true },
  { word: "abacuses", canBeTargetWord: true },
  { word: "abadengo", canBeTargetWord: true },
  // Temporarily moved; copy from WordArrays folder at root of repo if needed
];

export const guessableWords8 = Words8.map((x) => x.word);
export const targetWords8 = Words8.filter((x) => x.canBeTargetWord).map((x) => x.word);
