import { Themes } from "../../Themes";
import { AreaConfig } from "../Area";

export const area: AreaConfig = {
  name: "Space",
  theme: Themes.Space,
  unlock_level: {
    hint: <>Unlock this area</>,
    isUnlockLevel: true,
    levelProps: {
      mode: "repeat",
      targetWord: "space",
      enforceFullLengthGuesses: true,
      defaultWordLength: 5,
      defaultnumGuesses: 6,
      keyboard: true,
      firstLetterProvided: false,
      checkInDictionary: false,
      puzzleLeaveNumBlanks: 0,
      puzzleRevealMs: 0,
      timerConfig: { isTimed: false },
    },
  },

  levels: [
    {
      hint: <>Only known inhabitted planet</>,
      levelProps: {
        mode: "repeat",
        targetWord: "earth",
        enforceFullLengthGuesses: true,
        defaultWordLength: 5,
        defaultnumGuesses: 6,
        keyboard: true,
        firstLetterProvided: true,
        puzzleLeaveNumBlanks: 0,
        puzzleRevealMs: 0,
        timerConfig: { isTimed: false },
      },
    },
    {
      hint: <>Planet of men</>,
      levelProps: {
        mode: "repeat",
        targetWord: "mars",
        enforceFullLengthGuesses: true,
        defaultWordLength: 4,
        defaultnumGuesses: 6,
        keyboard: true,
        firstLetterProvided: false,
        puzzleLeaveNumBlanks: 0,
        puzzleRevealMs: 0,
        timerConfig: { isTimed: false },
      },
    },
    {
      hint: <>Path followed around a bigger object</>,
      levelProps: {
        mode: "repeat",
        targetWord: "orbit",
        enforceFullLengthGuesses: true,
        defaultWordLength: 5,
        defaultnumGuesses: 6,
        keyboard: true,
        firstLetterProvided: true,
        puzzleLeaveNumBlanks: 0,
        puzzleRevealMs: 0,
        timerConfig: { isTimed: false },
      },
    },
    {
      hint: <>Planet of women</>,
      levelProps: {
        mode: "repeat",
        targetWord: "venus",
        enforceFullLengthGuesses: true,
        defaultWordLength: 5,
        defaultnumGuesses: 6,
        keyboard: true,
        firstLetterProvided: false,
        puzzleLeaveNumBlanks: 0,
        puzzleRevealMs: 0,
        timerConfig: { isTimed: false },
      },
    },
    {
      hint: <>Planet sharing a name with a metal</>,
      levelProps: {
        mode: "repeat",
        targetWord: "mercury",
        enforceFullLengthGuesses: true,
        defaultWordLength: 5,
        defaultnumGuesses: 6,
        keyboard: true,
        firstLetterProvided: false,
        puzzleLeaveNumBlanks: 0,
        puzzleRevealMs: 0,
        timerConfig: { isTimed: false },
      },
    },
    {
      hint: <>Attractive force</>,
      levelProps: {
        mode: "repeat",
        targetWord: "gravity",
        enforceFullLengthGuesses: true,
        defaultWordLength: 7,
        defaultnumGuesses: 6,
        keyboard: true,
        firstLetterProvided: true,
        puzzleLeaveNumBlanks: 4,
        puzzleRevealMs: 1500,
        timerConfig: { isTimed: false },
      },
    },
    {
      hint: <>Planet with a storm greater in size than the earth</>,
      levelProps: {
        mode: "repeat",
        targetWord: "jupiter",
        enforceFullLengthGuesses: true,
        defaultWordLength: 7,
        defaultnumGuesses: 6,
        keyboard: true,
        firstLetterProvided: true,
        puzzleLeaveNumBlanks: 0,
        puzzleRevealMs: 0,
        timerConfig: { isTimed: false },
      },
    },
    {
      hint: <>Gravitationally bound collection of stars</>,
      levelProps: {
        mode: "repeat",
        targetWord: "galaxy",
        enforceFullLengthGuesses: true,
        defaultWordLength: 6,
        defaultnumGuesses: 6,
        keyboard: true,
        firstLetterProvided: true,
        puzzleLeaveNumBlanks: 0,
        puzzleRevealMs: 0,
        timerConfig: { isTimed: false },
      },
    },
    {
      hint: <>Planet of the sea</>,
      levelProps: {
        mode: "repeat",
        targetWord: "neptune",
        enforceFullLengthGuesses: true,
        defaultWordLength: 7,
        defaultnumGuesses: 6,
        keyboard: true,
        firstLetterProvided: false,
        puzzleLeaveNumBlanks: 0,
        puzzleRevealMs: 0,
        timerConfig: { isTimed: false },
      },
    },
    {
      hint: <>Outburst of energy from a star</>,
      levelProps: {
        mode: "repeat",
        targetWord: "flare",
        enforceFullLengthGuesses: true,
        defaultWordLength: 5,
        defaultnumGuesses: 6,
        keyboard: true,
        firstLetterProvided: false,
        puzzleLeaveNumBlanks: 3,
        puzzleRevealMs: 1500,
        timerConfig: { isTimed: false },
      },
    },
    {
      hint: <>Planet with icy rings</>,
      levelProps: {
        mode: "repeat",
        targetWord: "saturn",
        enforceFullLengthGuesses: true,
        defaultWordLength: 6,
        defaultnumGuesses: 6,
        keyboard: true,
        firstLetterProvided: false,
        puzzleLeaveNumBlanks: 0,
        puzzleRevealMs: 0,
        timerConfig: { isTimed: false },
      },
    },
    {
      hint: <>Radient emission</>,
      levelProps: {
        mode: "repeat",
        targetWord: "aurora",
        enforceFullLengthGuesses: true,
        defaultWordLength: 6,
        defaultnumGuesses: 6,
        keyboard: true,
        firstLetterProvided: false,
        puzzleLeaveNumBlanks: 3,
        puzzleRevealMs: 1500,
        timerConfig: { isTimed: false },
      },
    },
    {
      hint: <>Planet that spins on its side</>,
      levelProps: {
        mode: "repeat",
        targetWord: "uranus",
        enforceFullLengthGuesses: true,
        defaultWordLength: 6,
        defaultnumGuesses: 6,
        keyboard: true,
        firstLetterProvided: false,
        puzzleLeaveNumBlanks: 0,
        puzzleRevealMs: 0,
        timerConfig: { isTimed: false },
      },
    },
    {
      hint: <>Super heated gas</>,
      levelProps: {
        mode: "repeat",
        targetWord: "plasma",
        enforceFullLengthGuesses: true,
        defaultWordLength: 6,
        defaultnumGuesses: 7,
        keyboard: true,
        firstLetterProvided: true,
        puzzleLeaveNumBlanks: 3,
        puzzleRevealMs: 1500,
        timerConfig: { isTimed: false },
      },
    },
  ],
};
