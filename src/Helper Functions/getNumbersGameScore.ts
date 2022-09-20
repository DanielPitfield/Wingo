export function getNumbersGameScore(
  bestGuess: number | null,
  targetNumber: number | null,
  scoringMethod: "standard" | "pointLostPerDifference"
): { score: number | null; difference: number | null } {
    //TODO: Refactor
  if (!targetNumber) {
    return { score: null, difference: null };
  }

  if (bestGuess === null) {
    return { score: null, difference: null };
  }

  const difference = Math.abs(bestGuess - targetNumber);

  if (difference === null) {
    return { score: null, difference: null };
  }

  let score = 0;

  /* 
  Standard:
  10 points for reaching it exactly
  7 points for being 1–5 away
  5 points for being 6–10 away
  */

  if (scoringMethod === "standard") {
    const exactAnswer = difference === 0;
    const sevenPointRange = difference >= 1 && difference <= 5;
    const fivePointRange = difference >= 6 && difference <= 10;

    if (exactAnswer) {
      score = 10;
    } else if (sevenPointRange) {
      score = 7;
    } else if (fivePointRange) {
      score = 5;
    } else {
      score = 0;
    }
  } else if (scoringMethod === "pointLostPerDifference" && difference >= 0 && difference <= 10) {
    // Award one point for being 10 away
    if (difference === 10) {
      score = 1;
    }
    // 10 points for exact answer (and one point is lost for each additional one difference after that)
    else {
      score = 10 - difference;
    }
  } else {
    throw new Error("Unexpected NumbersGame scoring method");
  }

  return { score: score, difference: difference };
}
