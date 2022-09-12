import { PageName } from "../PageNames";
import { LetterStatus } from "../Components/LetterTile";
import { getLetterStatus } from "../Pages/WingoConfig";

const isSimpleStatusMode = (page: PageName) => {
  // The modes where the letter statuses should be either correct or incorrect (green or red statuses) and nothing inbetween
  const simpleStatusModes: PageName[] = ["LettersCategories"];
  return simpleStatusModes.includes(page);
};

type WordSummary = {
  character: string;
  status: LetterStatus;
}[];

export function getWordSummary(page: PageName, word: string, targetWord: string, inDictionary: boolean): WordSummary {
  // TODO: Refactor

  // Character and status array
  const defaultCharacterStatuses = (word || "").split("").map((character, index) => ({
    character: character,
    status: getLetterStatus(character, index, targetWord, inDictionary),
  }));

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
