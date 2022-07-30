const words_three = [
  { word: "aaa", canBeTargetWord: true },
  { word: "aah", canBeTargetWord: true },
  { word: "aal", canBeTargetWord: true },
  { word: "aam", canBeTargetWord: true },
  { word: "aas", canBeTargetWord: true },
  { word: "aba", canBeTargetWord: true },
  // Temporarily moved; copy from WordArrays folder at root of repo if needed
];

export const words_three_guessable = words_three.map((x) => x.word);
export const words_three_targets = words_three.filter((x) => x.canBeTargetWord).map((x) => x.word);
