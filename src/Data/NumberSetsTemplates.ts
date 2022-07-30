import { operators } from "../Pages/CountdownNumbersConfig";
import { randomIntFromInterval } from "../Pages/Nubble";
import { NumberSetConfigProps, NumberSetTemplate } from "../Pages/NumberSets";

// TODO: Examples and finding of operator are hardcoded
// TODO: The correctAnswer must be an integer

export function generateSet(): NumberSetConfigProps {
  // 10 small numbers to choose from
  const smallNumbers: number[] = Array.from({ length: 6 })
    .map((_) => randomIntFromInterval(2, 10))
    .sort((a, b) => b - a);

  /** All number sets */
  const sets = {
    Multiply: {
      difficulty: "easy",
      correctAnswerDescription: "Multiply left number by right number",
      examples: [
        {
          numbersLeft: [smallNumbers[0]],
          numbersRight: [smallNumbers[1]],
          correctAnswer: operators
            .find((operator) => operator.name === "×")
            ?.function(smallNumbers[0], smallNumbers[1]),
        } as NumberSetTemplate,
        {
          numbersLeft: [smallNumbers[2]],
          numbersRight: [smallNumbers[3]],
          correctAnswer: operators
            .find((operator) => operator.name === "×")
            ?.function(smallNumbers[2], smallNumbers[3]),
        } as NumberSetTemplate,
      ],
      question: {
        numbersLeft: [smallNumbers[4]],
        numbersRight: [smallNumbers[5]],
        correctAnswer: operators.find((operator) => operator.name === "×")?.function(smallNumbers[4], smallNumbers[5]),
      } as NumberSetTemplate,
    } as NumberSetConfigProps,

    Add: {
      difficulty: "easy",
      correctAnswerDescription: "Add the two numbers together",
      examples: [
        {
          numbersLeft: [smallNumbers[0]],
          numbersRight: [smallNumbers[1]],
          correctAnswer: operators
            .find((operator) => operator.name === "+")
            ?.function(smallNumbers[0], smallNumbers[1]),
        } as NumberSetTemplate,
        {
          numbersLeft: [smallNumbers[2]],
          numbersRight: [smallNumbers[3]],
          correctAnswer: operators
            .find((operator) => operator.name === "+")
            ?.function(smallNumbers[2], smallNumbers[3]),
        } as NumberSetTemplate,
      ],
      question: {
        numbersLeft: [smallNumbers[4]],
        numbersRight: [smallNumbers[5]],
        correctAnswer: operators.find((operator) => operator.name === "+")?.function(smallNumbers[4], smallNumbers[5]),
      } as NumberSetTemplate,
    } as NumberSetConfigProps,

    Minus: {
      difficulty: "easy",
      correctAnswerDescription: "Minus the two numbers together",
      examples: [
        {
          numbersLeft: [smallNumbers[0]],
          numbersRight: [smallNumbers[1]],
          correctAnswer: operators
            .find((operator) => operator.name === "-")
            ?.function(smallNumbers[0], smallNumbers[1]),
        } as NumberSetTemplate,
        {
          numbersLeft: [smallNumbers[2]],
          numbersRight: [smallNumbers[3]],
          correctAnswer: operators
            .find((operator) => operator.name === "-")
            ?.function(smallNumbers[2], smallNumbers[3]),
        } as NumberSetTemplate,
      ],
      question: {
        numbersLeft: [smallNumbers[4]],
        numbersRight: [smallNumbers[5]],
        correctAnswer: operators.find((operator) => operator.name === "-")?.function(smallNumbers[4], smallNumbers[5]),
      } as NumberSetTemplate,
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
        } as NumberSetTemplate,
        {
          numbersLeft: [smallNumbers[2] * smallNumbers[3]],
          numbersRight: [smallNumbers[3]],
          correctAnswer: operators
            .find((operator) => operator.name === "÷")
            ?.function(smallNumbers[2] * smallNumbers[3], smallNumbers[3]),
        } as NumberSetTemplate,
      ],
      question: {
        numbersLeft: [smallNumbers[4] * smallNumbers[5]],
        numbersRight: [smallNumbers[5]],
        correctAnswer: operators
          .find((operator) => operator.name === "÷")
          ?.function(smallNumbers[4] * smallNumbers[5], smallNumbers[5]),
      } as NumberSetTemplate,
    } as NumberSetConfigProps,
  };

  return { ...Object.values(sets)[Math.round(Math.random() * (Object.values(sets).length - 1))] };
}
