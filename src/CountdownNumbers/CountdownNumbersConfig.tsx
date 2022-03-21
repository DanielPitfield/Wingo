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

export function hasNumberSelectionStarted(
  statuses: {
    number: number | null;
    picked: boolean;
  }[]
): boolean {
  for (let i = 0; i < statuses.length; i++) {
    const number = statuses[i].number;
    // If any number has been picked, return true
    if (number) {
      return true;
    }
  }
  return false;
}

export function hasNumberSelectionFinished(
  statuses: {
    number: number | null;
    picked: boolean;
  }[]
): boolean {
  for (let i = 0; i < statuses.length; i++) {
    const number = statuses[i].number;
    // If any number is not picked, return false
    if (!number) {
      return false;
    }
  }
  return true;
}

export type Guess = { operand1: number | null; operand2: number | null; operator: typeof operators[0]["name"] };

const CountdownNumbersConfig: React.FC<Props> = (props) => {
  const [guesses, setGuesses] = useState<Guess[]>([]);

  const defaultCountdownStatuses: {
    number: number | null;
    picked: boolean;
  }[] = [
    { number: null, picked: false },
    { number: null, picked: false },
    { number: null, picked: false },
    { number: null, picked: false },
    { number: null, picked: false },
    { number: null, picked: false },
  ];

  const [countdownStatuses, setCountdownStatuses] = useState<
    {
      number: number | null;
      picked: boolean;
    }[]
  >(defaultCountdownStatuses);

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

    if (!hasNumberSelectionFinished(countdownStatuses)) {
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
  }, [setSeconds, seconds, props.timerConfig.isTimed, countdownStatuses]);

  function getTargetNumber(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
  }

  function ResetGame() {
    setGuesses([]);
    setCountdownStatuses(defaultCountdownStatuses);
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
    if (!hasNumberSelectionFinished(countdownStatuses)) {
      return;
    }

    // Nothing entered yet
    if (!hasSubmitNumber) {
      return;
    }

    // TODO: Realistic: ask for result of calculation, then add guess
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
    if (!number) {
      return;
    }

    // Still more numbers available to pick/choose
    if (!hasNumberSelectionFinished(countdownStatuses) && inProgress) {
      // Make a copy of current statuses
      const newCountdownStatuses = countdownStatuses.slice();
      // Find index of first object without a number
      const index = newCountdownStatuses.findIndex((element) => element.number === null);
      // Update element with new number
      newCountdownStatuses[index].number = number;
      // Set with this element updated
      setCountdownStatuses(newCountdownStatuses);

      // Determine target number if last number is being picked
      if (index === newCountdownStatuses.length - 1) {
        const newTargetNumber = getTargetNumber(100, 999);
        settargetNumber(newTargetNumber);
      }
    }
  }

  function onSubmitCountdownExpression(expression: number[]) {
    // If no numbers have been picked (statuses as it was to begin with)
    if (countdownStatuses === defaultCountdownStatuses && inProgress) {
      // There are 6 numbers in the input array
      if (expression.length === countdownStatuses.length) {
        // Make a copy of the current countdownStatuses
        const newCountdownStatuses = countdownStatuses.slice();
        // Add the numbers into the status object array (along with updating picked boolean)
        for (let i = 0; i < expression.length; i++) {
          // Update with the number
          newCountdownStatuses[i].number = expression[i];
        }
        // Update countdownStatuses
        setCountdownStatuses(newCountdownStatuses);

        // Determine target number
        const newTargetNumber = getTargetNumber(100, 999);
        settargetNumber(newTargetNumber);
      }
    }
  }

  function onSubmitNumber(number: number) {
    // Additional condition of all 6 numbers having been selected
    if (
      currentGuess.operand1 !== null &&
      currentGuess.operand2 !== null &&
      hasNumberSelectionFinished(countdownStatuses) &&
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

  function addOperandToGuess(number: number | null) {
    if (!number) {
      return;
    }

    if (!hasNumberSelectionFinished(countdownStatuses)) {
      return;
    }

    if (hasTimerEnded) {
      return;
    }

    // Find all the elements of the respective number (where picked is also false)
    const numberStatus = countdownStatuses.filter((x) => x.number === number && !x.picked);

    // No suitable element in countdownStatuses to accomodate adding this new number
    if (numberStatus.length <= 0) {
      return;
    }

    const bothOperandsEmpty = currentGuess.operand1 === null && currentGuess.operand2 === null;
    const onlyFirstOperand = currentGuess.operand1 !== null && currentGuess.operand2 === null;
    const onlySecondOperand = currentGuess.operand1 === null && currentGuess.operand2 !== null;
    const bothOperands = currentGuess.operand1 !== null && currentGuess.operand2 !== null;

    if (bothOperandsEmpty || onlySecondOperand) {
      // Set operand1 to number
      setCurrentGuess({ ...currentGuess, operand1: number });
    } else if (onlyFirstOperand) {
      // Set operand2 to number
      setCurrentGuess({ ...currentGuess, operand2: number });
    } else if (bothOperands) {
      // Remove the second operand
      removeOperandFromGuess(currentGuess.operand2);
      // Replace with (add) new second operand
      setCurrentGuess({ ...currentGuess, operand2: number }); 
    }

    const newCountdownStatuses = countdownStatuses.slice();
    // Find first suitable index to accomodate adding this new number
    const numberStatusIndex = countdownStatuses.findIndex((x) => x.number === number && !x.picked);
    // Flag as picked so it can't be added again
    newCountdownStatuses[numberStatusIndex].picked = true;
    setCountdownStatuses(newCountdownStatuses);
  }

  function removeOperandFromGuess(number: number | null) {
    // TODO: Prevent default (context menu appearing)

    // Tile that was right clicked had no value (empty)
    if (!number) {
      return;
    }

    if (hasTimerEnded) {
      return;
    }

    // If both operands are the same number
    if (currentGuess.operand1 === number && currentGuess.operand2 === number) {
      // TODO: Is there way of determining which (of the two operands with the same numbers) was right clicked?
      // Remove the second occurence of the number
      setCurrentGuess({ ...currentGuess, operand2: null });
    }
    // If the first operand was (right) clicked
    else if (currentGuess.operand1 === number) {
      setCurrentGuess({ ...currentGuess, operand1: null });
      // If the other operand was also empty, go back a row
      /*
      if (currentGuess.operand2 === null && wordIndex > 0) {
        setWordIndex(wordIndex - 1); // Decrement index to go back a row
      }
      */
    } else if (currentGuess.operand2 === number) {
      setCurrentGuess({ ...currentGuess, operand2: null });
      /*
      if (currentGuess.operand1 === null && wordIndex > 0) {
        setWordIndex(wordIndex - 1); // Decrement index to go back a row
      }
      */
    }

    const newCountdownStatuses = countdownStatuses.slice();
    // Find first occurence of this number being picked
    const numberStatusIndex = countdownStatuses.findIndex((x) => x.number === number && x.picked);
    // Flag as not picked so it can be added again
    newCountdownStatuses[numberStatusIndex].picked = false;
    setCountdownStatuses(newCountdownStatuses);
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
      countdownExpression={countdownStatuses}
      inProgress={inProgress}
      hasTimerEnded={hasTimerEnded}
      hasSubmitNumber={hasSubmitNumber}
      targetNumber={targetNumber}
      onClick={addOperandToGuess}
      onContextMenu={removeOperandFromGuess}
      onEnter={onEnter}
      onSubmitCountdownNumber={onSubmitCountdownNumber}
      onSubmitCountdownExpression={onSubmitCountdownExpression}
      onSubmitNumber={onSubmitNumber}
      onBackspace={onBackspace}
      ResetGame={ResetGame}
      ContinueGame={ContinueGame}
      setPage={props.setPage}
      setOperator={(operator) => setCurrentGuess({ ...currentGuess, operator })}
    ></CountdownNumbers>
  );
};

export default CountdownNumbersConfig;
