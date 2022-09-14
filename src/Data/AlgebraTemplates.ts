import { Difficulty } from "./DefaultGamemodeSettings";
import { shuffleArray } from "./shuffleArray";

export type AlgebraTemplate = {
  difficulty: Difficulty;
  inputs: number[];
  questions: QuestionTemplate[];
};

export type QuestionTemplate = {
  expression: string;
  answerType: answerType;
  correctAnswers: string[];
};

export type answerType = "letter" | "number" | "combination";

/* TODO: Difficulty mechanics
  Can only use some of the letters (some are not included with the keyboard) with the combination answerType?
  Add buttons to include operators in guess (and make an expression answerType)
  Expression provided as an answer must meet minimum/maximum length requirements?
*/

/* All templates */
const AlgebraTemplates = {
  SmallEasy1: {
    difficulty: "easy",
    inputs: [3, 7, 5, 8, 4, 2],
    questions: [
      {
        expression: "2d - (f x a) - c",
        answerType: "letter",
        correctAnswers: ["c"],
      },
      {
        expression: "(2c - e) + f",
        answerType: "letter",
        correctAnswers: ["d"],
      },
      {
        expression: "(b - e) x (f + a)",
        answerType: "number",
        correctAnswers: ["15"],
      },
      {
        expression: "(d + e) * (d + e)",
        answerType: "number",
        correctAnswers: ["144"],
      },
      {
        expression: "(c * 2a) - (b x e)",
        answerType: "letter",
        correctAnswers: ["f"],
      },
    ],
  } as AlgebraTemplate,
  expression1: {
    difficulty: "easy",
    inputs: [1, 2, 3, 4, 5, 6],
    questions: [
      {
        expression: "2f - (b x c)",
        answerType: "combination",
        correctAnswers: ["6A", "3B", "2C", "f"],
      },
    ],
  } as AlgebraTemplate,
};

export function getAlgebraTemplates(numTemplates: number, difficulty: Difficulty): AlgebraTemplate[] {
  // Sets that have the specified difficulty
  const filteredAlgebraTemplates = Object.values(AlgebraTemplates).filter(
    (algebraTemplate) => algebraTemplate.difficulty === difficulty
  );
  // Randomly select the required amount of sets
  return shuffleArray(filteredAlgebraTemplates).slice(0, numTemplates);
}
