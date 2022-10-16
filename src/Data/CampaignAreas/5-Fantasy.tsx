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
      page: "/Wingo/Repeat",
      levelProps: {
        mode: "repeat",
        targetWord: "fantasy",
        enforceFullLengthGuesses: true,
        defaultNumGuesses: 6,
        gamemodeSettings: {
          wordLength: 7,
          isFirstLetterProvided: true,
          puzzleLeaveNumBlanks: 0,
          puzzleRevealSeconds: 0,
          timerConfig: { isTimed: false },
        },
      },
    },
  },

  levels: [],
};
