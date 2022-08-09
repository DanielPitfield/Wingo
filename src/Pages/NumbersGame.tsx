import React, { useState } from "react";
import { PageName } from "../PageNames";
import { Button } from "../Components/Button";
import { MessageNotification } from "../Components/MessageNotification";
import ProgressBar, { GreenToRedColorTransition } from "../Components/ProgressBar";
import { NumberRow } from "../Components/NumberRow";
import NumberTile from "../Components/NumberTile";
import { determineScore, Guess, hasNumberSelectionFinished, hasNumberSelectionStarted } from "./NumbersGameConfig";
import { NumberSelectionRow } from "../Components/NumberSelectionRow";
import { Theme } from "../Data/Themes";
import { NumberPuzzle, NumberPuzzleValue } from "../Data/NumbersGameSolver";
import { SettingsData } from "../Data/SaveData";
import GamemodeSettingsMenu from "../Components/GamemodeSettingsMenu";
import { randomIntFromInterval } from "./Numble";
import { pickRandomElementFrom } from "./WingoConfig";
import { LEVEL_FINISHING_TEXT } from "../Components/Level";

interface Props {
  campaignConfig:
    | {
        isCampaignLevel: true;
        // What score must be achieved to pass the campaign level?
        targetScore: number;
      }
    | { isCampaignLevel: false };

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

  ResetGame: () => void;
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
  // The number of operands the numberPuzzle can compute a solution for (with no noticeable delay)
  const NUMBERPUZZLE_MAX_NUM_OPERANDS_WITHHOUT_DELAY = 6;
  // The maximum possible number of operands the numberPuzzle can a compute solution for (without the browser crashing)
  const NUMBERPUZZLE_MAX_NUM_OPERANDS = 7;

  const [solutions, setSolutions] = useState<{ best: NumberPuzzleValue; all: NumberPuzzleValue[] } | null>(null);

  const DEFAULT_TIMER_VALUE = 30;
  const [mostRecentTotalSeconds, setMostRecentTotalSeconds] = useState(
    props.gamemodeSettings?.timerConfig?.isTimed === true
      ? props.gamemodeSettings?.timerConfig.seconds
      : DEFAULT_TIMER_VALUE
  );

  const [computeSolutionButtonClicked, setComputeSolutionButtonClicked] = useState(false);

  // Finding a solution (once the targetNumber is known)
  React.useEffect(() => {
    // Don't try to find a solution (if it will cause a delay)
    if (props.gamemodeSettings.numOperands > NUMBERPUZZLE_MAX_NUM_OPERANDS_WITHHOUT_DELAY) {
      return;
    }

    computeBestSolution();
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

    const bigNumbers = props.gamemodeSettings.hasScaryNumbers
      ? // The numbers 1 to 99 (without multiples of 10 becuase they would be too easy)
        Array.from({ length: 99 }, (_, i) => i + 1).filter((number) => number % 10 !== 0)
      : // The four standard big numbers
        [25, 50, 75, 100];

    return pickRandomElementFrom(bigNumbers);
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
    let Grid = [];

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

  function computeBestSolution() {
    if (!props.targetNumber) {
      return;
    }

    if (props.gamemodeSettings.numOperands > NUMBERPUZZLE_MAX_NUM_OPERANDS) {
      return;
    }

    const inputNumbers = props.numberTileStatuses
      .filter((x) => x.type === "original" && x.number)
      .map((x) => x.number!);

    if (inputNumbers.length > NUMBERPUZZLE_MAX_NUM_OPERANDS) {
      return;
    }

    // The amount of numbers that can be selected does not match with the specified/requested number from props
    if (inputNumbers.length !== props.gamemodeSettings.numOperands) {
      return;
    }

    const puzzle = new NumberPuzzle(props.targetNumber, inputNumbers);
    setSolutions(puzzle.solve());
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

  function displayOutcome(): React.ReactNode {
    if (props.inProgress || !props.hasTimerEnded || !props.targetNumber) {
      return;
    }

    const { score, difference } = determineScore(
      props.closestGuessSoFar,
      props.targetNumber,
      props.gamemodeSettings.scoringMethod
    );

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
    } else if (score === 10) {
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

  function displayBestSolution() {
    const { score, difference } = determineScore(
      props.closestGuessSoFar,
      props.targetNumber,
      props.gamemodeSettings.scoringMethod
    );

    // Don't need to show a best solution, the player got the target number
    if (difference === 0) {
      return;
    }

    // Too many operands to compute a solution
    if (props.gamemodeSettings.numOperands > NUMBERPUZZLE_MAX_NUM_OPERANDS) {
      return;
    }

    // Can just manage to find a solution with 7 operands, show a button to start finding the solution
    else if (props.gamemodeSettings.numOperands === NUMBERPUZZLE_MAX_NUM_OPERANDS && solutions === null) {
      return (
        <Button
          mode={"default"}
          onClick={() => {
            setComputeSolutionButtonClicked(true);
            window.setTimeout(() => computeBestSolution(), 0);
          }}
          settings={props.settings}
          additionalProps={{ autoFocus: true }}
          disabled={computeSolutionButtonClicked}
        >
          {computeSolutionButtonClicked && solutions === null ? "Calculating..." : "Find Best Solution"}
        </Button>
      );
    }

    // Show the best solution (only when it has been found)
    return (
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
      {!props.campaignConfig.isCampaignLevel && !props.gameshowScore && (
        <div className="gamemodeSettings">
          <GamemodeSettingsMenu>{generateSettingsOptions()}</GamemodeSettingsMenu>
        </div>
      )}

      {props.gameshowScore !== undefined && <div className="gameshow-score">{displayGameshowScore()}</div>}

      {!props.inProgress && (
        <>
          {displayOutcome()}

          {displayBestSolution()}

          <Button
            mode={"accept"}
            onClick={() => {
              props.ResetGame();
              setSolutions(null);
              setComputeSolutionButtonClicked(false);
            }}
            settings={props.settings}
            additionalProps={{ autoFocus: true }}
          >
            {props.gameshowScore !== undefined
              ? "Next round"
              : props.campaignConfig.isCampaignLevel
              ? LEVEL_FINISHING_TEXT
              : "Restart"}
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
