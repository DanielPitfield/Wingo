import React, { useState } from "react";
import { NumberPuzzle } from "../CountdownNumbers/CountdownSolver";
import GamemodeSettingsMenu from "../GamemodeSettingsMenu";
import "../index.scss";
import { MessageNotification } from "../MessageNotification";
import { SettingsData } from "../SaveData";
import { Theme } from "../Themes";
import DiceGrid from "./DiceGrid";
import { HexagonPinAdjacency, nubbleGridShape, nubbleGridShapes, nubbleGridSize, nubbleGridSizes } from "./NubbleConfig";

interface Props {
  isCampaignLevel: boolean;
  theme: Theme;

  gamemodeSettings: {
    numDice: number;
    diceMin: number;
    diceMax: number;
    gridShape: nubbleGridShape;
    gridSize: nubbleGridSize;
    numTeams: number;
    isGameOverOnIncorrectPick: boolean;
    timerConfig: { isTimed: true; seconds: number } | { isTimed: false };
  };

  remainingSeconds: number;

  updateGamemodeSettings: (newGamemodeSettings: {
    numDice: number;
    diceMin: number;
    diceMax: number;
    gridShape: nubbleGridShape;
    gridSize: nubbleGridSize;
    numTeams: number;
    isGameOverOnIncorrectPick: boolean;
    timerConfig: { isTimed: true; seconds: number } | { isTimed: false };
  }) => void;
  updateRemainingSeconds: (newSeconds: number) => void;

  determineHexagonRowValues: () => { rowNumber: number; values: number[] }[];
  determinePoints: (value: number) => number;
  determinePointColourMappings: () => { points: number; colour: string }[];
  determineSquareAdjacentMappings: () => {
    pin: number;
    adjacent_pins: number[];
  }[];
  determineHexagonAdjacentMappings: () => {
    pin: number;
    adjacent_pins: HexagonPinAdjacency;
  }[];

  settings: SettingsData;
}

export function randomIntFromInterval(min: number, max: number) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const Nubble: React.FC<Props> = (props) => {
  const [status, setStatus] = useState<
    | "dice-rolling"
    | "dice-rolled-awaiting-pick"
    | "picked-awaiting-dice-roll"
    | "game-over-incorrect-tile"
    | "game-over-timer-ended"
  >("picked-awaiting-dice-roll");
  const [diceValues, setdiceValues] = useState<number[]>(
    Array.from({ length: props.gamemodeSettings.numDice }).map((x) => randomDiceNumber())
  );
  const [pickedPins, setPickedPins] = useState<number[]>([]);
  const gridPoints = Array.from({ length: props.gamemodeSettings.gridSize }).map((_, i) => ({
    number: i + 1,
    points: props.determinePoints(i + 1),
  }));
  const [totalPoints, setTotalPoints] = useState(0);

  const DEFAULT_TIMER_VALUE = 600;
  const [mostRecentTotalSeconds, setMostRecentTotalSeconds] = useState(
    props.gamemodeSettings?.timerConfig?.isTimed === true
      ? props.gamemodeSettings?.timerConfig.seconds
      : DEFAULT_TIMER_VALUE
  );

  // Determine valid results on update of diceValues (at start and on roll of dice)
  React.useEffect(() => {
    setStatus("dice-rolled-awaiting-pick");
  }, [diceValues]);

  // End game when timer runs out
  const hasTimerEnded = props.remainingSeconds <= 0;

  React.useEffect(() => {
    // TODO: Move status to NubbleConfig and set within timer useEffect()?
    setStatus("game-over-timer-ended");
  }, [hasTimerEnded]);

  /**
   *
   * @returns
   */
  function randomDiceNumber() {
    return randomIntFromInterval(props.gamemodeSettings.diceMin, props.gamemodeSettings.diceMax);
  }

  /**
   *
   * @returns
   */
  function rollDice() {
    // If dice is not available to be rolled
    if (status !== "picked-awaiting-dice-roll") {
      return;
    }

    // Dice is now being rolled
    setStatus("dice-rolling");

    // Determine random dice values for all the dice
    setdiceValues(Array.from({ length: props.gamemodeSettings.numDice }).map((x) => randomDiceNumber()));
  }

  /**
   *
   * @param value
   * @returns
   */
  function isPrime(value: number): boolean {
    if (value <= 1) {
      return false;
    }

    // even numbers
    if (value % 2 === 0 && value > 2) {
      return false;
    }

    // store the square to loop faster
    const s = Math.sqrt(value);
    for (let i = 3; i <= s; i += 2) {
      // start from 3, stop at the square, increment in twos
      // modulo shows a divisor was found
      if (value % i === 0) {
        return false;
      }
    }

    return true;
  }

  /**
   *
   * @param pinNumber
   * @returns
   */
  function isAdjacentBonus(pinNumber: number): boolean {
    if (props.gamemodeSettings.gridShape === "square") {
      // Pin adjacency information
      const adjacentMappings = props.determineSquareAdjacentMappings();
      // Adjacent pins of the clicked pin
      const adjacent_pins = adjacentMappings.find((x) => x.pin === pinNumber)?.adjacent_pins;

      if (!adjacent_pins) {
        return false;
      }

      // All the adjacent pins which have also previously been picked
      const picked_adjacent_pins = pickedPins.filter((x) => adjacent_pins?.includes(x));

      // The pin and the 3 adjacent pins to make a 2x2 square
      if (picked_adjacent_pins.length >= 3) {
        return true;
      } else {
        return false;
      }
    } else if (props.gamemodeSettings.gridShape === "hexagon" as nubbleGridShape) {
      // Pin adjacency information
      const adjacentMappings = props.determineHexagonAdjacentMappings();
      // Adjacent pins of the clicked pin
      const adjacent_pins = adjacentMappings.find((x) => x.pin === pinNumber)?.adjacent_pins;

      if (!adjacent_pins) {
        return false;
      }

      // The pin and two adjacent pins forming a triangle can happen in six ways

      // In a clockwise direction...
      const topTriangle =
        adjacent_pins.leftAbove !== null &&
        pickedPins.includes(adjacent_pins.leftAbove) &&
        adjacent_pins.rightAbove !== null &&
        pickedPins.includes(adjacent_pins.rightAbove);

      const topRightTriangle =
        adjacent_pins.rightAbove !== null &&
        pickedPins.includes(adjacent_pins.rightAbove) &&
        adjacent_pins.right !== null &&
        pickedPins.includes(adjacent_pins.right);

      const bottomRightTriangle =
        adjacent_pins.rightBelow !== null &&
        pickedPins.includes(adjacent_pins.rightBelow) &&
        adjacent_pins.right !== null &&
        pickedPins.includes(adjacent_pins.right);

      const bottomTriangle =
        adjacent_pins.leftBelow !== null &&
        pickedPins.includes(adjacent_pins.leftBelow) &&
        adjacent_pins.rightBelow !== null &&
        pickedPins.includes(adjacent_pins.rightBelow);

      const bottomLeftTriangle =
        adjacent_pins.leftBelow !== null &&
        pickedPins.includes(adjacent_pins.leftBelow) &&
        adjacent_pins.left !== null &&
        pickedPins.includes(adjacent_pins.left);

      const topLeftTriangle =
        adjacent_pins.leftAbove !== null &&
        pickedPins.includes(adjacent_pins.leftAbove) &&
        adjacent_pins.left !== null &&
        pickedPins.includes(adjacent_pins.left);

      if (
        topTriangle ||
        topRightTriangle ||
        bottomRightTriangle ||
        bottomTriangle ||
        bottomLeftTriangle ||
        topLeftTriangle
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      // Unexpected grid shape
      return false;
    }
  }

  /**
   *
   * @param pinNumber
   * @returns
   */
  function onClick(pinNumber: number) {
    if (status === "dice-rolling") {
      return;
    }

    if (pinNumber < 1) {
      return;
    }

    // Find all the ways the selected pin can be made with the input numbers
    const puzzle = new NumberPuzzle(pinNumber, diceValues);
    const solutions = puzzle.solve().all;

    // There are no solutions (ways of making the selected number)
    if (solutions.length < 1) {
      // End game if game setting is enabled
      if (props.gamemodeSettings.isGameOverOnIncorrectPick) {
        setStatus("game-over-incorrect-tile");
      }

      // Return early
      return;
    }

    setStatus("picked-awaiting-dice-roll");

    // Keep track that the pin has now been correctly picked
    const newPickedPins = pickedPins.slice();
    newPickedPins.push(pinNumber);
    setPickedPins(newPickedPins);

    // Find out how many base points the pin is worth
    let pinScore = gridPoints.find((x) => x.number === pinNumber)?.points;

    if (isPrime(pinNumber)) {
      // Double points if the picked pin is a prime number
      pinScore = pinScore! * 2;
    }

    // Bonus points awarded for nubble triangle
    const adjacentBonus = 200;

    if (isAdjacentBonus(pinNumber)) {
      pinScore = pinScore! + adjacentBonus;
    }

    // Add points to total points
    if (pinScore) {
      setTotalPoints(totalPoints + pinScore);
    }
  }

  // Array (length of rowLength) of buttons
  function populateRow(rowLength: number, rowNumber: number) {
    // Calculate the middle row
    const middle = Math.sqrt(props.gamemodeSettings.gridSize) / 2;

    // Calculate the offset from the middle row (negative offset applied to rows below middle)
    const offset = (middle - rowNumber) * -1;

    // How much to slant the parallelogram
    const X_SLANT = 2.45;
    const Y_SLANT = 1.8;

    // Information regarding which pin values are on the current row (for hexagon grid shape)
    const rowInformation = props.determineHexagonRowValues().find((row) => rowNumber === row.rowNumber);

    // Information regarding what colour the rows are and how many points are awarded for each row
    const pointColourInformation = props.determinePointColourMappings();

    return (
      <div
        className="nubble-grid-row"
        style={{
          transform:
            props.gamemodeSettings.gridShape === "hexagon" as nubbleGridShape
              ? `translate(${offset * 10 * X_SLANT}px, ${offset * 10 * Y_SLANT}px)`
              : undefined,
        }}
      >
        {Array.from({ length: rowLength }).map((_, i) => {
          if (props.gamemodeSettings.gridShape === "square") {
            // What was the highest value included in the previous row?
            const prevRowEndingValue = (rowNumber - 1) * rowLength;
            // Start from that value and add the index to it (index is zero based, so add an additional one)
            const value = prevRowEndingValue + i + 1;
            // Has the pin already been picked?
            const isPicked = pickedPins.includes(value);
            // What colour should the pin be?
            const colour = pointColourInformation.find((x) => x.points === props.determinePoints(value))?.colour;

            return (
              <button
                key={i}
                className="nubble-button"
                data-prime={isPrime(value)}
                data-shape={props.gamemodeSettings.gridShape}
                data-picked={isPicked}
                data-colour={colour}
                onClick={() => onClick(value)}
                disabled={isPicked || status !== "dice-rolled-awaiting-pick"}
              >
                {value}
              </button>
            );
          } else if (props.gamemodeSettings.gridShape === "hexagon" as nubbleGridShape) {
            const value = rowInformation?.values[i];

            if (!value) {
              return;
            }

            const isPicked = pickedPins.includes(value);
            const colour = pointColourInformation.find((x) => x.points === props.determinePoints(value))?.colour;

            return (
              <button
                key={i}
                className="nubble-button"
                data-prime={isPrime(value)}
                data-shape={props.gamemodeSettings.gridShape}
                data-picked={isPicked}
                data-colour={colour}
                onClick={() => onClick(value)}
                disabled={isPicked || status !== "dice-rolled-awaiting-pick"}
              >
                <span className="top"></span>
                <span className="middle">{value}</span>
                <span className="bottom"></span>
              </button>
            );
          }
        })}
      </div>
    );
  }

  /**
   *
   * @returns
   */
  function populateGrid() {
    var Grid = [];

    const rowLength = Math.sqrt(props.gamemodeSettings.gridSize);

    // Start with higher value rows (so that they are rendered first, at the top of the grid)
    for (let i = rowLength; i >= 1; i--) {
      Grid.push(populateRow(rowLength, i));
    }
    return Grid;
  }

  /**
   *
   * @returns
   */
  function displayPinScores() {
    const pinScores = [];
    const pointColourMappings = props.determinePointColourMappings();

    // Create read-only nubble pin of each colour with text of how many points it awards
    for (const row of pointColourMappings) {
      pinScores.push(
        <button
          key={row.colour}
          className="nubble-button-display"
          data-prime={false}
          data-picked={false}
          data-colour={row.colour}
          onClick={() => {
            /* Do nothing */
          }}
          disabled={false}
        >
          {row.points}
        </button>
      );
    }

    // Use the last/highest row colour to show prime nubble pin
    const lastPointColourMapping = pointColourMappings[pointColourMappings.length - 1];

    // Create a prime nubble pin (a pin with a border) to show it awards double points
    pinScores.push(
      <button
        key={"prime-read-only"}
        className="nubble-button-display"
        data-prime={true}
        data-picked={false}
        data-colour={lastPointColourMapping.colour}
        onClick={() => {}}
        disabled={false}
      >
        {lastPointColourMapping.points * 2}
      </button>
    );

    return pinScores;
  }

  function generateSettingsOptions(): React.ReactNode {
    return (
      <>
        <label>
          <input
            type="number"
            value={props.gamemodeSettings.numDice}
            min={2}
            max={6}
            onChange={(e) => {
              const newGamemodeSettings = {
                ...props.gamemodeSettings,
                numDice: e.target.valueAsNumber,
              };
              props.updateGamemodeSettings(newGamemodeSettings);
            }}
          ></input>
          Number of dice
        </label>

        <label>
          <input
            type="number"
            value={props.gamemodeSettings.diceMin}
            min={1}
            max={props.gamemodeSettings.diceMax}
            onChange={(e) => {
              const newGamemodeSettings = {
                ...props.gamemodeSettings,
                diceMin: e.target.valueAsNumber,
              };
              props.updateGamemodeSettings(newGamemodeSettings);
            }}
          ></input>
          Minimum dice value
        </label>

        <label>
          <input
            type="number"
            value={props.gamemodeSettings.diceMax}
            min={props.gamemodeSettings.diceMin}
            max={100}
            onChange={(e) => {
              const newGamemodeSettings = {
                ...props.gamemodeSettings,
                diceMax: e.target.valueAsNumber,
              };
              props.updateGamemodeSettings(newGamemodeSettings);
            }}
          ></input>
          Maximum dice value
        </label>

        <label>
          <select
            onChange={(e) => {
              const newGamemodeSettings = {
                ...props.gamemodeSettings,
                gridShape: e.target.value as nubbleGridShape,
              };
              props.updateGamemodeSettings(newGamemodeSettings);
            }}
            className="nubbleGridShape_input"
            name="nubbleGridShape"
            value={props.gamemodeSettings.gridShape as nubbleGridShape}
          >
            {nubbleGridShapes.map((nubbleGridShape) => (
              <option key={nubbleGridShape} value={nubbleGridShape}>
                {nubbleGridShape}
              </option>
            ))}
          </select>
          Grid Shape
        </label>

        <label>
          <select
            onChange={(e) => {
              const newGamemodeSettings = {
                ...props.gamemodeSettings,
                gridSize: parseInt(e.target.value) as nubbleGridSize,
              };
              props.updateGamemodeSettings(newGamemodeSettings);
            }}
            className="nubbleGridSize_input"
            name="nubbleGridSize"
            value={props.gamemodeSettings.gridSize as nubbleGridSize}
          >
            {nubbleGridSizes.map((nubbleGridSize) => (
              <option key={nubbleGridSize} value={nubbleGridSize}>
                {nubbleGridSize}
              </option>
            ))}
          </select>
          Grid Size
        </label>

        <label>
          <input
            type="number"
            value={props.gamemodeSettings.numTeams}
            min={1}
            max={4}
            onChange={(e) => {
              const newGamemodeSettings = {
                ...props.gamemodeSettings,
                numTeams: e.target.valueAsNumber,
              };
              props.updateGamemodeSettings(newGamemodeSettings);
            }}
          ></input>
          Number of teams
        </label>

        <label>
          <input
            checked={props.gamemodeSettings.isGameOverOnIncorrectPick}
            type="checkbox"
            onChange={(e) => {
              const newGamemodeSettings = {
                ...props.gamemodeSettings,
                isGameOverOnIncorrectPick: !props.gamemodeSettings.isGameOverOnIncorrectPick,
              };
              props.updateGamemodeSettings(newGamemodeSettings);
            }}
          ></input>
          Incorrect pick ends game
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

  return (
    <div className="App" style={{ backgroundImage: `url(${props.theme.backgroundImageSrc})`, backgroundSize: "100%" }}>
      {!props.isCampaignLevel && (
        <div className="gamemodeSettings">
          <GamemodeSettingsMenu>{generateSettingsOptions()}</GamemodeSettingsMenu>
        </div>
      )}
      
      {status === "game-over-incorrect-tile" && (
        <MessageNotification type="error">
          Incorrect tile picked
          <br />
          Your score was <strong>{totalPoints}</strong>
        </MessageNotification>
      )}
      <DiceGrid
        diceValues={diceValues}
        rollDice={rollDice}
        settings={props.settings}
        disabled={status !== "picked-awaiting-dice-roll"}
      >
        {status === "dice-rolling"
          ? "Rolling..."
          : status === "picked-awaiting-dice-roll"
          ? "Roll Dice"
          : status === "dice-rolled-awaiting-pick"
          ? "Pick a nibble"
          : "Game over"}
      </DiceGrid>
      <div className="nubble-grid" data-shape={props.gamemodeSettings.gridShape}>
        {populateGrid()}
      </div>
      <div className="nubble-score-wrapper">
        <div className="nubble-score">{totalPoints}</div>
        <div className="nubble-pin-scores">{displayPinScores()}</div>
      </div>
    </div>
  );
};

export default Nubble;
