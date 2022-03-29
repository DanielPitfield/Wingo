const words_eleven = [
  { word: "abacination", canBeTargetWord: true },
  { word: "abactinally", canBeTargetWord: true },
  { word: "abalienated", canBeTargetWord: true },
  { word: "abandonable", canBeTargetWord: true },
  { word: "abandonedly", canBeTargetWord: true },
  { word: "abandonment", canBeTargetWord: true },
  { word: "abarthrosis", canBeTargetWord: true },
  // Temporarily moved; copy from WordArrays folder at root of repo if needed
];

export const words_eleven_guessable = words_eleven.map((x) => x.word);
export const words_eleven_targets = words_eleven.filter((x) => x.canBeTargetWord).map((x) => x.word);
