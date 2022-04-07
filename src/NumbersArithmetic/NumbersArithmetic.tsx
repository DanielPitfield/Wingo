import React, { useState } from "react";
import "../App.scss";
import { Page } from "../App";
import { MessageNotification } from "../MessageNotification";
import LetterTile from "../LetterTile";
import { operators } from "../Nubble/getValidValues";
import { randomIntFromInterval } from "../Nubble/Nubble";
import { NumPad } from "../NumPad";

interface Props {
  revealIntervalSeconds: number;
  numTiles: number;
  difficulty: "easy" | "normal" | "hard";
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
  const [guess, setGuess] = useState("");
  const [tiles, setTiles] = useState<string[]>([]);

  React.useEffect(() => {
    // If all tiles have been initialised
    if (tiles.length > 0) {
      return;
    }

    // Determine the starting number
    const starting_number = randomIntFromInterval(1, 1000);

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

    /**
     * Generates a new valid tile from the existing running total (so that the generated tile does not result in a decimal).
     * @param targetNumber Existing running total.
     * @returns New running total and a tile.
     */
    function generateTile(targetNumber: number): { tile: string; newRunningTotal: number } {
      // One of the four operators
      let tile_operator = operators[Math.floor(Math.random() * (operators.length - 1))];

      // String symbol of the operator
      let operator_symbol = tile_operator.name;

      let tile_number: number | undefined = undefined;

      switch (operator_symbol) {
        case "/": {
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
            const operators_division_removed = operators.filter((operator) => operator.name !== "/");

            // One of three operators
            tile_operator =
              operators_division_removed[Math.floor(Math.random() * (operators_division_removed.length - 1))];

            // String symbol of the operator
            operator_symbol = tile_operator.name;

            // TODO: Fix
            tile_number = randomIntFromInterval(1, 50);
          }
          break;
        }

        case "*": {
          // Smaller range for multiplication
          tile_number = randomIntFromInterval(2, 10);
          break;
        }

        case "+":
        case "-": {
          // Larger range for addition and subtraction
          tile_number = randomIntFromInterval(1, 50);
          break;
        }
      }

      if (tile_number !== undefined) {
        // Apply operation shown on current tile and update target number
        const newTargetNumber = tile_operator.function(targetNumber, tile_number);

        // String of the combination of operator and value
        return { tile: operator_symbol + tile_number.toString(), newRunningTotal: newTargetNumber };
      }

      throw new Error("Error generating tile");
    }
  }, [tiles, props.numTiles]);

  React.useEffect(() => {
    // If the game has finished
    if (revealState.type === "finished") {
      return;
    }

    // Timer Setup
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
    </div>
  );
};

export default NumbersArithmetic;
