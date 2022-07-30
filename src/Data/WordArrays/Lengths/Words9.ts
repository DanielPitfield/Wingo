const words_nine = [
  { word: "aardvarks", canBeTargetWord: true },
  { word: "aaronical", canBeTargetWord: true },
  { word: "aaronitic", canBeTargetWord: true },
  { word: "aasvogels", canBeTargetWord: true },
  { word: "abacinate", canBeTargetWord: true },
  { word: "abaciscus", canBeTargetWord: true },
  { word: "abactinal", canBeTargetWord: true },
  // Temporarily moved; copy from WordArrays folder at root of repo if needed
];

export const words_nine_guessable = words_nine.map((x) => x.word);
export const words_nine_targets = words_nine.filter((x) => x.canBeTargetWord).map((x) => x.word);
