import { AlgebraTemplate, AlgebraTemplates } from "../Data/AlgebraTemplates";
import { Difficulty } from "../Data/DefaultGamemodeSettings";
import { shuffleArray } from "./shuffleArray";

export function getAlgebraTemplates(numTemplates: number, difficulty: Difficulty): AlgebraTemplate[] {
  // Templates that have the specified difficulty
  const filteredAlgebraTemplates = Object.values(AlgebraTemplates).filter(
    (algebraTemplate) => algebraTemplate.difficulty === difficulty
  );
  // Randomly select the required amount of templates
  return shuffleArray(filteredAlgebraTemplates).slice(0, numTemplates);
}
