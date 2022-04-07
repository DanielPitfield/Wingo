import React, { useState } from "react";
import "../App.scss";
import { Keyboard } from "../Keyboard";
import { Page } from "../App";
import { WordRow } from "../WordRow";
import { Button } from "../Button";
import { MessageNotification } from "../MessageNotification";
import ProgressBar, { GreenToRedColorTransition } from "../ProgressBar";
import LetterTile from "../LetterTile";
import { operators, operators_symbols } from "../Nubble/getValidValues";
import { randomIntFromInterval } from "../Nubble/Nubble";

interface Props {
  revealIntervalSeconds: number;
  numTiles: number;
  difficulty: "easy" | "normal" | "hard";
  setPage: (page: Page) => void;
}

const NumbersArithmetic: React.FC<Props> = (props) => {
  const [tileValue, setTileValue] = useState("");
  const [targetNumber, setTargetNumber] = useState(0);

  function generateTileValue() {
    // One of the four operators
    let tile_operator = operators[Math.floor(Math.random() * (operators.length - 1))];
    // String symbol of the operator
    let operator_symbol = tile_operator.name;

    let tile_number;

    if (operator_symbol === "/") {
      // Number of attempts to find a clean divisor
      const max_limit = 5;

      let fail_count = 0;
      do {
        const random_divisor = randomIntFromInterval(2, 10);
        // Clean division (result would be integer)
        if (targetNumber % random_divisor === 0) {
          // Use that divisor as tile number
          tile_number = random_divisor;
        } else {
          fail_count += 1;
        }
      } while (tile_number === undefined && fail_count < max_limit);

      // Clean divisor could not be found
      if (tile_number === undefined) {
        // Get the operators (but without division)
        const operators_division_removed = operators.slice(1, operators.length);
        // One of three operators
        tile_operator = operators_division_removed[Math.floor(Math.random() * (operators.length - 1))];
        // String symbol of the operator
        operator_symbol = tile_operator.name;
      }
    } else if (operator_symbol === "*") {
      // Smaller range for multiplication
      tile_number = randomIntFromInterval(2, 10);
    } else {
      // Larger range for addition and subtraction
      tile_number = randomIntFromInterval(1, 50);
    }

    if (tile_number !== undefined) {
      // Apply operation shown on current tile and update target number
      const newTargetNumber = tile_operator.function(targetNumber, tile_number);
      setTargetNumber(newTargetNumber);

      // String of the combination of operator and value
      setTileValue(operator_symbol + tile_number.toString());
    }
  }

  React.useEffect(() => {
    // Starting values
    const start_value = randomIntFromInterval(1, 1000);
    setTileValue(start_value.toString());
    setTargetNumber(start_value);

    // Timer Setup
    const timer = setInterval(() => {
      generateTileValue();
    }, props.revealIntervalSeconds * 1000);
    // Clear timer after all tiles have been revealed
    setTimeout(() => {
      clearInterval(timer);
    }, props.revealIntervalSeconds * props.numTiles * 1000);
  }, []);

  function displayOutcome() {
    // Game still in progress, don't display anything
    /*
    if (props.inProgress) {
      return;
    }
    */
  }

  return (
    <div className="App">
      <div>{/*displayOutcome()*/}</div>
      <LetterTile letter={tileValue} status={"not set"}></LetterTile>
    </div>
  );
};

export default NumbersArithmetic;
