import { TargetWordMapping } from "../../../Pages/WingoConfig";

const Words4: TargetWordMapping[] = [
  { word: "aahs", canBeTargetWord: true },
  { word: "aals", canBeTargetWord: true },
  { word: "aani", canBeTargetWord: true },
  { word: "aaru", canBeTargetWord: true },
  { word: "abac", canBeTargetWord: true },
  { word: "abay", canBeTargetWord: true },
  { word: "abas", canBeTargetWord: true },
  { word: "abba", canBeTargetWord: true },
  // Temporarily moved; copy from WordArrays folder at root of repo if needed
];

export const guessableWords4: string[] = Words4.map((x) => x.word);
export const targetWords4: string[] = Words4.filter((x) => x.canBeTargetWord).map((x) => x.word);
