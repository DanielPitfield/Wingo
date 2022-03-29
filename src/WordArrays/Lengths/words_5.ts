const words_five = [
  { word: "aahed", canBeTargetWord: true },
  { word: "aalii", canBeTargetWord: true },
  { word: "aargh", canBeTargetWord: true },
  { word: "aaron", canBeTargetWord: true },
  { word: "abaca", canBeTargetWord: true },
  { word: "abaci", canBeTargetWord: true },
  { word: "aback", canBeTargetWord: true },
  { word: "abada", canBeTargetWord: true },
  { word: "abaff", canBeTargetWord: true },
  // Temporarily moved; copy from WordArrays folder at root of repo if needed

];

export const words_five_guessable = words_five.map((x) => x.word);
export const words_five_targets = words_five.filter((x) => x.canBeTargetWord).map((x) => x.word);
