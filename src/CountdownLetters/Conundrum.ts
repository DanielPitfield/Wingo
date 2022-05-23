import { words_nine_targets } from "../WordArrays/Lengths/words_9";
import { wordLengthMappingsTargets } from "../WordleConfig";

export function checkAnagram(constructedWord: string, targetWord: string) {
  var constructedWordLetters = constructedWord.split("").sort().join("");
  var targetWordLetters = targetWord.split("").sort().join("");

  return constructedWordLetters === targetWordLetters;
}

export function generateConundrum() {
  /*
  Combinations of word lengths that could make up a 9 letter conundrum
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
  // Get a random word length combination
  let wordLengthCombination = wordLengthCombinations[Math.round(Math.random() * (wordLengthCombinations.length - 1))];

  let conundrum;

  let failCount = 0;
  const MAX_FAIL_COUNT = 100;

  // Loop until a conundrum is found
  while (conundrum === undefined && failCount < MAX_FAIL_COUNT) {
    let constructedWord = "";

    for (const wordLength of wordLengthCombination) {
      const wordArray = wordLengthMappingsTargets.find((mapping) => mapping.value === wordLength)?.array;
      if (!wordArray) {
        break;
      }

      // Find a word of the wordLength
      const word = wordArray[Math.round(Math.random() * (wordArray.length - 1))];
      if (!word) {
        break;
      }

      // Append the word to constructedWord
      constructedWord += word;
    }

    // Find 9 letter words which are anagrams of constructedWord
    const anagrams = words_nine_targets.filter((word) => checkAnagram(constructedWord, word));

    // Only one unique anagram
    if (anagrams.length === 1) {
      conundrum = { question: constructedWord, answer: anagrams[0] };
    }
    // Failed to find unique anagram
    else {
      failCount += 1;
      if (failCount === MAX_FAIL_COUNT) {
        // Try a different wordLengthCombination
        wordLengthCombination = wordLengthCombinations[Math.round(Math.random() * (wordLengthCombinations.length - 1))];
        failCount = 0;
      }
    }
  }

  // Once found, return the conundrum
  if (conundrum !== undefined) {
    return conundrum;
  }
}
