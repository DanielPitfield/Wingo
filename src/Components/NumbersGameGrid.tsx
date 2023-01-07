import Button from "../Components/Button";
import NumberRow from "../Components/NumberRow";
import NumberTile from "../Components/NumberTile";
import NumberSelectionRow from "../Components/NumberSelectionRow";
import { DEFAULT_NUMBERS_GAME_NUM_ROWS } from "../Data/DefaultGamemodeSettings";
import { hasNumberSelectionFinished } from "../Helpers/hasNumberSelectionFinished";
import { hasNumberSelectionStarted } from "../Helpers/hasNumberSelectionStarted";
import { Guess, IntermediaryTileStatus, NumbersGameConfigProps, NumberTileStatus } from "../Pages/NumbersGameConfig";
import { SettingsData } from "../Data/SaveData/Settings";
import { Theme } from "../Data/Themes";
import { getRandomBigNumber } from "../Helpers/getRandomBigNumber";
import { getRandomSmallNumber } from "../Helpers/getRandomSmallNumber";

interface INumbersGameGridProps {
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

const NumbersGameGrid = (props: INumbersGameGridProps) => {
  const Grid = [];

  const isSelectionFinished = hasNumberSelectionFinished(props.numberTileStatuses, props.gamemodeSettings.numOperands);

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
          onClick={() => props.onSubmitNumbersGameNumber(getRandomBigNumber(props.gamemodeSettings.hasScaryNumbers)!)}
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

  // If all numbers (even if 1 is left) are used, no more rows are needed
  const allNumbersUsed = props.numberTileStatuses.filter((x) => !x.picked).length <= 1;

  const numberOfRowsToDisplay = Math.max(
    // Ensure at least DEFAULT_NUMBERS_GAME_NUM_ROWS number of rows is always shown
    DEFAULT_NUMBERS_GAME_NUM_ROWS,
    // If all the numbers have been used, don't add any more rows; else add another row
    allNumbersUsed ? props.wordIndex : props.wordIndex + 1
  );

  for (let i = 0; i < numberOfRowsToDisplay; i++) {
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

export default NumbersGameGrid;
