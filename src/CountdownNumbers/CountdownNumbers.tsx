import React, { useState } from "react";
import "../App.scss";
import { Page } from "../App";
import { Button } from "../Button";
import { MessageNotification } from "../MessageNotification";
import ProgressBar from "../ProgressBar";
import { SaveData } from "../SaveData";
import { NumberRow } from "./NumberRow";
import NumberTile from "./NumberTile";
import { operators } from "../Nubble/Nubble";
import { Guess, hasNumberSelectionFinished, hasNumberSelectionStarted } from "./CountdownNumbersConfig";
import { CountdownRow } from "./CountdownRow";

interface Props {
  mode: "casual" | "realistic";
  timerConfig: { isTimed: false } | { isTimed: true; totalSeconds: number; elapsedSeconds: number };
  wordIndex: number;
  guesses: Guess[];
  defaultNumOperands: number;
  defaultNumGuesses: number;
  expressionLength: number;
  currentGuess: Guess;
  countdownExpression: {
    number: number | null;
    picked: boolean;
  }[]
  inProgress: boolean;
  hasTimerEnded: boolean;
  hasSubmitNumber: boolean;
  targetNumber: number | null;
  onClick: (value: number | null) => void;
  onContextMenu: (value: number | null) => void;
  setPage: (page: Page) => void;
  onEnter: () => void;
  onSubmitCountdownNumber: (number: number) => void;
  onSubmitCountdownExpression: (numberExpression: number[]) => void;
  onSubmitNumber: (number: number) => void;
  onBackspace: () => void;
  ResetGame: () => void;
  ContinueGame: () => void;
  setOperator: (operator: Guess["operator"]) => void;
}

const CountdownNumbers: React.FC<Props> = (props) => {
  // Currently selected guess, to be used as the final guess when time runs out
  const [selectedFinalGuess, setSelectedFinalGuess] = useState("");

  // Create grid of rows (for guessing numbers)
  function populateGrid(expressionLength: number) {
    function getSmallNumber(): number | null {
      // Already 6 picked numbers, don't add any more
      if (hasNumberSelectionFinished(props.countdownExpression)) {
        return null;
      }

      // Array of numbers 1 through 10
      const smallNumbers = [];
      for (let i = 1; i <= 10; i++) {
        smallNumbers.push(i);
      }

      const random_index = Math.floor(Math.random() * (smallNumbers.length - 1));
      const random_small_number = smallNumbers[random_index];

      return random_small_number;
    }

    function getBigNumber(): number | null {
      if (hasNumberSelectionFinished(props.countdownExpression)) {
        return null;
      }

      const bigNumbers = [25, 50, 75, 100];

      const random_index = Math.floor(Math.random() * (bigNumbers.length - 1));
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
    const isSelectionFinished = hasNumberSelectionFinished(props.countdownExpression);

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
            isReadOnly={true}
            // Ignore left and right clicks on the target number
            onClick={() => {}}
            onContextMenu={() => {}}
          ></NumberTile>
        </div>
        <CountdownRow
          key={"number_selection"}
          isReadOnly={true}
          onClick={(value) => props.onClick(value)}
          expression={props.countdownExpression}
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
            onClick={() => /* TODO: Big numbers not being added */ props.onSubmitCountdownNumber(getBigNumber()!)}
          >
            Big
          </Button>
          <Button
            mode={"default"}
            disabled={hasNumberSelectionStarted(props.countdownExpression) || isSelectionFinished}
            onClick={quickNumberSelection}
          >
            Quick Pick
          </Button>
        </div>
      </div>
    );

    for (let i = 0; i < props.defaultNumGuesses; i++) {
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
        Show the respectgive guess
        */
        guess = props.guesses[i];
      }

      Grid.push(
        <NumberRow
          key={`countdown_numbers_input ${i}`}
          isReadOnly={false}
          onClick={props.onClick}
          onContextMenu={(value) => props.onContextMenu(value)}
          expression={guess}
          length={expressionLength}
          targetNumber={props.targetNumber}
          hasSubmit={!props.inProgress}
          setOperator={props.setOperator}
        ></NumberRow>
      );
    }

    return Grid;
  }

  function determineScore() {
    const difference = Math.abs(parseInt(selectedFinalGuess) - (props.targetNumber || 0));
  }

  function displayOutcome() {
    let outcome: "success" | "failure" | "in-progress" = "in-progress";
    const GOLD_PER_NUMBER = 30;

    // When timer runs out and if a guess has been made
    if (!props.inProgress && props.hasTimerEnded) {
      if (!selectedFinalGuess) {
        // finalGuess is empty (no guess was made), no points
        outcome = "failure";
        return (
          <>
            <MessageNotification type="error">
              <strong>No guess was made</strong>
              <br />
              <strong>0 points</strong>
            </MessageNotification>
          </>
        );
      }
      if (props.mode === "casual") {
        // Already evaluated that guess is valid, so just display result
        outcome = "success";
        // Reward gold based on how long the selected guess is
        SaveData.addGold(selectedFinalGuess.length * GOLD_PER_NUMBER);
        return (
          <>
            <MessageNotification type="success">
              <strong>{selectedFinalGuess}</strong>
              <br />
              <strong>{determineScore()} points</strong>
            </MessageNotification>
          </>
        );
      } else {
        // Realistic mode
        outcome = "success";
        SaveData.addGold(selectedFinalGuess.length * GOLD_PER_NUMBER);
        return (
          <>
            <MessageNotification type="success">
              <strong>{selectedFinalGuess}</strong>
              <br />
              <strong>{determineScore()} points</strong>
            </MessageNotification>
          </>
        );
      }
    }
  }

  return (
    <div className="App">
      <div>{displayOutcome()}</div>

      <div>
        {props.hasTimerEnded && !props.inProgress && (
          <Button mode={"accept"} onClick={() => props.ResetGame()}>
            Restart
          </Button>
        )}
      </div>

      <div className="countdown_numbers_grid">{populateGrid(props.expressionLength)}</div>

      <div>
        {props.timerConfig.isTimed && (
          <ProgressBar progress={props.timerConfig.elapsedSeconds} total={props.timerConfig.totalSeconds}></ProgressBar>
        )}
      </div>
    </div>
  );
};

export default CountdownNumbers;
