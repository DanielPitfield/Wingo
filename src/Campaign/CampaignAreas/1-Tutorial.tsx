import { Themes } from "../../Themes";
import { AreaConfig } from "../Area";

export const area: AreaConfig = {
  name: "Tutorial",
  theme: Themes.GenericWingo,
  unlock_level: {
    hint: (
      <>
        Every area must first be unlocked by guessing the name of the area
        <br />
        Since this is the tutorial, we'll tell you that the answer is: <strong>START</strong>
        <br />
        Try entering the word <strong>START</strong>
      </>
    ),
    isUnlockLevel: true,
    level: {
      gameCategory: "wingo",
      levelProps: {
        mode: "repeat",
        targetWord: "start",
        enforceFullLengthGuesses: true,
        defaultWordLength: 5,
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
  levels: [
    {
      hint: <>To acquire new knowledge</>,
      level: {
        gameCategory: "wingo",
        levelProps: {
          mode: "repeat",
          targetWord: "learn",
          enforceFullLengthGuesses: true,
          defaultWordLength: 5,
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
  ],
};
