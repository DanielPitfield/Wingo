import React, { useState } from "react";
import "../index.scss";
import DiceGrid from "./DiceGrid";
import { getValidValues } from "./getValidValues";

interface Props {
  numDice: number;
  diceMin: number;
  diceMax: number;
  gridSize: 25 | 64 | 100;
  gridShape: "square" | "hexagon";
  determinePoints: (value: number) => number;
  determinePointColourMappings: () => { points: number; colour: string }[];
  determineAdjacentMappings: () => { pin: number; adjacent_pins: number[] }[];
  numTeams: number;
  timeLengthMins: number;
}

export function randomIntFromInterval(min: number, max: number) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const Nubble: React.FC<Props> = (props) => {
  const [isDiceRolling, setisDiceRolling] = useState(false);
  const [diceValues, setdiceValues] = useState<number[]>(
    Array.from({ length: props.numDice }).map((x) => randomDiceNumber())
  );
  const [pickedPins, setPickedPins] = useState<number[]>([]);
  const gridPoints = Array.from({ length: props.gridSize }).map((_, i) => ({
    number: i + 1,
    points: props.determinePoints(i + 1),
  }));
  const [totalPoints, setTotalPoints] = useState(0);
  const [validValues, setValidValues] = useState<number[]>();

  // Determine valid results on update of diceValues (at start and on roll of dice)
  React.useEffect(() => {
    const newValidValues = getValidValues(diceValues, props.gridSize);
    setValidValues(newValidValues);
    // Once new values have been set, show the dice as having stopped rolling
    setisDiceRolling(false);
  }, [diceValues]);

  function randomDiceNumber() {
    return randomIntFromInterval(props.diceMin, props.diceMax);
  }

  function rollDice() {
    // If dice isn't already rolling
    if (!isDiceRolling) {
      // Dice is now being rolled
      setisDiceRolling(true);
      // Determine random dice values for all the dice
      setdiceValues(Array.from({ length: props.numDice }).map((x) => randomDiceNumber()));
    }
  }

  function isPrime(value: number) {
    // returns boolean
    if (value <= 1) return false; // negatives
    if (value % 2 === 0 && value > 2) return false; // even numbers
    const s = Math.sqrt(value); // store the square to loop faster
    for (let i = 3; i <= s; i += 2) {
      // start from 3, stop at the square, increment in twos
      if (value % i === 0) return false; // modulo shows a divisor was found
    }
    return true;
  }

  function isAdjacentTriangle(pinNumber: number) {
    // Array deatiling pin adjacency for this gridSize
    const adjacentMappings = props.determineAdjacentMappings();
    console.log(adjacentMappings);
    // Adjacent pins of the clicked pin
    const adjacent_pins = adjacentMappings.find((x) => x.pin === pinNumber)?.adjacent_pins;
    // All the adjacent pins which have also previously been picked
    const picked_adjacent_pins = pickedPins.filter((x) => adjacent_pins?.includes(x));
    // Determine if there is a nubble triangle (3 adjacent picked pins)
    if (picked_adjacent_pins.length >= 3) {
      return true;
    }
    return false;
  }

  function onClick(pinNumber: number) {
    if (!validValues || !validValues.includes(pinNumber) || pinNumber < 1 || isDiceRolling) {
      // No valid values, number is invalid or dice is rolling
      return;
    } else {
      // Keep track that the pin has now been correctly picked
      let newPickedPins = pickedPins.slice();
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

      if (isAdjacentTriangle(pinNumber)) {
        pinScore = pinScore! + adjacentBonus;
      }

      // Add points to total points
      if (pinScore) {
        setTotalPoints(totalPoints + pinScore);
      }
    }
  }

  // Array (length of rowLength) of buttons
  function populateRow(rowLength: number, rowNumber: number) {
    // Calculate the middle row
    const middle = Math.sqrt(props.gridSize) / 2;

    // Calculate the offset from the middle row (negative is below middle)
    const offset = middle - rowNumber;

    // How much to slant the parallelogram
    const X_SLANT = 2.45;
    const Y_SLANT = 1.8;

    return (
      <div
        className="nubble-grid-row"
        style={{
          transform:
            props.gridShape === "hexagon"
              ? `translate(${offset * 10 * X_SLANT}px, ${offset * 10 * Y_SLANT}px)`
              : undefined,
        }}
      >
        {Array.from({ length: rowLength }).map((_, i) => {
          let value = rowNumber * rowLength + i + 1;
          let isPicked = pickedPins.includes(value);

          const pointColourMappings = props.determinePointColourMappings();
          let colour = pointColourMappings.find((x) => x.points === props.determinePoints(value))?.colour;

          return (
            <button
              key={i}
              className="nubble-button"
              data-prime={isPrime(value)}
              data-shape={props.gridShape}
              data-picked={isPicked}
              data-colour={colour}
              onClick={() => onClick(value)}
              disabled={isPicked}
            >
              {props.gridShape === "hexagon" && <span className="top"></span>}
              {props.gridShape === "hexagon" && <span className="middle">{value}</span>}
              {props.gridShape === "hexagon" && <span className="bottom"></span>}
              {props.gridShape === "square" && value}
            </button>
          );
        })}
      </div>
    );
  }

  function populateGrid() {
    var Grid = [];

    const rowLength = Math.sqrt(props.gridSize);
    for (let i = 0; i < rowLength; i++) {
      Grid.push(populateRow(rowLength, i));
    }
    return Grid;
  }

  function displayPinScores() {
    var all_pin_scores = [];
    const pointColourMappings = props.determinePointColourMappings();
    // Create nubble pin of each colour with text of how many points it awards
    for (let i = 0; i < pointColourMappings.length; i++) {
      all_pin_scores.push(
        <button
          key={i}
          // TODO: Change class name so doesnt change colour on hover
          className="nubble-button-display"
          data-prime={false}
          data-picked={false}
          data-colour={pointColourMappings[i].colour}
          // Do nothing
          onClick={() => onClick(0)}
          disabled={false}
        >
          {pointColourMappings[i].points}
        </button>
      );
    }

    let trimmed_pin_scores = [];
    if (props.gridShape === "square") {
      const numRows = Math.sqrt(props.gridSize);
      trimmed_pin_scores = all_pin_scores.slice(all_pin_scores.length - numRows, all_pin_scores.length);
    } else {
      trimmed_pin_scores = all_pin_scores.slice();
    }

    // Create a prime nubble pin to show it awards double points
    trimmed_pin_scores.push(
      <button
        key={"prime-read-only"}
        // TODO: Change class name so doesnt change colour on hover
        className="nubble-button-display"
        data-prime={true}
        data-picked={false}
        // Choose last colour mapping (red)
        data-colour={pointColourMappings[pointColourMappings.length - 1].colour}
        // Do nothing
        onClick={() => onClick(0)}
        disabled={false}
      >
        {pointColourMappings[pointColourMappings.length - 1].points * 2}
      </button>
    );
    return trimmed_pin_scores;
  }

  return (
    <div className="App">
      <DiceGrid numDice={props.numDice} diceValues={diceValues} rollDice={rollDice} disabled={isDiceRolling}></DiceGrid>
      <div className="nubble-grid">{populateGrid()}</div>
      <div className="nubble-score">{totalPoints}</div>
      <div className="nubble-pin-scores">{displayPinScores()}</div>
    </div>
  );
};

export default Nubble;
