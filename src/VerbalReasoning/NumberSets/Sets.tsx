import { operators } from "../../CountdownNumbers/CountdownNumbersConfig";
import { randomIntFromInterval } from "../../Nubble/Nubble";
import { NumberSetConfigProps, NumberSetTemplate } from "./NumberSets";

// 10 small numbers to choose from
let smallNumbers: number[] = Array.from({ length: 10 }).map((_) => randomIntFromInterval(2, 10));

/** All number sets */
export const Sets = {
  Multiply: {
    difficulty: "easy",
    correctAnswerDescription: "Multiply left number by right number",
    examples: [
      {
        numbersLeft: [smallNumbers[0]],
        numbersRight: [smallNumbers[1]],
        correctAnswer: operators.find(operator => operator.name === "×")?.function(smallNumbers[0], smallNumbers[1]),
      } as NumberSetTemplate,
      {
        numbersLeft: [smallNumbers[2]],
        numbersRight: [smallNumbers[3]],
        correctAnswer: operators.find(operator => operator.name === "×")?.function(smallNumbers[2], smallNumbers[3]),
      } as NumberSetTemplate
    ],
    question: {
      numbersLeft: [smallNumbers[4]],
      numbersRight: [smallNumbers[5]],
      correctAnswer: operators.find(operator => operator.name === "×")?.function(smallNumbers[4], smallNumbers[5]),
    } as NumberSetTemplate
  } as NumberSetConfigProps,

  Add: {
    difficulty: "easy",
    correctAnswerDescription: "Add the two numbers together",
    examples: [
      {
        numbersLeft: [smallNumbers[0]],
        numbersRight: [smallNumbers[1]],
        correctAnswer: operators.find(operator => operator.name === "+")?.function(smallNumbers[0], smallNumbers[1]),
      } as NumberSetTemplate,
      {
        numbersLeft: [smallNumbers[2]],
        numbersRight: [smallNumbers[3]],
        correctAnswer: operators.find(operator => operator.name === "+")?.function(smallNumbers[2], smallNumbers[3]),
      } as NumberSetTemplate
    ],
    question: {
      numbersLeft: [smallNumbers[4]],
      numbersRight: [smallNumbers[5]],
      correctAnswer: operators.find(operator => operator.name === "+")?.function(smallNumbers[4], smallNumbers[5]),
    } as NumberSetTemplate
  } as NumberSetConfigProps,
};
