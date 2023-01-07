import React, { useState } from "react";
import Button from "../Components/Button";
import MessageNotification from "../Components/MessageNotification";
import ProgressBar, { GreenToRedColorTransition } from "../Components/ProgressBar";
import { Guess, NumbersGameConfigProps, NumberTileStatus } from "./NumbersGameConfig";
import { Theme } from "../Data/Themes";
import { LEVEL_FINISHING_TEXT } from "../Components/Level";
import { hasNumberSelectionFinished } from "../Helpers/hasNumberSelectionFinished";
import { NumberPuzzleValue, NumberPuzzle } from "../Helpers/NumbersGameSolver";
import { getNumbersGameScore } from "../Helpers/getNumbersGameScore";
import { getNewGamemodeSettingValue } from "../Helpers/getGamemodeSettingsNewValue";
import NumbersGameGamemodeSettings from "../Components/GamemodeSettingsOptions/NumbersGameGamemodeSettings";
import { SettingsData } from "../Data/SaveData/Settings";
import { getRandomBigNumber } from "../Helpers/getRandomBigNumber";
import { getRandomSmallNumber } from "../Helpers/getRandomSmallNumber";
import NumbersGameGrid from "../Components/NumbersGameGrid";

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

    return getRandomSmallNumber();
  }

  function getBigNumber(): number | null {
    if (hasNumberSelectionFinished(props.numberTileStatuses, props.gamemodeSettings.numOperands)) {
      return null;
    }

    return getRandomBigNumber(props.gamemodeSettings.hasScaryNumbers);
  }

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
      className="App numbers-game"
      style={{ backgroundImage: `url(${props.theme.backgroundImageSrc})`, backgroundSize: "100% 100%" }}
    >
      <NumbersGameGrid {...props} />

      {props.inProgress && (
        <div className="game-panel">
          <div className="button-section">
            <Button mode="destructive" onClick={props.onBackspace} settings={props.settings}>
              Undo
            </Button>
            <Button mode="destructive" onClick={props.clearGrid} settings={props.settings}>
              Clear
            </Button>
            <Button mode="default" onClick={props.submitBestGuess} settings={props.settings}>
              Use Best Guess
            </Button>
          </div>
          
          <div className="timer-section">
            {props.gamemodeSettings.timerConfig.isTimed && (
              <ProgressBar
                progress={props.remainingSeconds}
                total={props.gamemodeSettings.timerConfig.seconds}
                display={{ type: "transition", colorTransition: GreenToRedColorTransition }}
              />
            )}
          </div>
        </div>
      )}

      <div className="info-panel">
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
      </div>
    </div>
  );
};

export default NumbersGame;
