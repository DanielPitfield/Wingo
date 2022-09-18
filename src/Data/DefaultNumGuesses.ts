import { PageName } from "../Data/PageNames";

const DEFAULT_NUM_GUESSES = 6;

const defaultNumGuesses: { page: PageName; numGuesses: number }[] = [
  { page: "wingo/puzzle", numGuesses: 1 },
  { page: "NumbersGame", numGuesses: 5 },
  { page: "ArithmeticDrag/Match", numGuesses: 3 },
  { page: "ArithmeticDrag/Order", numGuesses: 3 },
  { page: "OnlyConnect", numGuesses: 3 },
  { page: "SameLetters", numGuesses: 20 },
  { page: "WordCodes/Question", numGuesses: 3 },
  { page: "WordCodes/Match", numGuesses: 3 },
  { page: "LettersNumbersGameshow", numGuesses: 5 },
];

export const getGamemodeDefaultNumGuesses = (page: PageName) => {
  return defaultNumGuesses.find((x) => x.page === page)?.numGuesses ?? DEFAULT_NUM_GUESSES;
};
