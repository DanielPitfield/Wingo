const getScoreFromDifference = (difference: number, scoringMethod: "standard" | "pointLostPerDifference") => {
  // Is the difference between 0 and 10?
  const withinTen = difference >= 0 && difference <= 10;

  // If not within ten, zero score
  if (!withinTen) {
    return 0;
  }

  /* 
  10 points for reaching it exactly
  7 points for being 1–5 away
  5 points for being 6–10 away
  */
  if (scoringMethod === "standard") {
    const exactAnswer = difference === 0;
    const sevenPointRange = difference >= 1 && difference <= 5;

    if (exactAnswer) {
      return 10;
    }

    if (sevenPointRange) {
      return 7;
    }

    return 5;
  }

  if (scoringMethod === "pointLostPerDifference") {
    // Award one point for being 10 away
    if (difference === 10) {
      return 1;
    }

    // 10 points for exact answer (and one point is lost for each additional one difference after that)
    return 10 - difference;
  }
};

export function getNumbersGameScore(
  bestGuess: number | null,
  targetNumber: number | null,
  scoringMethod: "standard" | "pointLostPerDifference"
): { score: number | null; difference: number | null } {
  const noScore = { score: null, difference: null };

  if (!targetNumber) {
    return noScore;
  }

  if (bestGuess === null) {
    return noScore;
  }

  const difference = Math.abs(bestGuess - targetNumber);

  if (difference === null) {
    return noScore;
  }

  return { score: getScoreFromDifference(difference, scoringMethod) ?? 0, difference: difference };
}
