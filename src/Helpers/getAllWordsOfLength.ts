import { guessableWordLengthMappings, targetWordLengthMappings } from "../Data/WordArrayMappings";

export function getAllWordsOfLength(wordLength: number): string[] {
  const guessableWordArray: string[] = guessableWordLengthMappings.find((x) => x.value === wordLength)?.array ?? [];
  const targetWordArray: string[] = targetWordLengthMappings.find((x) => x.value === wordLength)?.array ?? [];

  return guessableWordArray.concat(targetWordArray) ?? [];
}
