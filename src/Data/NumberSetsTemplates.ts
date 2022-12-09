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
      correctAnswer: smallNumbers[4] - smallNumbers[5],
    },
  },

  {
    difficulty: "medium",
    correctAnswerDescription: "Double the first, add the second",
    examples: [
      {
        numbersLeft: [mediumNumbers[0]],
        numbersRight: [mediumNumbers[1]],
        correctAnswer: mediumNumbers[0] * 2 + mediumNumbers[1],
      },
      {
        numbersLeft: [mediumNumbers[2]],
        numbersRight: [mediumNumbers[3]],
        correctAnswer: mediumNumbers[2] * 2 + mediumNumbers[3],
      },
    ],
    question: {
      numbersLeft: [mediumNumbers[4]],
      numbersRight: [mediumNumbers[5]],
      correctAnswer: mediumNumbers[4] * 2 + mediumNumbers[5],
    },
  },

  {
    difficulty: "medium",
    correctAnswerDescription: "Multiply first by double the second",
    examples: [
      {
        numbersLeft: [mediumNumbers[7]],
        numbersRight: [smallNumbers[3]],
        correctAnswer: mediumNumbers[7] * (smallNumbers[3] * 2),
      },
      {
        numbersLeft: [mediumNumbers[2]],
        numbersRight: [smallNumbers[5]],
        correctAnswer: mediumNumbers[2] * (smallNumbers[5] * 2),
      },
    ],
    question: {
      numbersLeft: [mediumNumbers[4]],
      numbersRight: [smallNumbers[1]],
      correctAnswer: mediumNumbers[4] * (smallNumbers[1] * 2),
    },
  },

  {
    difficulty: "hard",
    correctAnswerDescription: "Product of left multiplied by by product of right",
    examples: [
      {
        numbersLeft: [smallNumbers[2], smallNumbers[3]],
        numbersRight: [smallNumbers[5], smallNumbers[6]],
        correctAnswer: smallNumbers[2] * smallNumbers[3] * (smallNumbers[5] * smallNumbers[6]),
      },
      {
        numbersLeft: [smallNumbers[6], smallNumbers[7]],
        numbersRight: [smallNumbers[8], smallNumbers[9]],
        correctAnswer: smallNumbers[6] * smallNumbers[7] * (smallNumbers[8] * smallNumbers[9]),
      },
    ],
    question: {
      numbersLeft: [smallNumbers[4], smallNumbers[5]],
      numbersRight: [smallNumbers[1], smallNumbers[9]],
      correctAnswer: smallNumbers[4] * smallNumbers[5] * (smallNumbers[1] * smallNumbers[9]),
    },
  },

  {
    difficulty: "hard",
    correctAnswerDescription: "Inner of each side added together * outside of each side added together",
    examples: [
      {
        numbersLeft: [smallNumbers[7], smallNumbers[2]],
        numbersRight: [smallNumbers[5], smallNumbers[4]],
        correctAnswer: (smallNumbers[2] + smallNumbers[5]) * (smallNumbers[7] + smallNumbers[4]),
      },
      {
        numbersLeft: [smallNumbers[3], smallNumbers[2]],
        numbersRight: [smallNumbers[3], smallNumbers[5]],
        correctAnswer: smallNumbers[2] + smallNumbers[3] * (smallNumbers[3] + smallNumbers[5]),
      },
    ],
    question: {
      numbersLeft: [smallNumbers[4], smallNumbers[6]],
      numbersRight: [smallNumbers[5], smallNumbers[9]],
      correctAnswer: (smallNumbers[6] + smallNumbers[5]) + (smallNumbers[4] + smallNumbers[9]),
    },
  },
];
