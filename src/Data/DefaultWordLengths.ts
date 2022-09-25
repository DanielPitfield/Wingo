import { PagePath } from "../Data/PageNames";
import { MIN_TARGET_WORD_LENGTH } from "./GamemodeSettingsInputLimits";

export const gamemodeDefaultWordLengths: { page: PagePath; wordLength: number }[] = [
  { page: "/wingo/increasing", wordLength: MIN_TARGET_WORD_LENGTH },
  { page: "/wingo/limitless", wordLength: MIN_TARGET_WORD_LENGTH },
  { page: "/wingo/puzzle", wordLength: 10 },
  { page: "/LettersGame", wordLength: 9 },
  { page: "/Conundrum", wordLength: 9 },
];
