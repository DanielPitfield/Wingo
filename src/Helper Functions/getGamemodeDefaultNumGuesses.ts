import { gamemodeDefaultNumGuesses } from "../Data/DefaultNumGuesses";
import { PageName } from "../Data/PageNames";

const DEFAULT_NUM_GUESSES = 6;

export const getGamemodeDefaultNumGuesses = (page: PageName) => {
  return gamemodeDefaultNumGuesses.find((x) => x.page === page)?.numGuesses ?? DEFAULT_NUM_GUESSES;
};
