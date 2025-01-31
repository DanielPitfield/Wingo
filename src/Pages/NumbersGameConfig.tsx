import React, { useState } from "react";
import NumbersGame from "./NumbersGame";
import { Theme } from "../Data/Themes";
import { operators } from "../Data/Operators";
import { getGamemodeDefaultTimerValue } from "../Helpers/getGamemodeDefaultTimerValue";
import { hasNumberSelectionFinished } from "../Helpers/hasNumberSelectionFinished";
import { getNumbersGameGuessTotal } from "../Helpers/getNumbersGameGuessTotal";
import { getNumbersGameScore } from "../Helpers/getNumbersGameScore";
import { useLocation } from "react-router";
import { PagePath } from "../Data/PageNames";
import { isCampaignLevelPath } from "../Helpers/CampaignPathChecks";
import { SettingsData } from "../Data/SaveData/Settings";
import { setMostRecentNumbersGameConfigGamemodeSettings } from "../Data/SaveData/MostRecentGamemodeSettings";
import { useCountdown } from "usehooks-ts";
import { useCorrectChime, useFailureChime, useLightPingChime, useClickChime } from "../Data/Sounds";

export interface NumbersGameConfigProps {
  campaignConfig:
    | {
        isCampaignLevel: true;
        // What score must be achieved to pass the campaign level?
        targetScore: number;
      }
    | { isCampaignLevel: false };

  gamemodeSettings: {
    hasScaryNumbers: boolean;
    scoringMethod: "standard" | "pointLostPerDifference";
    // The number/amount of numbers (that make up the selection used to make the target number)
    numOperands: number;
    timerConfig: { isTimed: true; seconds: number } | { isTimed: false };
  };
}

interface Props extends NumbersGameConfigProps {
  theme: Theme;
  settings: SettingsData;
  setTheme: (theme: Theme) => void;
  addGold: (gold: number) => void;
  onComplete: (wasCorrect: boolean) => void;
}

export type OriginalTileStatus = {
  type: "original";
  number: number | null;
  picked: boolean;
};

export type IntermediaryTileStatus = {
  type: "intermediary";
  wordIndex: number;
  number: number | null;
  picked: boolean;
};

export type NumberTileStatus = OriginalTileStatus | IntermediaryTileStatus;

export type Guess = { operand1: number | null; operand2: number | null; operator: (typeof operators)[0]["name"] };

const NumbersGameConfig = (props: Props) => {
  const location = useLocation().pathname as PagePath;

  const [gamemodeSettings, setGamemodeSettings] = useState<NumbersGameConfigProps["gamemodeSettings"]>(
    props.gamemodeSettings
  );

  const [inProgress, setInProgress] = useState(true);

  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [currentGuess, setCurrentGuess] = useState<Guess>({ operand1: null, operand2: null, operator: "+" });
  const [closestGuessSoFar, setClosestGuessSoFar] = useState<number | null>(null);

  const [targetNumber, setTargetNumber] = useState<number | null>(null);
  const [wordIndex, setWordIndex] = useState(0);

  // Fill an array of length numOperands with the initial tile status (original type and unpicked)
  const DEFAULT_NUMBER_TILE_STATUSES: OriginalTileStatus[] = Array(gamemodeSettings.numOperands)
    .fill("")
    .map((_) => ({
      type: "original",
      number: null,
      picked: false,
    }));

  const [numberTileStatuses, setNumberTileStatuses] = useState<NumberTileStatus[]>(DEFAULT_NUMBER_TILE_STATUSES);

  // The starting/total time of the timer
  const [totalSeconds, setTotalSeconds] = useState(
    props.gamemodeSettings?.timerConfig?.isTimed === true
      ? props.gamemodeSettings?.timerConfig?.seconds
      : getGamemodeDefaultTimerValue(location)
  );

  // How many seconds left on the timer?
  const [remainingSeconds, { startCountdown, stopCountdown, resetCountdown }] = useCountdown({
    countStart: totalSeconds,
    intervalMs: 1000,
  });

  // Sounds
  const [playCorrectChimeSoundEffect] = useCorrectChime(props.settings);
  const [playFailureChimeSoundEffect] = useFailureChime(props.settings);
  const [playLightPingSoundEffect] = useLightPingChime(props.settings);
  const [playClickSoundEffect] = useClickChime(props.settings);

  const getOriginalTileStatuses = () => {
    return numberTileStatuses.filter((x) => x.type === "original");
  };

  const getIntermediaryTileStatuses = () => {
    return numberTileStatuses.filter((x) => x.type === "intermediary");
  };

  // Start timer (any time the toggle is enabled or the totalSeconds is changed)
  React.useEffect(() => {
    if (!inProgress) {
      return;
    }

    if (!gamemodeSettings.timerConfig.isTimed) {
      return;
    }

    if (!hasNumberSelectionFinished(numberTileStatuses, gamemodeSettings.numOperands)) {
      return;
    }

    startCountdown();
  }, [inProgress, gamemodeSettings.timerConfig.isTimed, totalSeconds, numberTileStatuses]);

  // Check remaining seconds on timer
  React.useEffect(() => {
    if (!inProgress) {
      return;
    }

    if (!gamemodeSettings.timerConfig.isTimed) {
      return;
    }

    if (!hasNumberSelectionFinished(numberTileStatuses, gamemodeSettings.numOperands)) {
      return;
    }

    if (remainingSeconds <= 0) {
      stopCountdown();
      submitBestGuess();
      setInProgress(false);
    }
  }, [inProgress, gamemodeSettings.timerConfig.isTimed, remainingSeconds, numberTileStatuses]);

  // When the guesses (or expressions made along a row) of the playable grid are changed
  React.useEffect(() => {
    // For each guess in currentGuesses...
    const intermediaryNumbers: IntermediaryTileStatus[] = guesses.map((guess, index) => {
      const existingNumbersGameStatus = numberTileStatuses.find(
        (x) => x.type === "intermediary" && x.wordIndex === index
      );

      // Create an intermediary tile of the result of the two operands (for the row)
      return {
        type: "intermediary",
        wordIndex: index,
        number: getNumbersGameGuessTotal(guess),
        picked: existingNumbersGameStatus?.picked || false,
      };
    });

    // Add (keep track of) these new tiles
    const newNumberTileStatuses: NumberTileStatus[] = getOriginalTileStatuses().concat(intermediaryNumbers);

    setNumberTileStatuses(newNumberTileStatuses);
  }, [guesses]);

  // Reset game after change of settings (stops cheating by changing settings partway through a game)
  React.useEffect(() => {
    if (isCampaignLevelPath(location)) {
      return;
    }

    ResetGame();

    // Save the latest gamemode settings for this mode
    setMostRecentNumbersGameConfigGamemodeSettings(gamemodeSettings);
  }, [gamemodeSettings]);

  React.useEffect(() => {
    if (!inProgress) {
      return;
    }

    if (wordIndex <= 0) {
      return;
    }

    // Is there an intermediary number of the target number?
    const isExactAnswer = getIntermediaryTileStatuses().find((status) => status.number === targetNumber);

    if (isExactAnswer) {
      // End the game prematurely
      setClosestGuessSoFar(targetNumber);
      stopCountdown();
      setInProgress(false);
    }
  }, [numberTileStatuses]);

  React.useEffect(() => {
    if (wordIndex < 0) {
      return;
    }

    /*
    Current guess always becomes either:
    The guess at the row of the current wordIndex (when going back to a previous row)
    An empty guess (going to a new row)
    */
    setCurrentGuess(guesses[wordIndex] ?? { operand1: null, operand2: null, operator: "+" });

    // Remove any guesses after the current row (that may still linger)
    setGuesses(guesses.slice(0, wordIndex));
  }, [wordIndex]);

  function getTargetNumber(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
  }

  function ResetGame() {
    if (!inProgress) {
      const { score, difference } = getNumbersGameScore(
        closestGuessSoFar,
        targetNumber,
        gamemodeSettings.scoringMethod
      );

      const MAX_POSSIBLE_SCORE = 10;
      // Achieved target score if a campaign level, otherwise just within 10 of target number
      const wasCorrect = props.campaignConfig.isCampaignLevel
        ? Boolean(score && score >= Math.min(props.campaignConfig.targetScore, MAX_POSSIBLE_SCORE))
        : Boolean(difference && difference <= 10);

      props.onComplete(wasCorrect);
    }

    setInProgress(true);

    setGuesses([]);
    setClosestGuessSoFar(null);
    setNumberTileStatuses(DEFAULT_NUMBER_TILE_STATUSES);
    setCurrentGuess({ operand1: null, operand2: null, operator: "+" });
    setTargetNumber(null);
    setWordIndex(0);

    if (gamemodeSettings.timerConfig.isTimed) {
      // Reset the timer if it is enabled in the game options
      resetCountdown();
    }
  }

  function onSubmitNumbersGameNumber(number: number) {
    if (number === undefined) {
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
        setTargetNumber(newTargetNumber);
      }
    }
  }

  function onSubmitNumbersGameSelection(expression: number[]) {
    // If required number of original numbers, expression is of the correct length and there are no picked or intermediary values
    if (
      expression.length === numberTileStatuses.length &&
      getOriginalTileStatuses().length === gamemodeSettings.numOperands &&
      numberTileStatuses.filter((x) => x.picked === true).length === 0 &&
      getIntermediaryTileStatuses().length === 0 &&
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
      setTargetNumber(newTargetNumber);
    }
  }

  function onSubmitNumber(number: number) {
    // Additional condition of all numbers having been selected
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
    }
  }

  function updateGamemodeSettings(newGamemodeSettings: NumbersGameConfigProps["gamemodeSettings"]) {
    setGamemodeSettings(newGamemodeSettings);
  }

  function addOperandToGuess(
    number: number | null,
    id: { type: "original"; index: number } | { type: "intermediary"; rowIndex: number }
  ) {
    if (!inProgress) {
      return;
    }

    if (number === null) {
      return;
    }

    if (!hasNumberSelectionFinished(numberTileStatuses, gamemodeSettings.numOperands)) {
      return;
    }

    // No suitable element in numberTileStatuses to accomodate adding this new number
    if (numberTileStatuses.findIndex((x) => x.number === number && !x.picked) === -1) {
      return;
    }

    /*
    The current guess already has both operands
    This likely means the operands total to an invalid result
    Instead of moving on to next row/guess,
    Wait on the invalid result being resolved by the user (either through undoing or changing the operator)
    */
    if (currentGuess.operand1 !== null && currentGuess.operand2 !== null) {
      return;
    }

    let updatedGuess: Guess;

    const bothOperandsEmpty = currentGuess.operand1 === null && currentGuess.operand2 === null;
    const onlyFirstOperand = currentGuess.operand1 !== null && currentGuess.operand2 === null;

    if (bothOperandsEmpty) {
      // Set operand1 to number
      updatedGuess = { ...currentGuess, operand1: number };
    } else if (onlyFirstOperand) {
      // Set operand2 to number
      updatedGuess = { ...currentGuess, operand2: number };
    } else {
      updatedGuess = currentGuess;
    }

    // If guess is now full and the guess makes a valid result
    if (
      updatedGuess.operand1 !== null &&
      updatedGuess.operand2 !== null &&
      getNumbersGameGuessTotal(updatedGuess) !== null
    ) {
      // Record the guessed expression
      setGuesses(guesses.concat(updatedGuess));
      // Clear current guess
      setCurrentGuess({ operand1: null, operator: "+", operand2: null });
      // Move to next row
      setWordIndex(wordIndex + 1);
    }
    // Update the guess shown at the current row
    else {
      setCurrentGuess(updatedGuess);
    }

    const newNumbersGameStatuses = numberTileStatuses.slice();
    // Flag newly added operand as picked so it can't be added again
    if (id.type === "original") {
      newNumbersGameStatuses[id.index].picked = true;
    } else if (id.type === "intermediary") {
      newNumbersGameStatuses[getOriginalTileStatuses().length + id.rowIndex].picked = true;
    }
    setNumberTileStatuses(newNumbersGameStatuses);
  }

  const getNumPositionsToBacktrack = (rowBeingEdited: Guess) => {
    // Both operands (and the intemediary result)
    if (rowBeingEdited.operand1 !== null && rowBeingEdited.operand2 !== null) {
      return 3;
    }

    // Just the first operand
    if (rowBeingEdited.operand1 !== null && rowBeingEdited.operand2 === null) {
      return 1;
    }

    // Unexpected guess state
    return 0;
  };

  function onBackspace() {
    if (!inProgress) {
      return;
    }

    if (!hasNumberSelectionFinished(numberTileStatuses, gamemodeSettings.numOperands)) {
      return;
    }

    const currentRowEmpty = currentGuess.operand1 === null && currentGuess.operand2 === null;

    // Nothing to remove
    if (currentRowEmpty && wordIndex === 0) {
      return;
    }

    // Undoing when the current row is empty/blank
    if (currentRowEmpty) {
      // Just go back a row (the current guess will automatically be the guess at this previous row)
      setWordIndex(Math.max(0, wordIndex - 1));
      return;
    }

    let rowBeingEdited: Guess = currentGuess;

    const onlyFirstOperand = rowBeingEdited.operand1 !== null && rowBeingEdited.operand2 === null;
    const bothOperands = rowBeingEdited.operand1 !== null && rowBeingEdited.operand2 !== null;

    let newGuess: Guess;

    if (onlyFirstOperand) {
      // Remove operand1
      newGuess = { ...rowBeingEdited, operand1: null };
    } else if (bothOperands) {
      // Remove operand2
      newGuess = { ...rowBeingEdited, operand2: null };
    } else {
      newGuess = rowBeingEdited;
    }

    setCurrentGuess(newGuess);

    // If guess will become empty after undo
    if (newGuess.operand1 === null && newGuess.operand2 === null) {
      // Move back to previous row
      setWordIndex(Math.max(0, wordIndex - 1));
    }

    const newNumberTileStatuses = numberTileStatuses.slice();

    // New tiles are always appended to the end of numberTileStatuses
    const mostRecentTile = numberTileStatuses[numberTileStatuses.length - 1];

    // Remove intermediaries
    if (mostRecentTile.type === "intermediary") {
      // Look for any other intermediaries on the row
      for (
        let i = numberTileStatuses.length - 1;
        i >= numberTileStatuses.length - 1 - getNumPositionsToBacktrack(rowBeingEdited);
        i--
      ) {
        if (numberTileStatuses[i].type === "intermediary")
          // Remove the tileStatus
          newNumberTileStatuses.splice(i, 1);
      }
    }

    // The first operand is being removed (was present in rowBeingEdited but won't be in newGuess)
    if (rowBeingEdited.operand1 !== null && newGuess.operand1 === null) {
      // Find the indexes of the original statuses
      const i1 = newNumberTileStatuses.findIndex(
        (x) => x.type === "original" && x.picked && x.number === rowBeingEdited?.operand1
      );
      if (i1 !== -1) {
        // In the copy, make the tile available again
        newNumberTileStatuses[i1].picked = false;
      }
    }

    // The second operand is being removed
    if (rowBeingEdited.operand2 !== null && newGuess.operand2 === null) {
      const i2 = newNumberTileStatuses.findIndex(
        (x) => x.type === "original" && x.picked && x.number === rowBeingEdited?.operand2
      );
      if (i2 !== -1) {
        // In the copy, make the tile available again
        newNumberTileStatuses[i2].picked = false;
      }
    }

    setNumberTileStatuses(newNumberTileStatuses);
  }

  function clearGrid() {
    if (inProgress) {
      setWordIndex(0);
      setGuesses([]);
      setCurrentGuess({ operand1: null, operator: "+", operand2: null });
      setNumberTileStatuses(numberTileStatuses.map((x) => ({ ...x, picked: false })));
    }
  }

  function submitBestGuess() {
    if (!inProgress) {
      return;
    }

    // Still on first row (and therefore no intermediary number to use as best guess)
    if (wordIndex <= 0) {
      return;
    }

    const intermediaryGuesses = getIntermediaryTileStatuses();

    // Another check there is an intermediary guess
    if (!intermediaryGuesses) {
      return;
    }

    // Get the closest intermediary guess
    const newClosest = intermediaryGuesses
      .map((x) => x.number)
      .concat(closestGuessSoFar === null ? [] : [closestGuessSoFar])
      .reduce(function (prev, curr) {
        const prevDifference = Math.abs(prev! - targetNumber!);
        const currentDifference = Math.abs(curr! - targetNumber!);

        return currentDifference < prevDifference ? curr : prev;
      }, null);

    setClosestGuessSoFar(newClosest);

    // End the game prematurely
    stopCountdown();
    setInProgress(false);
  }

  return (
    <NumbersGame
      campaignConfig={props.campaignConfig}
      gamemodeSettings={gamemodeSettings}
      remainingSeconds={remainingSeconds}
      totalSeconds={totalSeconds}
      wordIndex={wordIndex}
      guesses={guesses}
      closestGuessSoFar={closestGuessSoFar}
      currentGuess={currentGuess}
      numberTileStatuses={numberTileStatuses}
      inProgress={inProgress}
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
      resetCountdown={resetCountdown}
      setTotalSeconds={setTotalSeconds}
      ResetGame={ResetGame}
      clearGrid={clearGrid}
      submitBestGuess={submitBestGuess}
      setOperator={(operator) => setCurrentGuess({ ...currentGuess, operator })}
      addGold={props.addGold}
    />
  );
};

export default NumbersGameConfig;
