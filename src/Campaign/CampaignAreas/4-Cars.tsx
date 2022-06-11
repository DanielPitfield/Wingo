import { Themes } from "../../Themes";
import { AreaConfig } from "../Area";

export const area: AreaConfig = {
  name: "Cars",
  theme: Themes.Cars,
  unlock_level: {
    type: "unlock-level",
    hint: <>Unlock this area</>,
    level: {
      gameCategory: "wingo",
      levelProps: {
        mode: "repeat",
        targetWord: "cars",
        enforceFullLengthGuesses: true,
        defaultWordLength: 4,
        defaultnumGuesses: 6,
        gamemodeSettings: {
          firstLetterProvided: true,
          timer: { isTimed: false },
        },
        checkInDictionary: false,
        puzzleLeaveNumBlanks: 0,
        puzzleRevealMs: 0,
      },
    },
  },

  levels: [],
};
