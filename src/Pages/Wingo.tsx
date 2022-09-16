import React, { useState } from "react";
import { Keyboard } from "../Components/Keyboard";
import { PageName } from "../PageNames";
import { WordRow } from "../Components/WordRow";
import { Button } from "../Components/Button";
import { MessageNotification } from "../Components/MessageNotification";
import ProgressBar, { GreenToRedColorTransition } from "../Components/ProgressBar";
import { getNewLives, WingoConfigProps } from "./WingoConfig";
import { Theme } from "../Data/Themes";
import { SettingsData } from "../Data/SaveData";
import { useCorrectChime, useFailureChime, useLightPingChime } from "../Data/Sounds";
import GamemodeSettingsMenu from "../Components/GamemodeSettingsMenu";
import { LEVEL_FINISHING_TEXT } from "../Components/Level";
import {
  MIN_PUZZLE_WORD_LENGTH,
  MAX_PUZZLE_WORD_LENGTH,
  MIN_PUZZLE_REVEAL_INTERVAL_SECONDS,
  MAX_PUZZLE_REVEAL_INTERVAL_SECONDS,
  MIN_PUZZLE_LEAVE_NUM_BLANKS,
  MAX_TARGET_WORD_LENGTH,
  MIN_TARGET_WORD_LENGTH,
} from "../Data/GamemodeSettingsInputLimits";
import { categoryMappings } from "../Data/WordArrayMappings";
import { getNewGamemodeSettingValue } from "../Data/GamemodeSettingsNewValue";
import { getGamemodeDefaultTimerValue } from "../Data/DefaultTimerValues";
import { DEFAULT_WINGO_INCREASING_MAX_NUM_LIVES } from "../Data/DefaultGamemodeSettings";
import { LetterStatus } from "../Components/LetterTile";

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
    maxLivesConfig: { isLimited: true; maxLives: number } | { isLimited: false };
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
    status: LetterStatus;
  }[];
  revealedLetterIndexes: number[];

  page: PageName;
  theme?: Theme;
  settings: SettingsData;
  setPage: (page: PageName) => void;
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
    maxLivesConfig: { isLimited: true; maxLives: number } | { isLimited: false };
    timerConfig: { isTimed: true; seconds: number } | { isTimed: false };
  }) => void;

  ResetGame: () => void;
  ContinueGame: () => void;
  setTheme: (theme: Theme) => void;
  gameshowScore?: number;
}

const Wingo = (props: Props) => {
  const [secondsUntilNextDailyWingo, setSecondsUntilNextDailyWingo] = useState(getSecondsUntilMidnight());
  const [playCorrectChimeSoundEffect] = useCorrectChime(props.settings);
  const [playFailureChimeSoundEffect] = useFailureChime(props.settings);
  const [playLightPingSoundEffect] = useLightPingChime(props.settings);

  /*
  Keep track of the most recent value for the timer
  So that the value can be used as the default value for the total seconds input element
  (even after the timer is enabled/disabled)
  */
  const [mostRecentTotalSeconds, setMostRecentTotalSeconds] = useState(
    props.gamemodeSettings?.timerConfig?.isTimed === true
      ? props.gamemodeSettings?.timerConfig.seconds
      : getGamemodeDefaultTimerValue(props.page)
  );

  const [mostRecentMaxLives, setMostRecentMaxLives] = useState(
    props.gamemodeSettings?.maxLivesConfig.isLimited === true
      ? props.gamemodeSettings.maxLivesConfig.maxLives
      : DEFAULT_WINGO_INCREASING_MAX_NUM_LIVES
  );

  const isModeWithDisplayRow = () => {
    const modesWithDisplayRow: typeof props.mode[] = ["puzzle", "conundrum"];
    return modesWithDisplayRow.includes(props.mode);
  };

  function getDisplayRow() {
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
          page={props.page}
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
            page={props.page}
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
  function populateGrid() {
    let Grid = [];

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
          page={props.page}
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

  const handleGamemodeSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGamemodeSettings: WingoConfigProps["gamemodeSettings"] = {
      ...props.gamemodeSettings,
      [e.target.name]: getNewGamemodeSettingValue(e, {
        maxLives: mostRecentMaxLives,
        totalSeconds: mostRecentTotalSeconds,
      }),
    };

    props.updateGamemodeSettings(newGamemodeSettings);
  };

  function generateSettingsOptions(): React.ReactNode {
    // Show atleast 1 letter (can't all be blank!)
    const MAX_PUZZLE_LEAVE_NUM_BLANKS = props.targetWord.length - 1;

    // Can the current mode be continued?
    const isContinuationMode = () => {
      // The modes which can be continued (they aren't always just reset)
      const continuationModes: typeof props.mode[] = ["increasing", "limitless"];
      return continuationModes.includes(props.mode);
    };

    const MIN_WORD_LENGTH_LABEL = isContinuationMode() ? "Starting Word Length" : "Word Length";

    // The starting word length must be atleast one below the maximum target word length (for 'increasing' mode), otherwise it would just be a mode of guessing one long word
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
              name="wordLength"
              value={props.gamemodeSettings.wordLength}
              min={MIN_PUZZLE_WORD_LENGTH}
              max={MAX_PUZZLE_WORD_LENGTH}
              onChange={handleGamemodeSettingsChange}
            ></input>
            Word Length
          </label>

          <label>
            <input
              type="number"
              name="puzzleRevealMs"
              // Show value in seconds (divide by 1000)
              value={props.gamemodeSettings.puzzleRevealMs / 1000}
              min={MIN_PUZZLE_REVEAL_INTERVAL_SECONDS}
              max={MAX_PUZZLE_REVEAL_INTERVAL_SECONDS}
              onChange={handleGamemodeSettingsChange}
            ></input>
            Reveal Interval (seconds)
          </label>

          <label>
            <input
              type="number"
              name="puzzleLeaveNumBlanks"
              value={props.gamemodeSettings.puzzleLeaveNumBlanks}
              min={MIN_PUZZLE_LEAVE_NUM_BLANKS}
              max={MAX_PUZZLE_LEAVE_NUM_BLANKS}
              onChange={handleGamemodeSettingsChange}
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
              name="wordLength"
              value={props.gamemodeSettings.wordLength}
              min={MIN_TARGET_WORD_LENGTH}
              max={MIN_WORD_LENGTH_MAX_BOUNDARY}
              onChange={handleGamemodeSettingsChange}
            ></input>
            {MIN_WORD_LENGTH_LABEL}
          </label>

          {isContinuationMode() && (
            <label>
              <input
                type="number"
                name="wordLengthMaxLimit"
                value={props.gamemodeSettings.wordLengthMaxLimit}
                min={props.gamemodeSettings.wordLength + 1}
                max={MAX_TARGET_WORD_LENGTH}
                onChange={handleGamemodeSettingsChange}
              ></input>
              Ending Word Length
            </label>
          )}

          {props.mode === "limitless" && (
            <>
              <label>
                <input
                  checked={props.gamemodeSettings.maxLivesConfig.isLimited}
                  type="checkbox"
                  name="maxLivesConfig"
                  onChange={handleGamemodeSettingsChange}
                ></input>
                Cap max number of extra lives
              </label>
              {props.gamemodeSettings.maxLivesConfig.isLimited && (
                <label>
                  <input
                    type="number"
                    name="maxLivesConfig"
                    value={props.gamemodeSettings.maxLivesConfig.maxLives}
                    min={1}
                    max={50}
                    onChange={(e) => {
                      setMostRecentMaxLives(e.target.valueAsNumber);
                      handleGamemodeSettingsChange(e);
                    }}
                  ></input>
                  Max number of extra lives
                </label>
              )}
            </>
          )}

          <label>
            <input
              checked={props.gamemodeSettings.isFirstLetterProvided}
              type="checkbox"
              name="isFirstLetterProvided"
              onChange={handleGamemodeSettingsChange}
            ></input>
            First Letter Provided
          </label>

          <label>
            <input
              checked={props.gamemodeSettings.isHintShown}
              type="checkbox"
              name="isHintShown"
              onChange={handleGamemodeSettingsChange}
            ></input>
            Hints
          </label>

          <>
            <label>
              <input
                checked={props.gamemodeSettings.timerConfig.isTimed}
                type="checkbox"
                name="timerConfig"
                onChange={handleGamemodeSettingsChange}
              ></input>
              Timer
            </label>
            {props.gamemodeSettings.timerConfig.isTimed && (
              <label>
                <input
                  type="number"
                  name="timerConfig"
                  value={props.gamemodeSettings.timerConfig.seconds}
                  min={10}
                  max={120}
                  step={5}
                  onChange={(e) => {
                    setMostRecentTotalSeconds(e.target.valueAsNumber);
                    handleGamemodeSettingsChange(e);
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

  React.useEffect(() => {
    if (props.inProgress) {
      return;
    }

    // Determine whether the game ended in failure or success
    const wasFailure =
      !props.inDictionary ||
      (props.mode === "limitless" &&
        getNewLives(props.numGuesses, props.wordIndex, props.gamemodeSettings.maxLivesConfig) <= 0);

    if (wasFailure) {
      playFailureChimeSoundEffect();
    } else {
      playCorrectChimeSoundEffect();
    }
  }, [props.inProgress]);

  function displayOutcome(): React.ReactNode {
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
                <br />
                The word was: <strong>{props.targetWord.toUpperCase()}</strong>
              </>
            )}
            {props.mode === "limitless" && (
              <>
                <br />
                <strong>-1 life</strong>
              </>
            )}
          </MessageNotification>
        );
      }
    }

    // The number of rows not used in guessing word
    const newLives = getNewLives(props.numGuesses, props.wordIndex, props.gamemodeSettings.maxLivesConfig);

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
                <br />
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
      style={{
        backgroundImage: !props.isCampaignLevel && props.theme ? `url(${props.theme.backgroundImageSrc})` : undefined,
        backgroundSize: "100% 100%",
      }}
    >
      {props.gameshowScore !== undefined && <div className="gameshow-score">{displayGameshowScore()}</div>}
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
              <GamemodeSettingsMenu>{generateSettingsOptions()}</GamemodeSettingsMenu>
            </div>
          )
      }

      <div className="word_grid">{populateGrid()}</div>

      {props.settings.gameplay.keyboard && (
        <Keyboard
          page={props.page}
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
          hasBackspace={true}
          hasEnter={true}
        />
      )}

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
