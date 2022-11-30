import { Difficulty } from "./DefaultGamemodeSettings";

export type AlgebraTemplate = {
  difficulty: Difficulty;
  inputs: number[];
  questions: AlgebraQuestion[];
};

export type AlgebraQuestion = {
  expression: string;
  answerType: answerType;
  correctAnswers: string[];
};

export type answerType = "letter" | "number" | "combination";

/* All templates */
export const AlgebraTemplates = {
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
