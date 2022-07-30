import { Themes } from "../../Themes";
import { AreaConfig } from "../Area";

export const area: AreaConfig = {
  name: "Nature",
  theme: Themes.Nature,
  unlock_level: {
    type: "unlock-level",
    hint: <>Unlock this area</>,
    level: {
      gameCategory: "Wingo",
      page: "wingo/repeat",
      levelProps: {
        mode: "repeat",
        targetWord: "nature",
        enforceFullLengthGuesses: true,
        defaultWordLength: 6,
        defaultnumGuesses: 6,
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
