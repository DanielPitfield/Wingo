import { getAllWordsOfLength } from "./getWordsOfLength";
import { getRandomElementFrom } from "./getRandomElementFrom";
import { isAnagram } from "./isAnagram";

/*
The Conundrum is designed to have only one solution,
But on occasion more than one valid word is found by happenstance,
(e.g. MISS AT TEE can become both ESTIMATES and STEAMIEST)
If this happens, any of these results is accepted.
*/

export function getConundrum() {
  /*
  Combinations of word lengths that could make up a conundrum
  There are probably more combinations, but these should make the best conundrums
  */

  const wordLengthCombinations = [
    [6, 3],
    [3, 6],
    [5, 4],
    [4, 5],
    [3, 3, 3],
    [4, 2, 3],
    [3, 2, 4],
  ];

  const MAX_ATTEMPTS_PER_COMBINATON = 100;
  const MAX_NUM_ANAGRAMS = 3;

  // Get a random word length combination
  let wordLengthCombination = getRandomElementFrom(wordLengthCombinations);

  let failCount = 0;
  let conundrum;

  // Loop until a conundrum is found
  while (conundrum === undefined && failCount < MAX_ATTEMPTS_PER_COMBINATON) {
    let constructedWord = "";

    for (const wordLength of wordLengthCombination) {
      // Get all words of  wordLength (can be from either guessable or target)
      const wordArray = getAllWordsOfLength(wordLength);
      // Find a word of the wordLength
      const word = getRandomElementFrom(wordArray) ?? "";
      // Append the word to constructedWord
      constructedWord += word;
    }

    // Expected length of the conundrum (sum of the lengths from the wordLength combination)
    const conundrumLength = wordLengthCombination.reduce((a: number, b: number) => a + b, 0);

    if (conundrumLength > 0 && constructedWord.length === conundrumLength) {
      // Find words which are anagrams of constructedWord
      const anagrams = getAllWordsOfLength(conundrumLength).filter((word) => isAnagram(constructedWord, word));

      // Very few number of anagrams
      if (anagrams.length >= 1 && anagrams.length <= MAX_NUM_ANAGRAMS) {
        conundrum = { conundrum: constructedWord, answer: getRandomElementFrom(anagrams) };
        return conundrum;
      }
    }

    // Failed to find conundrum
    failCount += 1;

    if (failCount === MAX_ATTEMPTS_PER_COMBINATON) {
      // Try a different wordLengthCombination
      wordLengthCombination = getRandomElementFrom(wordLengthCombinations);
      failCount = 0;
    }
  }
}
