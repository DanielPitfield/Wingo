import React, { useEffect, useState } from "react";
import { Keyboard } from "./Keyboard";
import { MAX_TARGET_WORD_LENGTH, MIN_TARGET_WORD_LENGTH, Page } from "./App";
import { WordRow } from "./WordRow";
import { Button } from "./Button";
import { MessageNotification } from "./MessageNotification";
import ProgressBar, { GreenToRedColorTransition } from "./ProgressBar";
import { categoryMappings, getNewLives } from "./WordleConfig";
import { Theme } from "./Themes";
import { SettingsData } from "./SaveData";
import { useCorrectChime, useFailureChime, useLightPingChime } from "./Sounds";
import GamemodeSettingsMenu from "./GamemodeSettingsMenu";

interface Props {
  isCampaignLevel: boolean;
  mode: "daily" | "repeat" | "category" | "increasing" | "limitless" | "puzzle" | "conundrum";
  gamemodeSettings: {
    wordLength: number;
    wordLengthMaxLimit: number;
    isFirstLetterProvided: boolean;
    isHintShown: boolean;
    puzzleRevealMs: number;
    puzzleLeaveNumBlanks: number;
    timerConfig: { isTimed: true; seconds: number } | { isTimed: false };
  };
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
    status: "" | "contains" | "correct" | "not set" | "not in word";
  }[];
  revealedLetterIndexes: number[];
  settings: SettingsData;
  finishingButtonText?: string;
  theme?: Theme;
  setPage: (page: Page) => void;
  onEnter: () => void;
  onSubmitLetter: (letter: string) => void;
  onSubmitTargetCategory: (category: string) => void;
  onBackspace: () => void;

  updateGamemodeSettings: (newGamemodeSettings: {
    wordLength: number;
    wordLengthMaxLimit: number;
    isFirstLetterProvided: boolean;
    isHintShown: boolean;
    puzzleRevealMs: number;
    puzzleLeaveNumBlanks: number;
    timerConfig: { isTimed: true; seconds: number } | { isTimed: false };
  }) => void;

  ResetGame: () => void;
  ContinueGame: () => void;
  setTheme: (theme: Theme) => void;
  gameshowScore?: number;
}

const Wordle: React.FC<Props> = (props) => {
  const [secondsUntilNextDailyWingo, setSecondsUntilNextDailyWingo] = useState(getSecondsUntilMidnight());
  const [playCorrectChimeSoundEffect] = useCorrectChime(props.settings);
  const [playFailureChimeSoundEffect] = useFailureChime(props.settings);
  const [playLightPingSoundEffect] = useLightPingChime(props.settings);

  /*
  Keep track of the most recent value for the timer
  So that the value can be used as the default value for the total seconds input element
  (even after the timer is enabled/disabled)
  */
  const DEFAULT_TIMER_VALUE = 30;
  const [mostRecentTotalSeconds, setMostRecentTotalSeconds] = useState(
    props.gamemodeSettings?.timerConfig?.isTimed === true
      ? props.gamemodeSettings?.timerConfig.seconds
      : DEFAULT_TIMER_VALUE
  );

  // Create grid of rows (for guessing words)
  function populateGrid(rowNumber: number, wordLength: number) {
    var Grid = [];

    if (props.mode === "puzzle") {
      // Create read only WordRow that slowly reveals puzzle word
      let displayWord = "";

      for (let i = 0; i < props.targetWord.length; i++) {
        if (props.revealedLetterIndexes.includes(i)) {
          displayWord += props.targetWord[i];
        } else {
          displayWord += " ";
        }
      }

      Grid.push(
        <WordRow
          key={"read-only"}
          mode={props.mode}
          isReadOnly={true}
          inProgress={props.inProgress}
          word={displayWord}
          isVertical={false}
          length={wordLength}
          targetWord={props.targetWord}
          revealedLetterIndexes={props.revealedLetterIndexes}
          hasSubmit={true}
          inDictionary={props.inDictionary}
          settings={props.settings}
          applyAnimation={false}
        />
      );
    } else if (props.mode === "conundrum" && props.conundrum) {
      // Create read only WordRow that reveals conundrum
      Grid.push(
        <div key={"conundrum_reveal"} className="countdown-letters-wrapper">
          <WordRow
            key={"read-only"}
            mode={props.mode}
            isReadOnly={true}
            inProgress={props.inProgress}
            word={props.conundrum}
            isVertical={false}
            length={wordLength}
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

    for (let i = 0; i < rowNumber; i++) {
      let word;

      if (props.wordIndex === i) {
        /* 
        If the wordIndex and the row number are the same
        (i.e the row is currently being used)
        Show the currentWord
        */
        word = props.currentWord;
      } else if (props.wordIndex <= i) {
        /*
        If the wordIndex is behind the currently iterated row
        (i.e the row has not been used yet)
        Show an empty string 
        */
        word = "";
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
          key={i}
          mode={props.mode}
          isReadOnly={false}
          inProgress={props.inProgress}
          isVertical={false}
          word={word}
          length={wordLength}
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

  function generateSettingsOptions(): React.ReactNode {
    // TODO: PuzzleWordMappings? There are currently only 10 length puzzle words
    const MIN_PUZZLE_WORD_LENGTH = 9;
    const MAX_PUZZLE_WORD_LENGTH = 11;

    const MIN_PUZZLE_REVEAL_INTERVAL_SECONDS = 1;
    const MAX_PUZZLE_REVEAL_INTERVAL_SECONDS = 10;

    // Leave atleast 1 letter blank (otherwise entire word is revealed)
    const MIN_PUZZLE_LEAVE_NUM_BLANKS = 1;
    // Show atleast 1 letter (can't all be blank!)
    const MAX_PUZZLE_LEAVE_NUM_BLANKS = props.targetWord.length - 1;

    // These modes can be continued and aren't always just reset
    const continuationMode = props.mode === "increasing" || props.mode === "limitless";
    const MIN_WORD_LENGTH_LABEL = continuationMode ? "Starting Word Length" : "Word Length";

    // The starting word length must be atleast one below the maximum target word length (for continuation modes)
    const MIN_WORD_LENGTH_MAX_BOUNDARY =
      props.mode === "increasing" ? MAX_TARGET_WORD_LENGTH - 1 : MAX_TARGET_WORD_LENGTH;

    let settings;

    // TODO: Timer that appears after all letters have been revealed (or player intervenes to guess early), which can also be configured in these gamemode settings options
    if (props.mode === "puzzle") {
      settings = (
        <>
          <label>
            <input
              type="number"
              value={props.gamemodeSettings.wordLength}
              min={MIN_PUZZLE_WORD_LENGTH}
              max={MAX_PUZZLE_WORD_LENGTH}
              onChange={(e) => {
                const newGamemodeSettings = {
                  ...props.gamemodeSettings,
                  wordLength: e.target.valueAsNumber,
                };
                props.updateGamemodeSettings(newGamemodeSettings);
              }}
            ></input>
            Word Length
          </label>

          <label>
            <input
              type="number"
              // Show value in seconds (divide by 1000)
              value={props.gamemodeSettings.puzzleRevealMs / 1000}
              min={MIN_PUZZLE_REVEAL_INTERVAL_SECONDS}
              max={MAX_PUZZLE_REVEAL_INTERVAL_SECONDS}
              onChange={(e) => {
                const newGamemodeSettings = {
                  ...props.gamemodeSettings,
                  // Update gamemode settings with milliseconds (multiply by 1000)
                  puzzleRevealMs: e.target.valueAsNumber * 1000,
                };
                props.updateGamemodeSettings(newGamemodeSettings);
              }}
            ></input>
            Reveal Interval (seconds)
          </label>

          <label>
            <input
              type="number"
              value={props.gamemodeSettings.puzzleLeaveNumBlanks}
              min={MIN_PUZZLE_LEAVE_NUM_BLANKS}
              max={MAX_PUZZLE_LEAVE_NUM_BLANKS}
              onChange={(e) => {
                const newGamemodeSettings = {
                  ...props.gamemodeSettings,
                  puzzleLeaveNumBlanks: e.target.valueAsNumber,
                };
                props.updateGamemodeSettings(newGamemodeSettings);
              }}
            ></input>
            Number of letters left blank
          </label>
        </>
      );
    } else {
      settings = (
        <>
          <label>
            <input
              type="number"
              value={props.gamemodeSettings.wordLength}
              min={MIN_TARGET_WORD_LENGTH}
              max={MIN_WORD_LENGTH_MAX_BOUNDARY}
              onChange={(e) => {
                const newGamemodeSettings = {
                  ...props.gamemodeSettings,
                  wordLength: e.target.valueAsNumber,
                };
                props.updateGamemodeSettings(newGamemodeSettings);
              }}
            ></input>
            {MIN_WORD_LENGTH_LABEL}
          </label>

          {continuationMode && (
            <label>
              <input
                type="number"
                value={props.gamemodeSettings.wordLengthMaxLimit}
                min={props.gamemodeSettings.wordLength + 1}
                max={MAX_TARGET_WORD_LENGTH}
                onChange={(e) => {
                  const newGamemodeSettings = {
                    ...props.gamemodeSettings,
                    wordLengthMaxLimit: e.target.valueAsNumber,
                  };
                  props.updateGamemodeSettings(newGamemodeSettings);
                }}
              ></input>
              Ending Word Length
            </label>
          )}

          <label>
            <input
              checked={props.gamemodeSettings.isFirstLetterProvided}
              type="checkbox"
              onChange={() => {
                const newGamemodeSettings = {
                  ...props.gamemodeSettings,
                  isFirstLetterProvided: !props.gamemodeSettings.isFirstLetterProvided,
                };
                props.updateGamemodeSettings(newGamemodeSettings);
              }}
            ></input>
            First Letter Provided
          </label>

          <label>
            <input
              checked={props.gamemodeSettings.isHintShown}
              type="checkbox"
              onChange={() => {
                const newGamemodeSettings = {
                  ...props.gamemodeSettings,
                  isHintShown: !props.gamemodeSettings.isHintShown,
                };
                props.updateGamemodeSettings(newGamemodeSettings);
              }}
            ></input>
            Hints
          </label>

          <>
            <label>
              <input
                checked={props.gamemodeSettings.timerConfig.isTimed}
                type="checkbox"
                onChange={() => {
                  // If currently timed, on change, make the game not timed and vice versa
                  const newTimer: { isTimed: true; seconds: number } | { isTimed: false } = props.gamemodeSettings
                    .timerConfig.isTimed
                    ? { isTimed: false }
                    : { isTimed: true, seconds: mostRecentTotalSeconds };
                  const newGamemodeSettings = { ...props.gamemodeSettings, timerConfig: newTimer };
                  props.updateGamemodeSettings(newGamemodeSettings);
                }}
              ></input>
              Timer
            </label>
            {props.gamemodeSettings.timerConfig.isTimed && (
              <label>
                <input
                  type="number"
                  value={props.gamemodeSettings.timerConfig.seconds}
                  min={10}
                  max={120}
                  step={5}
                  onChange={(e) => {
                    setMostRecentTotalSeconds(e.target.valueAsNumber);
                    const newGamemodeSettings = {
                      ...props.gamemodeSettings,
                      timer: { isTimed: true, seconds: e.target.valueAsNumber },
                    };
                    props.updateGamemodeSettings(newGamemodeSettings);
                  }}
                ></input>
                Seconds
              </label>
            )}
          </>
        </>
      );
    }

    return settings;
  }

  useEffect(() => {
    if (props.inProgress) {
      return;
    }

    // Determine whethe the game ended in failure or success
    const wasFailure =
      !props.inDictionary || (props.mode === "limitless" && getNewLives(props.numGuesses, props.wordIndex) <= 0);

    if (wasFailure) {
      playFailureChimeSoundEffect();
    } else {
      playCorrectChimeSoundEffect();
    }
  }, [props.inProgress]);

  function displayOutcome() {
    // Game still in progress
    if (props.inProgress) {
      return (
        props.targetHint && (
          <MessageNotification type="info">
            <strong>Hint:</strong> {props.targetHint}
          </MessageNotification>
        )
      );
    }

    // Invalid word (wrong spelling)
    if (!props.inDictionary) {
      if (props.mode === "puzzle" || props.mode === "conundrum") {
        return <MessageNotification type="error">Incorrect</MessageNotification>;
      } else {
        return (
          <MessageNotification type="error">
            <strong>{props.currentWord.toUpperCase()}</strong> is not a valid word
            {!props.isCampaignLevel && (
              <>
                <br></br>
                The word was: <strong>{props.targetWord.toUpperCase()}</strong>
              </>
            )}
            {props.mode === "limitless" && (
              <>
                <br></br>
                <strong>-1 life</strong>
              </>
            )}
          </MessageNotification>
        );
      }
    }

    // The number of rows not used in guessing word
    const newLives = getNewLives(props.numGuesses, props.wordIndex);

    if (props.mode === "limitless") {
      // Word guessed with rows to spare
      if (newLives > 0) {
        return (
          <MessageNotification type="success">
            <strong>+{newLives}</strong> lives
          </MessageNotification>
        );
        // Word guessed with last guess
      } else if (props.currentWord.toUpperCase() === props.targetWord.toUpperCase()) {
        return (
          <MessageNotification type="success">
            <strong>No lives added</strong>
          </MessageNotification>
        );
        // Word was not guessed
      } else {
        return (
          <MessageNotification type="default">
            {!props.isCampaignLevel && (
              <>
                The word was: <strong>{props.targetWord.toUpperCase()}</strong>
                <br></br>
              </>
            )}
            <strong>-1 life</strong>
          </MessageNotification>
        );
      }
    }

    // Other modes
    if (props.wordIndex === 0 && props.currentWord.toUpperCase() === props.targetWord.toUpperCase()) {
      if (props.mode === "puzzle" || props.mode === "conundrum") {
        return <MessageNotification type="success">Correct</MessageNotification>;
      } else {
        return <MessageNotification type="success">You guessed the word in one guess</MessageNotification>;
      }
    } else if (
      props.wordIndex < props.numGuesses &&
      props.currentWord.toUpperCase() === props.targetWord.toUpperCase()
    ) {
      return (
        <MessageNotification type="success">
          You guessed the word in <strong>{props.wordIndex + 1}</strong> guesses
        </MessageNotification>
      );
    } else {
      return (
        <MessageNotification type="default">
          {!props.isCampaignLevel && (
            <>
              The word was: <strong>{props.targetWord.toUpperCase()}</strong>
            </>
          )}
        </MessageNotification>
      );
    }
  }

  function isOutcomeContinue(): boolean {
    const correctAnswer = props.targetWord.toUpperCase() === props.currentWord.toUpperCase();

    // Correct answer with only row left
    const lastRowCorrectAnswer = props.numGuesses === 1 && correctAnswer;

    // Limitless - lives left or correct answer with last remaining life
    const LimitlessContinue = props.mode === "limitless" && (props.numGuesses > 1 || lastRowCorrectAnswer);

    // Increasing - correct and next wordLength does not exceed limit
    const IncreasingContinue =
      props.mode === "increasing" &&
      correctAnswer &&
      props.gamemodeSettings.wordLength < props.gamemodeSettings.wordLengthMaxLimit;

    if (LimitlessContinue || IncreasingContinue) {
      return true;
    } else {
      return false;
    }
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

  // Render the countdown to the next daily wingo
  useEffect(() => {
    if (props.mode !== "daily") {
      return;
    }

    if (props.inProgress) {
      return;
    }

    const intervalId = window.setInterval(() => setSecondsUntilNextDailyWingo(getSecondsUntilMidnight()), 1000);

    return () => clearInterval(intervalId);
  }, [props.mode, props.inProgress]);

  function displayGameshowScore() {
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

  return (
    <div
      className="App"
      style={{ backgroundImage: props.theme && `url(${props.theme.backgroundImageSrc})`, backgroundSize: "100%" }}
    >
      {props.gameshowScore !== undefined && <div className="gameshow-score">{displayGameshowScore()}</div>}
      <div>{displayOutcome()}</div>
      {props.mode === "daily" && !props.inProgress && (
        <MessageNotification type="default">
          Next Daily Wordle in: {secondsToTimeString(secondsUntilNextDailyWingo)}
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
              : props.finishingButtonText || (isOutcomeContinue() ? "Continue" : "Restart")}
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
              <GamemodeSettingsMenu>{generateSettingsOptions()}</GamemodeSettingsMenu>
            </div>
          )
      }

      <div className="word_grid">{populateGrid(props.numGuesses, props.gamemodeSettings.wordLength)}</div>

      <div className="keyboard">
        <Keyboard
          mode={`wingo/${props.mode}` as Page}
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
          disabled={!props.inProgress}
          showKeyboard={props.settings.gameplay.keyboard}
          allowSpaces={props.targetWord.includes("-") || props.targetWord.includes(" ") || undefined}
        />
      </div>

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

export default Wordle;
