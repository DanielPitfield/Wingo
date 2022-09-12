import { operators } from "../Pages/NumbersGameConfig";
import { randomIntFromInterval } from "../Pages/Numble";
import { NumberSetConfigProps, NumberSetTemplate } from "../Pages/NumberSets";
import { Difficulty } from "./DefaultGamemodeSettings";
import { shuffleArray } from "../Pages/ArithmeticDrag";

// TODO: Examples and finding of operator are hardcoded
// TODO: The correctAnswer must be an integer

const smallNumbers: number[] = Array.from({ length: 10 }).map((_) => randomIntFromInterval(2, 10));

/* All number sets */
const sets = {
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
    ] as NumberSetTemplate[],
    question: {
      numbersLeft: [smallNumbers[4]],
      numbersRight: [smallNumbers[5]],
      correctAnswer: operators.find((operator) => operator.name === "×")?.function(smallNumbers[4], smallNumbers[5]),
    },
  } as NumberSetConfigProps,

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
  } as NumberSetConfigProps,

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
  } as NumberSetConfigProps,

  Divide: {
    difficulty: "easy",
    correctAnswerDescription: "Divide the two numbers together",
    examples: [
      {
        numbersLeft: [smallNumbers[0] * smallNumbers[1]],
        numbersRight: [smallNumbers[1]],
        correctAnswer: operators
          .find((operator) => operator.name === "÷")
          ?.function(smallNumbers[0] * smallNumbers[1], smallNumbers[1]),
      },
      {
        numbersLeft: [smallNumbers[2] * smallNumbers[3]],
        numbersRight: [smallNumbers[3]],
        correctAnswer: operators
          .find((operator) => operator.name === "÷")
          ?.function(smallNumbers[2] * smallNumbers[3], smallNumbers[3]),
      },
    ],
    question: {
      numbersLeft: [smallNumbers[4] * smallNumbers[5]],
      numbersRight: [smallNumbers[5]],
      correctAnswer: operators
        .find((operator) => operator.name === "÷")
        ?.function(smallNumbers[4] * smallNumbers[5], smallNumbers[5]),
    },
  } as NumberSetConfigProps,
};

export function getNumberSets(numSets: number, difficulty: Difficulty): NumberSetConfigProps[] {
  // Sets that have the specified difficulty
  const filteredNumberSets = Object.values(sets).filter((numberSet) => numberSet.difficulty === difficulty);
  // Randomly select the required amount of sets
  return shuffleArray(filteredNumberSets).slice(0, numSets);
}
