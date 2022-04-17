import React, { useState } from "react";
import { arrayMove, OrderGroup } from "react-draggable-order";
import { Page } from "../App";
import LetterTile from "../LetterTile";
import { operators, pretty_operator_symbols } from "../Nubble/getValidValues";
import { randomIntFromInterval } from "../Nubble/Nubble";
import ProgressBar, { GreenToRedColorTransition } from "../ProgressBar";
import { DraggableItem } from "./DraggableItem";

interface Props {
  mode: "order" | "match";
  numTiles: number;
  numOperands: 2 | 3;
  difficulty: "easy" | "normal" | "hard";
  timerConfig: { isTimed: false } | { isTimed: true; seconds: number };
  setPage: (page: Page) => void;
}

/** */
const ArithmeticDrag: React.FC<Props> = (props) => {
  const [revealState, setRevealState] = useState<{ type: "in-progress"; movedTiles: number } | { type: "finished" }>({
    type: "in-progress",
    movedTiles: 0,
  });
  const [inProgress, setInProgress] = useState(true);
  const [seconds, setSeconds] = useState(props.timerConfig.isTimed ? props.timerConfig.seconds : 0);
  const [guess, setGuess] = useState("");
  const [tiles, setTiles] = useState<{ expression: string; total: number }[]>([]);

  function getStartingNumberLimit(): number {
    switch (props.difficulty) {
      case "easy": {
        return 100;
      }
      case "normal": {
        return 250;
      }
      case "hard": {
        return 1000;
      }
    }
  }

  React.useEffect(() => {
    // If all tiles have been initialised
    if (tiles.length > 0) {
      return;
    }

    const newTiles: { expression: string; total: number }[] = [];

    for (let i = 0; i < props.numTiles; i++) {
      const tile = generateTile();
      newTiles.push(tile);
    }

    setTiles(newTiles);

    function getOperatorLimit(operator: string) {
      switch (props.difficulty) {
        case "easy": {
          switch (operator) {
            case "/":
            case "*": {
              return 4;
            }
            case "+":
            case "-": {
              return 20;
            }
          }
          break;
        }
        case "normal": {
          switch (operator) {
            case "/":
            case "*": {
              return 4;
            }
            case "+":
            case "-": {
              return 100;
            }
          }
          break;
        }
        case "hard": {
          switch (operator) {
            case "/":
            case "*": {
              return 10;
            }
            case "+":
            case "-": {
              return 250;
            }
          }
          break;
        }
      }
    }

    function countOperators(expression: string): number {
      let operatorCount = 0;

      for (let i = 0; i < expression.length; i++) {
        const character = expression.charAt(i);
        if (pretty_operator_symbols.includes(character)) {
          operatorCount = operatorCount + 1;
        }
      }

      return operatorCount;
    }

    /**
     * Generates a new valid tile
     * @returns Object of tile information (display string and evaluation result)
     */
    function generateTile(): { expression: string; total: number } {
      // First number of the tile expression
      const starting_number = randomIntFromInterval(1, getStartingNumberLimit());

      // Begin the expression and total as this value (as string and as number)
      let expression = starting_number.toString();
      let total = starting_number;

      const numOperators = props.numOperands - 1;

      // Until expression has the required number of operators (is correct length)
      while (countOperators(expression) < numOperators) {
        // Choose one of the four operators
        let operator = operators[Math.round(Math.random() * (operators.length - 1))];
        let operator_symbol = operator.name;
        let operand: number | undefined = undefined;

        switch (operator_symbol) {
          case "/": {
            // Number of attempts to find a clean divisor
            const max_limit = 10;
            let fail_count = 0;

            // Loop max_limit times in the attempt of finding a clean divisor
            do {
              const random_divisor = randomIntFromInterval(2, getOperatorLimit(operator_symbol)!);
              // Clean division (result would be integer)
              if (total % random_divisor === 0 && total > 0) {
                // Use that divisor as tile number
                operand = random_divisor;
              } else {
                fail_count += 1;
              }
            } while (operand === undefined && fail_count < max_limit);
            break;
          }

          case "*": {
            // Lower threshold of 2 (no point multiplying by 1)
            operand = randomIntFromInterval(2, getOperatorLimit(operator_symbol)!);
            break;
          }

          case "+": {
            operand = randomIntFromInterval(1, getOperatorLimit(operator_symbol)!);
            break;
          }

          case "-": {
            // The value 1 or 10% of the operator limit?
            const MIN_VALUE_LIMIT = 1;
            // The current targetNumber is too small to be suitable for subtraction
            if (total <= MIN_VALUE_LIMIT) {
              break;
            }
            // The target number is smaller than the maximum value which can be subtracted
            else if (total < getOperatorLimit(operator_symbol)!) {
              // Only subtract a random value which is smaller than targetNumber
              operand = randomIntFromInterval(1, total - 1);
            } else {
              // Proceed as normal
              operand = randomIntFromInterval(1, getOperatorLimit(operator_symbol)!);
            }
          }
        }

        // An operator and operand were determined in this iteration
        if (operand !== undefined) {
          // Add both to expression string
          expression = expression + getPrettyOperatorSymbol(operator_symbol) + operand.toString();

          // Insert closing bracket after operand following the first operator (when there are 3 operands)
          if (countOperators(expression) === 1 && props.numOperands === 3) {
            expression = expression + ")";
          }

          // Calculate the new total
          total = operator.function(total, operand);
        }
      }

      // Insert starting bracket with three operands
      if (props.numOperands === 3) {
        expression = "(" + expression;
      }

      // Once expression is desired length, return
      return { expression: expression, total: total };
    }
  }, [tiles, props.numTiles]);

  function getPrettyOperatorSymbol(operatorSymbol: "+" | "-" | "/" | "*"): string {
    switch (operatorSymbol) {
      case "/":
        return "÷";

      case "*":
        return "×";

      case "+":
        return "+";

      case "-":
        return "-";
    }
  }

  // (Guess) Timer Setup
  React.useEffect(() => {
    if (!props.timerConfig.isTimed || !inProgress) {
      return;
    }

    // Only start this timer once all the tiles have been revealed
    if (revealState.type !== "finished") {
      return;
    }

    const timerGuess = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      } else {
        setInProgress(false);
      }
    }, 1000);
    return () => {
      clearInterval(timerGuess);
    };
  }, [setSeconds, seconds, props.timerConfig.isTimed, revealState]);

  /**
   *
   * @returns
   */
  function displayTiles() {
    return (
      <OrderGroup mode={"between"}>
        {tiles.map((tile, index) => (
          <DraggableItem key={index} index={index} onMove={(toIndex) => setTiles(arrayMove(tiles, index, toIndex))}>
            <LetterTile letter={tile.expression} status="not set" />
          </DraggableItem>
        ))}
      </OrderGroup>
    );
  }

  /**
   *
   * @returns
   */
  function displayOutcome(): React.ReactNode {
    // Game still in progress, don't display anything
    if (inProgress) {
      return;
    }

    return <></>;
  }

  return (
    <div className="App numbers_arithmetic">
      <div className="outcome">{displayOutcome()}</div>
      {inProgress && <div className="tile_row">{displayTiles()}</div>}
      {revealState.type === "finished" && (
        <div>
          {props.timerConfig.isTimed && (
            <ProgressBar
              progress={seconds}
              total={props.timerConfig.seconds}
              display={{ type: "transition", colorTransition: GreenToRedColorTransition }}
            ></ProgressBar>
          )}
        </div>
      )}
    </div>
  );
};

export default ArithmeticDrag;
