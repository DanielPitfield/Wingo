import { Themes } from "../Themes";
import { AreaConfig } from "../../Pages/Area";
import { commonWingoSettings } from "../DefaultGamemodeSettings";

export const area: AreaConfig = {
  name: "Travel",
  theme: Themes.Travel,
  unlock_level: {
    type: "unlock-level",
    hint: (
      <>
        Unlock this area by guessing the word!
        <br />
        As this is the first one, we'll give you this one for free.
        <br />
        Enter <strong>TRAVEL</strong> below
      </>
    ),
    level: {
      gameCategory: "Wingo",
      page: "/Wingo/Repeat",
      levelProps: {
        mode: "repeat",
        targetWord: "travel",
        gamemodeSettings: {
          ...commonWingoSettings,
          wordLength: 6,
        },
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
        gameCategory: "Wingo",
        page: "/Wingo/Repeat",
        levelProps: {
          mode: "repeat",
          targetWord: "canada",
          gamemodeSettings: {
            ...commonWingoSettings,
            wordLength: 6,
          },
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
        gameCategory: "Wingo",
        page: "/Wingo/Repeat",
        levelProps: {
          mode: "repeat",
          targetWord: "poutine",
          gamemodeSettings: {
            ...commonWingoSettings,
            wordLength: 7,
          },
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
        gameCategory: "Wingo",
        page: "/Wingo/Puzzle",
        levelProps: {
          mode: "puzzle",
          targetWord: "moose",
          gamemodeSettings: {
            ...commonWingoSettings,
            startingNumGuesses: 1,
            puzzleLeaveNumBlanks: 3,
            puzzleRevealSeconds: 1.5,
          },
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
        gameCategory: "Wingo",
        page: "/Wingo/Repeat",
        levelProps: {
          mode: "repeat",
          targetWord: "maple-syrup",
          gamemodeSettings: {
            ...commonWingoSettings,
            wordLength: 11,
            startingNumGuesses: 5,
          },
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
        gameCategory: "Wingo",
        page: "/Wingo/Puzzle",
        levelProps: {
          mode: "puzzle",
          targetWord: "polar-bear",
          gamemodeSettings: {
            ...commonWingoSettings,
            wordLength: 10,
            startingNumGuesses: 1,
            puzzleLeaveNumBlanks: 3,
            puzzleRevealSeconds: 1.5,
          },
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
        gameCategory: "Wingo",
        page: "/Wingo/Repeat",
        levelProps: {
          mode: "repeat",
          targetWord: "usa",
          gamemodeSettings: {
            ...commonWingoSettings,
            wordLength: 3,
          },
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
        gameCategory: "Wingo",
        page: "/Wingo/Puzzle",
        levelProps: {
          mode: "puzzle",
          targetWord: "constitution",
          gamemodeSettings: {
            ...commonWingoSettings,
            wordLength: 13,
            startingNumGuesses: 1,
            puzzleLeaveNumBlanks: 3,
            puzzleRevealSeconds: 1.5,
          },
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
        gameCategory: "Wingo",
        page: "/Wingo/Puzzle",
        levelProps: {
          mode: "puzzle",
          targetWord: "cheeseburger",
          gamemodeSettings: {
            ...commonWingoSettings,
            wordLength: 12,
            startingNumGuesses: 1,
            puzzleLeaveNumBlanks: 3,
            puzzleRevealSeconds: 1.5,
          },
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
        gameCategory: "Wingo",
        page: "/Wingo/Puzzle",
        levelProps: {
          mode: "puzzle",
          targetWord: "baseball",
          gamemodeSettings: {
            ...commonWingoSettings,
            wordLength: 8,
            startingNumGuesses: 1,
            puzzleLeaveNumBlanks: 3,
            puzzleRevealSeconds: 1.5,
          },
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
        gameCategory: "Wingo",
        page: "/Wingo/Puzzle",
        levelProps: {
          mode: "puzzle",
          targetWord: "mexico",
          gamemodeSettings: {
            ...commonWingoSettings,
            wordLength: 6,
            startingNumGuesses: 1,
            puzzleLeaveNumBlanks: 3,
            puzzleRevealSeconds: 1.5,
          },
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
        gameCategory: "Wingo",
        page: "/Wingo/Puzzle",
        levelProps: {
          mode: "puzzle",
          targetWord: "mariachi",
          gamemodeSettings: {
            ...commonWingoSettings,
            wordLength: 8,
            startingNumGuesses: 1,
            puzzleLeaveNumBlanks: 3,
            puzzleRevealSeconds: 1.5,
          },
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
        gameCategory: "Wingo",
        page: "/Wingo/Puzzle",
        levelProps: {
          mode: "puzzle",
          targetWord: "brazil",
          gamemodeSettings: {
            ...commonWingoSettings,
            wordLength: 6,
            startingNumGuesses: 1,
            puzzleLeaveNumBlanks: 3,
            puzzleRevealSeconds: 1.5,
          },
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
        gameCategory: "Wingo",
        page: "/Wingo/Puzzle",
        levelProps: {
          mode: "puzzle",
          targetWord: "carnival",
          gamemodeSettings: {
            ...commonWingoSettings,
            wordLength: 8,
            startingNumGuesses: 1,
            puzzleLeaveNumBlanks: 3,
            puzzleRevealSeconds: 1.5,
          },
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
        gameCategory: "Wingo",
        page: "/Wingo/Puzzle",
        levelProps: {
          mode: "puzzle",
          targetWord: "samba",
          gamemodeSettings: {
            ...commonWingoSettings,
            startingNumGuesses: 1,
            puzzleLeaveNumBlanks: 3,
            puzzleRevealSeconds: 1.5,
          },
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
        gameCategory: "Wingo",
        page: "/Wingo/Puzzle",
        levelProps: {
          mode: "puzzle",
          targetWord: "football",
          gamemodeSettings: {
            ...commonWingoSettings,
            wordLength: 8,
            startingNumGuesses: 1,
            puzzleLeaveNumBlanks: 3,
            puzzleRevealSeconds: 1.5,
          },
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
        gameCategory: "Wingo",
        page: "/Wingo/Puzzle",
        levelProps: {
          mode: "puzzle",
          targetWord: "chile",
          gamemodeSettings: {
            ...commonWingoSettings,
            startingNumGuesses: 1,
            puzzleLeaveNumBlanks: 3,
            puzzleRevealSeconds: 1.5,
          },
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
        gameCategory: "Wingo",
        page: "/Wingo/Puzzle",
        levelProps: {
          mode: "puzzle",
          targetWord: "argentina",
          gamemodeSettings: {
            ...commonWingoSettings,
            wordLength: 9,
            startingNumGuesses: 1,
            puzzleLeaveNumBlanks: 3,
            puzzleRevealSeconds: 1.5,
          },
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
        gameCategory: "Wingo",
        page: "/Wingo/Puzzle",
        levelProps: {
          mode: "puzzle",
          targetWord: "south-africa",
          gamemodeSettings: {
            ...commonWingoSettings,
            wordLength: 12,
            startingNumGuesses: 1,
            puzzleLeaveNumBlanks: 3,
            puzzleRevealSeconds: 1.5,
          },
        },
      },
    },
  ],
};
