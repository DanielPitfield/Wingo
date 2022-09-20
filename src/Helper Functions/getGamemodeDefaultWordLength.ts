import { gamemodeDefaultWordLengths } from "../Data/DefaultWordLengths";
import { PageName } from "../Data/PageNames";

const DEFAULT_WORD_LENGTH = 5;

export const getGamemodeDefaultWordLength = (page: PageName) => {
  return gamemodeDefaultWordLengths.find((x) => x.page === page)?.wordLength ?? DEFAULT_WORD_LENGTH;
};
