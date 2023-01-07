import { SettingsData } from "../Data/SaveData/Settings";
import { Theme } from "../Data/Themes";
import { isModeWithDisplayRow } from "../Helpers/isModeWithDisplayRow";
import { WingoConfigProps, WingoMode } from "../Pages/WingoConfig";
import { LetterTileStatus } from "./LetterTile";
import WordRow from "./WordRow";

interface IDisplayRowProps {
  isCampaignLevel: boolean;
  mode: WingoMode;

  gamemodeSettings: WingoConfigProps["gamemodeSettings"];

  remainingSeconds: number;
  totalSeconds: number;
  numCorrectGuesses: number;
  numIncorrectGuesses: number;
  remainingGuesses: number;
  guesses: string[];
  currentWord: string;
  wordIndex: number;
  inProgress: boolean;
  inDictionary: boolean;
  errorMessage: { isShown: true; message: string } | { isShown: false };
  isIncompleteWord: boolean;
  conundrum?: string;
  targetWord: string;
  targetHint?: string;
  targetCategory?: string;
  letterStatuses: LetterTileStatus[];
  revealedLetterIndexes: number[];

  theme?: Theme;
  settings: SettingsData;
  onEnter: () => void;
  onSubmitLetter: (letter: string) => void;
  onBackspace: () => void;

  updateGamemodeSettings: (newGamemodeSettings: WingoConfigProps["gamemodeSettings"]) => void;
  resetCountdown: () => void;
  setTotalSeconds: (numSeconds: number) => void;

  ResetGame: () => void;
  ContinueGame: () => void;
  setTheme: (theme: Theme) => void;
}

const DisplayRow = (props: IDisplayRowProps) => {
  if (!isModeWithDisplayRow(props.mode)) {
    return null;
  }

  if (props.mode === "puzzle") {
    let displayWord = "";

    for (let i = 0; i < props.targetWord.length; i++) {
      if (props.revealedLetterIndexes.includes(i)) {
        displayWord += props.targetWord[i];
      } else {
        displayWord += " ";
      }
    }

    // Return a read only WordRow that slowly reveals puzzle word
    return (
      <WordRow
        key={"wingo/read-only"}
        isReadOnly={true}
        inProgress={props.inProgress}
        word={displayWord}
        length={props.gamemodeSettings.wordLength}
        targetWord={props.targetWord}
        revealedLetterIndexes={props.revealedLetterIndexes}
        hasSubmit={true}
        inDictionary={props.inDictionary}
        settings={props.settings}
        applyAnimation={false}
      />
    );
  }

  if (props.mode === "conundrum" && props.conundrum !== undefined) {
    // Return a read only WordRow that reveals conundrum
    return (
      <WordRow
        key={"conundrum/read-only"}
        isReadOnly={true}
        inProgress={props.inProgress}
        word={props.conundrum}
        length={props.gamemodeSettings.wordLength}
        targetWord={props.targetWord}
        revealedLetterIndexes={props.revealedLetterIndexes}
        hasSubmit={true}
        inDictionary={props.inDictionary}
        settings={props.settings}
        applyAnimation={false}
      />
    );
  }

  return null;
};

export default DisplayRow;
