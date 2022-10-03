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

export function getAllPuzzleWordsOfLength(wordLength: number): { word: string; hint: string }[] {
  return puzzleWordLengthMappings.find((x) => x.value === wordLength)?.array ?? [];
}
