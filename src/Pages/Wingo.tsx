import React, { useState } from "react";
import Keyboard from "../Components/Keyboard";
import Button from "../Components/Button";
import MessageNotification from "../Components/MessageNotification";
import ProgressBar, { GreenToRedColorTransition } from "../Components/ProgressBar";
import { WingoConfigProps, WingoMode } from "./WingoConfig";
import { Theme } from "../Data/Themes";
import { useCorrectChime, useFailureChime, useLightPingChime } from "../Data/Sounds";
import { LEVEL_FINISHING_TEXT } from "../Components/Level";
import { categoryMappings } from "../Data/WordArrayMappings";
import { getNewGamemodeSettingValue } from "../Helpers/getGamemodeSettingsNewValue";
import { DEFAULT_WINGO_INCREASING_MAX_NUM_LIVES } from "../Data/DefaultGamemodeSettings";
import { LetterTileStatus } from "../Components/LetterTile";
import WingoGamemodeSettings from "../Components/GamemodeSettingsOptions/WingoGamemodeSettings";
import { SettingsData } from "../Data/SaveData/Settings";
import { getTimeUntilPeriodicReset } from "../Helpers/getTimeUntilPeriodicReset";
import { useLocation } from "react-router-dom";
import { PagePath } from "../Data/PageNames";
import { isDailyMode, isTimePeriodicMode, isWeeklyMode } from "../Helpers/isTimePeriodicMode";
import WingoGrid from "../Components/WIngoGrid";
import WingoConundrum from "../Components/WingoConundrum";
import WingoOutcome from "../Components/WingoOutcome";

interface WingoProps {
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

const Wingo = (props: WingoProps) => {
  const location = useLocation().pathname as PagePath;

  const [keyboardDisabled, setKeyboardDisabled] = useState(false);
  const [categoryCanBeChanged, setCategoryCanBeChanged] = useState(false);

  const [timeUntilDailyReset, setTimeUntilDailyReset] = useState(getTimeUntilPeriodicReset("Day"));
  const [timeUntilWeeklyReset, setTimeUntilWeeklyReset] = useState(getTimeUntilPeriodicReset("Week"));

  const [playCorrectChimeSoundEffect] = useCorrectChime(props.settings);
  const [playFailureChimeSoundEffect] = useFailureChime(props.settings);
  const [playLightPingSoundEffect] = useLightPingChime(props.settings);

  const [mostRecentMaxLives, setMostRecentMaxLives] = useState(
    props.gamemodeSettings?.maxLivesConfig?.isLimited === true
      ? props.gamemodeSettings?.maxLivesConfig?.maxLives
      : DEFAULT_WINGO_INCREASING_MAX_NUM_LIVES
  );

  React.useEffect(() => {
    if (props.inProgress) {
      return;
    }

    if (isCurrentGuessCorrect()) {
      playCorrectChimeSoundEffect();
    } else {
      playFailureChimeSoundEffect();
    }
  }, [props.inProgress]);

  const Hint = () => {
    if (!props.targetHint) {
      return null;
    }

    // Display the hint (if defined)
    return (
      <MessageNotification type="info">
        <strong>Hint:</strong> {props.targetHint}
      </MessageNotification>
    );
  };

  const isCurrentGuessCorrect = (): boolean => {
    return (
      props.currentWord.length > 0 &&
      props.currentWord.replace(/ /g, "-").toLowerCase() === props.targetWord.replace(/ /g, "-").toLowerCase() &&
      props.inDictionary
    );
  };

  function isOutcomeContinue(): boolean {
    if (props.mode === "increasing") {
      // Correct and next wordLength does not exceed limit
      return isCurrentGuessCorrect() && props.gamemodeSettings.wordLength < props.gamemodeSettings.wordLengthMaxLimit;
    }

    if (props.mode === "limitless") {
      // Correct answer with last row left
      const lastRowCorrectAnswer = isCurrentGuessCorrect() && props.remainingGuesses === 1;
      // Lives left or correct answer with last remaining life
      return lastRowCorrectAnswer || props.remainingGuesses > 1;
    }

    // Only increasing and limitless modes can be continued
    return false;
  }

  // Render the timer to the next periodic reset
  React.useEffect(() => {
    // Not a daily/weekly mode
    if (!isTimePeriodicMode(location)) {
      return;
    }

    if (props.inProgress) {
      return;
    }

    const intervalId = setInterval(
      () =>
        isDailyMode(location)
          ? setTimeUntilDailyReset(getTimeUntilPeriodicReset("Day"))
          : setTimeUntilWeeklyReset(getTimeUntilPeriodicReset("Week")),
      1000
    );

    return () => {
      clearInterval(intervalId);
    };
  }, [props.mode, props.inProgress]);

  // Set a boolean determining whether the category can be changed yet
  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setCategoryCanBeChanged(true);
    }, 1500);

    return () => window.clearTimeout(timeoutId);
  }, [setCategoryCanBeChanged]);

  const handleMaxLivesToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGamemodeSettings: WingoConfigProps["gamemodeSettings"] = {
      ...props.gamemodeSettings,
      maxLivesConfig: e.target.checked ? { isLimited: true, maxLives: mostRecentMaxLives } : { isLimited: false },
    };

    props.updateGamemodeSettings(newGamemodeSettings);
  };

  const handleTimerToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGamemodeSettings: WingoConfigProps["gamemodeSettings"] = {
      ...props.gamemodeSettings,
      timerConfig: e.target.checked ? { isTimed: true, seconds: props.totalSeconds } : { isTimed: false },
    };

    props.updateGamemodeSettings(newGamemodeSettings);
  };

  const handleSimpleGamemodeSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGamemodeSettings: WingoConfigProps["gamemodeSettings"] = {
      ...props.gamemodeSettings,
      [e.target.name]: getNewGamemodeSettingValue(e),
    };

    props.updateGamemodeSettings(newGamemodeSettings);
  };

  // Show a slightly different UI for conundrum (though it shares the core logic of Wingo.tsx)
  if (props.mode === "conundrum") {
    return (
      <WingoConundrum
        {...props}
        handleMaxLivesToggle={handleMaxLivesToggle}
        handleSimpleGamemodeSettingsChange={handleSimpleGamemodeSettingsChange}
        handleTimerToggle={handleTimerToggle}
        keyboardDisabled={keyboardDisabled}
        setMostRecentMaxLives={setMostRecentMaxLives}
        setKeyboardDisabled={setKeyboardDisabled}
        isOutcomeContinue={isOutcomeContinue()}
        isCurrentGuessCorrect={isCurrentGuessCorrect()}
      />
    );
  }

  // Else; for all other modes
  return (
    <div
      className="App"
      style={{
        backgroundImage: !props.isCampaignLevel && props.theme ? `url(${props.theme.backgroundImageSrc})` : undefined,
        backgroundSize: "100% 100%",
      }}
    >
      <Hint />
      <WingoOutcome {...props} isCurrentGuessCorrect={isCurrentGuessCorrect()} />

      {isDailyMode(location) && !props.inProgress && (
        <MessageNotification type="default">Next Daily reset in: {timeUntilDailyReset}</MessageNotification>
      )}
      {isWeeklyMode(location) && !props.inProgress && (
        <MessageNotification type="default">Next Weekly reset in: {timeUntilWeeklyReset}</MessageNotification>
      )}
      <div>
        {!isTimePeriodicMode(location) && !props.inProgress && (
          <Button
            mode={"accept"}
            settings={props.settings}
            onClick={() => (isOutcomeContinue() ? props.ContinueGame() : props.ResetGame())}
            additionalProps={{ autoFocus: true }}
          >
            {props.isCampaignLevel ? LEVEL_FINISHING_TEXT : isOutcomeContinue() ? "Continue" : "Restart"}
          </Button>
        )}
      </div>

      <div className="category_label">
        {props.mode === "category" && (
          <MessageNotification type="default">
            <div className="category_selection">
              <label className="category_label">
                <span>
                  <strong>Category</strong>: {props.targetCategory}
                </span>
                <Button mode="accept" onClick={() => props.ResetGame()} disabled={!categoryCanBeChanged}>
                  New category
                </Button>
              </label>
            </div>
          </MessageNotification>
        )}
      </div>

      {props.mode !== "daily" && !props.isCampaignLevel && (
        <div className="gamemodeSettings">
          <WingoGamemodeSettings
            mode={props.mode}
            gamemodeSettings={props.gamemodeSettings}
            handleMaxLivesToggle={handleMaxLivesToggle}
            handleTimerToggle={handleTimerToggle}
            handleSimpleGamemodeSettingsChange={handleSimpleGamemodeSettingsChange}
            setMostRecentMaxLives={setMostRecentMaxLives}
            resetCountdown={props.resetCountdown}
            setTotalSeconds={props.setTotalSeconds}
            onLoadPresetGamemodeSettings={props.updateGamemodeSettings}
            onShowOfAddPresetModal={() => setKeyboardDisabled(true)}
            onHideOfAddPresetModal={() => setKeyboardDisabled(false)}
          />
        </div>
      )}

      {props.errorMessage.isShown && (
        <MessageNotification type="error">{props.errorMessage.message}</MessageNotification>
      )}

      {props.mode === "limitless" && (
        <MessageNotification type="default">
          <div>{`Correct Guesses: ${props.numCorrectGuesses}`}</div>
          <div>{`Incorrect Guesses: ${props.numIncorrectGuesses}`}</div>
        </MessageNotification>
      )}

      <WingoGrid {...props} />

      <Keyboard
        onEnter={props.onEnter}
        onSubmitLetter={(letter) => {
          props.onSubmitLetter(letter);
          playLightPingSoundEffect();
        }}
        onBackspace={props.onBackspace}
        guesses={props.guesses}
        targetWord={props.targetWord}
        inDictionary={props.inDictionary}
        letterStatuses={props.letterStatuses}
        settings={props.settings}
        disabled={keyboardDisabled || !props.inProgress}
        hasBackspace={true}
        hasEnter={true}
      />

      <div>
        {props.gamemodeSettings.timerConfig.isTimed && (
          <ProgressBar
            progress={props.remainingSeconds}
            total={props.gamemodeSettings.timerConfig.seconds}
            display={{ type: "transition", colorTransition: GreenToRedColorTransition }}
          />
        )}
      </div>
    </div>
  );
};

export default Wingo;
