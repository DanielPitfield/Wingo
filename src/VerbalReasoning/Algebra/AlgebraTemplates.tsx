import { operators } from "../../CountdownNumbers/CountdownNumbersConfig";
import { randomIntFromInterval } from "../../Nubble/Nubble";
import { AlegbraConfigProps, QuestionTemplate } from "./Algebra";

// 10 small numbers to choose from
let smallNumbers: number[] = Array.from({ length: 10 }).map((_) => randomIntFromInterval(2, 10));

// TODO: Sets won't ever change (determined once on launch)
// TODO: Examples and finding of operator are hardcoded
// TODO: The correctAnswer must be an integer

/** All number sets */
export const AlgebraTemplates = {
  EasySmall: {
    difficulty: "easy",
    inputs: [3, 7, 5, 8, 4, 2],
    questions: [
      {
        expression: "2d - (f x a) - c",
        answerType: "letter",
        correctAnswer: "c",
      } as QuestionTemplate,
      {
        expression: "(2c - e) + f",
        answerType: "letter",
        correctAnswer: "d",
      } as QuestionTemplate,
      {
        expression: "(b - e) x (f + a)",
        answerType: "number",
        correctAnswer: 15,
      } as QuestionTemplate,
      {
        expression: "(d + e) * (d + e)",
        answerType: "number",
        correctAnswer: 144,
      } as QuestionTemplate,
      {
        expression: "(c * 2a) - (b x e)",
        answerType: "letter",
        correctAnswer: "f",
      } as QuestionTemplate,
    ],
  } as AlegbraConfigProps,
};
