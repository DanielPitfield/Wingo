import React, { useState } from "react";
import { PageName } from "../PageNames";
import { Button } from "../Components/Button";
import { MessageNotification } from "../Components/MessageNotification";
import ProgressBar, { GreenToRedColorTransition } from "../Components/ProgressBar";
import { NumberRow } from "../Components/NumberRow";
import NumberTile from "../Components/NumberTile";
import { Guess, hasNumberSelectionFinished, hasNumberSelectionStarted } from "./NumbersGameConfig";
import { NumberSelectionRow } from "../Components/NumberSelectionRow";
import { Theme } from "../Data/Themes";
import { NumberPuzzle, NumberPuzzleValue } from "../Data/NumbersGameSolver";
import { SettingsData } from "../Data/SaveData";
import GamemodeSettingsMenu from "../Components/GamemodeSettingsMenu";
import { randomIntFromInterval } from "./Numble";
import { pickRandomElementFrom } from "./WingoConfig";
import { LEVEL_FINISHING_TEXT } from "../Components/Level";

interface Props {
  isCampaignLevel: boolean;

  gamemodeSettings: {
    hasScaryNumbers: boolean;
    // The quantity of numbers (that make up the selection which can be chosen from to make the target number)
    numOperands: number;
    scoringMethod: "standard" | "pointLostPerDifference";
    timerConfig: { isTimed: true; seconds: number } | { isTimed: false };
  };

  remainingSeconds: number;
  wordIndex: number;
  guesses: Guess[];
  closestGuessSoFar: number | null;
  numGuesses: number;
  currentGuess: Guess;
  numberTileStatuses: {
    type: "original" | "intermediary";
    number: number | null;
    picked: boolean;
  }[];
  inProgress: boolean;
  hasTimerEnded: boolean;
  hasSubmitNumber: boolean;
  targetNumber: number | null;
  theme: Theme;
  settings: SettingsData;
  onClick: (
    value: number | null,
    id: { type: "original"; index: number } | { type: "intermediary"; rowIndex: number }
  ) => void;
  clearGrid: () => void;
  submitBestGuess: () => void;
  setTheme: (theme: Theme) => void;
  setPage: (page: PageName) => void;
  onSubmitNumbersGameNumber: (number: number) => void;
  onSubmitNumbersGameSelection: (numberExpression: number[]) => void;
  onSubmitNumber: (number: number) => void;
  onBackspace: () => void;

  updateGamemodeSettings: (newGamemodeSettings: {
    hasScaryNumbers: boolean;
    scoringMethod: "standard" | "pointLostPerDifference";
    numOperands: number;
    timerConfig: { isTimed: true; seconds: number } | { isTimed: false };
  }) => void;
  updateRemainingSeconds: (newSeconds: number) => void;

  resetGame: (wasCorrect: boolean, answer: string, targetAnswer: string, score: number | null) => void;
  setOperator: (operator: Guess["operator"]) => void;
  addGold: (gold: number) => void;
  gameshowScore?: number;
}

/**
 *
 * @param props
 * @returns
 */
const NumbersGame: React.FC<Props> = (props) => {
  const [solutions, setSolutions] = useState<{ best: NumberPuzzleValue; all: NumberPuzzleValue[] } | null>(null);

  const DEFAULT_TIMER_VALUE = 30;
  const [mostRecentTotalSeconds, setMostRecentTotalSeconds] = useState(
    props.gamemodeSettings?.timerConfig?.isTimed === true
      ? props.gamemodeSettings?.timerConfig.seconds
      : DEFAULT_TIMER_VALUE
  );

  React.useEffect(() => {
    if (!props.targetNumber) {
      return;
    }

    const inputNumbers = props.numberTileStatuses
      .filter((x) => x.type === "original" && x.number)
      .map((x) => x.number!);

    // The amount of numbers that can be selected does not match with the specified/requested number from props
    if (inputNumbers.length !== props.gamemodeSettings.numOperands) {
      return;
    }

    // TODO: Use WebWorkers for solving Numbers Game

    /*
    if (window.Worker) {
      // Start Web Worker
      var worker = new Worker("NumbersGameWebWorkerSolver.ts");
      // Send data
      worker.postMessage({
        targetNumber: props.targetNumber,
        inputNumbers: inputNumbers,
      });
      // Recieve solution
      worker.onmessage = function (e) {
        const solutions = e.data;
        if (solutions) {
          setSolutions(solutions.best);
        }
      };
    } else {
      throw new Error("Web Workers not supported");
    }
    */

    // Slow to solve with 7 numbers, page unrensponsive with 8 numbers
    const puzzle = new NumberPuzzle(props.targetNumber, inputNumbers);
    setSolutions(puzzle.solve());
  }, [props.targetNumber]);

  function getSmallNumber(): number | null {
    // Already selected enough numbers, don't add any more
    if (hasNumberSelectionFinished(props.numberTileStatuses, props.gamemodeSettings.numOperands)) {
      return null;
    }

    // Array of numbers 1 through 10
    const smallNumbers = [];
    for (let i = 1; i <= 10; i++) {
      smallNumbers.push(i);
    }

    return pickRandomElementFrom(smallNumbers);
  }

  function getBigNumber(): number | null {
    if (hasNumberSelectionFinished(props.numberTileStatuses, props.gamemodeSettings.numOperands)) {
      return null;
    }

    // The four standard big numbers
    const bigNumbers = [25, 50, 75, 100];

    if (props.gamemodeSettings.hasScaryNumbers) {
      let scaryNumber;
      while (scaryNumber === undefined) {
        // Random number between 11 and 99
        const randomNumber = randomIntFromInterval(11, 99);
        // A multiple of 10 is too easy!
        if (randomNumber % 10 !== 0) {
          scaryNumber = randomNumber;
        }
      }
      return scaryNumber;
    } else {
      // Randomly select one of the four standard big numbers
      return pickRandomElementFrom(bigNumbers);
    }
  }

  // Automatically choose a selection of small or big numbers
  function quickNumberSelection() {
    let newNumbersGameSelection = [];

    // Build selection by randomly adding small numbers or big numbers
    for (let i = 0; i < props.gamemodeSettings.numOperands; i++) {
      let x = Math.floor(Math.random() * 3) === 0;
      // 66% chance small number, 33% chance big number
      if (x) {
        newNumbersGameSelection.push(getBigNumber()!);
      } else {
        newNumbersGameSelection.push(getSmallNumber()!);
      }
    }
    // Set the entire expression at once
    props.onSubmitNumbersGameSelection(newNumbersGameSelection);
  }
  // Create grid of rows (for guessing numbers)
  function populateGrid() {
    var Grid = [];

    const isSelectionFinished = hasNumberSelectionFinished(
      props.numberTileStatuses,
      props.gamemodeSettings.numOperands
    );

    /*
    Target Number
    Read-only NumberRow for number selection
    Add 'Small' and 'Big' number buttons
    NumberRows for intemediary calculations
    */
    Grid.push(
      <div className="numbers-game-wrapper">
        <div className="target-number">
          <NumberTile number={isSelectionFinished ? props.targetNumber : null} disabled={true} isReadOnly={true} />
        </div>
        <NumberSelectionRow
          key={"number_selection"}
          disabled={!isSelectionFinished}
          onClick={props.onClick}
          numberTileStatuses={props.numberTileStatuses}
        />
        <div className="add-number-buttons-wrapper">
          <Button
            className="add-number-buttons"
            mode={"default"}
            settings={props.settings}
            disabled={isSelectionFinished}
            onClick={() => props.onSubmitNumbersGameNumber(getSmallNumber()!)}
          >
            Small
          </Button>
          <Button
            className="add-number-buttons"
            mode={"default"}
            settings={props.settings}
            disabled={isSelectionFinished}
            onClick={() => props.onSubmitNumbersGameNumber(getBigNumber()!)}
          >
            Big
          </Button>
          <Button
            className="add-number-buttons"
            mode={"default"}
            settings={props.settings}
            disabled={hasNumberSelectionStarted(props.numberTileStatuses) || isSelectionFinished}
            onClick={quickNumberSelection}
          >
            Quick Pick
          </Button>
        </div>
      </div>
    );

    for (let i = 0; i < props.numGuesses; i++) {
      let guess: Guess;

      if (props.wordIndex === i) {
        /* 
        If the wordIndex and the row number are the same
        (i.e the row is currently being used)
        Show the currentGuess
        */
        guess = props.currentGuess;
      } else if (props.wordIndex <= i) {
        /*
        If the wordIndex is behind the currently iterated row
        (i.e the row has not been used yet)
        Show an empty guess
        */
        guess = { operand1: null, operand2: null, operator: "+" };
      } else {
        /* 
        If the wordIndex is ahead of the currently iterated row
        (i.e the row has already been used)
        Show the respective guess
        */
        guess = props.guesses[i];
      }

      Grid.push(
        <NumberRow
          key={`numbers-game-input ${i}`}
          hasTimerEnded={props.hasTimerEnded}
          onClick={props.onClick}
          expression={guess}
          targetNumber={props.targetNumber}
          hasSubmit={!props.inProgress}
          setOperator={props.setOperator}
          disabled={!isSelectionFinished || i > props.wordIndex}
          rowIndex={i}
          indetermediaryGuessStatuses={props.numberTileStatuses.filter((x) => x.type === "intermediary") as any}
        />
      );
    }

    return Grid;
  }

  function generateSettingsOptions(): React.ReactNode {
    return (
      <>
        <label>
          <input
            type="number"
            value={props.gamemodeSettings.numOperands}
            min={4}
            max={10}
            onChange={(e) => {
              const newGamemodeSettings = {
                ...props.gamemodeSettings,
                numOperands: e.target.valueAsNumber,
              };
              props.updateGamemodeSettings(newGamemodeSettings);
            }}
          ></input>
          Numbers in selection
        </label>
        <label>
          <input
            checked={props.gamemodeSettings.hasScaryNumbers}
            type="checkbox"
            onChange={(e) => {
              const newGamemodeSettings = {
                ...props.gamemodeSettings,
                hasScaryNumbers: !props.gamemodeSettings.hasScaryNumbers,
              };
              props.updateGamemodeSettings(newGamemodeSettings);
            }}
          ></input>
          Scary Big Numbers
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
                  props.updateRemainingSeconds(e.target.valueAsNumber);
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

  /**
   *
   * @returns
   */
  function determineBestGuess(): number | null {
    // No target number
    if (!props.targetNumber) {
      return null;
    }

    return props.closestGuessSoFar;
  }

  function determineDifference(): number | null {
    if (!props.targetNumber) {
      return null;
    }
    // Evaluate player's attempt(s)
    const best_guess = determineBestGuess();

    if (best_guess === null) {
      return null;
    }

    const difference = Math.abs(best_guess - props.targetNumber);

    return difference;
  }

  function determineScore(): number | null {
    if (!props.targetNumber) {
      return null;
    }

    // How far away was the result from the target number?
    const difference = determineDifference();

    if (difference === null) {
      return null;
    }

    let score = 0;

    /* 
    Standard:
    10 points for reaching it exactly
    7 points for being 1–5 away
    5 points for being 6–10 away
    */

    if (props.gamemodeSettings.scoringMethod === "standard") {
      const exactAnswer = difference === 0;
      const sevenPointRange = difference >= 1 && difference <= 5;
      const fivePointRange = difference >= 6 && difference <= 10;

      if (exactAnswer) {
        score = 10;
      } else if (sevenPointRange) {
        score = 7;
      } else if (fivePointRange) {
        score = 5;
      } else {
        score = 0;
      }
    } else if (
      props.gamemodeSettings.scoringMethod === "pointLostPerDifference" &&
      difference >= 0 &&
      difference <= 10
    ) {
      // Award one point for being 10 away
      if (difference === 10) {
        score = 1;
      }
      // 10 points for exact answer (and one point is lost for each additional one difference after that)
      else {
        score = 10 - difference;
      }
    } else {
      throw new Error("Unexpected NumbersGame scoring method");
    }

    return score;
  }

  function displayOutcome() {
    if (props.inProgress || !props.hasTimerEnded || !props.targetNumber) {
      return;
    }

    const score = determineScore();

    if (score === null) {
      return (
        <>
          <MessageNotification type="error">
            No guess was made
            <br />
            <strong>0</strong> points
          </MessageNotification>
        </>
      );
    } else {
      if (score === 10) {
        return (
          <MessageNotification type="success">
            You got the target number!
            <br />
            <strong>{score}</strong> points
          </MessageNotification>
        );
      } else if (score >= 1 && score <= 9) {
        return (
          <MessageNotification type="success">
            You were <strong>{determineDifference()}</strong> away from the target number
            <br />
            <strong>{score}</strong> points
          </MessageNotification>
        );
      } else {
        return (
          <MessageNotification type="error">
            You were {determineDifference()} away from the target number
            <br />
            <strong>0</strong> points
          </MessageNotification>
        );
      }
    }
  }

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
      style={{ backgroundImage: `url(${props.theme.backgroundImageSrc})`, backgroundSize: "100% 100%" }}
    >
      {!props.isCampaignLevel && !props.gameshowScore && (
        <div className="gamemodeSettings">
          <GamemodeSettingsMenu>{generateSettingsOptions()}</GamemodeSettingsMenu>
        </div>
      )}

      {props.gameshowScore !== undefined && <div className="gameshow-score">{displayGameshowScore()}</div>}

      {!props.inProgress && (
        <>
          {displayOutcome()}

          {determineDifference() !== 0 && (
            <div className="best-solution">
              <MessageNotification type="default">
                Best Solution:
                <br />
                <strong>
                  <br />
                  {solutions?.best.toListOfSteps().map((step) => (
                    <>
                      {step}
                      <br />
                    </>
                  ))}
                </strong>
              </MessageNotification>
            </div>
          )}

          <Button
            mode={"accept"}
            onClick={() =>
              props.resetGame(
                // correct?
                determineScore !== null && determineScore()! > 0,
                // guess made
                !determineBestGuess() ? "" : determineBestGuess()!.toString(),
                // target answer
                props.targetNumber ? props.targetNumber?.toString() : "0",
                // score
                determineScore()
              )
            }
            settings={props.settings}
            additionalProps={{ autoFocus: true }}
          >
            {props.gameshowScore !== undefined
              ? "Next round"
              : props.isCampaignLevel ? LEVEL_FINISHING_TEXT : "Restart"}
          </Button>
        </>
      )}

      <div className="numbers-game-grid">{populateGrid()}</div>

      {props.inProgress && (
        <>
          <Button mode="destructive" onClick={props.clearGrid} settings={props.settings}>
            Clear
          </Button>
          <Button mode="default" onClick={props.submitBestGuess} settings={props.settings}>
            Use Best Guess
          </Button>
        </>
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

export default NumbersGame;
