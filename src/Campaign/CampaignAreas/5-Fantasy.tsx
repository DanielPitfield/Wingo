import { Themes } from "../../Themes";
import { AreaConfig } from "../Area";

export const area: AreaConfig = {
  name: "Fantasy",
  theme: Themes.Fantasy,
  unlock_level: {
    type: "unlock-level",
    hint: <>Unlock this area</>,
    level: {
      gameCategory: "wingo",
      levelProps: {
        mode: "repeat",
        targetWord: "fantasy",
        enforceFullLengthGuesses: true,
        defaultWordLength: 7,
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
