import { Themes } from "../../Themes";
import { AreaConfig } from "../Area";

export const area: AreaConfig = {
  name: "Nature",
  theme: Themes.Nature,
  unlock_level: {
    hint: <>Unlock this area</>,
    isUnlockLevel: true,
    level: {
      gameCategory: "wingo",
      levelProps: {
        mode: "repeat",
        targetWord: "nature",
        enforceFullLengthGuesses: true,
        defaultWordLength: 6,
        defaultnumGuesses: 6,
        keyboard: true,
        firstLetterProvided: true,
        checkInDictionary: false,
        puzzleLeaveNumBlanks: 0,
        puzzleRevealMs: 0,
        timerConfig: { isTimed: false },
      },
    },
  },

  levels: [],
};