import { gamemodeDefaultNumGuesses } from "../Data/DefaultNumGuesses";
import { PagePath } from "../Data/PageNames";

const DEFAULT_NUM_GUESSES = 6;

export const getGamemodeDefaultNumGuesses = (page: PagePath) => {
  return gamemodeDefaultNumGuesses.find((x) => x.page === page)?.numGuesses ?? DEFAULT_NUM_GUESSES;
};
