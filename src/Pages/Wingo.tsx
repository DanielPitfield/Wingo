import React, { useState } from "react";
import { Keyboard } from "../Components/Keyboard";
import { WordRow } from "../Components/WordRow";
import { Button } from "../Components/Button";
import { MessageNotification } from "../Components/MessageNotification";
import ProgressBar, { GreenToRedColorTransition } from "../Components/ProgressBar";
import { WingoConfigProps, WingoMode } from "./WingoConfig";
import { Theme } from "../Data/Themes";
import { useCorrectChime, useFailureChime, useLightPingChime } from "../Data/Sounds";
import { LEVEL_FINISHING_TEXT } from "../Components/Level";
import { categoryMappings } from "../Data/WordArrayMappings";
import { getNewGamemodeSettingValue } from "../Helpers/getGamemodeSettingsNewValue";
import { DEFAULT_WINGO_INCREASING_MAX_NUM_LIVES } from "../Data/DefaultGamemodeSettings";
import { LetterTileStatus } from "../Components/LetterTile";
import { getNumNewLimitlessLives } from "../Helpers/getNumNewLimitlessLives";
import WingoGamemodeSettings from "../Components/GamemodeSettingsOptions/WingoGamemodeSettings";
import { SettingsData } from "../Data/SaveData/Settings";
import { getTimeUntilPeriodicReset } from "../Helpers/getTimeUntilPeriodicReset";
import { useLocation } from "react-router-dom";
import { PagePath } from "../Data/PageNames";
import { isDailyMode, isTimePeriodicMode, isWeeklyMode } from "../Helpers/isTimePeriodicMode";

interface Props {
  isCampaignLevel: boolean;
  mode: WingoMode;

  gamemodeSettings: WingoConfigProps["gamemodeSettings"];

  remainingSeconds: number;
  totalSeconds: number;
  remainingGuesses: number;
  guesses: string[];
  currentWord: string;
  wordIndex: number;
  inProgress: boolean;
  inDictionary: boolean;
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

  gameshowScore?: number;
}

const Wingo = (props: Props) => {
  const location = useLocation().pathname as PagePath;
  
  const [keyboardDisabled, setKeyboardDisabled] = useState(false);

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

  const isModeWithDisplayRow = (): boolean => {
    const modesWithDisplayRow: typeof props.mode[] = ["puzzle", "conundrum"];
    return modesWithDisplayRow.includes(props.mode);
  };

  function getDisplayRow(): React.ReactNode {
    if (!isModeWithDisplayRow()) {
      return;
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
        <div className="letters-game-wrapper" key={"conundrum/reveal"}>
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
        </div>
      );
    }

    return;
  }

  const Grid = () => {
    const Grid = [];

    // Puzzle/Conundrum display row
    if (isModeWithDisplayRow()) {
      Grid.push(getDisplayRow());
    }

    for (let i = 0; i < props.remainingGuesses; i++) {
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

    return <div className="word_grid">{Grid}</div>
  }

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

  function displayHint() {
    if (!props.targetHint) {
      return;
    }

    // Display the hint (if defined)
    return (
      <MessageNotification type="info">
        <strong>Hint:</strong> {props.targetHint}
      </MessageNotification>
    );
  }

  const isCurrentGuessCorrect = () => {
    return (
      props.currentWord.length > 0 &&
      props.currentWord.toUpperCase() === props.targetWord.toUpperCase() &&
      props.inDictionary
    );
  };

  const Outcome = () => {
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

      if (isCurrentGuessCorrect()) {
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
      <MessageNotification type={isCurrentGuessCorrect() ? "success" : "error"}>
        <strong>{isCurrentGuessCorrect() ? "Correct!" : "Incorrect!"}</strong>
        <br />

        {!props.inDictionary && (
          <>
            <strong>{props.currentWord.toUpperCase()}</strong> is not a valid word
            <br />
          </>
        )}

        {isCurrentGuessCorrect() && (
          <strong>
            {props.wordIndex === 0
              ? "You guessed the word in one guess"
              : `You guessed the word in ${props.wordIndex + 1} guesses`}
          </strong>
        )}

        {!isCurrentGuessCorrect() && !props.isCampaignLevel && (
          <>
            The word was: <strong>{props.targetWord.toUpperCase()}</strong>
          </>
        )}
      </MessageNotification>
    );
  }

  function isOutcomeContinue(): boolean {
    const correctAnswer =
      props.currentWord.length > 0 && props.targetWord.toUpperCase() === props.currentWord.toUpperCase();

    if (props.mode === "increasing") {
      // Correct and next wordLength does not exceed limit
      return correctAnswer && props.gamemodeSettings.wordLength < props.gamemodeSettings.wordLengthMaxLimit;
    }

    if (props.mode === "limitless") {
      // Correct answer with last row left
      const lastRowCorrectAnswer = props.remainingGuesses === 1 && correctAnswer;
      // Lives left or correct answer with last remaining life
      return lastRowCorrectAnswer || props.remainingGuesses > 1;
    }

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

  function displayGameshowScore(): React.ReactNode {
    if (props.gameshowScore === undefined || props.gameshowScore === null) {
      return;
    }

    return (
      <MessageNotification type="default">
        <strong>Gameshow points: </strong>
        {props.gameshowScore}
      </MessageNotification>
    );
  }

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

  /*
  TODO: Gamemode Settings Indicators/Icons
  These should display to the user whether certain important gamemode settings are enabled or disabled
  For instance, if a campaign level, currently how do you know whether enforceFullLengthGuesses is enabled/disabled?
  */

  return (
    <div
      className="App"
      style={{
        backgroundImage: !props.isCampaignLevel && props.theme ? `url(${props.theme.backgroundImageSrc})` : undefined,
        backgroundSize: "100% 100%",
      }}
    >
      {props.gameshowScore !== undefined && <div className="gameshow-score">{displayGameshowScore()}</div>}
      {props.inProgress && <div>{displayHint()}</div>}
      <Outcome/>
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
            {props.gameshowScore !== undefined
              ? "Next round"
              : props.isCampaignLevel
              ? LEVEL_FINISHING_TEXT
              : isOutcomeContinue()
              ? "Continue"
              : "Restart"}
          </Button>
        )}
      </div>
      <div className="category_label">
        {props.mode === "category" && (
          <MessageNotification type="default">
            <div className="category_selection">
              <label className="category_label">
                <strong>Category</strong>{" "}
                <select
                  onChange={(event) => {
                    props.onSubmitTargetCategory(event.target.value);
                  }}
                  className="category_input"
                  name="category"
                  value={props.targetCategory}
                >
                  {categoryMappings.map((category) => (
                    <option key={category.name} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </MessageNotification>
        )}
      </div>
      {
        /* Not daily mode, a campaign level or part of gameshow preset */ props.mode !== "daily" &&
          !props.isCampaignLevel &&
          props.gameshowScore === undefined && (
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
          )
      }
      <Grid/>
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
