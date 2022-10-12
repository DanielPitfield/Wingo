import { Themes } from "../Themes";
import { AreaConfig } from "../../Pages/Area";

export const area: AreaConfig = {
  name: "Nature",
  theme: Themes.Nature,
  unlock_level: {
    type: "unlock-level",
    hint: <>Unlock this area</>,
    level: {
      gameCategory: "Wingo",
      page: "/Wingo/Repeat",
      levelProps: {
        mode: "repeat",
        targetWord: "nature",
        enforceFullLengthGuesses: true,
        defaultWordLength: 6,
        defaultNumGuesses: 6,
        gamemodeSettings: {
          isFirstLetterProvided: true,
          puzzleLeaveNumBlanks: 0,
          puzzleRevealSeconds: 0,
          timerConfig: { isTimed: false },
        },
        checkInDictionary: false,
      },
    },
  },

  levels: [],
};
