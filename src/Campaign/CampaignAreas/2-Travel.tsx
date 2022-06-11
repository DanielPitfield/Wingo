import { Themes } from "../../Themes";
import { AreaConfig } from "../Area";

export const area: AreaConfig = {
  name: "Travel",
  theme: Themes.Travel,
  unlock_level: {
    type: "unlock-level",
    hint: <>Unlock this area</>,
    level: {
      gameCategory: "wingo",
      levelProps: {
        mode: "repeat",
        targetWord: "travel",
        enforceFullLengthGuesses: true,
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

  levels: [
    {
      type: "level",
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
          gamemodeSettings: {
            firstLetterProvided: true,
            timer: { isTimed: false },
          },
          puzzleLeaveNumBlanks: 0,
          puzzleRevealMs: 0,
        },
      },
    },
    {
      type: "level",
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
          gamemodeSettings: {
            firstLetterProvided: true,
            timer: { isTimed: false },
          },
          puzzleLeaveNumBlanks: 0,
          puzzleRevealMs: 0,
        },
      },
    },
    {
      type: "level",
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
          gamemodeSettings: {
            firstLetterProvided: false,
            timer: { isTimed: false },
          },
          puzzleLeaveNumBlanks: 3,
          puzzleRevealMs: 1500,
        },
      },
    },
    {
      type: "level",
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
          gamemodeSettings: {
            firstLetterProvided: false,
            timer: { isTimed: false },
          },
          puzzleLeaveNumBlanks: 0,
          puzzleRevealMs: 0,
        },
      },
    },
    {
      type: "level",
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
          gamemodeSettings: {
            firstLetterProvided: false,
            timer: { isTimed: false },
          },
          puzzleLeaveNumBlanks: 3,
          puzzleRevealMs: 1500,
        },
      },
    },
    {
      type: "level",
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
          gamemodeSettings: {
            firstLetterProvided: false,
            timer: { isTimed: false },
          },
          puzzleLeaveNumBlanks: 0,
          puzzleRevealMs: 0,
        },
      },
    },
    {
      type: "level",
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
          gamemodeSettings: {
            firstLetterProvided: true,
            timer: { isTimed: false },
          },
          puzzleLeaveNumBlanks: 3,
          puzzleRevealMs: 1500,
        },
      },
    },
    {
      type: "level",
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
          gamemodeSettings: {
            firstLetterProvided: false,
            timer: { isTimed: false },
          },
          puzzleLeaveNumBlanks: 3,
          puzzleRevealMs: 1500,
        },
      },
    },
    {
      type: "level",
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
          gamemodeSettings: {
            firstLetterProvided: false,
            timer: { isTimed: false },
          },
          puzzleLeaveNumBlanks: 3,
          puzzleRevealMs: 1500,
        },
      },
    },
    {
      type: "level",
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
          gamemodeSettings: {
            firstLetterProvided: true,
            timer: { isTimed: false },
          },
          puzzleLeaveNumBlanks: 3,
          puzzleRevealMs: 1500,
        },
      },
    },
    {
      type: "level",
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
          gamemodeSettings: {
            firstLetterProvided: true,
            timer: { isTimed: false },
          },
          puzzleLeaveNumBlanks: 3,
          puzzleRevealMs: 1500,
        },
      },
    },
    {
      type: "level",
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
          gamemodeSettings: {
            firstLetterProvided: true,
            timer: { isTimed: false },
          },
          puzzleLeaveNumBlanks: 3,
          puzzleRevealMs: 1500,
        },
      },
    },
    {
      type: "level",
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
          gamemodeSettings: {
            firstLetterProvided: false,
            timer: { isTimed: false },
          },
          puzzleLeaveNumBlanks: 3,
          puzzleRevealMs: 1500,
        },
      },
    },
    {
      type: "level",
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
          gamemodeSettings: {
            firstLetterProvided: false,
            timer: { isTimed: false },
          },
          puzzleLeaveNumBlanks: 3,
          puzzleRevealMs: 1500,
        },
      },
    },
    {
      type: "level",
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
          gamemodeSettings: {
            firstLetterProvided: false,
            timer: { isTimed: false },
          },
          puzzleLeaveNumBlanks: 3,
          puzzleRevealMs: 1500,
        },
      },
    },
    {
      type: "level",
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
          gamemodeSettings: {
            firstLetterProvided: true,
            timer: { isTimed: false },
          },
          puzzleLeaveNumBlanks: 3,
          puzzleRevealMs: 1500,
        },
      },
    },
    {
      type: "level",
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
          gamemodeSettings: {
            firstLetterProvided: true,
            timer: { isTimed: false },
          },
          puzzleLeaveNumBlanks: 3,
          puzzleRevealMs: 1500,
        },
      },
    },
    {
      type: "level",
      hint: <></>,
      levelButtonCoords: {
        x: 49,
        y: 87,
      },
      level: {
        gameCategory: "wingo",
        levelProps: {
          mode: "repeat",
          targetWord: "south-africa",
          enforceFullLengthGuesses: true,
          defaultnumGuesses: 7,
          gamemodeSettings: {
            firstLetterProvided: true,
            timer: { isTimed: false },
          },
          puzzleLeaveNumBlanks: 3,
          puzzleRevealMs: 1500,
        },
      },
    },
    {
      type: "level",
      hint: <></>,
      levelButtonCoords: {
        x: 52,
        y: 81,
      },
      level: {
        gameCategory: "wingo",
        levelProps: {
          mode: "repeat",
          targetWord: "a",
          enforceFullLengthGuesses: true,
          defaultnumGuesses: 7,
          gamemodeSettings: {
            firstLetterProvided: true,
            timer: { isTimed: false },
          },
          puzzleLeaveNumBlanks: 3,
          puzzleRevealMs: 1500,
        },
      },
    },
    {
      type: "level",
      hint: <></>,
      levelButtonCoords: {
        x: 47,
        y: 78,
      },
      level: {
        gameCategory: "wingo",
        levelProps: {
          mode: "repeat",
          targetWord: "a",
          enforceFullLengthGuesses: true,
          defaultnumGuesses: 7,
          gamemodeSettings: {
            firstLetterProvided: true,
            timer: { isTimed: false },
          },
          puzzleLeaveNumBlanks: 3,
          puzzleRevealMs: 1500,
        },
      },
    },
    {
      type: "level",
      hint: <></>,
      levelButtonCoords: {
        x: 50,
        y: 74,
      },
      level: {
        gameCategory: "wingo",
        levelProps: {
          mode: "repeat",
          targetWord: "a",
          enforceFullLengthGuesses: true,
          defaultnumGuesses: 7,
          gamemodeSettings: {
            firstLetterProvided: true,
            timer: { isTimed: false },
          },
          puzzleLeaveNumBlanks: 3,
          puzzleRevealMs: 1500,
        },
      },
    },
    {
      type: "level",
      hint: <></>,
      levelButtonCoords: {
        x: 54,
        y: 67,
      },
      level: {
        gameCategory: "wingo",
        levelProps: {
          mode: "repeat",
          targetWord: "a",
          enforceFullLengthGuesses: true,
          defaultnumGuesses: 7,
          gamemodeSettings: {
            firstLetterProvided: true,
            timer: { isTimed: false },
          },
          puzzleLeaveNumBlanks: 3,
          puzzleRevealMs: 1500,
        },
      },
    },
    {
      type: "level",
      hint: <></>,
      levelButtonCoords: {
        x: 53,
        y: 61,
      },
      level: {
        gameCategory: "wingo",
        levelProps: {
          mode: "repeat",
          targetWord: "a",
          enforceFullLengthGuesses: true,
          defaultnumGuesses: 7,
          gamemodeSettings: {
            firstLetterProvided: true,
            timer: { isTimed: false },
          },
          puzzleLeaveNumBlanks: 3,
          puzzleRevealMs: 1500,
        },
      },
    },
    {
      type: "level",
      hint: <></>,
      levelButtonCoords: {
        x: 48,
        y: 65,
      },
      level: {
        gameCategory: "wingo",
        levelProps: {
          mode: "repeat",
          targetWord: "a",
          enforceFullLengthGuesses: true,
          defaultnumGuesses: 7,
          gamemodeSettings: {
            firstLetterProvided: true,
            timer: { isTimed: false },
          },
          puzzleLeaveNumBlanks: 3,
          puzzleRevealMs: 1500,
        },
      },
    },
    {
      type: "level",
      hint: <></>,
      levelButtonCoords: {
        x: 44,
        y: 67,
      },
      level: {
        gameCategory: "wingo",
        levelProps: {
          mode: "repeat",
          targetWord: "a",
          enforceFullLengthGuesses: true,
          defaultnumGuesses: 7,
          gamemodeSettings: {
            firstLetterProvided: true,
            timer: { isTimed: false },
          },
          puzzleLeaveNumBlanks: 3,
          puzzleRevealMs: 1500,
        },
      },
    },
    {
      type: "level",
      hint: <></>,
      levelButtonCoords: {
        x: 42,
        y: 64,
      },
      level: {
        gameCategory: "wingo",
        levelProps: {
          mode: "repeat",
          targetWord: "a",
          enforceFullLengthGuesses: true,
          defaultnumGuesses: 7,
          gamemodeSettings: {
            firstLetterProvided: true,
            timer: { isTimed: false },
          },
          puzzleLeaveNumBlanks: 3,
          puzzleRevealMs: 1500,
        },
      },
    },
    {
      type: "level",
      hint: <></>,
      levelButtonCoords: {
        x: 40,
        y: 60,
      },
      level: {
        gameCategory: "wingo",
        levelProps: {
          mode: "repeat",
          targetWord: "a",
          enforceFullLengthGuesses: true,
          defaultnumGuesses: 7,
          gamemodeSettings: {
            firstLetterProvided: true,
            timer: { isTimed: false },
          },
          puzzleLeaveNumBlanks: 3,
          puzzleRevealMs: 1500,
        },
      },
    },
    {
      type: "level",
      hint: <></>,
      levelButtonCoords: {
        x: 44,
        y: 55,
      },
      level: {
        gameCategory: "wingo",
        levelProps: {
          mode: "repeat",
          targetWord: "a",
          enforceFullLengthGuesses: true,
          defaultnumGuesses: 7,
          gamemodeSettings: {
            firstLetterProvided: true,
            timer: { isTimed: false },
          },
          puzzleLeaveNumBlanks: 3,
          puzzleRevealMs: 1500,
        },
      },
    },
    {
      type: "level",
      hint: <></>,
      levelButtonCoords: {
        x: 48,
        y: 56,
      },
      level: {
        gameCategory: "wingo",
        levelProps: {
          mode: "repeat",
          targetWord: "a",
          enforceFullLengthGuesses: true,
          defaultnumGuesses: 7,
          gamemodeSettings: {
            firstLetterProvided: true,
            timer: { isTimed: false },
          },
          puzzleLeaveNumBlanks: 3,
          puzzleRevealMs: 1500,
        },
      },
    },
    {
      type: "level",
      hint: <></>,
      levelButtonCoords: {
        x: 54,
        y: 53,
      },
      level: {
        gameCategory: "wingo",
        levelProps: {
          mode: "repeat",
          targetWord: "a",
          enforceFullLengthGuesses: true,
          defaultnumGuesses: 7,
          gamemodeSettings: {
            firstLetterProvided: true,
            timer: { isTimed: false },
          },
          puzzleLeaveNumBlanks: 3,
          puzzleRevealMs: 1500,
        },
      },
    },
    {
      type: "level",
      hint: <></>,
      levelButtonCoords: {
        x: 57,
        y: 56,
      },
      level: {
        gameCategory: "wingo",
        levelProps: {
          mode: "repeat",
          targetWord: "a",
          enforceFullLengthGuesses: true,
          defaultnumGuesses: 7,
          gamemodeSettings: {
            firstLetterProvided: true,
            timer: { isTimed: false },
          },
          puzzleLeaveNumBlanks: 3,
          puzzleRevealMs: 1500,
        },
      },
    },
    {
      type: "level",
      hint: <></>,
      levelButtonCoords: {
        x: 60,
        y: 55,
      },
      level: {
        gameCategory: "wingo",
        levelProps: {
          mode: "repeat",
          targetWord: "a",
          enforceFullLengthGuesses: true,
          defaultnumGuesses: 7,
          gamemodeSettings: {
            firstLetterProvided: true,
            timer: { isTimed: false },
          },
          puzzleLeaveNumBlanks: 3,
          puzzleRevealMs: 1500,
        },
      },
    },
    {
      type: "level",
      hint: <></>,
      levelButtonCoords: {
        x: 62.5,
        y: 57,
      },
      level: {
        gameCategory: "wingo",
        levelProps: {
          mode: "repeat",
          targetWord: "a",
          enforceFullLengthGuesses: true,
          defaultnumGuesses: 7,
          gamemodeSettings: {
            firstLetterProvided: true,
            timer: { isTimed: false },
          },
          puzzleLeaveNumBlanks: 3,
          puzzleRevealMs: 1500,
        },
      },
    },
    {
      type: "level",
      hint: <></>,
      levelButtonCoords: {
        x: 64,
        y: 63,
      },
      level: {
        gameCategory: "wingo",
        levelProps: {
          mode: "repeat",
          targetWord: "a",
          enforceFullLengthGuesses: true,
          defaultnumGuesses: 7,
          gamemodeSettings: {
            firstLetterProvided: true,
            timer: { isTimed: false },
          },
          puzzleLeaveNumBlanks: 3,
          puzzleRevealMs: 1500,
        },
      },
    },
    {
      type: "level",
      hint: <></>,
      levelButtonCoords: {
        x: 66,
        y: 58,
      },
      level: {
        gameCategory: "wingo",
        levelProps: {
          mode: "repeat",
          targetWord: "a",
          enforceFullLengthGuesses: true,
          defaultnumGuesses: 7,
          gamemodeSettings: {
            firstLetterProvided: true,
            timer: { isTimed: false },
          },
          puzzleLeaveNumBlanks: 3,
          puzzleRevealMs: 1500,
        },
      },
    },
  ],
};
