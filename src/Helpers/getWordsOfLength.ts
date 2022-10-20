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
  let newWordArray: string[] = [];

  for (let i = MIN_TARGET_WORD_LENGTH; i <= wordLength; i++) {
    // Add all words of currently iterated wordLength to larger array
    newWordArray = newWordArray.concat(getAllWordsOfLength(i));
  }

  return newWordArray;
}

export function getAllPuzzleWordsOfLength(wordLength: number): { word: string; hint: string }[] {
  return puzzleWordLengthMappings.find((x) => x.value === wordLength)?.array ?? [];
}
