import React, { useState } from "react";
import "../App.scss";
import { Page } from "../App";
import CountdownNumbers from "./CountdownNumbers";

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

const CountdownNumbersConfig: React.FC<Props> = (props) => {
  const [guesses, setGuesses] = useState<number[]>([]);
  const [countdownExpression, setCountdownExpression] = useState<number[]>([]);
  const [currentExpression, setCurrentExpression] = useState<number[]>([]);
  const [inProgress, setinProgress] = useState(true);
  const [hasTimerEnded, sethasTimerEnded] = useState(false);
  const [expressionLength, setExpressionLength] = useState(props.defaultExpressionLength);
  const [targetNumber, settargetNumber] = useState<string>();
  const [hasSubmitNumber, sethasSubmitNumber] = useState(false);

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

  function ResetGame() {
    setGuesses([]);    
    setCountdownExpression([]);
    setCurrentExpression([]);
    settargetNumber("");
    setinProgress(true);
    sethasTimerEnded(false)
    setExpressionLength(props.defaultExpressionLength);
    sethasSubmitNumber(false);
    if (props.timerConfig.isTimed) {
      // Reset the timer if it is enabled in the game options
      setSeconds(props.timerConfig.seconds);
    }
  }

  function ContinueGame() {
    setCurrentExpression([]);
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
      setGuesses(guesses.concat(currentExpression));
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
    if (countdownExpression.length < props.defaultNumOperands && inProgress) {
      const newCountdownExpression = countdownExpression.slice();
      newCountdownExpression.push(number);
      setCountdownExpression(newCountdownExpression);
    }
  }

  function onSubmitCountdownExpression(expression: number[]) {
    if (countdownExpression.length === 0 && inProgress) {
      setCountdownExpression(expression);
    }
  }

  function onSubmitNumber(number: number) {
    // Additional condition of all 6 numbers having been selected
    if (currentExpression.length < expressionLength && countdownExpression.length === props.defaultNumOperands && inProgress) {
      const newCurrentExpression = currentExpression.slice();
      newCurrentExpression.push(number);
      setCurrentExpression(newCurrentExpression);
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
      guesses={guesses}
      defaultNumOperands={props.defaultNumOperands}
      defaultNumGuesses={props.defaultNumGuesses}
      currentExpression={currentExpression}
      countdownExpression={countdownExpression}
      inProgress={inProgress}
      hasTimerEnded={hasTimerEnded}
      hasSubmitNumber={hasSubmitNumber}
      targetNumber={targetNumber || ""}
      onEnter={onEnter}
      onSubmitCountdownNumber={onSubmitCountdownNumber}
      onSubmitCountdownExpression={onSubmitCountdownExpression}
      onSubmitNumber={onSubmitNumber}
      onBackspace={onBackspace}
      ResetGame={ResetGame}
      ContinueGame={ContinueGame}
      setPage={props.setPage}
    ></CountdownNumbers>
  );
};

export default CountdownNumbersConfig;
