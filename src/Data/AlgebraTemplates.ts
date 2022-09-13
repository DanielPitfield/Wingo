import { AlgebraConfigProps } from "../Pages/Algebra";
import { shuffleArray } from "../Pages/ArithmeticDrag";
import { Difficulty } from "./DefaultGamemodeSettings";

/* All templates */
const AlgebraTemplates = {
  MediumSmall: {
    difficulty: "medium",
    inputs: [3, 7, 5, 8, 4, 2],
    questions: [
      {
        expression: "2d - (f x a) - c",
        answerType: "letter",
        correctAnswer: "c",
      },
      {
        expression: "(2c - e) + f",
        answerType: "letter",
        correctAnswer: "d",
      },
      {
        expression: "(b - e) x (f + a)",
        answerType: "number",
        correctAnswer: "15",
      },
      {
        expression: "(d + e) * (d + e)",
        answerType: "number",
        correctAnswer: "144",
      },
      {
        expression: "(c * 2a) - (b x e)",
        answerType: "letter",
        correctAnswer: "f",
      },
    ],
  } as AlgebraConfigProps,
};

export function getAlgebraTemplates(numTemplates: number, difficulty: Difficulty): AlgebraConfigProps[] {
  // Sets that have the specified difficulty
  const filteredAlgebraTemplates = Object.values(AlgebraTemplates).filter((algebraTemplate) => algebraTemplate.difficulty === difficulty);
  // Randomly select the required amount of sets
  return shuffleArray(filteredAlgebraTemplates).slice(0, numTemplates);
}
