import { Themes } from "../Themes";
import { AreaConfig } from "../../Pages/Area";

export const area: AreaConfig = {
  name: "Fantasy",
  theme: Themes.Fantasy,
  unlock_level: {
    type: "unlock-level",
    hint: <>Unlock this area</>,
    level: {
      gameCategory: "Wingo",
      page: "wingo/repeat",
      levelProps: {
        mode: "repeat",
        targetWord: "fantasy",
        enforceFullLengthGuesses: true,
        defaultWordLength: 7,
        defaultNumGuesses: 6,
        gamemodeSettings: {
          isFirstLetterProvided: true,
          puzzleLeaveNumBlanks: 0,
          puzzleRevealMs: 0,
          timerConfig: { isTimed: false },
        },
        checkInDictionary: false,
      },
    },
  },

  levels: [],
};
