import { Themes } from "../../Themes";
import { AreaConfig } from "../Area";

export const area: AreaConfig = {
  name: "Travel",
  theme: Themes.Travel,
  unlock_level: {
    hint: <>Unlock this area</>,
    isUnlockLevel: true,
    levelProps: {
      mode: "repeat",
      targetWord: "travel",
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

  levels: [],
};
