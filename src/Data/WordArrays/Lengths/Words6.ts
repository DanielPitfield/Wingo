const words_six = [
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

export const words_six_guessable = words_six.map((x) => x.word);
export const words_six_targets = words_six.filter((x) => x.canBeTargetWord).map((x) => x.word);
