import Button from "../Components/Button";
import LetterSelectionRow from "../Components/LetterSelectionRow";
import WordRow from "../Components/WordRow";
import { Theme } from "../Data/Themes";
import { LettersGameConfigProps, LettersGameTileStatus } from "../Pages/LettersGameConfig";
import { SettingsData } from "../Data/SaveData/Settings";
import { getWeightedLetter } from "../Helpers/getWeightedLetter";
import { consonantWeightings, vowelWeightings } from "../Data/LettersGameWeightings";

interface ILettersGameGridProps {
  campaignConfig: LettersGameConfigProps["campaignConfig"];
  gamemodeSettings: LettersGameConfigProps["gamemodeSettings"];

  letterTileStatuses: LettersGameTileStatus[];

  guesses: string[];
  currentWord: string;
  inProgress: boolean;
  inDictionary: boolean;
  hasLetterSelectionFinished: boolean;
  targetWord: string;
  remainingSeconds: number;
  totalSeconds: number;

  theme: Theme;
  settings: SettingsData;
  setTheme: (theme: Theme) => void;
  addGold: (gold: number) => void;
  onEnter: () => void;

  onSubmitSelectionLetter: (letter: string) => void;
  onSubmitSelectionWord: (word: string) => void;

  onClickSelectionLetter: (letter: string | null, index: number) => void;
  onSubmitKeyboardLetter: (letter: string) => void;
  onBackspace: () => void;

  updateGamemodeSettings: (newGamemodeSettings: LettersGameConfigProps["gamemodeSettings"]) => void;
  resetCountdown: () => void;
  setTotalSeconds: (numSeconds: number) => void;

  ResetGame: () => void;
  ContinueGame: () => void;
}

const LettersGameGrid = (props: ILettersGameGridProps) => {
  const getVowel = (): string => {
    // Already have enough letters, don't add any more
    if (props.hasLetterSelectionFinished) {
      return "";
    }

    return getWeightedLetter(vowelWeightings);
  };

  const getConsonant = (): string => {
    // Already have enough letters, don't add any more
    if (props.hasLetterSelectionFinished) {
      return "";
    }

    return getWeightedLetter(consonantWeightings);
  };

  const quickLetterSelection = () => {
    const selectionWordLetters = Array(props.gamemodeSettings.numLetters)
      .fill("")
      .map((_) => {
        // Equal chance to be true or false
        const x = Math.floor(Math.random() * 2) === 0;
        // Equal chance (to add a vowel or consonant)
        return x ? getVowel() : getConsonant();
      });

    // Set the entire word at once
    props.onSubmitSelectionWord(selectionWordLetters.join(""));
  };

  // Read only letter selection WordRow
  const letterSelection = (
    <LetterSelectionRow
      key={"letters-game/read-only"}
      letterTileStatuses={props.letterTileStatuses}
      settings={props.settings}
      disabled={!props.inProgress}
      onClick={props.onClickSelectionLetter}
    />
  );

  // Buttons to add letters to letter selection row
  const addLetterButtons = (
    <div className="add-letter-buttons-wrapper">
      <Button
        mode={"default"}
        disabled={props.hasLetterSelectionFinished}
        settings={props.settings}
        onClick={() => props.onSubmitSelectionLetter(getVowel())}
      >
        Vowel
      </Button>
      <Button
        mode={"default"}
        disabled={props.hasLetterSelectionFinished}
        settings={props.settings}
        onClick={() => props.onSubmitSelectionLetter(getConsonant())}
      >
        Consonant
      </Button>
      <Button
        mode={"default"}
        disabled={
          // There is atleast one already selected letter
          props.letterTileStatuses.some((letterStatus) => letterStatus.letter !== null) ||
          // The entire selection is finished
          props.hasLetterSelectionFinished
        }
        settings={props.settings}
        onClick={quickLetterSelection}
      >
        Quick Pick
      </Button>
    </div>
  );

  // WordRow to enter words using available letters
  const inputRow = (
    <WordRow
      key={"letters-game/input"}
      isReadOnly={false}
      inProgress={props.inProgress}
      word={props.currentWord}
      length={props.gamemodeSettings.numLetters}
      targetWord={props.targetWord}
      hasSubmit={!props.inProgress}
      inDictionary={props.inDictionary}
      settings={props.settings}
      applyAnimation={false}
    />
  );

  return (
    <div className="letters-game-word-grid">
      <div className="letters-game-wrapper" key={"letter_selection"}>
        {letterSelection}
        {addLetterButtons}
        {inputRow}
      </div>
    </div>
  );
};

export default LettersGameGrid;
