export function isLettersGameGuessValid(guessedWord: string, selectionWord: string) {
  if (!selectionWord || !guessedWord) {
    return false;
  }

  const validLetters = selectionWord.split("");
  const guessedWordLetters = guessedWord.split("");

  // For every letter in the guess
  return guessedWordLetters.every((attemptedLetter) => {
    // The letter must be one of the letters allowed (within validLetters)
    const letterIndex = validLetters.indexOf(attemptedLetter);
    if (letterIndex > -1) {
      // Delete the letter from validLetters (so that the same letter can't be used more than once)
      validLetters.splice(letterIndex, 1);
      return true;
    } else {
      return false;
    }
  });
}
