import React, { useState } from "react";
import { Page } from "../App";
import CountdownNumbers from "./CountdownNumbers";
import { calculateTotal } from "./NumberRow";
import { Theme } from "../Themes";
import { SettingsData } from "../SaveData";

interface Props {
  page: Page;
  mode: "countdown_numbers_casual" | "countdown_numbers_realistic";
  defaultNumOperands: number;
  defaultNumGuesses: number;
  defaultExpressionLength: number;
  timerConfig: { isTimed: false } | { isTimed: true; seconds: number };
  theme: Theme;
  settings: SettingsData;
  setTheme: (theme: Theme) => void;
  setPage: (page: Page) => void;
  addGold: (gold: number) => void;
}

export const operators: { name: "÷" | "-" | "+" | "×"; function: (num1: number, num2: number) => number }[] = [
  {
    name: "÷",
    function: (num1: number, num2: number): number => num1 / num2,
  },
  {
    name: "-",
    function: (num1: number, num2: number): number => num1 - num2,
  },
  {
    name: "+",
    function: (num1: number, num2: number): number => num1 + num2,
  },
  {
    name: "×",
    function: (num1: number, num2: number): number => num1 * num2,
  },
];

export const operators_symbols = ["÷", "-", "+", "×"];

export function isNumberValid(currentExpression: string) {
  if (!currentExpression) {
    return false;
  }
}

export function hasNumberSelectionStarted(
  statuses: {
    type: "original" | "intermediary";
    number: number | null;
    picked: boolean;
  }[]
): boolean {
  return statuses.filter((x) => x.type === "original" && x.number).length > 0;
}

export function hasNumberSelectionFinished(
  statuses: {
    type: "original" | "intermediary";
    number: number | null;
    picked: boolean;
  }[]
): boolean {
  return statuses.filter((x) => x.type === "original" && x.number).length === 6;
}

export type Guess = { operand1: number | null; operand2: number | null; operator: typeof operators[0]["name"] };

const CountdownNumbersConfig: React.FC<Props> = (props) => {
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [numGuesses, setNumGuesses] = useState(props.defaultNumGuesses);

  const defaultCountdownStatuses: (
    | {
        type: "original";
        number: number | null;
        picked: boolean;
      }
    | {
        type: "intermediary";
        wordIndex: number;
        number: number | null;
        picked: boolean;
      }
  )[] = [
    { type: "original", number: null, picked: false },
    { type: "original", number: null, picked: false },
    { type: "original", number: null, picked: false },
    { type: "original", number: null, picked: false },
    { type: "original", number: null, picked: false },
    { type: "original", number: null, picked: false },
  ];

  const [countdownStatuses, setCountdownStatuses] = useState<
    (
      | {
          type: "original";
          number: number | null;
          picked: boolean;
        }
      | {
          type: "intermediary";
          wordIndex: number;
          number: number | null;
          picked: boolean;
        }
    )[]
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

  React.useEffect(() => {
    const intermediaryNumbers: typeof countdownStatuses = guesses.map((guess, index) => {
      const existingCountdownStatus = countdownStatuses.find((x) => x.type === "intermediary" && x.wordIndex === index);

      return {
        type: "intermediary",
        wordIndex: index,
        number: calculateTotal(guess),
        picked: existingCountdownStatus?.picked || false,
      };
    });

    setCountdownStatuses(countdownStatuses.filter((x) => x.type !== "intermediary").concat(intermediaryNumbers));
  }, [guesses]);

  function getTargetNumber(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
  }

  function ResetGame() {
    setGuesses([]);
    setCountdownStatuses(defaultCountdownStatuses);
    setCurrentGuess({ operand1: null, operand2: null, operator: "+" });
    settargetNumber(null);
    setWordIndex(0);
    setinProgress(true);
    sethasTimerEnded(false);
    setExpressionLength(props.defaultExpressionLength);
    sethasSubmitNumber(false);
    if (props.timerConfig.isTimed) {
      // Reset the timer if it is enabled in the game options
      setSeconds(props.timerConfig.seconds);
    }
  }

  function onEnter() {
    if (!inProgress) {
      return;
    }

    // TODO: Realistic: ask for result of calculation
    if (props.mode !== "countdown_numbers_realistic") {
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
      if (index === newCountdownStatuses.filter((x) => x.type === "original").length - 1) {
        const newTargetNumber = getTargetNumber(100, 999);
        settargetNumber(newTargetNumber);
      }
    }
  }

  function onSubmitCountdownExpression(expression: number[]) {
    // If no numbers have been picked (statuses as it was to begin with), and there are 6 numbers in the input array
    if (
      countdownStatuses.filter((x) => x.type === "original").length === defaultCountdownStatuses.length &&
      inProgress &&
      expression.length === countdownStatuses.length
    ) {
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

  function addOperandToGuess(
    number: number | null,
    id: { type: "original"; index: number } | { type: "intermediary"; rowIndex: number }
  ) {
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

    let updatedGuess: Guess;

    const bothOperandsEmpty = currentGuess.operand1 === null && currentGuess.operand2 === null;
    const onlyFirstOperand = currentGuess.operand1 !== null && currentGuess.operand2 === null;
    const onlySecondOperand = currentGuess.operand1 === null && currentGuess.operand2 !== null;
    // const bothOperands = currentGuess.operand1 !== null && currentGuess.operand2 !== null;

    if (bothOperandsEmpty || onlySecondOperand) {
      // Set operand1 to number
      updatedGuess = { ...currentGuess, operand1: number };
    } else if (onlyFirstOperand) {
      // Set operand2 to number
      updatedGuess = { ...currentGuess, operand2: number };
    } else {
      updatedGuess = currentGuess;
    }
    /* else if (bothOperands) {
      // Remove the second operand
      removeOperandFromGuess(currentGuess.operand2);
      // Replace with (add) new second operand
      updatedGuess({ ...currentGuess, operand2: number });
    }
    */

    // If guess is now full
    if (updatedGuess.operand1 !== null && updatedGuess.operand2 !== null) {
      // Record the guessed expression
      setGuesses(guesses.concat(updatedGuess));
      // Clear current guess
      setCurrentGuess({ operand1: null, operator: "+", operand2: null });
      // Move to next row
      setWordIndex(wordIndex + 1);

      // Add a new row to use
      if (wordIndex + 1 >= numGuesses) {
        setNumGuesses(numGuesses + 1);
      }
    } else {
      setCurrentGuess(updatedGuess);
    }

    const newCountdownStatuses = countdownStatuses.slice();
    if (id.type === "original") {
      // Flag as picked so it can't be added again
      newCountdownStatuses[id.index].picked = true;
    } else if (id.type === "intermediary") {
      newCountdownStatuses[countdownStatuses.filter((x) => x.type === "original").length + id.rowIndex].picked = true;
    }
    setCountdownStatuses(newCountdownStatuses);
  }

  function removeOperandFromGuess(number: number | null, index: number) {
    // TODO: Prevent default (context menu appearing)

    // Tile that was right clicked had no value (empty)
    if (!number) {
      return;
    }

    // If not an operand
    if (index !== 0 && index !== 2) {
      return;
    }

    if (hasTimerEnded) {
      return;
    }

    let updatedGuess: Guess;

    // If both operands are the same number
    if (currentGuess.operand1 === number && currentGuess.operand2 === number) {
      // TODO: Is there way of determining which (of the two operands with the same numbers) was right clicked?
      // Remove the second occurence of the number
      updatedGuess = { ...currentGuess, operand2: null };
    }
    // If the first operand was (right) clicked
    else if (currentGuess.operand1 === number) {
      updatedGuess = { ...currentGuess, operand1: null };
    } else if (currentGuess.operand2 === number) {
      updatedGuess = { ...currentGuess, operand2: null };
    } else {
      updatedGuess = currentGuess;
    }

    setCurrentGuess(updatedGuess);

    // If guess is now empty
    if (updatedGuess.operand1 === null && updatedGuess.operand2 === null && wordIndex > 0 && guesses.length > 0) {
      // Remove the guessed expression from recorded guesses
      setGuesses(guesses.slice(0, guesses.length - 1));
      // Clear current guess
      setCurrentGuess({ operand1: null, operator: "+", operand2: null });
      // Move back to previous row
      setWordIndex(wordIndex - 1);
    }

    const newCountdownStatuses = countdownStatuses.slice();
    // Flag as not picked so it can be added again
    newCountdownStatuses[index].picked = false;
    setCountdownStatuses(newCountdownStatuses);
  }

  function clearGrid() {
    if (inProgress) {
      setWordIndex(0);
      setGuesses([]);
      setCurrentGuess({ operand1: null, operator: "+", operand2: null });
      setCountdownStatuses(countdownStatuses.map((x) => ({ ...x, picked: false })));
      setNumGuesses(props.defaultNumGuesses);
    }
  }

  function submitBestGuess() {
    // If game is in progress and there is an intermediary number
    if (inProgress && wordIndex >= 1) {
      // End the game prematurely
      setSeconds(0);
      sethasTimerEnded(true);
      setinProgress(false);
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
      numGuesses={numGuesses}
      currentGuess={currentGuess}
      countdownStatuses={countdownStatuses}
      inProgress={inProgress}
      hasTimerEnded={hasTimerEnded}
      hasSubmitNumber={hasSubmitNumber}
      targetNumber={targetNumber}
      theme={props.theme}
      settings={props.settings}
      setTheme={props.setTheme}
      onClick={addOperandToGuess}
      onRightClick={removeOperandFromGuess}
      onEnter={onEnter}
      onSubmitCountdownNumber={onSubmitCountdownNumber}
      onSubmitCountdownExpression={onSubmitCountdownExpression}
      onSubmitNumber={onSubmitNumber}
      onBackspace={onBackspace}
      resetGame={ResetGame}
      clearGrid={clearGrid}
      submitBestGuess={submitBestGuess}
      setPage={props.setPage}
      setOperator={(operator) => setCurrentGuess({ ...currentGuess, operator })}
      addGold={props.addGold}
    ></CountdownNumbers>
  );
};

export default CountdownNumbersConfig;
