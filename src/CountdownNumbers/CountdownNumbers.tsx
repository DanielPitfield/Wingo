import React, { useState } from "react";
import { Page } from "../App";
import { Button } from "../Button";
import { MessageNotification } from "../MessageNotification";
import ProgressBar, { GreenToRedColorTransition } from "../ProgressBar";
import { NumberRow } from "./NumberRow";
import NumberTile from "./NumberTile";
import { Guess, hasNumberSelectionFinished, hasNumberSelectionStarted } from "./CountdownNumbersConfig";
import { CountdownRow } from "./CountdownRow";
import { Theme } from "../Themes";
import { NumberPuzzle, NumberPuzzleValue } from "./CountdownSolver";
import { SettingsData } from "../SaveData";

interface Props {
  mode: "countdown_numbers_casual" | "countdown_numbers_realistic";
  timerConfig: { isTimed: false } | { isTimed: true; totalSeconds: number; elapsedSeconds: number };
  wordIndex: number;
  guesses: Guess[];
  defaultNumOperands: number;
  numGuesses: number;
  expressionLength: number;
  currentGuess: Guess;
  countdownStatuses: {
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
  setPage: (page: Page) => void;
  onEnter: () => void;
  onSubmitCountdownNumber: (number: number) => void;
  onSubmitCountdownExpression: (numberExpression: number[]) => void;
  onSubmitNumber: (number: number) => void;
  onBackspace: () => void;
  resetGame: () => void;
  setOperator: (operator: Guess["operator"]) => void;
  addGold: (gold: number) => void;
}

/**
 *
 * @param props
 * @returns
 */
const CountdownNumbers: React.FC<Props> = (props) => {
  const [solutions, setSolutions] = useState<{ best: NumberPuzzleValue; all: NumberPuzzleValue[] } | null>(null);

  React.useEffect(() => {
    if (!props.targetNumber) {
      return;
    }

    const inputNumbers = props.countdownStatuses.filter((x) => x.type === "original").map((x) => x.number!);

    if (inputNumbers.length !== 6) {
      return;
    }

    const puzzle = new NumberPuzzle(props.targetNumber, inputNumbers);
    setSolutions(puzzle.solve());
  }, [props.targetNumber]);

  // Create grid of rows (for guessing numbers)
  function populateGrid(expressionLength: number) {
    /**
     *
     * @returns
     */
    function getSmallNumber(): number | null {
      // Already 6 picked numbers, don't add any more
      if (hasNumberSelectionFinished(props.countdownStatuses)) {
        return null;
      }

      // Array of numbers 1 through 10
      const smallNumbers = [];
      for (let i = 1; i <= 10; i++) {
        smallNumbers.push(i);
      }

      const random_index = Math.round(Math.random() * (smallNumbers.length - 1));
      const random_small_number = smallNumbers[random_index];

      return random_small_number;
    }

    /**
     *
     * @returns
     */
    function getBigNumber(): number | null {
      if (hasNumberSelectionFinished(props.countdownStatuses)) {
        return null;
      }

      const bigNumbers = [25, 50, 75, 100];

      const random_index = Math.round(Math.random() * (bigNumbers.length - 1));
      const random_big_number = bigNumbers[random_index];

      return random_big_number;
    }

    /**
     *
     */
    function quickNumberSelection() {
      let newCountdownExpression = [];
      const numCountdownNumbers = 6;

      // Build word by randomly adding small numbers or big numbers
      for (let i = 0; i < numCountdownNumbers; i++) {
        let x = Math.floor(Math.random() * 3) === 0;
        // 66% chance small number, 33% chance big number
        if (x) {
          newCountdownExpression.push(getBigNumber()!);
        } else {
          newCountdownExpression.push(getSmallNumber()!);
        }
      }
      // Set the entire expression at once
      props.onSubmitCountdownExpression(newCountdownExpression);
    }

    var Grid = [];

    // Check if 6 numbers have been selected
    const isSelectionFinished = hasNumberSelectionFinished(props.countdownStatuses);

    /*
    Target Number
    Read-only NumberRow for number selection
    Add 'Small' and 'Big' number buttons
    NumberRows for intemediary calculations
    */
    Grid.push(
      <div className="countdown-numbers-wrapper">
        <div className="target-number">
          <NumberTile number={isSelectionFinished ? props.targetNumber : null} disabled={true} isReadOnly={true} />
        </div>
        <CountdownRow
          key={"number_selection"}
          disabled={!isSelectionFinished}
          onClick={props.onClick}
          expression={props.countdownStatuses}
          length={props.defaultNumOperands}
        />
        <div className="add-number-buttons-wrapper">
          <Button
            mode={"default"}
            settings={props.settings}
            disabled={isSelectionFinished}
            onClick={() => props.onSubmitCountdownNumber(getSmallNumber()!)}
          >
            Small
          </Button>
          <Button
            mode={"default"}
            settings={props.settings}
            disabled={isSelectionFinished}
            onClick={() => props.onSubmitCountdownNumber(getBigNumber()!)}
          >
            Big
          </Button>
          <Button
            mode={"default"}
            settings={props.settings}
            disabled={hasNumberSelectionStarted(props.countdownStatuses) || isSelectionFinished}
            onClick={quickNumberSelection}
          >
            Quick Pick
          </Button>
        </div>
      </div>
    );

    if (props.inProgress) {
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
            key={`countdown_numbers_input ${i}`}
            hasTimerEnded={props.hasTimerEnded}
            onClick={props.onClick}
            expression={guess}
            length={expressionLength}
            targetNumber={props.targetNumber}
            hasSubmit={!props.inProgress}
            setOperator={props.setOperator}
            disabled={!isSelectionFinished || i > props.wordIndex}
            rowIndex={i}
            indetermediaryGuessStatuses={props.countdownStatuses.filter((x) => x.type === "intermediary") as any}
          />
        );
      }
    } else {
      Grid.push(
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
      );
    }

    return Grid;
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

    const intermediaryStatuses = props.countdownStatuses.filter((x) => x.type === "intermediary");

    // No intermediary results
    if (intermediaryStatuses.length <= 0) {
      return null;
    }

    // Get all the intermediary numbers (from statuses)
    const intermediaryNumbers = [];
    for (let i = 0; i < intermediaryStatuses.length; i++) {
      if (intermediaryStatuses[i].number !== null) {
        intermediaryNumbers.push(intermediaryStatuses[i].number);
      }
    }

    // Get the closest intermediary guess
    const closest = intermediaryNumbers.reduce(function (prev, curr) {
      const prevDifference = Math.abs(prev! - props.targetNumber!);
      const currentDifference = Math.abs(curr! - props.targetNumber!);

      return currentDifference < prevDifference ? curr : prev;
    });

    return closest;
  }

  function displayOutcome() {
    if (props.inProgress || !props.hasTimerEnded || !props.targetNumber) {
      return;
    }

    // Evaluate player's attempt(s)
    const best_guess = determineBestGuess();

    if (best_guess === null) {
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
      const difference = Math.abs(best_guess - props.targetNumber);

      // Guess the target number exactly, difference is 0, score is 10
      const score = 10 - difference;

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
            You were <strong>{difference}</strong> away from the target number
            <br />
            <strong>{score}</strong> points
          </MessageNotification>
        );
      } else {
        return (
          <MessageNotification type="error">
            You were {difference} away from the target number
            <br />
            <strong>0</strong> points
          </MessageNotification>
        );
      }
    }
  }

  return (
    <div className="App" style={{ backgroundImage: `url(${props.theme.backgroundImageSrc})`, backgroundSize: "100%" }}>
      {displayOutcome()}

      <div>
        {props.hasTimerEnded && !props.inProgress && (
          <Button mode={"accept"} onClick={() => props.resetGame()} settings={props.settings}>
            Restart
          </Button>
        )}
      </div>

      <div className="countdown-numbers-grid">{populateGrid(props.expressionLength)}</div>

      {props.inProgress && (
        <Button mode="destructive" onClick={props.clearGrid} settings={props.settings}>
          Clear
        </Button>
      )}

      {props.inProgress && (
        <Button mode="default" onClick={props.submitBestGuess} settings={props.settings}>
          Use Best Guess
        </Button>
      )}

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

export default CountdownNumbers;
