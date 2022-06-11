import { Puzzles } from "../../Puzzles/Puzzles";
import { Themes } from "../../Themes";
import { AreaConfig } from "../Area";

export const area: AreaConfig = {
  name: "Space",
  theme: Themes.Space,
  unlock_level: {
    type: "unlock-level",
    hint: <>Unlock this area</>,
    level: {
      gameCategory: "wingo",
      levelProps: {
        mode: "repeat",
        targetWord: "space",
        enforceFullLengthGuesses: true,
        defaultWordLength: 5,
        defaultnumGuesses: 6,
        gamemodeSettings: {
          firstLetterProvided: false,
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
      hint: <>Only known inhabitted planet</>,
      levelButtonCoords: {
        x: 5,
        y: 5,
      },
      level: {
        gameCategory: "wingo",
        levelProps: {
          mode: "repeat",
          targetWord: "earth",
          enforceFullLengthGuesses: true,
          defaultWordLength: 5,
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
      hint: <>Planet of men</>,
      levelButtonCoords: {
        x: 25,
        y: 5,
      },
      level: {
        gameCategory: "wingo",
        levelProps: {
          mode: "repeat",
          targetWord: "mars",
          enforceFullLengthGuesses: true,
          defaultWordLength: 4,
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
      hint: <>Path followed around a bigger object</>,
      levelButtonCoords: {
        x: 45,
        y: 6,
      },
      level: {
        gameCategory: "wingo",
        levelProps: {
          mode: "repeat",
          targetWord: "orbit",
          enforceFullLengthGuesses: true,
          defaultWordLength: 5,
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
      hint: <>Planet of women</>,
      levelButtonCoords: {
        x: 12,
        y: 12,
      },
      level: {
        gameCategory: "wingo",
        levelProps: {
          mode: "repeat",
          targetWord: "venus",
          enforceFullLengthGuesses: true,
          defaultWordLength: 5,
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
      hint: <>Planet sharing a name with a metal</>,
      levelButtonCoords: {
        x: 20,
        y: 20,
      },
      level: {
        gameCategory: "wingo",
        levelProps: {
          mode: "repeat",
          targetWord: "mercury",
          enforceFullLengthGuesses: true,
          defaultWordLength: 7,
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
      hint: <>Attractive force</>,
      levelButtonCoords: {
        x: 28,
        y: 28,
      },
      level: {
        gameCategory: "wingo",
        levelProps: {
          mode: "repeat",
          targetWord: "gravity",
          enforceFullLengthGuesses: true,
          defaultWordLength: 7,
          defaultnumGuesses: 6,
          gamemodeSettings: {
            firstLetterProvided: true,
            timer: { isTimed: false },
          },
          puzzleLeaveNumBlanks: 4,
          puzzleRevealMs: 1500,
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
        gameCategory: "wingo",
        levelProps: {
          mode: "repeat",
          targetWord: "jupiter",
          enforceFullLengthGuesses: true,
          defaultWordLength: 7,
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
      hint: <>Gravitationally bound collection of stars</>,
      levelButtonCoords: {
        x: 44,
        y: 44,
      },
      level: {
        gameCategory: "wingo",
        levelProps: {
          mode: "repeat",
          targetWord: "galaxy",
          enforceFullLengthGuesses: true,
          defaultWordLength: 6,
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
      hint: <>Planet of the sea</>,
      levelButtonCoords: {
        x: 52,
        y: 52,
      },
      level: {
        gameCategory: "wingo",
        levelProps: {
          mode: "repeat",
          targetWord: "neptune",
          enforceFullLengthGuesses: true,
          defaultWordLength: 7,
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
      hint: <>Outburst of energy from a star</>,
      levelButtonCoords: {
        x: 60,
        y: 60,
      },
      level: {
        gameCategory: "wingo",
        levelProps: {
          mode: "repeat",
          targetWord: "flare",
          enforceFullLengthGuesses: true,
          defaultWordLength: 5,
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
    {
      type: "level",
      hint: <>Planet with icy rings</>,
      levelButtonCoords: {
        x: 76,
        y: 76,
      },
      level: {
        gameCategory: "wingo",
        levelProps: {
          mode: "repeat",
          targetWord: "saturn",
          enforceFullLengthGuesses: true,
          defaultWordLength: 6,
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
      hint: <>Radient emission</>,
      levelButtonCoords: {
        x: 82,
        y: 82,
      },
      level: {
        gameCategory: "wingo",
        levelProps: {
          mode: "repeat",
          targetWord: "aurora",
          enforceFullLengthGuesses: true,
          defaultWordLength: 6,
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
      hint: <>Planet that spins on its side</>,
      levelButtonCoords: {
        x: 90,
        y: 90,
      },
      level: {
        gameCategory: "wingo",
        levelProps: {
          mode: "repeat",
          targetWord: "uranus",
          enforceFullLengthGuesses: true,
          defaultWordLength: 6,
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
      hint: <>Super heated gas</>,
      levelButtonCoords: {
        x: 10,
        y: 10,
      },
      level: {
        gameCategory: "wingo",
        levelProps: {
          mode: "repeat",
          targetWord: "plasma",
          enforceFullLengthGuesses: true,
          defaultWordLength: 6,
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
