const words_ten = [
  { word: "aardwolves", canBeTargetWord: true },
  { word: "abacterial", canBeTargetWord: true },
  { word: "abalienate", canBeTargetWord: true },
  { word: "abandoners", canBeTargetWord: true },
  { word: "abandoning", canBeTargetWord: true },
  { word: "abannition", canBeTargetWord: true },
  { word: "abaptiston", canBeTargetWord: true },
  { word: "abaptistum", canBeTargetWord: true },
  { word: "abasedness", canBeTargetWord: true },
  // Temporarily moved; copy from WordArrays folder at root of repo if needed
];

export const words_ten_guessable = words_ten.map((x) => x.word);
export const words_ten_targets = words_ten.filter((x) => x.canBeTargetWord).map((x) => x.word);
