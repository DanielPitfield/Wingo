const Words6 = [
  { word: "aahing", canBeTargetWord: true },
  { word: "aaliis", canBeTargetWord: true },
  { word: "aarrgh", canBeTargetWord: true },
  { word: "ababua", canBeTargetWord: true },
  { word: "abacay", canBeTargetWord: true },
  { word: "abacas", canBeTargetWord: true },
  { word: "abacli", canBeTargetWord: true },
  { word: "abacot", canBeTargetWord: true },
  { word: "abacus", canBeTargetWord: true },
  // Temporarily moved; copy from WordArrays folder at root of repo if needed
];

export const guessableWords6 = Words6.map((x) => x.word);
export const targetWords6 = Words6.filter((x) => x.canBeTargetWord).map((x) => x.word);
