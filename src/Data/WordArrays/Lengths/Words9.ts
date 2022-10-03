const Words9 = [
  { word: "aardvarks", canBeTargetWord: true },
  { word: "aaronical", canBeTargetWord: true },
  { word: "aaronitic", canBeTargetWord: true },
  { word: "aasvogels", canBeTargetWord: true },
  { word: "abacinate", canBeTargetWord: true },
  { word: "abaciscus", canBeTargetWord: true },
  { word: "abactinal", canBeTargetWord: true },
  // Temporarily moved; copy from WordArrays folder at root of repo if needed
];

export const guessableWords9 = Words9.map((x) => x.word);
export const targetWords9 = Words9.filter((x) => x.canBeTargetWord).map((x) => x.word);
