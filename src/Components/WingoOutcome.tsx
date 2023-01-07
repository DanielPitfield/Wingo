import { SettingsData } from "../Data/SaveData/Settings";
import { Theme } from "../Data/Themes";
import { getNumNewLimitlessLives } from "../Helpers/getNumNewLimitlessLives";
import { WingoConfigProps, WingoMode } from "../Pages/WingoConfig";
import MessageNotification from "./MessageNotification";

interface WingoOutcomeProps {
  isCampaignLevel: boolean;
  mode: WingoMode;
  gamemodeSettings: WingoConfigProps["gamemodeSettings"];
  remainingGuesses: number;
  guesses: string[];
  currentWord: string;
  wordIndex: number;
  inProgress: boolean;
  inDictionary: boolean;
  targetWord: string;
  theme?: Theme;
  settings: SettingsData;
  isCurrentGuessCorrect: boolean;
}

const WingoOutcome = (props: WingoOutcomeProps) => {
  if (props.inProgress) {
    return null;
  }

  if (props.mode === "limitless") {
    // The number of rows not used in guessing word
    const newLives = getNumNewLimitlessLives(
      props.remainingGuesses,
      props.wordIndex,
      props.gamemodeSettings.maxLivesConfig
    );

    if (props.isCurrentGuessCorrect) {
      return (
        <MessageNotification type="success">
          <strong>
            {newLives > 0
              ? /* Word guessed with rows to spare */ `+${newLives} ${newLives === 1 ? "life" : "lives"}`
              : /* Word guessed with last guess */ "No lives added"}
          </strong>
        </MessageNotification>
      );
    }

    return (
      <MessageNotification type={props.remainingGuesses > 1 ? "default" : "error"}>
        {props.remainingGuesses <= 1 && (
          <>
            <strong>Game Over</strong>
            <br />
          </>
        )}
        {!props.inDictionary && (
          <>
            <strong>{props.currentWord.toUpperCase()}</strong> is not a valid word
            <br />
          </>
        )}
        {!props.isCampaignLevel && (
          <>
            The word was: <strong>{props.targetWord.toUpperCase()}</strong>
            <br />
          </>
        )}
        <strong>-1 life</strong>
      </MessageNotification>
    );
  }

  return (
    <MessageNotification type={props.isCurrentGuessCorrect ? "success" : "error"}>
      <strong>{props.isCurrentGuessCorrect ? "Correct!" : "Incorrect!"}</strong>
      <br />

      {!props.inDictionary && (
        <>
          <strong>{props.currentWord.toUpperCase()}</strong> is not a valid word
          <br />
        </>
      )}

      {props.isCurrentGuessCorrect && (
        <span>
          {props.wordIndex === 0
            ? "You guessed the word in one guess"
            : `You guessed the word in ${props.wordIndex + 1} guesses`}
        </span>
      )}

      {!props.isCurrentGuessCorrect && !props.isCampaignLevel && (
        <>
          The word was: <strong>{props.targetWord.toUpperCase()}</strong>
        </>
      )}
    </MessageNotification>
  );
};

export default WingoOutcome;