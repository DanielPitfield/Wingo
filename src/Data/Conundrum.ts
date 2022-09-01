import { pickRandomElementFrom } from "../Pages/WingoConfig";
import { wordLengthMappingsGuessable, wordLengthMappingsTargets } from "./WordArrayMappings";

export function checkAnagram(constructedWord: string, targetWord: string): boolean {
  const constructedWordLetters = constructedWord.split("").sort().join("");
  const targetWordLetters = targetWord.split("").sort().join("");

  return constructedWordLetters === targetWordLetters;
}

export function getAllWordsOfLength(wordLength: number): string[] {
  const guessableWordArray: string[] = wordLengthMappingsGuessable.find((x) => x.value === wordLength)?.array ?? [];
  const targetWordArray: string[] = wordLengthMappingsTargets.find((x) => x.value === wordLength)?.array ?? [];

  return guessableWordArray.concat(targetWordArray) ?? [];
}

export function generateConundrum() {
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
  let wordLengthCombination = pickRandomElementFrom(wordLengthCombinations);

  let failCount = 0;
  let conundrum;

  // Loop until a conundrum is found
  while (conundrum === undefined && failCount < MAX_ATTEMPTS_PER_COMBINATON) {
    let constructedWord = "";

    for (const wordLength of wordLengthCombination) {
      // Get all words of  wordLength (can be from either guessable or target)
      const wordArray = getAllWordsOfLength(wordLength);
      // Find a word of the wordLength
      const word = pickRandomElementFrom(wordArray) ?? "";
      // Append the word to constructedWord
      constructedWord += word;
    }

    // Expected length of the conundrum (sum of the lengths from the wordLength combination)
    const conundrumLength = wordLengthCombination.reduce((a: number, b: number) => a + b, 0);

    if (conundrumLength > 0 && constructedWord.length === conundrumLength) {
      // Find words which are anagrams of constructedWord
      const anagrams = getAllWordsOfLength(conundrumLength).filter((word) => checkAnagram(constructedWord, word));

      // Very few number of anagrams
      if (anagrams.length <= MAX_NUM_ANAGRAMS) {
        conundrum = { question: constructedWord, answer: pickRandomElementFrom(anagrams) };
        return conundrum;
      }
    }

    // Failed to find conundrum
    failCount += 1;
    if (failCount === MAX_ATTEMPTS_PER_COMBINATON) {
      // Try a different wordLengthCombination
      wordLengthCombination = pickRandomElementFrom(wordLengthCombinations);
      failCount = 0;
    }
  }
}
