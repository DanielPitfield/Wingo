import { operators } from "../Data/Operators";
import { Guess } from "../Pages/NumbersGameConfig";

export function getNumbersGameGuessTotal(guess: Guess): number | null {
  if (!guess) {
    return null;
  }

  const operator = operators.find((x) => x.name === guess.operator);

  if (!operator) {
    return null;
  }

  // Either operand is missing, show nothing
  if (guess.operand1 === null || guess.operand2 === null) {
    return null;
  }

  const result = operator.function(guess.operand1, guess.operand2);

  // If the result is not generated correctly
  if (!result) {
    return null;
  }

  // If the result is fractional
  if (result !== Math.round(result)) {
    return null;
  }

  // If the result is negative or zero
  if (result <= 0) {
    return null;
  }

  return result;
}
