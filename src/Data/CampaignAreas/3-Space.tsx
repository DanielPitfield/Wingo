import { Themes } from "../Themes";
import { AreaConfig } from "../../Pages/Area";

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
        enforceFullLengthGuesses: true,
        defaultNumGuesses: 6,

        gamemodeSettings: {
          wordLength: 5,
          isFirstLetterProvided: false,
          puzzleLeaveNumBlanks: 0,
          puzzleRevealSeconds: 0,
          timerConfig: { isTimed: false },
        },
        checkInDictionary: false,
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
          enforceFullLengthGuesses: true,
          defaultNumGuesses: 6,
          gamemodeSettings: {
            wordLength: 5,
            isFirstLetterProvided: true,
            puzzleLeaveNumBlanks: 0,
            puzzleRevealSeconds: 0,
            timerConfig: { isTimed: false },
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
          enforceFullLengthGuesses: true,
          defaultNumGuesses: 6,
          gamemodeSettings: {
            wordLength: 4,
            isFirstLetterProvided: false,
            puzzleLeaveNumBlanks: 0,
            puzzleRevealSeconds: 0,
            timerConfig: { isTimed: false },
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
          enforceFullLengthGuesses: true,
          defaultNumGuesses: 6,
          gamemodeSettings: {
            wordLength: 5,
            isFirstLetterProvided: true,
            puzzleLeaveNumBlanks: 0,
            puzzleRevealSeconds: 0,
            timerConfig: { isTimed: false },
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
          enforceFullLengthGuesses: true,
          defaultNumGuesses: 6,
          gamemodeSettings: {
            wordLength: 5,
            isFirstLetterProvided: false,
            puzzleLeaveNumBlanks: 0,
            puzzleRevealSeconds: 0,
            timerConfig: { isTimed: false },
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
          enforceFullLengthGuesses: true,
          defaultNumGuesses: 6,
          gamemodeSettings: {
            wordLength: 7,
            isFirstLetterProvided: false,
            puzzleLeaveNumBlanks: 0,
            puzzleRevealSeconds: 0,
            timerConfig: { isTimed: false },
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
        page: "/Wingo/Repeat",
        levelProps: {
          mode: "repeat",
          targetWord: "gravity",
          enforceFullLengthGuesses: true,
          defaultNumGuesses: 6,
          gamemodeSettings: {
            wordLength: 7,
            isFirstLetterProvided: true,
            puzzleLeaveNumBlanks: 4,
            puzzleRevealSeconds: 1.5,
            timerConfig: { isTimed: false },
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
          enforceFullLengthGuesses: true,
          defaultNumGuesses: 6,
          gamemodeSettings: {
            wordLength: 7,
            isFirstLetterProvided: true,
            puzzleLeaveNumBlanks: 0,
            puzzleRevealSeconds: 0,
            timerConfig: { isTimed: false },
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
          enforceFullLengthGuesses: true,
          defaultNumGuesses: 6,
          gamemodeSettings: {
            wordLength: 6,
            isFirstLetterProvided: true,
            puzzleLeaveNumBlanks: 0,
            puzzleRevealSeconds: 0,
            timerConfig: { isTimed: false },
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
          enforceFullLengthGuesses: true,
          defaultNumGuesses: 6,
          gamemodeSettings: {
            wordLength: 7,
            isFirstLetterProvided: false,
            puzzleLeaveNumBlanks: 0,
            puzzleRevealSeconds: 0,
            timerConfig: { isTimed: false },
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
        page: "/Wingo/Repeat",
        levelProps: {
          mode: "repeat",
          targetWord: "flare",
          enforceFullLengthGuesses: true,
          defaultNumGuesses: 6,
          gamemodeSettings: {
            wordLength: 5,
            isFirstLetterProvided: false,
            puzzleLeaveNumBlanks: 3,
            puzzleRevealSeconds: 1.5,
            timerConfig: { isTimed: false },
          },
        },
      },
    },
    /*
    {
      type: "level",
      hint: null,
      levelButtonCoords: {
        x: 68,
        y: 68,
      },
      level: {
        gameCategory: "puzzle",
        levelProps: {
          ...Puzzles.Easy1IconHorizontallyAcrross,
        },
      },
    },
    */
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
          enforceFullLengthGuesses: true,
          defaultNumGuesses: 6,
          gamemodeSettings: {
            wordLength: 6,
            isFirstLetterProvided: false,
            puzzleLeaveNumBlanks: 0,
            puzzleRevealSeconds: 0,
            timerConfig: { isTimed: false },
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
        page: "/Wingo/Repeat",
        levelProps: {
          mode: "repeat",
          targetWord: "aurora",
          enforceFullLengthGuesses: true,
          defaultNumGuesses: 6,
          gamemodeSettings: {
            wordLength: 6,
            isFirstLetterProvided: false,
            puzzleLeaveNumBlanks: 3,
            puzzleRevealSeconds: 1.5,
            timerConfig: { isTimed: false },
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
          enforceFullLengthGuesses: true,
          defaultNumGuesses: 6,
          gamemodeSettings: {
            wordLength: 6,
            isFirstLetterProvided: false,
            puzzleLeaveNumBlanks: 0,
            puzzleRevealSeconds: 0,
            timerConfig: { isTimed: false },
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
        page: "/Wingo/Repeat",
        levelProps: {
          mode: "repeat",
          targetWord: "plasma",
          enforceFullLengthGuesses: true,
          defaultNumGuesses: 7,
          gamemodeSettings: {
            wordLength: 6,
            isFirstLetterProvided: true,
            puzzleLeaveNumBlanks: 3,
            puzzleRevealSeconds: 1.5,
            timerConfig: { isTimed: false },
          },
        },
      },
    },
  ],
};
