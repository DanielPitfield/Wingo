const words_eight = [
  { word: "aardvark", canBeTargetWord: true },
  { word: "aardwolf", canBeTargetWord: true },
  { word: "aaronite", canBeTargetWord: true },
  { word: "aasvogel", canBeTargetWord: true },
  { word: "abacisci", canBeTargetWord: true },
  { word: "abaction", canBeTargetWord: true },
  { word: "abaculus", canBeTargetWord: true },
  { word: "abacuses", canBeTargetWord: true },
  { word: "abadengo", canBeTargetWord: true },
    // Temporarily moved; copy from WordArrays folder at root of repo if needed

];

export const words_eight_guessable = words_eight.map((x) => x.word);
export const words_eight_targets = words_eight.filter((x) => x.canBeTargetWord).map((x) => x.word);
