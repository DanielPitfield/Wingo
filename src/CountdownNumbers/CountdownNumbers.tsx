import React, { useState } from "react";
import { Page } from "../App";
import { Button } from "../Button";
import { MessageNotification } from "../MessageNotification";
import ProgressBar, { GreenToRedColorTransition } from "../ProgressBar";
import { NumberRow } from "./NumberRow";
import NumberTile from "./NumberTile";
import { Guess, hasNumberSelectionFinished, hasNumberSelectionStarted } from "./CountdownNumbersConfig";
import { CountdownRow } from "./CountdownRow";
import { getCountdownAnswer } from "../Nubble/getValidValues";
import { Theme } from "../Themes";

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
  onClick: (
    value: number | null,
    id: { type: "original"; index: number } | { type: "intermediary"; rowIndex: number }
  ) => void;
  onRightClick: (value: number | null, index: number) => void;
  clearGrid: () => void;
  submitBestGuess: () => void;
  setTheme: (theme: Theme) => void;
  setPage: (page: Page) => void;
  onEnter: () => void;
  onSubmitCountdownNumber: (number: number) => void;
  onSubmitCountdownExpression: (numberExpression: number[]) => void;
  onSubmitNumber: (number: number) => void;
  onBackspace: () => void;
  ResetGame: () => void;
  setOperator: (operator: Guess["operator"]) => void;
  addGold: (gold: number) => void;
}

const CountdownNumbers: React.FC<Props> = (props) => {
  const [answer, setAnswer] = useState("");

  React.useEffect(() => {
    if (!props.targetNumber) {
      return;
    }

    const inputNumbers = props.countdownStatuses.filter((x) => x.type === "original").map((x) => x.number!);

    if (inputNumbers.length !== 6) {
      return;
    }

    const answer = getCountdownAnswer(inputNumbers, props.targetNumber);
    setAnswer(answer);
  }, [props.targetNumber]);

  // Create grid of rows (for guessing numbers)
  function populateGrid(expressionLength: number) {
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

    function getBigNumber(): number | null {
      if (hasNumberSelectionFinished(props.countdownStatuses)) {
        return null;
      }

      const bigNumbers = [25, 50, 75, 100];

      const random_index = Math.round(Math.random() * (bigNumbers.length - 1));
      const random_big_number = bigNumbers[random_index];

      return random_big_number;
    }

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
          <NumberTile
            number={isSelectionFinished ? props.targetNumber : null}
            disabled={false}
            isReadOnly={true}
            // Ignore left and right clicks on the target number
            onClick={() => {}}
            onRightClick={() => {}}
          ></NumberTile>
        </div>
        <CountdownRow
          key={"number_selection"}
          isReadOnly={true}
          onClick={props.onClick}
          expression={props.countdownStatuses}
          length={props.defaultNumOperands}
        ></CountdownRow>
        <div className="add-number-buttons-wrapper">
          <Button
            mode={"default"}
            disabled={isSelectionFinished}
            onClick={() => props.onSubmitCountdownNumber(getSmallNumber()!)}
          >
            Small
          </Button>
          <Button
            mode={"default"}
            disabled={isSelectionFinished}
            onClick={() => props.onSubmitCountdownNumber(getBigNumber()!)}
          >
            Big
          </Button>
          <Button
            mode={"default"}
            disabled={hasNumberSelectionStarted(props.countdownStatuses) || isSelectionFinished}
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
          key={`countdown_numbers_input ${i}`}
          isReadOnly={i < props.wordIndex}
          hasTimerEnded={props.hasTimerEnded}
          onClick={props.onClick}
          onRightClick={props.onRightClick}
          expression={guess}
          length={expressionLength}
          targetNumber={props.targetNumber}
          hasSubmit={!props.inProgress}
          setOperator={props.setOperator}
          rowIndex={i}
        ></NumberRow>
      );
    }

    return Grid;
  }

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
    let intermediaryNumbers = [];
    for (let i = 0; i < intermediaryStatuses.length; i++) {
      if (intermediaryStatuses[i].number !== null) {
        intermediaryNumbers.push(intermediaryStatuses[i].number);
      }
    }

    // Get the closest intermediary guess
    var closest = intermediaryNumbers.reduce(function (prev, curr) {
      const prevDifference = Math.abs(prev! - props.targetNumber!);
      const currentDifference = Math.abs(curr! - props.targetNumber!);
      return currentDifference < prevDifference ? curr : prev;
    });

    return closest;
  }

  function displayOutcome() {
    //let outcome: "success" | "failure" | "in-progress" = "in-progress";
    //const GOLD_PER_POINT = 30;

    if (props.inProgress || !props.hasTimerEnded || !props.targetNumber) {
      return;
    }

    // Evaluate player's attempt(s)
    const best_guess = determineBestGuess();

    if (best_guess === null) {
      //outcome = "failure";
      return (
        <>
          <MessageNotification type="error">
            <strong>No guess was made</strong>
            <br />
            <strong>0 points</strong>
          </MessageNotification>
        </>
      );
    } else {
      // TODO: determineBestGuess could return the difference, depends on if the message should show the best guess
      const difference = Math.abs(best_guess - props.targetNumber);
      // Guess the target number exactly, difference is 0, score is 10
      const score = 10 - difference;

      if (score === 10) {
        //outcome = "success";
        return (
          <>
            <MessageNotification type="success">
              <strong>You got the target number!</strong>
              <br />
              <strong>10 points</strong>
            </MessageNotification>
          </>
        );
      } else if (score >= 1 && score <= 9) {
        //outcome = "success";

        return (
          <>
            <MessageNotification type="success">
              <strong>{`You were ${difference} away from the target number`}</strong>
              <br />
              <strong>{`${score} points`}</strong>
              <strong>{`Answer: ${answer}`}</strong>
            </MessageNotification>
          </>
        );
      } else {
        //outcome = "failure";

        return (
          <>
            <MessageNotification type="error">
              <strong>{`You were too far away from the target number (${difference})`}</strong>
              <br />
              <strong>0 points</strong>
              <strong>{`Answer: ${answer}`}</strong>
            </MessageNotification>
          </>
        );
      }
    }
  }

  return (
    <div className="App" style={{ backgroundImage: `url(${props.theme.backgroundImageSrc})`, backgroundSize: "100%" }}>
      <div>{displayOutcome()}</div>

      <div>
        {props.hasTimerEnded && !props.inProgress && (
          <Button mode={"accept"} onClick={() => props.ResetGame()}>
            Restart
          </Button>
        )}
      </div>

      <div className="countdown-numbers-grid">{populateGrid(props.expressionLength)}</div>

      <Button mode="destructive" onClick={props.clearGrid}>
        Clear
      </Button>

      <Button mode="default" onClick={props.submitBestGuess}>
        Use Best Guess
      </Button>

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
