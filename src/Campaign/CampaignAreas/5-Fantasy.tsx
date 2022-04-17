import { Themes } from "../../Themes";
import { AreaConfig } from "../Area";

export const area: AreaConfig = {
  name: "Fantasy",
  theme: Themes.Fantasy,
  unlock_level: {
    hint: <>Unlock this area</>,
    isUnlockLevel: true,
    levelProps: {
      mode: "repeat",
      targetWord: "fantasy",
      enforceFullLengthGuesses: true,
      defaultWordLength: 7,
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
