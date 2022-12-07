import { TargetWordMapping } from "../../../Pages/WingoConfig";

const Words10: TargetWordMapping[] = [
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

export const guessableWords10: string[] = Words10.map((x) => x.word);
export const targetWords10: string[] = Words10.filter((x) => x.canBeTargetWord).map((x) => x.word);
