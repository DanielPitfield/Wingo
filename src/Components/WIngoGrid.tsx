import { SettingsData } from "../Data/SaveData/Settings";
import { Theme } from "../Data/Themes";
import { isModeWithDisplayRow } from "../Helpers/isModeWithDisplayRow";
import { WingoConfigProps, WingoMode } from "../Pages/WingoConfig";
import DisplayRow from "./DisplayRow";
import { LetterTileStatus } from "./LetterTile";
import WordRow from "./WordRow";

interface IWingoGridProps {
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
  onSubmitTargetCategory: (category: string) => void;
  onBackspace: () => void;

  updateGamemodeSettings: (newGamemodeSettings: WingoConfigProps["gamemodeSettings"]) => void;
  resetCountdown: () => void;
  setTotalSeconds: (numSeconds: number) => void;

  ResetGame: () => void;
  ContinueGame: () => void;
  setTheme: (theme: Theme) => void;
}

const WingoGrid = (props: IWingoGridProps) => {
  const Grid = [];

  // Puzzle/Conundrum display row
  if (isModeWithDisplayRow(props.mode)) {
    Grid.push(<DisplayRow key={`${props.mode}-display-row`} {...props} />);
  }

  for (let i = 0; i < props.gamemodeSettings.startingNumGuesses; i++) {
    let word;

    if (props.wordIndex < i) {
      /*
        If the wordIndex is behind the currently iterated row
        (i.e the row has not been used yet)
        Show an empty string 
        */
      word = "";
    } else if (props.wordIndex === i) {
      /* 
        If the wordIndex and the row number are the same
        (i.e the row is currently being used)
        Show the currentWord
        */
      word = props.currentWord;
    } else {
      /* 
        If the wordIndex is ahead of the currently iterated row
        (i.e the row has already been used)
        Show the respective guessed word
        */
      word = props.guesses[i];
    }

    Grid.push(
      <WordRow
        key={`wingo/row/${i}`}
        isReadOnly={false}
        inProgress={props.inProgress}
        word={word}
        length={props.gamemodeSettings.wordLength}
        targetWord={props.targetWord}
        hasSubmit={props.wordIndex > i || !props.inProgress}
        inDictionary={props.inDictionary}
        isIncompleteWord={props.isIncompleteWord}
        applyAnimation={props.wordIndex === i}
        settings={props.settings}
      />
    );
  }

  return <div className="word_grid">{Grid}</div>;
};

export default WingoGrid;
