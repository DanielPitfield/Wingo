export function getWordsWithLength(wordArray: string[], wordLength: number) {
  return wordArray.filter((word) => word.length === wordLength);
}
