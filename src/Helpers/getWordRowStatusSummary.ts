import { PagePath } from "../Data/PageNames";
import { LetterTileStatus } from "../Components/LetterTile";
import { getLetterStatus } from "./getLetterStatus";

const isSimpleStatusMode = (page: PagePath) => {
  // The modes where the letter statuses should be either correct or incorrect (green or red statuses) and nothing inbetween
  const simpleStatusModes: PagePath[] = ["/Wingo/Puzzle", "/LettersCategories"];
  return simpleStatusModes.includes(page);
};

// The status of every letter in the word of a WordRow
export type WordRowStatusSummary = LetterTileStatus[];

// The information which determine/influence the LetterStatuses within WordRowStatusSummary
export type WordRowStatusChecks = {
  isReadOnly: boolean;
  page: PagePath;
  word: string;
  targetWord: string;
  inDictionary: boolean;
  wordArray: string[];
};

export function getWordRowStatusSummary(statusChecks: WordRowStatusChecks): WordRowStatusSummary {
  const { isReadOnly, page, word, targetWord, inDictionary, wordArray } = statusChecks;

  // Letter and status array
  const defaultLetterStatuses = (word ?? "").split("").map((letter, index) => ({
    letter: letter,
    status: getLetterStatus(letter, index, targetWord, inDictionary),
  }));

  if (isReadOnly) {
    return defaultLetterStatuses.map((letterStatus) => {
      // A letter is present (not a blank letter)
      const hasLetter =
        letterStatus.letter !== undefined &&
        letterStatus.letter !== "" &&
        letterStatus.letter !== " ";

      // The read only WordRow in puzzle mode slowly reveals the correct answer (signify this by showing the status as correct)
      if (hasLetter && page === "/Wingo/Puzzle") {
        letterStatus.status = "correct";
        return letterStatus;
      }

      // Otherwise, read only WordRows should have letters with the 'not set' status
      if (hasLetter) {
        letterStatus.status = "not set";
      }

      return letterStatus;
    });
  }

  if (isSimpleStatusMode(page) && word === targetWord) {
    return defaultLetterStatuses.map((letterStatus) => ({ ...letterStatus, status: word === targetWord ? "correct" : "incorrect" }));
  }

  // Changing status because of repeated letters
  return defaultLetterStatuses.map((letterStatus, index) => {
    // Is there already a green tile for this letter?
    const hasGreenTile = defaultLetterStatuses.some(
      (y) => y.letter === letterStatus.letter && y.status === "correct"
    );

    // Is there already an orange tile of the letter?
    const hasOrangeTile =
      defaultLetterStatuses.findIndex(
        (y) => y.letter === letterStatus.letter && y.status === "contains"
      ) !== index;

    // Does the letter have a coloured status (either green or yellow?)
    const hasColouredStatus = hasGreenTile || hasOrangeTile;

    // Change duplicate yellow ('contains') statuses to the 'not in word' status
    if (letterStatus.status === "contains" && hasColouredStatus) {
      letterStatus.status = "not in word";
    }

    return letterStatus;
  });
}
