import React, { useState } from "react";
import { Page } from "../App";
import { MessageNotification } from "../MessageNotification";
import LetterTile from "../LetterTile";
import { randomIntFromInterval } from "../Nubble/Nubble";
import { NumPad } from "../NumPad";
import ProgressBar, { GreenToRedColorTransition } from "../ProgressBar";
import { Button } from "../Button";
import { operators } from "../CountdownNumbers/CountdownNumbersConfig";
import { Theme } from "../Themes";
import { SettingsData } from "../SaveData";
import GamemodeSettingsMenu from "../GamemodeSettingsMenu";

interface Props {
  revealIntervalSeconds: number;
  numTiles: number;
  numCheckpoints: number;
  difficulty: "easy" | "normal" | "hard";
  theme: Theme;
  settings: SettingsData;
  setPage: (page: Page) => void;
  onComplete?: (wasCorrect: boolean) => void;
}

/** */
const ArithmeticReveal: React.FC<Props> = (props) => {
  // Max number of characters permitted in a guess
  const MAX_LENGTH = 6;

  const [targetNumbers, setTargetNumbers] = useState<number[]>([]);
  const [revealState, setRevealState] = useState<{ type: "in-progress"; revealedTiles: number } | { type: "finished" }>(
    { type: "in-progress", revealedTiles: 0 }
  );
  const [currentCheckpoint, setCurrentCheckpoint] = useState(0);
  const [inProgress, setInProgress] = useState(true);
  const [guess, setGuess] = useState("");
  const [tiles, setTiles] = useState<string[][]>([]);
  const [targetTransitioned, setTargetTransitioned] = useState(false);

  // Gamemode settings
  const [isTimerEnabled, setIsTimerEnabled] = useState(true);
  const DEFAULT_TIMER_VALUE = 10;
  const [remainingSeconds, setRemainingSeconds] = useState(DEFAULT_TIMER_VALUE);
  const [totalSeconds, setTotalSeconds] = useState(DEFAULT_TIMER_VALUE);

  // Generate the elements to configure the gamemode settings
  const gamemodeSettings = generateSettings();

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

    const newTiles: string[][] = [];
    const newTargetNumbers: number[] = [];

    // Determine the starting number
    const starting_number = randomIntFromInterval(1, getStartingNumberLimit());

    for (let i = 0; i < props.numCheckpoints; i++) {
      // Use the randomly generated number or carry on from previous checkpoint target
      const checkpoint_starting_number = i === 0 ? starting_number : newTargetNumbers[i - 1];

      // Start a tiles array, starting with the number
      const checkpointTiles: string[] = [checkpoint_starting_number.toString()];

      // Keep a running target number
      let runningTotal = checkpoint_starting_number;

      // For each tile in the checkpoint
      for (let i = 0; i < props.numTiles; i++) {
        // Generate a new tile from the existing target number
        const { tile, newRunningTotal } = generateTile(runningTotal);

        // Add the tile string
        checkpointTiles.push(tile);

        // Update the running target number
        runningTotal = newRunningTotal;
      }

      // Push this checkpoint's tiles to larger array
      newTiles.push(checkpointTiles);

      // The running total now become the target number
      newTargetNumbers.push(runningTotal);

      console.log(
        `%cTarget Number:%c ${runningTotal}; %cTiles:%c ${checkpointTiles.join(", ")}`,
        "font-weight: bold",
        "font-weight: normal",
        "font-weight: bold",
        "font-weight: normal"
      );
    }

    setTiles(newTiles);
    setTargetNumbers(newTargetNumbers);

    function getOperatorLimit(operator: string) {
      switch (props.difficulty) {
        case "easy": {
          switch (operator) {
            case "÷":
            case "×": {
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
            case "÷":
            case "×": {
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
            case "÷":
            case "×": {
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
          case "÷": {
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
            } while (tile_number === undefined && fail_count < max_limit); // Stop once a tile number has been determined or after max_limit number of attempts to find a tile number
            break;
          }

          case "×": {
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
            tile: operator_symbol + tile_number.toString(),
            newRunningTotal: newTargetNumber,
          };
        }
      }

      throw new Error("Unexpected number");
    }
  }, [tiles, props.numTiles]);

  React.useEffect(() => {
    setInProgress(true);
    setRevealState({ type: "in-progress", revealedTiles: 0 });
    setGuess("");
    setRemainingSeconds(totalSeconds);
  }, [currentCheckpoint]);

  React.useEffect(() => {
    // If the game has finished
    if (revealState.type === "finished") {
      return;
    }

    // (Reveal Tile) Timer Setup
    const timer = setInterval(() => {
      const numRevealedTiles = revealState.type === "in-progress" ? revealState.revealedTiles + 1 : 1;

      // If all tiles have been revealed
      if (numRevealedTiles > props.numTiles) {
        setRevealState({ type: "finished" });
        clearInterval(timer);
      } else {
        setRevealState({
          type: "in-progress",
          revealedTiles: numRevealedTiles,
        });
        setTargetTransitioned(true);
      }
    }, props.revealIntervalSeconds * 1000);

    return () => clearInterval(timer);
  }, [props.numTiles, props.revealIntervalSeconds, revealState]);

  // (Guess) Timer Setup
  React.useEffect(() => {
    if (!isTimerEnabled || !inProgress) {
      return;
    }

    // Only start this timer once all the tiles have been revealed
    if (revealState.type !== "finished") {
      return;
    }

    const timerGuess = setInterval(() => {
      if (remainingSeconds > 0) {
        setRemainingSeconds(remainingSeconds - 1);
      } else {
        setInProgress(false);
        clearInterval(timerGuess);
      }
    }, 1000);

    return () => clearInterval(timerGuess);
  }, [setRemainingSeconds, remainingSeconds, isTimerEnabled, revealState, inProgress]);

  /**
   *
   * @returns
   */
  function displayOutcome(): React.ReactNode {
    // Game still in progress, don't display anything
    if (inProgress) {
      return;
    }

    // Guess is the correct end of checkpoint value
    const successCondition = guess === targetNumbers[currentCheckpoint].toString();
    // Last checkpoint
    const lastCheckpoint = currentCheckpoint === props.numCheckpoints - 1;

    let message_notification;

    // Current checkpoint guess correct and more checkpoints to go
    if (successCondition && !lastCheckpoint) {
      message_notification = (
        <>
          <MessageNotification type="success">
            <strong>Correct!</strong>
            <br></br>
            <span>{`${currentCheckpoint + 1} / ${props.numCheckpoints} checkpoints completed`}</span>
          </MessageNotification>

          <br></br>

          <Button
            mode="accept"
            onClick={() => setCurrentCheckpoint(currentCheckpoint + 1)}
            settings={props.settings}
            additionalProps={{ autoFocus: true }}
          >
            Next Checkpoint
          </Button>
        </>
      );
    }
    // Last checkpoint guess correct
    else if (successCondition && lastCheckpoint) {
      message_notification = (
        <>
          <MessageNotification type="success">
            <strong>Correct!</strong>
            <br></br>
            <span>{`Completed all ${props.numCheckpoints} checkpoints!`}</span>
          </MessageNotification>

          <br></br>

          <Button
            mode="accept"
            onClick={() => ResetGame()}
            settings={props.settings}
            additionalProps={{ autoFocus: true }}
          >
            Restart
          </Button>
        </>
      );
    }
    // Incorrect guess
    else if (!successCondition) {
      message_notification = (
        <>
          <MessageNotification type="error">
            <strong>Incorrect!</strong>
            <br />
            <span>
              The answer was <strong>{targetNumbers[currentCheckpoint]}</strong>
            </span>
            <br />
            {tiles[currentCheckpoint].join(" , ")}
          </MessageNotification>

          <br></br>

          <Button
            mode="accept"
            onClick={() => ResetGame()}
            settings={props.settings}
            additionalProps={{ autoFocus: true }}
          >
            Restart
          </Button>
        </>
      );
    }

    return <>{message_notification}</>;
  }

  function ResetGame() {
    props.onComplete?.(true);
    setInProgress(true);
    setGuess("");
    setCurrentCheckpoint(0);
    setRevealState({ type: "in-progress", revealedTiles: 0 });
    setTargetNumbers([]);
    setTiles([]);
    if (isTimerEnabled) {
      // Reset the timer if it is enabled in the game options
      setRemainingSeconds(totalSeconds);
    }
  }

  function onBackspace() {
    if (guess.length === 0) {
      return;
    }

    setGuess(guess.substring(0, guess.length - 1));
  }

  function onSubmitNumber(number: number) {
    if (guess.length >= MAX_LENGTH) {
      return;
    }

    setGuess(`${guess}${number}`);
  }

  React.useEffect(() => {
    setTargetTransitioned(false);
  }, [targetTransitioned]);

  function generateSettings(): React.ReactNode {
    let settings;

    settings = (
      <>
        {/* TODO: QOL: Configure speed, difficulty, number of checkpoints */}
        <label>
          <input type="number" value={3} min={1} max={10} onChange={(e) => {}}></input>
          Number of Checkpoints
        </label>
        <>
          <label>
            <input
              checked={isTimerEnabled}
              type="checkbox"
              onChange={(e) => {
                setIsTimerEnabled(!isTimerEnabled);
              }}
            ></input>
            Timer
          </label>
          {isTimerEnabled && (
            <label>
              <input
                type="number"
                value={totalSeconds}
                min={10}
                max={120}
                step={5}
                onChange={(e) => {
                  setRemainingSeconds(e.target.valueAsNumber);
                  setTotalSeconds(e.target.valueAsNumber);
                }}
              ></input>
              Seconds
            </label>
          )}
        </>
      </>
    );

    return settings;
  }

  return (
    <div
      className="App numbers_arithmetic"
      style={{ backgroundImage: `url(${props.theme.backgroundImageSrc})`, backgroundSize: "100%" }}
    >
      <div className="gamemodeSettings">
        <GamemodeSettingsMenu>{gamemodeSettings}</GamemodeSettingsMenu>
      </div>
      <div className="outcome">{displayOutcome()}</div>
      {inProgress && (
        <div className="target">
          <LetterTile
            letter={revealState.type === "finished" ? "?" : tiles[currentCheckpoint]?.[revealState.revealedTiles]}
            status={revealState.type === "finished" || targetTransitioned ? "contains" : "not set"}
            settings={props.settings}
          ></LetterTile>
        </div>
      )}
      {revealState.type === "finished" && (
        <div className="guess">
          <LetterTile
            letter={guess}
            status={
              inProgress ? "not set" : guess === targetNumbers[currentCheckpoint].toString() ? "correct" : "incorrect"
            }
            settings={props.settings}
          ></LetterTile>
        </div>
      )}
      {revealState.type === "finished" && (
        <NumPad
          onEnter={() => setInProgress(false)}
          onBackspace={onBackspace}
          onSubmitNumber={onSubmitNumber}
          settings={props.settings}
          disabled={!inProgress}
          showKeyboard={props.settings.gameplay.keyboard}
        />
      )}
      {revealState.type === "finished" && (
        <div>
          {isTimerEnabled && (
            <ProgressBar
              progress={remainingSeconds}
              total={totalSeconds}
              display={{ type: "transition", colorTransition: GreenToRedColorTransition }}
            ></ProgressBar>
          )}
        </div>
      )}
    </div>
  );
};

export default ArithmeticReveal;
