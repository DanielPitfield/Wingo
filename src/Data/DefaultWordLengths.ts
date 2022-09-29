import { PagePath } from "../Data/PageNames";
import { MIN_TARGET_WORD_LENGTH } from "./GamemodeSettingsInputLimits";

export const gamemodeDefaultWordLengths: { page: PagePath; wordLength: number }[] = [
  { page: "/Wingo/Increasing", wordLength: MIN_TARGET_WORD_LENGTH },
  { page: "/Wingo/Limitless", wordLength: MIN_TARGET_WORD_LENGTH },
  { page: "/Wingo/Puzzle", wordLength: 10 },
  { page: "/LettersGame", wordLength: 9 },
  { page: "/Conundrum", wordLength: 9 },
];
