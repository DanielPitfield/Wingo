import { wordLengthMappingsGuessable, wordLengthMappingsTargets } from "../Data/WordArrayMappings";

export function getAllWordsOfLength(wordLength: number): string[] {
  const guessableWordArray: string[] = wordLengthMappingsGuessable.find((x) => x.value === wordLength)?.array ?? [];
  const targetWordArray: string[] = wordLengthMappingsTargets.find((x) => x.value === wordLength)?.array ?? [];

  return guessableWordArray.concat(targetWordArray) ?? [];
}
