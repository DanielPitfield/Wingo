import React, { useState } from "react";
import { Keyboard } from "../Components/Keyboard";
import { PagePath } from "../Data/PageNames";
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
import { LetterStatus } from "../Components/LetterTile";
import { getGamemodeDefaultTimerValue } from "../Helpers/getGamemodeDefaultTimerValue";
import { getNumNewLimitlessLives } from "../Helpers/getNumNewLimitlessLives";
import WingoGamemodeSettings from "../Components/GamemodeSettingsOptions/WingoGamemodeSettings";
import { useLocation } from "react-router-dom";
import { SettingsData } from "../Data/SaveData/Settings";

interface Props {
  isCampaignLevel: boolean;
  mode: WingoMode;

  gamemodeSettings: WingoConfigProps["gamemodeSettings"];

  remainingSeconds: number;
  numGuesses: number;
  guesses: string[];
  currentWord: string;
  wordIndex: number;
  inProgress: boolean;
  inDictionary: boolean;
  isIncompleteWord: boolean;
  hasSubmitLetter: boolean;
  conundrum?: string;
  targetWord: string;
  targetHint?: string;
  targetCategory?: string;
  letterStatuses: {
    letter: string;
    status: LetterStatus;
  }[];
  revealedLetterIndexes: number[];

  theme?: Theme;
  settings: SettingsData;
  onEnter: () => void;
  onSubmitLetter: (letter: string) => void;
  onSubmitTargetCategory: (category: string) => void;
  onBackspace: () => void;

  updateGamemodeSettings: (newGamemodeSettings: WingoConfigProps["gamemodeSettings"]) => void;

  ResetGame: () => void;
  ContinueGame: () => void;
  setTheme: (theme: Theme) => void;

  gameshowScore?: number;
}

const Wingo = (props: Props) => {
  const location = useLocation().pathname as PagePath;

  const [secondsUntilNextDailyWingo, setSecondsUntilNextDailyWingo] = useState(getSecondsUntilMidnight());
  const [playCorrectChimeSoundEffect] = useCorrectChime(props.settings);
  const [playFailureChimeSoundEffect] = useFailureChime(props.settings);
  const [playLightPingSoundEffect] = useLightPingChime(props.settings);
  const [keyboardDisabled, setKeyboardDisabled] = useState(false);

  /*
  Keep track of the most recent value for the timer
  So that the value can be used as the default value for the total seconds input element
  (even after the timer is enabled/disabled)
  */
  const [mostRecentTotalSeconds, setMostRecentTotalSeconds] = useState(
    props.gamemodeSettings?.timerConfig?.isTimed === true
      ? props.gamemodeSettings?.timerConfig?.seconds
      : getGamemodeDefaultTimerValue(location)
  );

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
          isVertical={false}
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
            isVertical={false}
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

  // Create grid of rows (for guessing words)
  function displayGrid(): React.ReactNode {
    const Grid = [];

    // Puzzle/Conundrum display row
    if (isModeWithDisplayRow()) {
      Grid.push(getDisplayRow());
    }

    for (let i = 0; i < props.numGuesses; i++) {
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
          isVertical={false}
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

    return Grid;
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

  function displayOutcome(): React.ReactNode {
    if (props.inProgress) {
      return;
    }

    if (props.mode === "limitless") {
      // The number of rows not used in guessing word
      const newLives = getNumNewLimitlessLives(
        props.numGuesses,
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
        <MessageNotification type={props.numGuesses > 1 ? "default" : "error"}>
          {props.numGuesses <= 1 && (
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
      const lastRowCorrectAnswer = props.numGuesses === 1 && correctAnswer;
      // Lives left or correct answer with last remaining life
      return lastRowCorrectAnswer || props.numGuesses > 1;
    }

    return false;
  }

  function getSecondsUntilMidnight(): number {
    const now = new Date();

    const midnight = new Date();
    midnight.setHours(23);
    midnight.setMinutes(59);
    midnight.setSeconds(59);

    const secondsUntilMidnight = Math.round((Number(midnight) - Number(now)) / 1000);

    return secondsUntilMidnight;
  }

  function secondsToTimeString(seconds: number): string {
    const date = new Date();
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(seconds);

    return date.toISOString().split("T")[1].split(".")[0];
  }

  // Render the timer to the next daily wingo
  React.useEffect(() => {
    if (props.mode !== "daily") {
      return;
    }

    if (props.inProgress) {
      return;
    }

    const intervalId = window.setInterval(() => setSecondsUntilNextDailyWingo(getSecondsUntilMidnight()), 1000);

    return () => clearInterval(intervalId);
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
      timerConfig: e.target.checked ? { isTimed: true, seconds: mostRecentTotalSeconds } : { isTimed: false },
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
      <div>{displayOutcome()}</div>
      {props.mode === "daily" && !props.inProgress && (
        <MessageNotification type="default">
          Next Daily Wingo in: {secondsToTimeString(secondsUntilNextDailyWingo)}
        </MessageNotification>
      )}
      <div>
        {!props.inProgress && props.mode !== "daily" && (
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
          !props.gameshowScore && (
            <div className="gamemodeSettings">
              <WingoGamemodeSettings
                mode={props.mode}
                gamemodeSettings={props.gamemodeSettings}
                handleMaxLivesToggle={handleMaxLivesToggle}
                handleTimerToggle={handleTimerToggle}
                handleSimpleGamemodeSettingsChange={handleSimpleGamemodeSettingsChange}
                setMostRecentMaxLives={setMostRecentMaxLives}
                setMostRecentTotalSeconds={setMostRecentTotalSeconds}
                onLoadGamemodeSettingsPreset={props.updateGamemodeSettings}
                onShowOfAddPresetModal={() => setKeyboardDisabled(true)}
                onHideOfAddPresetModal={() => setKeyboardDisabled(false)}
              ></WingoGamemodeSettings>
            </div>
          )
      }

      <div className="word_grid">{displayGrid()}</div>

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
        disabled={!props.inProgress || keyboardDisabled}
        hasBackspace={true}
        hasEnter={true}
      />

      <div>
        {props.gamemodeSettings.timerConfig.isTimed && (
          <ProgressBar
            progress={props.remainingSeconds}
            total={props.gamemodeSettings.timerConfig.seconds}
            display={{ type: "transition", colorTransition: GreenToRedColorTransition }}
          ></ProgressBar>
        )}
      </div>
    </div>
  );
};

export default Wingo;
