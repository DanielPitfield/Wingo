import React, { useState } from "react";
import Button from "../Components/Button";
import MessageNotification from "../Components/MessageNotification";
import ProgressBar, { GreenToRedColorTransition } from "../Components/ProgressBar";
import NumberRow from "../Components/NumberRow";
import NumberTile from "../Components/NumberTile";
import { Guess, IntermediaryTileStatus, NumbersGameConfigProps, NumberTileStatus } from "./NumbersGameConfig";
import NumberSelectionRow from "../Components/NumberSelectionRow";
import { Theme } from "../Data/Themes";
import { LEVEL_FINISHING_TEXT } from "../Components/Level";
import { DEFAULT_NUMBERS_GAME_NUM_ROWS } from "../Data/DefaultGamemodeSettings";
import { getRandomElementFrom } from "../Helpers/getRandomElementFrom";
import { hasNumberSelectionFinished } from "../Helpers/hasNumberSelectionFinished";
import { hasNumberSelectionStarted } from "../Helpers/hasNumberSelectionStarted";
import { NumberPuzzleValue, NumberPuzzle } from "../Helpers/NumbersGameSolver";
import { getNumbersGameScore } from "../Helpers/getNumbersGameScore";
import { getNewGamemodeSettingValue } from "../Helpers/getGamemodeSettingsNewValue";
import NumbersGameGamemodeSettings from "../Components/GamemodeSettingsOptions/NumbersGameGamemodeSettings";
import { SettingsData } from "../Data/SaveData/Settings";

interface NumbersGameProps {
  campaignConfig: NumbersGameConfigProps["campaignConfig"];
  gamemodeSettings: NumbersGameConfigProps["gamemodeSettings"];

  inProgress: boolean;

  remainingSeconds: number;
  totalSeconds: number;

  wordIndex: number;
  targetNumber: number | null;
  guesses: Guess[];
  closestGuessSoFar: number | null;
  currentGuess: Guess;

  numberTileStatuses: NumberTileStatus[];

  theme: Theme;
  settings: SettingsData;

  onClick: (
    value: number | null,
    id: { type: "original"; index: number } | { type: "intermediary"; rowIndex: number }
  ) => void;

  clearGrid: () => void;
  submitBestGuess: () => void;

  setTheme: (theme: Theme) => void;

  onSubmitNumbersGameNumber: (number: number) => void;
  onSubmitNumbersGameSelection: (numberExpression: number[]) => void;
  onSubmitNumber: (number: number) => void;
  onBackspace: () => void;

  updateGamemodeSettings: (newGamemodeSettings: NumbersGameConfigProps["gamemodeSettings"]) => void;
  resetCountdown: () => void;
  setTotalSeconds: (numSeconds: number) => void;

  ResetGame: () => void;

  setOperator: (operator: Guess["operator"]) => void;
  addGold: (gold: number) => void;
}

const NumbersGame = (props: NumbersGameProps) => {
  // The number of operands the numberPuzzle can compute a solution for (with no noticeable delay)
  const NUMBERPUZZLE_MAX_NUM_OPERANDS_WITHHOUT_DELAY = 6;
  // The maximum possible number of operands the numberPuzzle can a compute solution for (without the browser crashing)
  const NUMBERPUZZLE_MAX_NUM_OPERANDS = 7;

  const [solutions, setSolutions] = useState<{ best: NumberPuzzleValue; all: NumberPuzzleValue[] } | null>(null);

  const [isComputeSolutionButtonClicked, setIsComputeSolutionButtonClicked] = useState(false);

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

    // The numbers 1 through 10
    const smallNumbers = Array.from({ length: 10 }, (_, i) => i + 1);

    return getRandomElementFrom(smallNumbers);
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

    return getRandomElementFrom(bigNumbers);
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

  const Grid = () => {
    const Grid = [];

    const isSelectionFinished = hasNumberSelectionFinished(
      props.numberTileStatuses,
      props.gamemodeSettings.numOperands
    );

    Grid.push(
      <div className="numbers-game-wrapper">
        <div className="target-number">
          <NumberTile number={isSelectionFinished ? props.targetNumber : null} disabled={true} isReadOnly={true} />
        </div>

        <NumberSelectionRow
          key={"number_selection"}
          // The original tiles are disabled when selection has not yet finished
          disabled={!props.inProgress || !isSelectionFinished}
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

    for (let i = 0; i < Math.max(DEFAULT_NUMBERS_GAME_NUM_ROWS, props.wordIndex + 1); i++) {
      let guess: Guess;

      if (props.wordIndex === i) {
        guess = props.currentGuess;
      } else if (props.wordIndex <= i) {
        guess = { operand1: null, operand2: null, operator: "+" };
      } else {
        guess = props.guesses[i];
      }

      Grid.push(
        <NumberRow
          key={`numbers-game-input-rpw-${i}`}
          onClick={props.onClick}
          expression={guess}
          targetNumber={props.targetNumber}
          hasSubmit={!props.inProgress}
          setOperator={props.setOperator}
          disabled={!props.inProgress || !isSelectionFinished || i > props.wordIndex}
          rowIndex={i}
          intermediaryTileStatuses={
            props.numberTileStatuses.filter((x) => x.type === "intermediary") as IntermediaryTileStatus[]
          }
        />
      );
    }

    return <div className="numbers-game-grid">{Grid}</div>;
  };

  const RoundScoreDisplay = () => {
    if (props.inProgress) {
      return null;
    }

    if (props.targetNumber === undefined) {
      return null;
    }

    const { score, difference } = getNumbersGameScore(
      props.closestGuessSoFar,
      props.targetNumber,
      props.gamemodeSettings.scoringMethod
    );

    if (score === null) {
      return (
        <MessageNotification type="error">
          No guess was made
          <br />
          <strong>0</strong> points
        </MessageNotification>
      );
    }

    if (props.closestGuessSoFar === props.targetNumber) {
      return (
        <MessageNotification type="success">
          You got the target number!
          <br />
          <strong>{score}</strong> points
        </MessageNotification>
      );
    }

    if (score >= 1 && score <= 9) {
      return (
        <MessageNotification type="success">
          You were <strong>{difference}</strong> away from the target number
          <br />
          <strong>{score}</strong> points
        </MessageNotification>
      );
    }

    return (
      <MessageNotification type="error">
        You were {difference} away from the target number
        <br />
        <strong>0</strong> points
      </MessageNotification>
    );
  };

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

  const BestSolution = () => {
    const { difference } = getNumbersGameScore(
      props.closestGuessSoFar,
      props.targetNumber,
      props.gamemodeSettings.scoringMethod
    );

    // Don't need to show a best solution, the player got the target number
    if (difference === 0) {
      return null;
    }

    // Too many operands to compute a solution
    if (props.gamemodeSettings.numOperands > NUMBERPUZZLE_MAX_NUM_OPERANDS) {
      return null;
    }

    // Can just manage to find a solution with 7 operands, show a button to start finding the solution
    if (props.gamemodeSettings.numOperands === NUMBERPUZZLE_MAX_NUM_OPERANDS && solutions === null) {
      return (
        <Button
          mode={"default"}
          onClick={() => {
            setIsComputeSolutionButtonClicked(true);
            window.setTimeout(() => computeBestSolution(), 0);
          }}
          settings={props.settings}
          additionalProps={{ autoFocus: true }}
          disabled={isComputeSolutionButtonClicked}
        >
          {isComputeSolutionButtonClicked && solutions === null ? "Calculating..." : "Find Best Solution"}
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
            {solutions?.best.toListOfSteps().map((step, index) => (
              <React.Fragment key={`bestSolutionStep-${index}`}>
                {step}
                <br />
              </React.Fragment>
            ))}
          </strong>
        </MessageNotification>
      </div>
    );
  };

  const Outcome = () => {
    if (props.inProgress) {
      return null;
    }

    return (
      <>
        <RoundScoreDisplay />
        <BestSolution />

        <Button
          mode={"accept"}
          onClick={() => {
            props.ResetGame();
            setSolutions(null);
            setIsComputeSolutionButtonClicked(false);
          }}
          settings={props.settings}
          additionalProps={{ autoFocus: true }}
        >
          {props.campaignConfig.isCampaignLevel ? LEVEL_FINISHING_TEXT : "Restart"}
        </Button>
      </>
    );
  };

  const handleTimerToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGamemodeSettings: NumbersGameConfigProps["gamemodeSettings"] = {
      ...props.gamemodeSettings,
      timerConfig: e.target.checked ? { isTimed: true, seconds: props.totalSeconds } : { isTimed: false },
    };

    props.updateGamemodeSettings(newGamemodeSettings);
  };

  const handleSimpleGamemodeSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGamemodeSettings: NumbersGameConfigProps["gamemodeSettings"] = {
      ...props.gamemodeSettings,
      [e.target.name]: getNewGamemodeSettingValue(e),
    };

    props.updateGamemodeSettings(newGamemodeSettings);
  };

  return (
    <div
      className="App"
      style={{ backgroundImage: `url(${props.theme.backgroundImageSrc})`, backgroundSize: "100% 100%" }}
    >
      {!props.campaignConfig.isCampaignLevel && (
        <div className="gamemodeSettings">
          <NumbersGameGamemodeSettings
            gamemodeSettings={props.gamemodeSettings}
            handleSimpleGamemodeSettingsChange={handleSimpleGamemodeSettingsChange}
            handleTimerToggle={handleTimerToggle}
            resetCountdown={props.resetCountdown}
            setTotalSeconds={props.setTotalSeconds}
            onLoadPresetGamemodeSettings={props.updateGamemodeSettings}
            onShowOfAddPresetModal={() => {}}
            onHideOfAddPresetModal={() => {}}
          />
        </div>
      )}

      <Outcome />

      <Grid />

      {props.inProgress && (
        <>
          <Button mode="destructive" onClick={props.onBackspace} settings={props.settings}>
            Undo
          </Button>
          <Button mode="destructive" onClick={props.clearGrid} settings={props.settings}>
            Clear
          </Button>
          <Button mode="default" onClick={props.submitBestGuess} settings={props.settings}>
            Use Best Guess
          </Button>
        </>
      )}

      {props.gamemodeSettings.timerConfig.isTimed && (
        <div>
          <ProgressBar
            progress={props.remainingSeconds}
            total={props.gamemodeSettings.timerConfig.seconds}
            display={{ type: "transition", colorTransition: GreenToRedColorTransition }}
          />
        </div>
      )}
    </div>
  );
};

export default NumbersGame;
