import { TileStatus } from "../Components/LetterTile";

export function getLetterStatus(letter: string, index: number, targetWord: string, inDictionary: boolean): TileStatus {
  if (!inDictionary) {
    // Red
    return "incorrect";
  }
  if (targetWord?.[index]?.toUpperCase() === letter?.toUpperCase()) {
    // Green
    return "correct";
  }
  if (targetWord?.toUpperCase().includes(letter?.toUpperCase())) {
    // Yellow
    return "contains";
  }
  // Grey
  return "not in word";
}
