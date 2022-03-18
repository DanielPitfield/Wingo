import React, { useState } from "react";
import "../App.scss";
import { Page } from "../App";
import CountdownNumbers from "./CountdownNumbers";
import { operators } from "../Nubble/Nubble";

interface Props {
  page: Page;
  mode: "casual" | "realistic";
  defaultNumOperands: number;
  defaultNumGuesses: number;
  defaultExpressionLength: number;
  timerConfig: { isTimed: false } | { isTimed: true; seconds: number };
  setPage: (page: Page) => void;
}

export function isNumberValid(currentExpression: string) {
  if (!currentExpression) {
    return false;
  }
}

export type Guess = { operand1: number | null; operand2: number | null; operator: typeof operators[0]["name"] };

const CountdownNumbersConfig: React.FC<Props> = (props) => {
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [countdownExpression, setCountdownExpression] = useState<number[]>([]);
  const [currentGuess, setCurrentGuess] = useState<Guess>({ operand1: null, operand2: null, operator: "+" });
  const [inProgress, setinProgress] = useState(true);
  const [hasTimerEnded, sethasTimerEnded] = useState(false);
  const [expressionLength, setExpressionLength] = useState(props.defaultExpressionLength);
  const [targetNumber, settargetNumber] = useState<number | null>(null);
  const [hasSubmitNumber, sethasSubmitNumber] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);

  const [seconds, setSeconds] = useState(props.timerConfig.isTimed ? props.timerConfig.seconds : 0);

  // Timer Setup
  React.useEffect(() => {
    if (!props.timerConfig.isTimed) {
      return;
    }

    if (countdownExpression.length !== 9) {
      return;
    }

    const timer = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      } else {
        sethasTimerEnded(true);
        setinProgress(false);
      }
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [setSeconds, seconds, props.timerConfig.isTimed, countdownExpression]);

  function getTargetNumber(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
  }

  function ResetGame() {
    setGuesses([]);
    setCountdownExpression([]);
    setCurrentGuess({ operand1: null, operand2: null, operator: "+" });
    settargetNumber(0);
    setinProgress(true);
    sethasTimerEnded(false);
    setExpressionLength(props.defaultExpressionLength);
    sethasSubmitNumber(false);
    if (props.timerConfig.isTimed) {
      // Reset the timer if it is enabled in the game options
      setSeconds(props.timerConfig.seconds);
    }
  }

  function ContinueGame() {
    setCurrentGuess({ operand1: null, operand2: null, operator: "+" });
    setinProgress(true);
    setExpressionLength(props.defaultExpressionLength);
    sethasSubmitNumber(false);
  }

  function onEnter() {
    if (!inProgress) {
      return;
    }

    // The 6 numbers have not all been picked
    if (countdownExpression.length !== 6) {
      return;
    }

    // Nothing entered yet
    if (!hasSubmitNumber) {
      return;
    }

    if (props.mode === "realistic") {
      // Don't need to do any evaluation of the guess and just add to guesses regardless
      setGuesses(guesses.concat(currentGuess));
      ContinueGame();
      return;
    }

    // Stop progress for evalution for Casual game mode type
    setinProgress(false);

    //
    //const isValidNumber = isNumberValid(currentExpression);

    // Wait half a second to show validity of word, then continue
    setTimeout(() => {
      ContinueGame();
    }, 500);

    // TODO: Add completed round to game history
  }

  function onSubmitCountdownNumber(number: number) {
    // Still more numbers available to pick/choose
    if (countdownExpression.length < props.defaultNumOperands && inProgress) {
      const newCountdownExpression = countdownExpression.slice();
      newCountdownExpression.push(number);
      setCountdownExpression(newCountdownExpression);
      // Determine target number when last number has been picked
      if (countdownExpression.length === props.defaultNumOperands - 1) {
        const newTargetNumber = getTargetNumber(100, 999);
        settargetNumber(newTargetNumber);
      }
    }
  }

  function onSubmitCountdownExpression(expression: number[]) {
    if (countdownExpression.length === 0 && inProgress) {
      setCountdownExpression(expression);
      // Determine target number
      const newTargetNumber = getTargetNumber(100, 999);
      settargetNumber(newTargetNumber);
    }
  }

  function onSubmitNumber(number: number) {
    // Additional condition of all 6 numbers having been selected
    if (
      currentGuess.operand1 !== null &&
      currentGuess.operand2 !== null &&
      countdownExpression.length === props.defaultNumOperands &&
      inProgress
    ) {
      // If operand1 has been populated, then set operand2
      if (currentGuess.operand1 !== null) {
        setCurrentGuess({ ...currentGuess, operand2: number });
      } else if (currentGuess.operand2 === null) {
        // Else; if operand2 has not been populated, then set operand1
        setCurrentGuess({ ...currentGuess, operand1: number });
      }

      sethasSubmitNumber(true);
    }
  }

  function onBackspace() {
    /*
    if (currentExpression.length > 0 && inProgress) {
      // If there is a letter to remove
      setCurrentExpression(currentExpression.substring(0, currentExpression.length - 1));
    }
    */
  }

  function moveOperand(number: number) {
    // If operand1 has been populated, then set operand2
    if (currentGuess.operand1 !== null) {
      setCurrentGuess({ ...currentGuess, operand2: number });
    } else if (currentGuess.operand2 === null) {
      // Else; if operand2 has not been populated, then set operand1
      setCurrentGuess({ ...currentGuess, operand1: number });
    }
  }

  return (
    <CountdownNumbers
      mode={props.mode}
      timerConfig={
        props.timerConfig.isTimed
          ? {
              isTimed: true,
              elapsedSeconds: seconds,
              totalSeconds: props.timerConfig.seconds,
            }
          : { isTimed: false }
      }
      expressionLength={expressionLength}
      wordIndex={wordIndex}
      guesses={guesses}
      defaultNumOperands={props.defaultNumOperands}
      defaultNumGuesses={props.defaultNumGuesses}
      currentGuess={currentGuess}
      countdownExpression={countdownExpression}
      inProgress={inProgress}
      hasTimerEnded={hasTimerEnded}
      hasSubmitNumber={hasSubmitNumber}
      targetNumber={targetNumber}
      onClick={moveOperand}
      onEnter={onEnter}
      onSubmitCountdownNumber={onSubmitCountdownNumber}
      onSubmitCountdownExpression={onSubmitCountdownExpression}
      onSubmitNumber={onSubmitNumber}
      onBackspace={onBackspace}
      ResetGame={ResetGame}
      ContinueGame={ContinueGame}
      setPage={props.setPage}
      setOperator={(operator) => setCurrentGuess({...currentGuess, operator})}
    ></CountdownNumbers>
  );
};

export default CountdownNumbersConfig;
