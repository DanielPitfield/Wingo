import { TargetWordMapping } from "../../../Pages/WingoConfig";

const Words11: TargetWordMapping[] = [
  { word: "abacination", canBeTargetWord: true },
  { word: "abactinally", canBeTargetWord: true },
  { word: "abalienated", canBeTargetWord: true },
  { word: "abandonable", canBeTargetWord: true },
  { word: "abandonedly", canBeTargetWord: true },
  { word: "abandonment", canBeTargetWord: true },
  { word: "abarthrosis", canBeTargetWord: true },
  // Temporarily moved; copy from WordArrays folder at root of repo if needed
];

export const guessableWords11: string[] = Words11.map((x) => x.word);
export const targetWords11: string[] = Words11.filter((x) => x.canBeTargetWord).map((x) => x.word);
