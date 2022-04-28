import { Themes } from "../../Themes";
import { AreaConfig } from "../Area";

export const area: AreaConfig = {
  name: "Travel",
  theme: Themes.Travel,
  unlock_level: {
    hint: <>Unlock this area</>,
    isUnlockLevel: true,
    level: {
      gameCategory: "wingo",
      levelProps: {
        mode: "repeat",
        targetWord: "travel",
        enforceFullLengthGuesses: true,
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
      hint: <>Home of stunning landscapes, Niagara Falls and Ice Hockey</>,
      levelButtonCoords: {
        x: 14,
        y: 27,
      },
      level: {
        gameCategory: "wingo",
        levelProps: {
          mode: "repeat",
          targetWord: "canada",
          enforceFullLengthGuesses: true,
          defaultnumGuesses: 6,
          keyboard: true,
          firstLetterProvided: true,
          puzzleLeaveNumBlanks: 0,
          puzzleRevealMs: 0,
          timerConfig: { isTimed: false },
        },
      },
    },
    {
      hint: <>Canadian dish of french fries, gravy and cheese curds</>,
      levelButtonCoords: {
        x: 18,
        y: 30,
      },
      level: {
        gameCategory: "wingo",
        levelProps: {
          mode: "repeat",
          targetWord: "poutine",
          enforceFullLengthGuesses: true,
          defaultnumGuesses: 6,
          keyboard: true,
          firstLetterProvided: true,
          puzzleLeaveNumBlanks: 0,
          puzzleRevealMs: 0,
          timerConfig: { isTimed: false },
        },
      },
    },
    {
      hint: <>Largest animal of the deer family</>,
      levelButtonCoords: {
        x: 22,
        y: 28,
      },
      level: {
        gameCategory: "wingo",
        levelProps: {
          mode: "repeat",
          targetWord: "moose",
          enforceFullLengthGuesses: true,
          defaultnumGuesses: 6,
          keyboard: true,
          firstLetterProvided: false,
          puzzleLeaveNumBlanks: 3,
          puzzleRevealMs: 1500,
          timerConfig: { isTimed: false },
        },
      },
    },
    {
      hint: <>Sweet sugary sap from certain trees</>,
      levelButtonCoords: {
        x: 26,
        y: 24,
      },
      level: {
        gameCategory: "wingo",
        levelProps: {
          mode: "repeat",
          targetWord: "maple-syrup",
          enforceFullLengthGuesses: true,
          defaultnumGuesses: 5,
          keyboard: true,
          firstLetterProvided: false,
          puzzleLeaveNumBlanks: 0,
          puzzleRevealMs: 0,
          timerConfig: { isTimed: false },
        },
      },
    },
    {
      hint: <>Canada is home to 60% of these furry animals</>,
      levelButtonCoords: {
        x: 30,
        y: 26,
      },
      level: {
        gameCategory: "wingo",
        levelProps: {
          mode: "repeat",
          targetWord: "polar-bear",
          enforceFullLengthGuesses: true,
          defaultnumGuesses: 6,
          keyboard: true,
          firstLetterProvided: false,
          puzzleLeaveNumBlanks: 3,
          puzzleRevealMs: 1500,
          timerConfig: { isTimed: false },
        },
      },
    },
    {
      hint: <>Land of the free</>,
      levelButtonCoords: {
        x: 28,
        y: 36,
      },
      level: {
        gameCategory: "wingo",
        levelProps: {
          mode: "repeat",
          targetWord: "usa",
          enforceFullLengthGuesses: true,
          defaultnumGuesses: 6,
          keyboard: true,
          firstLetterProvided: false,
          puzzleLeaveNumBlanks: 0,
          puzzleRevealMs: 0,
          timerConfig: { isTimed: false },
        },
      },
    },
    {
      hint: <>Founding legal basis</>,
      levelButtonCoords: {
        x: 24,
        y: 38,
      },
      level: {
        gameCategory: "wingo",
        levelProps: {
          mode: "repeat",
          targetWord: "constitution",
          enforceFullLengthGuesses: true,
          defaultnumGuesses: 7,
          keyboard: true,
          firstLetterProvided: true,
          puzzleLeaveNumBlanks: 3,
          puzzleRevealMs: 1500,
          timerConfig: { isTimed: false },
        },
      },
    },
    {
      hint: <>Famous american food treat, originating from Germany</>,
      levelButtonCoords: {
        x: 19,
        y: 39,
      },
      level: {
        gameCategory: "wingo",
        levelProps: {
          mode: "repeat",
          targetWord: "cheeseburger",
          enforceFullLengthGuesses: true,
          defaultnumGuesses: 7,
          keyboard: true,
          firstLetterProvided: false,
          puzzleLeaveNumBlanks: 3,
          puzzleRevealMs: 1500,
          timerConfig: { isTimed: false },
        },
      },
    },
    {
      hint: <>Famous american sport</>,
      levelButtonCoords: {
        x: 17,
        y: 47,
      },
      level: {
        gameCategory: "wingo",
        levelProps: {
          mode: "repeat",
          targetWord: "baseball",
          enforceFullLengthGuesses: true,
          defaultnumGuesses: 5,
          keyboard: true,
          firstLetterProvided: false,
          puzzleLeaveNumBlanks: 3,
          puzzleRevealMs: 1500,
          timerConfig: { isTimed: false },
        },
      },
    },
    {
      hint: <>Home to Tacos, Margarita and Tequilla</>,
      levelButtonCoords: {
        x: 17,
        y: 55,
      },
      level: {
        gameCategory: "wingo",
        levelProps: {
          mode: "repeat",
          targetWord: "mexico",
          enforceFullLengthGuesses: true,
          defaultnumGuesses: 5,
          keyboard: true,
          firstLetterProvided: true,
          puzzleLeaveNumBlanks: 3,
          puzzleRevealMs: 1500,
          timerConfig: { isTimed: false },
        },
      },
    },
    {
      hint: <>Mexican quartet</>,
      levelButtonCoords: {
        x: 20,
        y: 62,
      },
      level: {
        gameCategory: "wingo",
        levelProps: {
          mode: "repeat",
          targetWord: "mariachi",
          enforceFullLengthGuesses: true,
          defaultnumGuesses: 7,
          keyboard: true,
          firstLetterProvided: true,
          puzzleLeaveNumBlanks: 3,
          puzzleRevealMs: 1500,
          timerConfig: { isTimed: false },
        },
      },
    },
    {
      hint: <>Home to Cachaça and Iguaçu Falls</>,
      levelButtonCoords: {
        x: 23,
        y: 68,
      },
      level: {
        gameCategory: "wingo",
        levelProps: {
          mode: "repeat",
          targetWord: "brazil",
          enforceFullLengthGuesses: true,
          defaultnumGuesses: 5,
          keyboard: true,
          firstLetterProvided: true,
          puzzleLeaveNumBlanks: 3,
          puzzleRevealMs: 1500,
          timerConfig: { isTimed: false },
        },
      },
    },
    {
      hint: <>Brazillian festivity</>,
      levelButtonCoords: {
        x: 29,
        y: 68,
      },
      level: {
        gameCategory: "wingo",
        levelProps: {
          mode: "repeat",
          targetWord: "carnival",
          enforceFullLengthGuesses: true,
          defaultnumGuesses: 6,
          keyboard: true,
          firstLetterProvided: false,
          puzzleLeaveNumBlanks: 3,
          puzzleRevealMs: 1500,
          timerConfig: { isTimed: false },
        },
      },
    },
    {
      hint: <>Brazillian dance</>,
      levelButtonCoords: {
        x: 34,
        y: 74,
      },
      level: {
        gameCategory: "wingo",
        levelProps: {
          mode: "repeat",
          targetWord: "samba",
          enforceFullLengthGuesses: true,
          defaultnumGuesses: 4,
          keyboard: true,
          firstLetterProvided: false,
          puzzleLeaveNumBlanks: 3,
          puzzleRevealMs: 1500,
          timerConfig: { isTimed: false },
        },
      },
    },
    {
      hint: <>Brazillian sport</>,
      levelButtonCoords: {
        x: 31,
        y: 77,
      },
      level: {
        gameCategory: "wingo",
        levelProps: {
          mode: "repeat",
          targetWord: "football",
          enforceFullLengthGuesses: true,
          defaultnumGuesses: 6,
          keyboard: true,
          firstLetterProvided: false,
          puzzleLeaveNumBlanks: 3,
          puzzleRevealMs: 1500,
          timerConfig: { isTimed: false },
        },
      },
    },
    {
      hint: <>Home to Easter Island and the Atacama desert</>,
      levelButtonCoords: {
        x: 26,
        y: 84,
      },
      level: {
        gameCategory: "wingo",
        levelProps: {
          mode: "repeat",
          targetWord: "chile",
          enforceFullLengthGuesses: true,
          defaultnumGuesses: 7,
          keyboard: true,
          firstLetterProvided: true,
          puzzleLeaveNumBlanks: 3,
          puzzleRevealMs: 1500,
          timerConfig: { isTimed: false },
        },
      },
    },
    {
      hint: <>Home to Tango</>,
      levelButtonCoords: {
        x: 25,
        y: 94,
      },
      level: {
        gameCategory: "wingo",
        levelProps: {
          mode: "repeat",
          targetWord: "argentina",
          enforceFullLengthGuesses: true,
          defaultnumGuesses: 7,
          keyboard: true,
          firstLetterProvided: true,
          puzzleLeaveNumBlanks: 3,
          puzzleRevealMs: 1500,
          timerConfig: { isTimed: false },
        },
      },
    },
  ],
};