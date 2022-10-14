import { MIN_TARGET_WORD_LENGTH } from "../Data/GamemodeSettingsInputLimits";
import {
  guessableWordLengthMappings,
  puzzleWordLengthMappings,
  targetWordLengthMappings,
} from "../Data/WordArrayMappings";

export function getGuessableWordsOfLength(wordLength: number): string[] {
  return guessableWordLengthMappings.find((x) => x.value === wordLength)?.array ?? [];
}

export function getTargetWordsOfLength(wordLength: number): string[] {
  return targetWordLengthMappings.find((x) => x.value === wordLength)?.array ?? [];
}

export function getAllWordsOfLength(wordLength: number): string[] {
  return getGuessableWordsOfLength(wordLength).concat(getTargetWordsOfLength(wordLength)) ?? [];
}

export function getAllWordsUpToLength(wordLength: number): string[] {
  // TODO: Refactor
  let newWordArray: string[] = [];

  for (let i = MIN_TARGET_WORD_LENGTH; i <= wordLength; i++) {
    // Find array containing words of i length
    const currentLengthWordArray = getAllWordsOfLength(i);
    newWordArray = newWordArray.concat(currentLengthWordArray);
  }

  return newWordArray;
}

export function getAllPuzzleWordsOfLength(wordLength: number): { word: string; hint: string }[] {
  return puzzleWordLengthMappings.find((x) => x.value === wordLength)?.array ?? [];
}
