import { Themes } from "../Themes";
import { AreaConfig } from "../../Pages/Area";
import { commonWingoSettings } from "../DefaultGamemodeSettings";

export const area: AreaConfig = {
  name: "Space",
  theme: Themes.Space,
  unlock_level: {
    type: "unlock-level",
    hint: <>Unlock this area</>,
    level: {
      gameCategory: "Wingo",
      page: "/Wingo/Repeat",
      levelProps: {
        mode: "repeat",
        targetWord: "space",
        gamemodeSettings: {
          ...commonWingoSettings,
        },
      },
    },
  },

  levels: [
    {
      type: "level",
      hint: <>Only known inhabitted planet</>,
      levelButtonCoords: {
        x: 5,
        y: 5,
      },
      level: {
        gameCategory: "Wingo",
        page: "/Wingo/Repeat",
        levelProps: {
          mode: "repeat",
          targetWord: "earth",
          gamemodeSettings: {
            ...commonWingoSettings,
          },
        },
      },
    },
    {
      type: "level",
      hint: <>Planet of men</>,
      levelButtonCoords: {
        x: 25,
        y: 5,
      },
      level: {
        gameCategory: "Wingo",
        page: "/Wingo/Repeat",
        levelProps: {
          mode: "repeat",
          targetWord: "mars",
          gamemodeSettings: {
            ...commonWingoSettings,
            wordLength: 4,
          },
        },
      },
    },
    {
      type: "level",
      hint: <>Path followed around a bigger object</>,
      levelButtonCoords: {
        x: 45,
        y: 6,
      },
      level: {
        gameCategory: "Wingo",
        page: "/Wingo/Repeat",
        levelProps: {
          mode: "repeat",
          targetWord: "orbit",
          gamemodeSettings: {
            ...commonWingoSettings,
          },
        },
      },
    },
    {
      type: "level",
      hint: <>Planet of women</>,
      levelButtonCoords: {
        x: 12,
        y: 12,
      },
      level: {
        gameCategory: "Wingo",
        page: "/Wingo/Repeat",
        levelProps: {
          mode: "repeat",
          targetWord: "venus",
          gamemodeSettings: {
            ...commonWingoSettings,
          },
        },
      },
    },
    {
      type: "level",
      hint: <>Planet sharing a name with a metal</>,
      levelButtonCoords: {
        x: 20,
        y: 20,
      },
      level: {
        gameCategory: "Wingo",
        page: "/Wingo/Repeat",
        levelProps: {
          mode: "repeat",
          targetWord: "mercury",
          gamemodeSettings: {
            ...commonWingoSettings,
            wordLength: 7,
          },
        },
      },
    },
    {
      type: "level",
      hint: <>Attractive force</>,
      levelButtonCoords: {
        x: 28,
        y: 28,
      },
      level: {
        gameCategory: "Wingo",
        page: "/Wingo/Puzzle",
        levelProps: {
          mode: "puzzle",
          targetWord: "gravity",
          gamemodeSettings: {
            ...commonWingoSettings,
            wordLength: 7,
            startingNumGuesses: 1,
            puzzleLeaveNumBlanks: 4,
            puzzleRevealSeconds: 1.5,
          },
        },
      },
    },
    {
      type: "level",
      hint: <>Planet with a storm greater in size than the earth</>,
      levelButtonCoords: {
        x: 36,
        y: 36,
      },
      level: {
        gameCategory: "Wingo",
        page: "/Wingo/Repeat",
        levelProps: {
          mode: "repeat",
          targetWord: "jupiter",
          gamemodeSettings: {
            ...commonWingoSettings,
            wordLength: 7,
          },
        },
      },
    },
    {
      type: "level",
      hint: <>Gravitationally bound collection of stars</>,
      levelButtonCoords: {
        x: 44,
        y: 44,
      },
      level: {
        gameCategory: "Wingo",
        page: "/Wingo/Repeat",
        levelProps: {
          mode: "repeat",
          targetWord: "galaxy",
          gamemodeSettings: {
            ...commonWingoSettings,
            wordLength: 6,
          },
        },
      },
    },
    {
      type: "level",
      hint: <>Planet of the sea</>,
      levelButtonCoords: {
        x: 52,
        y: 52,
      },
      level: {
        gameCategory: "Wingo",
        page: "/Wingo/Repeat",
        levelProps: {
          mode: "repeat",
          targetWord: "neptune",
          gamemodeSettings: {
            ...commonWingoSettings,
            wordLength: 7,
          },
        },
      },
    },
    {
      type: "level",
      hint: <>Outburst of energy from a star</>,
      levelButtonCoords: {
        x: 60,
        y: 60,
      },
      level: {
        gameCategory: "Wingo",
        page: "/Wingo/Puzzle",
        levelProps: {
          mode: "puzzle",
          targetWord: "flare",
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
      hint: <>Planet with icy rings</>,
      levelButtonCoords: {
        x: 76,
        y: 76,
      },
      level: {
        gameCategory: "Wingo",
        page: "/Wingo/Repeat",
        levelProps: {
          mode: "repeat",
          targetWord: "saturn",
          gamemodeSettings: {
            ...commonWingoSettings,
            wordLength: 6,
          },
        },
      },
    },
    {
      type: "level",
      hint: <>Radient emission</>,
      levelButtonCoords: {
        x: 82,
        y: 82,
      },
      level: {
        gameCategory: "Wingo",
        page: "/Wingo/Puzzle",
        levelProps: {
          mode: "puzzle",
          targetWord: "aurora",
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
      hint: <>Planet that spins on its side</>,
      levelButtonCoords: {
        x: 90,
        y: 90,
      },
      level: {
        gameCategory: "Wingo",
        page: "/Wingo/Repeat",
        levelProps: {
          mode: "repeat",
          targetWord: "uranus",
          gamemodeSettings: {
            ...commonWingoSettings,
            wordLength: 6,
          },
        },
      },
    },
    {
      type: "level",
      hint: <>Super heated gas</>,
      levelButtonCoords: {
        x: 10,
        y: 10,
      },
      level: {
        gameCategory: "Wingo",
        page: "/Wingo/Puzzle",
        levelProps: {
          mode: "puzzle",
          targetWord: "plasma",
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
  ],
};
