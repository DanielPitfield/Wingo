import { Difficulty } from "../Data/DefaultGamemodeSettings1";
import { NumberSetTemplate, NumberSetsTemplates } from "../Data/NumberSetsTemplates";
import { shuffleArray } from "./shuffleArray";

export function getNumberSetTemplates(numSets: number, difficulty: Difficulty): NumberSetTemplate[] {
  // Sets that have the specified difficulty
  const filteredNumberSets = Object.values(NumberSetsTemplates).filter(
    (numberSet) => numberSet.difficulty === difficulty
  );
  // Randomly select the required amount of sets
  return shuffleArray(filteredNumberSets).slice(0, numSets);
}
