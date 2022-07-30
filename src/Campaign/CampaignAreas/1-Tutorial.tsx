import { Themes } from "../../Themes";
import { AreaConfig } from "../Area";

export const area: AreaConfig = {
  name: "Tutorial",
  theme: Themes.GenericWingo,
  unlock_level: {
    type: "unlock-level",
    hint: (
      <>
        Every area must first be unlocked by guessing the name of the area
        <br />
        Since this is the tutorial, we'll tell you that the answer is: <strong>START</strong>
        <br />
        Try entering the word <strong>START</strong>
      </>
    ),
    level: {
      gameCategory: "Wingo",
      page: "wingo/repeat",
      levelProps: {
        mode: "repeat",
        targetWord: "start",
        enforceFullLengthGuesses: true,
        defaultWordLength: 5,
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
  levels: [
    {
      type: "level",
      hint: <>To acquire new knowledge</>,
      levelButtonCoords: {
        x: 10,
        y: 10,
      },
      level: {
        gameCategory: "Wingo",
        page: "wingo/repeat",
        levelProps: {
          mode: "repeat",
          targetWord: "learn",
          enforceFullLengthGuesses: true,
          defaultWordLength: 5,
          defaultnumGuesses: 6,
          /*
          These settings with their default values will be used for the campaign level
          Normally, declaring settings like this would mean they are configurable
          But in this case, they won't be able to be configured as the collapsible (to change them) is conditionally rendered
          */
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
  ],
};
