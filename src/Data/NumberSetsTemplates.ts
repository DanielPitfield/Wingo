import { getRandomIntFromRange } from "../Helpers/getRandomIntFromRange";
import { Difficulty } from "./DefaultGamemodeSettings";

/** Config for a specific number set (exported for config from campaign) */
export type NumberSetTemplate = {
  difficulty: Difficulty;
  correctAnswerDescription: string;
  examples: NumberSetQuestion[];
  question: NumberSetQuestion;
};

/** Config for a specific number set (exported for config from campaign) */
export type NumberSetQuestion = {
  numbersLeft: number[];
  numbersRight: number[];
  correctAnswer: number;
};

const smallNumbers: number[] = Array.from({ length: 10 }).map((_) => getRandomIntFromRange(2, 10));
const mediumNumbers: number[] = Array.from({ length: 10 }).map((_) => getRandomIntFromRange(10, 50));
const largeNumbers: number[] = Array.from({ length: 10 }).map((_) => getRandomIntFromRange(50, 250));

export const NumberSetsTemplates: NumberSetTemplate[] = [
  {
    difficulty: "easy",
    correctAnswerDescription: "Multiply left number by right number",
    examples: [
      {
        numbersLeft: [smallNumbers[0]],
        numbersRight: [smallNumbers[1]],
        correctAnswer: smallNumbers[0] * smallNumbers[1],
      },
      {
        numbersLeft: [smallNumbers[2]],
        numbersRight: [smallNumbers[3]],
        correctAnswer: smallNumbers[2] * smallNumbers[3],
      },
    ],
    question: {
      numbersLeft: [smallNumbers[4]],
      numbersRight: [smallNumbers[5]],
      correctAnswer: smallNumbers[4] * smallNumbers[5],
    },
  },

  {
    difficulty: "easy",
    correctAnswerDescription: "Add the two numbers together",
    examples: [
      {
        numbersLeft: [smallNumbers[0]],
        numbersRight: [smallNumbers[1]],
        correctAnswer: smallNumbers[0] + smallNumbers[1],
      },
      {
        numbersLeft: [smallNumbers[2]],
        numbersRight: [smallNumbers[3]],
        correctAnswer: smallNumbers[2] + smallNumbers[3],
      },
    ],
    question: {
      numbersLeft: [smallNumbers[4]],
      numbersRight: [smallNumbers[5]],
      correctAnswer: smallNumbers[4] + smallNumbers[5],
    },
  },

  {
    difficulty: "easy",
    correctAnswerDescription: "Minus the two numbers together",
    examples: [
      {
        numbersLeft: [smallNumbers[0]],
        numbersRight: [smallNumbers[1]],
        correctAnswer: smallNumbers[0] - smallNumbers[1],
      },
      {
        numbersLeft: [smallNumbers[2]],
        numbersRight: [smallNumbers[3]],
        correctAnswer: smallNumbers[2] - smallNumbers[3],
      },
    ],
    question: {
      numbersLeft: [smallNumbers[4]],
      numbersRight: [smallNumbers[5]],
      correctAnswer:  smallNumbers[4] - smallNumbers[5],
    },
  },
];
