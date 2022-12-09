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

export const AlgebraTemplates: AlgebraTemplate[] = [
  {
    difficulty: "easy",
    inputs: [1, 2, 3, 4, 5, 6],
    questions: [
      {
        expression: "2a + c + e",
        answerType: "number",
        correctAnswers: ["10"],
      },
      {
        expression: "2b * c",
        answerType: "number",
        correctAnswers: ["12"],
      },
      {
        expression: "2e * 3b ",
        answerType: "number",
        correctAnswers: ["60"],
      },
    ],
  },

  {
    difficulty: "easy",
    inputs: [2, 4, 6, 8, 10, 12],
    questions: [
      {
        expression: "b * a",
        answerType: "letter",
        correctAnswers: ["d"],
      },
      {
        expression: "4f / b ",
        answerType: "letter",
        correctAnswers: ["f"],
      },
      {
        expression: "2e - 2d",
        answerType: "letter",
        correctAnswers: ["b"],
      },
    ],
  },
  {
    difficulty: "medium",
    inputs: [1, 2, 3, 4, 5, 6],
    questions: [
      {
        expression: "2f - (b x c)",
        answerType: "combination",
        correctAnswers: ["6A", "3B", "2C", "f"],
      },
    ],
  },
  {
    difficulty: "medium",
    inputs: [10, 15, 20, 25, 30, 35],
    questions: [
      {
        expression: "c * c",
        answerType: "number",
        correctAnswers: ["400"],
      },
      {
        expression: "(f - a) * a",
        answerType: "number",
        correctAnswers: ["250"],
      },
      {
        expression: "(2a + 2c + 2e) * a",
        answerType: "number",
        correctAnswers: ["1500"],
      },
    ],
  },
  {
    difficulty: "hard",
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
  },
  {
    difficulty: "hard",
    inputs: [13, 27, 9],
    questions: [
      {
        expression: "((b / c) * a) + 9a",
        answerType: "combination",
        correctAnswers: ["12A"],
      },
    ],
  },
];
