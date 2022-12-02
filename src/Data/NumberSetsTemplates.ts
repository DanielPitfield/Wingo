import { getRandomIntFromRange } from "../Helpers/getRandomIntFromRange";
import { Difficulty } from "./DefaultGamemodeSettings";
import { operators } from "./Operators";

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

// TODO: Examples and finding of operator are hardcoded

const smallNumbers: number[] = Array.from({ length: 10 }).map((_) => getRandomIntFromRange(2, 10));

/* All number sets */
export const NumberSetsTemplates = {
  Multiply: {
    difficulty: "easy",
    correctAnswerDescription: "Multiply left number by right number",
    examples: [
      {
        numbersLeft: [smallNumbers[0]],
        numbersRight: [smallNumbers[1]],
        correctAnswer: operators.find((operator) => operator.name === "×")?.function(smallNumbers[0], smallNumbers[1]),
      },
      {
        numbersLeft: [smallNumbers[2]],
        numbersRight: [smallNumbers[3]],
        correctAnswer: operators.find((operator) => operator.name === "×")?.function(smallNumbers[2], smallNumbers[3]),
      },
    ],
    question: {
      numbersLeft: [smallNumbers[4]],
      numbersRight: [smallNumbers[5]],
      correctAnswer: operators.find((operator) => operator.name === "×")?.function(smallNumbers[4], smallNumbers[5]),
    },
  } as NumberSetTemplate,

  Add: {
    difficulty: "easy",
    correctAnswerDescription: "Add the two numbers together",
    examples: [
      {
        numbersLeft: [smallNumbers[0]],
        numbersRight: [smallNumbers[1]],
        correctAnswer: operators.find((operator) => operator.name === "+")?.function(smallNumbers[0], smallNumbers[1]),
      },
      {
        numbersLeft: [smallNumbers[2]],
        numbersRight: [smallNumbers[3]],
        correctAnswer: operators.find((operator) => operator.name === "+")?.function(smallNumbers[2], smallNumbers[3]),
      },
    ],
    question: {
      numbersLeft: [smallNumbers[4]],
      numbersRight: [smallNumbers[5]],
      correctAnswer: operators.find((operator) => operator.name === "+")?.function(smallNumbers[4], smallNumbers[5]),
    },
  } as NumberSetTemplate,

  Minus: {
    difficulty: "easy",
    correctAnswerDescription: "Minus the two numbers together",
    examples: [
      {
        numbersLeft: [smallNumbers[0]],
        numbersRight: [smallNumbers[1]],
        correctAnswer: operators.find((operator) => operator.name === "-")?.function(smallNumbers[0], smallNumbers[1]),
      },
      {
        numbersLeft: [smallNumbers[2]],
        numbersRight: [smallNumbers[3]],
        correctAnswer: operators.find((operator) => operator.name === "-")?.function(smallNumbers[2], smallNumbers[3]),
      },
    ],
    question: {
      numbersLeft: [smallNumbers[4]],
      numbersRight: [smallNumbers[5]],
      correctAnswer: operators.find((operator) => operator.name === "-")?.function(smallNumbers[4], smallNumbers[5]),
    },
  } as NumberSetTemplate,
};
