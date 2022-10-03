const Words4 = [
  { word: "aahs", canBeTargetWord: true },
  { word: "aals", canBeTargetWord: true },
  { word: "aani", canBeTargetWord: true },
  { word: "aaru", canBeTargetWord: true },
  { word: "abac", canBeTargetWord: true },
  { word: "abay", canBeTargetWord: true },
  { word: "abas", canBeTargetWord: true },
  { word: "abba", canBeTargetWord: true },
  // Temporarily moved; copy from WordArrays folder at root of repo if needed
];

export const guessableWords4 = Words4.map((x) => x.word);
export const targetWords4 = Words4.filter((x) => x.canBeTargetWord).map((x) => x.word);
