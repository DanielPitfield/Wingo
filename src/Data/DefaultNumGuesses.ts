import { PagePath } from "../Data/PageNames";

export const gamemodeDefaultNumGuesses: { page: PagePath; numGuesses: number }[] = [
  { page: "/Wingo/Puzzle", numGuesses: 1 },
  { page: "/Conundrum", numGuesses: 1 },
  { page: "/NumbersGame", numGuesses: 5 },
  { page: "/ArithmeticDrag/Match", numGuesses: 3 },
  { page: "/ArithmeticDrag/Order", numGuesses: 3 },
  { page: "/OnlyConnect", numGuesses: 3 },
  { page: "/SameLetters", numGuesses: 20 },
  { page: "/WordCodes/Question", numGuesses: 3 },
  { page: "/WordCodes/Match", numGuesses: 3 },
];
