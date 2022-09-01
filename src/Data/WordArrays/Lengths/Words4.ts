const words_four = [
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

export const words_four_guessable = words_four.map((x) => x.word);
export const words_four_targets = words_four.filter((x) => x.canBeTargetWord).map((x) => x.word);
