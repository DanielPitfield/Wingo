const Words3 = [
  { word: "aaa", canBeTargetWord: true },
  { word: "aah", canBeTargetWord: true },
  { word: "aal", canBeTargetWord: true },
  { word: "aam", canBeTargetWord: true },
  { word: "aas", canBeTargetWord: true },
  { word: "aba", canBeTargetWord: true },
  // Temporarily moved; copy from WordArrays folder at root of repo if needed
];

export const guessableWords3 = Words3.map((x) => x.word);
export const targetWords3 = Words3.filter((x) => x.canBeTargetWord).map((x) => x.word);
