import React, { useState } from "react";
import "../App.scss";
import { Page } from "../App";
import { MessageNotification } from "../MessageNotification";
import LetterTile from "../LetterTile";
import { operators } from "../Nubble/getValidValues";
import { randomIntFromInterval } from "../Nubble/Nubble";
import { NumPad } from "../NumPad";
import ProgressBar, { GreenToRedColorTransition } from "../ProgressBar";

interface Props {
  revealIntervalSeconds: number;
  numTiles: number;
  difficulty: "easy" | "normal" | "hard";
  timerConfig: { isTimed: false } | { isTimed: true; seconds: number };
  setPage: (page: Page) => void;
}

/** */
const NumbersArithmetic: React.FC<Props> = (props) => {
  // Max number of characters permitted in a guess
  const MAX_LENGTH = 6;

  const [targetNumber, setTargetNumber] = useState(0);
  const [revealState, setRevealState] = useState<{ type: "in-progress"; revealedTiles: number } | { type: "finished" }>(
    { type: "in-progress", revealedTiles: 0 }
  );
  const [inProgress, setInProgress] = useState(true);
  const [seconds, setSeconds] = useState(props.timerConfig.isTimed ? props.timerConfig.seconds : 0);
  const [guess, setGuess] = useState("");
  const [tiles, setTiles] = useState<string[]>([]);

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

    // Determine the starting number
    const starting_number = randomIntFromInterval(1, getStartingNumberLimit());

    // Start a tiles array, starting with the number
    const newTiles: string[] = [starting_number.toString()];

    // Keep a running target number
    let runningTotal = starting_number;

    // For each tile
    for (let i = 0; i < props.numTiles; i++) {
      // Generate a new tile from the existing target number
      const { tile, newRunningTotal } = generateTile(runningTotal);

      // Add the tile string
      newTiles.push(tile);

      // Update the running target number
      runningTotal = newRunningTotal;
    }

    // Set the tiles
    setTiles(newTiles);

    // The running total now become the target number
    setTargetNumber(runningTotal);
    console.log(`Target Number: ${runningTotal}; Tiles: ${newTiles.join(", ")}`);

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

    /**
     * Generates a new valid tile from the existing running total (so that the generated tile does not result in a decimal).
     * @param targetNumber Existing running total.
     * @returns New running total and a tile.
     */
    function generateTile(targetNumber: number): { tile: string; newRunningTotal: number } {
      let foundTileNumber = false;

      while (!foundTileNumber) {
        // One of the four operators
        let tile_operator = operators[Math.round(Math.random() * (operators.length - 1))];
        let operator_symbol = tile_operator.name;
        let tile_number: number | undefined = undefined;

        switch (operator_symbol) {
          case "/": {
            // Number of attempts to find a clean divisor
            const max_limit = 10;
            let fail_count = 0;

            // Loop max_limit times in the attempt of finding a clean divisor
            do {
              const random_divisor = randomIntFromInterval(2, getOperatorLimit(operator_symbol)!);
              // Clean division (result would be integer)
              if (targetNumber % random_divisor === 0 && targetNumber > 0) {
                // Use that divisor as tile number
                tile_number = random_divisor;
              } else {
                fail_count += 1;
              }
            } while (tile_number === undefined && fail_count < max_limit);
            break;
          }

          case "*": {
            // Lower threshold of 2 (no point multiplying by 1)
            tile_number = randomIntFromInterval(2, getOperatorLimit(operator_symbol)!);
            break;
          }

          case "+": {
            tile_number = randomIntFromInterval(1, getOperatorLimit(operator_symbol)!);
            break;
          }

          case "-": {
            // The value 1 or 10% of the operator limit?
            const MIN_VALUE_LIMIT = 1;
            // The current targetNumber is too small to be suitable for subtraction
            if (targetNumber <= MIN_VALUE_LIMIT) {
              break;
            }
            // The target number is smaller than the maximum value which can be subtracted
            else if (targetNumber < getOperatorLimit(operator_symbol)!) {
              // Only subtract a random value which is smaller than targetNumber
              tile_number = randomIntFromInterval(1, targetNumber - 1);
            } else {
              // Proceed as normal
              tile_number = randomIntFromInterval(1, getOperatorLimit(operator_symbol)!);
            }
          }
        }

        // The target number was determined in this iteration
        if (tile_number !== undefined) {
          // Set flag to stop while loop
          foundTileNumber = true;
          // Apply operation shown on current tile and update target number
          const newTargetNumber = tile_operator.function(targetNumber, tile_number);
          // String of the combination of operator and value
          return {
            tile: getPrettyOperatorSymbol(operator_symbol) + tile_number.toString(),
            newRunningTotal: newTargetNumber,
          };
        }
      }

      throw new Error("Unexpected number");
    }
  }, [tiles, props.numTiles]);

  function getPrettyOperatorSymbol(operatorSymbol: "+" | "-" | "/" | "*"): string {
    switch (operatorSymbol) {
      case "/":
        return "÷";

      case "*":
        return "x";

      case "+":
        return "+";

      case "-":
        return "-";
    }
  }

  React.useEffect(() => {
    // If the game has finished
    if (revealState.type === "finished") {
      return;
    }

    // (Reveal Tile) Timer Setup
    const timer = setInterval(() => {
      const newRevealedSeconds = revealState.type === "in-progress" ? revealState.revealedTiles + 1 : 1;

      // If all tiles have been revealed
      if (newRevealedSeconds > props.numTiles) {
        setRevealState({ type: "finished" });
        clearInterval(timer);
      } else {
        setRevealState({
          type: "in-progress",
          revealedTiles: newRevealedSeconds,
        });
      }
    }, props.revealIntervalSeconds * 1000);

    return () => clearInterval(timer);
  }, [props.numTiles, props.revealIntervalSeconds, revealState]);

  // (Guess) Timer Setup
  React.useEffect(() => {
    if (!props.timerConfig.isTimed) {
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
  function displayOutcome(): React.ReactNode {
    // Game still in progress, don't display anything
    if (inProgress) {
      return;
    }

    return (
      <MessageNotification type={guess === targetNumber.toString() ? "success" : "error"}>
        <strong>{guess === targetNumber.toString() ? "Correct!" : "Incorrect"}</strong>
        <br />
        <span>
          The answer was <strong>{targetNumber}</strong>
        </span>
        <br />
        {tiles.join(" ")}
      </MessageNotification>
    );
  }

  /** */
  function onBackspace() {
    if (guess.length === 0) {
      return;
    }

    setGuess(guess.substring(0, guess.length - 1));
  }

  /**
   *
   * @param number
   */
  function onSubmitNumber(number: number) {
    if (guess.length >= MAX_LENGTH) {
      return;
    }

    setGuess(`${guess}${number}`);
  }

  return (
    <div className="App numbers_arithmetic">
      <div className="outcome">{displayOutcome()}</div>
      {inProgress && (
        <div className="target">
          <LetterTile
            letter={revealState.type === "finished" ? "?" : tiles[revealState.revealedTiles]}
            status={revealState.type === "finished" ? "contains" : "not set"}
          ></LetterTile>
        </div>
      )}
      {revealState.type === "finished" && (
        <div className="guess">
          <LetterTile
            letter={guess}
            status={inProgress ? "not set" : guess === targetNumber.toString() ? "correct" : "incorrect"}
          ></LetterTile>
        </div>
      )}
      {revealState.type === "finished" && (
        <NumPad onEnter={() => setInProgress(false)} onBackspace={onBackspace} onSubmitNumber={onSubmitNumber} />
      )}
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

export default NumbersArithmetic;
