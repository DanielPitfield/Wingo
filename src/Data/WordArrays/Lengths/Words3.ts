import { TargetWordMapping } from "../../../Pages/WingoConfig";

const Words3: TargetWordMapping[] = [
  { word: "aaa", canBeTargetWord: true },
  { word: "aah", canBeTargetWord: true },
  { word: "aal", canBeTargetWord: true },
  { word: "aam", canBeTargetWord: true },
  { word: "aas", canBeTargetWord: true },
  { word: "aba", canBeTargetWord: true },
  // Temporarily moved; copy from WordArrays folder at root of repo if needed
];

export const guessableWords3: string[] = Words3.map((x) => x.word);
export const targetWords3: string[] = Words3.filter((x) => x.canBeTargetWord).map((x) => x.word);
