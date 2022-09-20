import { PageName } from "../Data/PageNames";
import { LetterStatus } from "../Components/LetterTile";
import { getLetterStatus } from "./getLetterStatus";

const isSimpleStatusMode = (page: PageName) => {
  // The modes where the letter statuses should be either correct or incorrect (green or red statuses) and nothing inbetween
  const simpleStatusModes: PageName[] = ["LettersCategories"];
  return simpleStatusModes.includes(page);
};

// The status of every letter in the word of a WordRow
export type WordRowStatusSummary = {
  character: string;
  status: LetterStatus;
}[];

// The information which determine/influence the LetterStatuses within WordRowStatusSummary
export type WordRowStatusChecks = {
  isReadOnly: boolean;
  page: PageName;
  word: string;
  targetWord: string;
  inDictionary: boolean;
  wordArray: string[];
};

export function getWordRowStatusSummary(statusChecks: WordRowStatusChecks): WordRowStatusSummary {
  const { isReadOnly, page, word, targetWord, inDictionary, wordArray } = statusChecks;

  // Character and status array
  const defaultCharacterStatuses = (word || "").split("").map((character, index) => ({
    character: character,
    status: getLetterStatus(character, index, targetWord, inDictionary),
  }));

  if (isReadOnly) {
    return defaultCharacterStatuses.map((characterStatus) => {
      // A letter/character is present (not a blank character)
      const hasCharacter =
        characterStatus.character !== undefined &&
        characterStatus.character !== "" &&
        characterStatus.character !== " ";

      // The read only WordRow in puzzle mode slowly reveals the correct answer (signify this by showing the status as correct)
      if (hasCharacter && page === "wingo/puzzle") {
        characterStatus.status = "correct";
        return characterStatus;
      }

      // Otherwise, read only WordRows should have letters with the 'not set' status
      if (hasCharacter) {
        characterStatus.status = "not set";
      }

      return characterStatus;
    });
  }

  if (isSimpleStatusMode(page) && word === targetWord) {
    return defaultCharacterStatuses.map((characterStatus) => ({ ...characterStatus, status: "correct" }));
  }

  if (isSimpleStatusMode(page) && word !== targetWord) {
    return defaultCharacterStatuses.map((characterStatus) => ({ ...characterStatus, status: "incorrect" }));
  }

  // Changing status because of repeated letters
  return defaultCharacterStatuses.map((characterStatus, index) => {
    // Is there already a green tile for this letter?
    const hasGreenTile = defaultCharacterStatuses.some(
      (y) => y.character === characterStatus.character && y.status === "correct"
    );
    // Is there already an orange tile of the letter?
    const hasOrangeTile =
      defaultCharacterStatuses.findIndex(
        (y) => y.character === characterStatus.character && y.status === "contains"
      ) !== index;
    // Does the letter have a coloured status (either green or yellow?)
    const hasColouredStatus = hasGreenTile || hasOrangeTile;

    // Change duplicate yellow ('contains') statuses to the 'not in word' status
    if (characterStatus.status === "contains" && hasColouredStatus) {
      characterStatus.status = "not in word";
    }

    return characterStatus;
  });
}
