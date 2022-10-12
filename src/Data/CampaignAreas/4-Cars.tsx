import { Themes } from "../Themes";
import { AreaConfig } from "../../Pages/Area";

export const area: AreaConfig = {
  name: "Cars",
  theme: Themes.Cars,
  unlock_level: {
    type: "unlock-level",
    hint: <>Unlock this area</>,
    level: {
      gameCategory: "Wingo",
      page: "/Wingo/Repeat",
      levelProps: {
        mode: "repeat",
        targetWord: "cars",
        enforceFullLengthGuesses: true,
        defaultNumGuesses: 6,
        gamemodeSettings: {
          wordLength: 4,
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
