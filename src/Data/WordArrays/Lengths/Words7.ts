const words_seven = [
  { word: "aaronic", canBeTargetWord: true },
  { word: "aarrghh", canBeTargetWord: true },
  { word: "ababdeh", canBeTargetWord: true },
  { word: "abacate", canBeTargetWord: true },
  { word: "abacaxi", canBeTargetWord: true },
  { word: "abacist", canBeTargetWord: true },
  { word: "abactor", canBeTargetWord: true },
  { word: "abaculi", canBeTargetWord: true },
  { word: "abaddon", canBeTargetWord: true },
  { word: "abadejo", canBeTargetWord: true },
  // Temporarily moved; copy from WordArrays folder at root of repo if needed
];

export const words_seven_guessable = words_seven.map((x) => x.word);
export const words_seven_targets = words_seven.filter((x) => x.canBeTargetWord).map((x) => x.word);
