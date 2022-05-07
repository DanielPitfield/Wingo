import React, { useEffect, useState } from "react";
import { Keyboard } from "./Keyboard";
import { Page } from "./App";
import { WordRow } from "./WordRow";
import { Button } from "./Button";
import { MessageNotification } from "./MessageNotification";
import ProgressBar, { GreenToRedColorTransition } from "./ProgressBar";
import { categoryMappings, getNewLives } from "./WordleConfig";
import { Theme } from "./Themes";
import { SettingsData } from "./SaveData";
import { useCorrectChime, useFailureChime, useLightPingChime } from "./Sounds";

interface Props {
  isCampaignLevel: boolean;
  mode: "daily" | "repeat" | "category" | "increasing" | "limitless" | "puzzle" | "letters_categories";
  timerConfig: { isTimed: false } | { isTimed: true; totalSeconds: number; elapsedSeconds: number };
  keyboard: boolean;
  wordLength: number;
  numGuesses: number;
  guesses: string[];
  currentWord: string;
  wordIndex: number;
  inProgress: boolean;
  inDictionary: boolean;
  isIncompleteWord: boolean;
  hasSubmitLetter: boolean;
  targetWord: string;
  targetHint?: string;
  targetCategory?: string;
  puzzleRevealMs?: number;
  puzzleLeaveNumBlanks?: number;
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
  ResetGame: () => void;
  ContinueGame: () => void;
  setTheme: (theme: Theme) => void;
}

const Wordle: React.FC<Props> = (props) => {
  const [secondsUntilNextDailyWingo, setSecondsUntilNextDailyWingo] = useState(getSecondsUntilMidnight());
  const [playCorrectChimeSoundEffect] = useCorrectChime(props.settings);
  const [playFailureChimeSoundEffect] = useFailureChime(props.settings);
  const [playLightPingSoundEffect] = useLightPingChime(props.settings);

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
          word={displayWord}
          isVertical={false}
          length={wordLength}
          targetWord={props.targetWord}
          revealedLetterIndexes={props.revealedLetterIndexes}
          hasSubmit={true}
          inDictionary={props.inDictionary}
          settings={props.settings}
        />
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
          inProgress={props.inProgress}
          isVertical={false}
          word={word}
          length={wordLength}
          targetWord={props.targetWord}
          hasSubmit={props.wordIndex > i || !props.inProgress}
          inDictionary={props.inDictionary}
          isIncompleteWord={props.isIncompleteWord}
          applyAnimation={props.inProgress ? i >= props.wordIndex - 1 : i >= props.wordIndex}
          settings={props.settings}
        />
      );
    }

    return Grid;
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
      if (props.mode === "puzzle") {
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
    // There are still rows to use or correct answer on only row left
    const LimitlessContinue =
      (props.mode === "limitless" && props.numGuesses > 1) || (props.numGuesses === 1 && correctAnswer);
    const IncreasingContinue = props.mode === "increasing" && correctAnswer;

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

  return (
    <div
      className="App"
      style={{ backgroundImage: props.theme && `url(${props.theme.backgroundImageSrc})`, backgroundSize: "100%" }}
    >
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
            onClick={() =>
              (props.mode === "increasing" || props.mode === "limitless") &&
              props.targetWord.toUpperCase() === props.currentWord.toUpperCase()
                ? props.ContinueGame()
                : props.ResetGame()
            }
            additionalProps={{ autoFocus: true }}
          >
            {props.finishingButtonText || (isOutcomeContinue() ? "Continue" : "Restart")}
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

      <div className="word_grid">{populateGrid(props.numGuesses, props.wordLength)}</div>

      <div className="keyboard">
        {
          /* TODO: Add options to turn keyboard/timer/first letter after Wordle has been launched (during the game) */ props.keyboard && (
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
              allowSpaces={props.targetWord.includes("-") || props.targetWord.includes(" ") || undefined}
            ></Keyboard>
          )
        }
      </div>

      <div>
        {props.timerConfig.isTimed && (
          <ProgressBar
            progress={props.timerConfig.elapsedSeconds}
            total={props.timerConfig.totalSeconds}
            display={{ type: "transition", colorTransition: GreenToRedColorTransition }}
          ></ProgressBar>
        )}
      </div>
    </div>
  );
};

export default Wordle;
