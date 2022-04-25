import { AlgebraConfigProps, QuestionTemplate } from "./Algebra";

/** All templates */
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
        correctAnswer: "15",
      } as QuestionTemplate,
      {
        expression: "(d + e) * (d + e)",
        answerType: "number",
        correctAnswer: "144",
      } as QuestionTemplate,
      {
        expression: "(c * 2a) - (b x e)",
        answerType: "letter",
        correctAnswer: "f",
      } as QuestionTemplate,
    ],
  } as AlgebraConfigProps,
};
