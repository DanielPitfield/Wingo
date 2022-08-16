import { PageName } from "../PageNames";

const DEFAULT_WORD_LENGTH = 5;

const defaultWordLengths: { page: PageName; wordLength: number }[] = [
  { page: "wingo/increasing", wordLength: 4 },
  { page: "wingo/puzzle", wordLength: 10 },
  { page: "LettersGame", wordLength: 9 },
  { page: "Conundrum", wordLength: 9 },
];

export const getGamemodeDefaultWordLength = (page: PageName) => {
  return defaultWordLengths.find((x) => x.page === page)?.wordLength ?? DEFAULT_WORD_LENGTH;
};
