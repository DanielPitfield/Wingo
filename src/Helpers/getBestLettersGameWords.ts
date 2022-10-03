import { getAllWordsOfLength } from "./getWordsOfLength";
import { isLettersGameGuessValid } from "./isLettersGameGuessValid";
import { shuffleArray } from "./shuffleArray";

export function getBestLettersGameWords(selectionWord: string) {
  // How many of the longest possible words should be shown?
  const NUM_BEST_WORDS = 5;

  // Array to store best words that are found
  let bestWords: string[] = [];

  // Start with bigger words first
  for (let wordLength = selectionWord.length; wordLength >= 4; wordLength--) {
    // The words which can be made with the selected letters
    const validWords: string[] = getAllWordsOfLength(wordLength).filter((word) =>
      isLettersGameGuessValid(word, selectionWord)
    );

    // Add these words to array
    bestWords = bestWords.concat(validWords);

    // Stop loop when enough words have been found
    if (bestWords.length >= NUM_BEST_WORDS) {
      break;
    }
  }

  return shuffleArray(bestWords).slice(0, NUM_BEST_WORDS);
}
