export function getNumNewLimitlessLives(
  remainingGuesses: number,
  wordIndex: number,
  maxLivesConfig: { isLimited: true; maxLives: number } | { isLimited: false }
): number {
  // Calculate the number of rows not used
  const extraRows = remainingGuesses - (wordIndex + 1);

  // Not limited, the number of new lives is not capped
  if (!maxLivesConfig.isLimited) {
    return extraRows;
  }

  // Limited, the number of new lives (but capped at the max value)
  return Math.min(extraRows, maxLivesConfig.maxLives);
}
