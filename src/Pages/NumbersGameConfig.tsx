import React, { useState } from "react";
import { PageName } from "../PageNames";
import NumbersGame from "./NumbersGame";
import { calculateTotal } from "../Components/NumberRow";
import { Theme } from "../Data/Themes";
import { SaveData, SettingsData } from "../Data/SaveData";

export interface NumbersGameConfigProps {
  campaignConfig:
    | {
        isCampaignLevel: true;
        // What score must be achieved to pass the campaign level?
        targetScore: number;
      }
    | { isCampaignLevel: false };

  gamemodeSettings?: {
    hasScaryNumbers?: boolean;
    scoringMethod?: "standard" | "pointLostPerDifference";
    // The number/amount of numbers (that make up the selection used to make the target number)
    defaultNumOperands?: number;
    timerConfig?: { isTimed: true; seconds: number } | { isTimed: false };
  };

  defaultNumGuesses: number;
  gameshowScore?: number;
}

interface Props extends NumbersGameConfigProps {
  page: PageName;
  theme: Theme;
  settings: SettingsData;
  setPage: (page: PageName) => void;
  setTheme: (theme: Theme) => void;
  addGold: (gold: number) => void;
  onComplete: (wasCorrect: boolean) => void;
  onCompleteGameshowRound?: (wasCorrect: boolean, guess: string, correctAnswer: string, score: number | null) => void;
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
  }[],
  numOperands: number
): boolean {
  return statuses.filter((x) => x.type === "original" && x.number).length === numOperands;
}

export function determineScore(
  bestGuess: number | null,
  targetNumber: number | null,
  scoringMethod: "standard" | "pointLostPerDifference"
): { score: number | null; difference: number | null } {
  if (!targetNumber) {
    return { score: null, difference: null };
  }

  if (bestGuess === null) {
    return { score: null, difference: null };
  }

  const difference = Math.abs(bestGuess - targetNumber);

  if (difference === null) {
    return { score: null, difference: null };
  }

  let score = 0;

  /* 
  Standard:
  10 points for reaching it exactly
  7 points for being 1–5 away
  5 points for being 6–10 away
  */

  if (scoringMethod === "standard") {
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
  } else if (scoringMethod === "pointLostPerDifference" && difference >= 0 && difference <= 10) {
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

  return { score: score, difference: difference };
}

export type Guess = { operand1: number | null; operand2: number | null; operator: typeof operators[0]["name"] };

const NumbersGameConfig: React.FC<Props> = (props) => {
  const DEFAULT_NUM_OPERANDS = 6;
  const DEFAULT_TIMER_VALUE = 30;

  const [closestGuessSoFar, setClosestGuessSoFar] = useState<number | null>(null);
  const [currentGuesses, setCurrentGuesses] = useState<Guess[]>([]);
  const [numGuesses, setNumGuesses] = useState(props.defaultNumGuesses);

  const defaultGamemodeSettings = {
    hasScaryNumbers: props.gamemodeSettings?.hasScaryNumbers ?? false,
    scoringMethod: props.gamemodeSettings?.scoringMethod ?? "standard",
    numOperands: props.gamemodeSettings?.defaultNumOperands ?? DEFAULT_NUM_OPERANDS,
    timerConfig: props.gamemodeSettings?.timerConfig ?? { isTimed: true, seconds: DEFAULT_TIMER_VALUE },
  };

  const [gamemodeSettings, setGamemodeSettings] = useState<{
    hasScaryNumbers: boolean;
    scoringMethod: "standard" | "pointLostPerDifference";
    numOperands: number;
    timerConfig: { isTimed: true; seconds: number } | { isTimed: false };
  }>(defaultGamemodeSettings);

  const [remainingSeconds, setRemainingSeconds] = useState(
    props.gamemodeSettings?.timerConfig?.isTimed === true
      ? props.gamemodeSettings?.timerConfig.seconds
      : DEFAULT_TIMER_VALUE
  );

  // Just numOperands number of original type numbers (all not yet picked)
  const defaultNumberTileStatuses: (
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
  )[] = Array.from({ length: gamemodeSettings.numOperands }).map((_) => ({
    type: "original",
    number: null,
    picked: false,
  }));

  const [numberTileStatuses, setNumberTileStatuses] = useState<
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
  >(defaultNumberTileStatuses);

  const [currentGuess, setCurrentGuess] = useState<Guess>({ operand1: null, operand2: null, operator: "+" });
  const [inProgress, setinProgress] = useState(true);
  const [hasTimerEnded, sethasTimerEnded] = useState(false);
  const [targetNumber, settargetNumber] = useState<number | null>(null);
  const [hasSubmitNumber, sethasSubmitNumber] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);

  // Timer Setup
  React.useEffect(() => {
    if (!gamemodeSettings.timerConfig.isTimed) {
      return;
    }

    if (!hasNumberSelectionFinished(numberTileStatuses, gamemodeSettings.numOperands)) {
      return;
    }

    const timer = setInterval(() => {
      if (remainingSeconds > 0) {
        setRemainingSeconds(remainingSeconds - 1);
      } else {
        submitBestGuess();
        sethasTimerEnded(true);
        setinProgress(false);
      }
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [setRemainingSeconds, remainingSeconds, gamemodeSettings.timerConfig.isTimed, numberTileStatuses]);

  React.useEffect(() => {
    const intermediaryNumbers: typeof numberTileStatuses = currentGuesses.map((guess, index) => {
      const existingNumbersGameStatus = numberTileStatuses.find(
        (x) => x.type === "intermediary" && x.wordIndex === index
      );

      return {
        type: "intermediary",
        wordIndex: index,
        number: calculateTotal(guess),
        picked: existingNumbersGameStatus?.picked || false,
      };
    });

    setNumberTileStatuses(numberTileStatuses.filter((x) => x.type !== "intermediary").concat(intermediaryNumbers));
  }, [currentGuesses]);

  React.useEffect(() => {
    if (!hasTimerEnded) {
      return;
    }

    clearGrid();
  }, [hasTimerEnded]);

  // Reset game after change of settings (stops cheating by changing settings partway through a game)
  React.useEffect(() => {
    if (props.page === "campaign/area/level" || props.gameshowScore !== undefined) {
      return;
    }

    ResetGame();

    // Save the latest gamemode settings for this mode
    SaveData.setNumbersGameConfigGamemodeSettings(gamemodeSettings);
  }, [gamemodeSettings]);

  React.useEffect(() => {
    if (!inProgress) {
      return;
    }

    const intermediaryStatuses = numberTileStatuses.filter((status) => status.type === "intermediary");
    const correctAnswer = intermediaryStatuses.find((status) => status.number === targetNumber);

    if (wordIndex >= 1 && correctAnswer) {
      // If game is in progress and there is an intermediary number, end the game prematurely
      setClosestGuessSoFar(targetNumber);
      setRemainingSeconds(0);
      sethasTimerEnded(true);
      setinProgress(false);
    }
  }, [numberTileStatuses]);

  function getTargetNumber(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
  }

  function ResetGame() {
    if (!inProgress) {
      const { score, difference } = determineScore(closestGuessSoFar, targetNumber, gamemodeSettings.scoringMethod);

      const MAX_POSSIBLE_SCORE = 10;
      // Achieved target score if a campaign level, otherwise just within 10 of target number
      const wasCorrect = props.campaignConfig.isCampaignLevel
        ? Boolean(score && score >= Math.min(props.campaignConfig.targetScore, MAX_POSSIBLE_SCORE))
        : Boolean(difference && difference <= 10);

      if (props.gameshowScore === undefined) {
        props.onComplete(wasCorrect);
      } else {
        props.onCompleteGameshowRound?.(
          wasCorrect,
          closestGuessSoFar?.toString() ?? "",
          targetNumber?.toString() ?? "",
          score
        );
      }
    }

    setCurrentGuesses([]);
    setClosestGuessSoFar(null);
    setNumberTileStatuses(defaultNumberTileStatuses);
    setCurrentGuess({ operand1: null, operand2: null, operator: "+" });
    settargetNumber(null);
    setWordIndex(0);
    setinProgress(true);
    sethasTimerEnded(false);
    sethasSubmitNumber(false);
    setNumGuesses(props.defaultNumGuesses);

    if (gamemodeSettings.timerConfig.isTimed) {
      // Reset the timer if it is enabled in the game options
      setRemainingSeconds(gamemodeSettings.timerConfig.seconds);
    }
  }

  function onSubmitNumbersGameNumber(number: number) {
    if (!number) {
      return;
    }

    // Still more numbers available to pick/choose
    if (!hasNumberSelectionFinished(numberTileStatuses, gamemodeSettings.numOperands) && inProgress) {
      // Make a copy of current statuses
      const newNumbersGameStatuses = numberTileStatuses.slice();
      // Find index of first object without a number
      const index = newNumbersGameStatuses.findIndex((element) => element.number === null);
      // Update element with new number
      newNumbersGameStatuses[index].number = number;
      // Set with this element updated
      setNumberTileStatuses(newNumbersGameStatuses);

      // Determine target number if last number is being picked
      if (index === newNumbersGameStatuses.filter((x) => x.type === "original").length - 1) {
        const newTargetNumber = getTargetNumber(100, 999);
        settargetNumber(newTargetNumber);
      }
    }
  }

  function onSubmitNumbersGameSelection(expression: number[]) {
    // If required number of original numbers, expression is of the correct length and there are no picked or intermediary values
    if (
      expression.length === numberTileStatuses.length &&
      numberTileStatuses.filter((x) => x.type === "original").length === gamemodeSettings.numOperands &&
      numberTileStatuses.filter((x) => x.picked === true).length === 0 &&
      numberTileStatuses.filter((x) => x.type === "intermediary").length === 0 &&
      inProgress
    ) {
      // Make a copy of the current numberTileStatuses
      const newNumbersGameStatuses = numberTileStatuses.slice();
      // Add the numbers into the status object array (along with updating picked boolean)
      for (let i = 0; i < expression.length; i++) {
        // Update with the number
        newNumbersGameStatuses[i].number = expression[i];
      }
      // Update numberTileStatuses
      setNumberTileStatuses(newNumbersGameStatuses);

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
      hasNumberSelectionFinished(numberTileStatuses, gamemodeSettings.numOperands) &&
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

  function updateGamemodeSettings(newGamemodeSettings: {
    hasScaryNumbers: boolean;
    scoringMethod: "standard" | "pointLostPerDifference";
    numOperands: number;
    timerConfig: { isTimed: true; seconds: number } | { isTimed: false };
  }) {
    setGamemodeSettings(newGamemodeSettings);
  }

  function updateRemainingSeconds(newSeconds: number) {
    setRemainingSeconds(newSeconds);
  }

  // TODO: QOL: Numbers Game - undo
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

    if (!hasNumberSelectionFinished(numberTileStatuses, gamemodeSettings.numOperands)) {
      return;
    }

    if (hasTimerEnded) {
      return;
    }

    // Find all the elements of the respective number (where picked is also false)
    const numberStatus = numberTileStatuses.filter((x) => x.number === number && !x.picked);

    // No suitable element in numberTileStatuses to accomodate adding this new number
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
      setCurrentGuesses(currentGuesses.concat(updatedGuess));
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

    const newNumbersGameStatuses = numberTileStatuses.slice();
    if (id.type === "original") {
      // Flag as picked so it can't be added again
      newNumbersGameStatuses[id.index].picked = true;
    } else if (id.type === "intermediary") {
      newNumbersGameStatuses[numberTileStatuses.filter((x) => x.type === "original").length + id.rowIndex].picked =
        true;
    }
    setNumberTileStatuses(newNumbersGameStatuses);
  }

  // TODO: QOL: Numbers Game - undo
  function removeOperandFromGuess(number: number | null, index: number) {
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
    if (
      updatedGuess.operand1 === null &&
      updatedGuess.operand2 === null &&
      wordIndex > 0 &&
      currentGuesses.length > 0
    ) {
      // Remove the guessed expression from recorded guesses
      setCurrentGuesses(currentGuesses.slice(0, currentGuesses.length - 1));
      // Clear current guess
      setCurrentGuess({ operand1: null, operator: "+", operand2: null });
      // Move back to previous row
      setWordIndex(wordIndex - 1);
    }

    const newNumbersGameStatuses = numberTileStatuses.slice();
    // Flag as not picked so it can be added again
    newNumbersGameStatuses[index].picked = false;
    setNumberTileStatuses(newNumbersGameStatuses);
  }

  function clearGrid() {
    if (inProgress) {
      setWordIndex(0);
      setCurrentGuesses([]);
      setCurrentGuess({ operand1: null, operator: "+", operand2: null });
      setNumberTileStatuses(numberTileStatuses.map((x) => ({ ...x, picked: false })));
      setNumGuesses(props.defaultNumGuesses);
    }
  }

  function submitBestGuess() {
    if (!inProgress) {
      return;
    }

    // Get the closest intermediary guess
    const newClosest = numberTileStatuses
      .filter((x) => x.type === "intermediary")
      .map((x) => x.number)
      .concat(closestGuessSoFar === null ? [] : [closestGuessSoFar])
      .reduce(function (prev, curr) {
        const prevDifference = Math.abs(prev! - targetNumber!);
        const currentDifference = Math.abs(curr! - targetNumber!);

        return currentDifference < prevDifference ? curr : prev;
      }, null);

    setClosestGuessSoFar(newClosest);

    // If game is in progress and there is an intermediary number
    if (inProgress && wordIndex >= 1) {
      // End the game prematurely
      setRemainingSeconds(0);
      sethasTimerEnded(true);
      setinProgress(false);
    }
  }

  return (
    <NumbersGame
      campaignConfig={props.campaignConfig}
      gamemodeSettings={gamemodeSettings}
      remainingSeconds={remainingSeconds}
      wordIndex={wordIndex}
      guesses={currentGuesses}
      closestGuessSoFar={closestGuessSoFar}
      numGuesses={numGuesses}
      currentGuess={currentGuess}
      numberTileStatuses={numberTileStatuses}
      inProgress={inProgress}
      hasTimerEnded={hasTimerEnded}
      hasSubmitNumber={hasSubmitNumber}
      targetNumber={targetNumber}
      theme={props.theme}
      settings={props.settings}
      setTheme={props.setTheme}
      onClick={addOperandToGuess}
      onSubmitNumbersGameNumber={onSubmitNumbersGameNumber}
      onSubmitNumbersGameSelection={onSubmitNumbersGameSelection}
      onSubmitNumber={onSubmitNumber}
      onBackspace={onBackspace}
      updateGamemodeSettings={updateGamemodeSettings}
      updateRemainingSeconds={updateRemainingSeconds}
      ResetGame={ResetGame}
      clearGrid={clearGrid}
      submitBestGuess={submitBestGuess}
      setPage={props.setPage}
      setOperator={(operator) => setCurrentGuess({ ...currentGuess, operator })}
      addGold={props.addGold}
      gameshowScore={props.gameshowScore}
    />
  );
};

export default NumbersGameConfig;
