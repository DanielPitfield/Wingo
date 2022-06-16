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
import { numberSizeOption, numberSizeOptions } from "./ArithmeticDrag";

interface Props {
  isCampaignLevel: boolean;

  gamemodeSettings?: {
    /* TODO: Difficulty presets
    All these settings control the difficulty for this mode

    Maybe offer difficulty dropdown/select with Easy, Normal, Hard presets 
    (i.e predetermined configurations of these settings)

    But then also offer a Custom option, where the user can fine tune these settings themselves
    (when the Custom option is selected, the inputs for the settings appear)
    */

    timer?: { isTimed: true; seconds: number } | { isTimed: false };
    numCheckpoints?: number;
    // How many tiles appear EACH checkpoint?
    numTiles?: number;
    // How big/difficult are the numbers used in these expressions?
    numberSize?: numberSizeOption;
    // The time between tiles appearing
    revealIntervalSeconds: number;
  };

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

  // Timer enabled by default, unless otherwise stated
  const [isTimerEnabled, setIsTimerEnabled] = useState(props.gamemodeSettings?.timer?.isTimed ?? true);
  const DEFAULT_TIMER_VALUE = 10;
  const [remainingSeconds, setRemainingSeconds] = useState(
    props.gamemodeSettings?.timer?.isTimed === true ? props.gamemodeSettings?.timer.seconds : DEFAULT_TIMER_VALUE
  );
  const [totalSeconds, setTotalSeconds] = useState(
    props.gamemodeSettings?.timer?.isTimed === true ? props.gamemodeSettings?.timer.seconds : DEFAULT_TIMER_VALUE
  );

  const DEFAULT_NUM_CHECKPOINTS = 1;
  const [numCheckpoints, setNumCheckpoints] = useState(
    props.gamemodeSettings?.numCheckpoints ?? DEFAULT_NUM_CHECKPOINTS
  );

  const DEFAULT_NUM_TILES = 5;
  const [numTiles, setNumTiles] = useState(props.gamemodeSettings?.numTiles ?? DEFAULT_NUM_TILES);

  const DEFAULT_NUMBERSIZE = "medium";
  const [numberSize, setNumberSize] = useState<"small" | "medium" | "large">(
    props.gamemodeSettings?.numberSize ?? DEFAULT_NUMBERSIZE
  );

  const DEFAULT_REVEAL_INTERVAL = 3;
  /* TODO: Sync Flip animation with reveal animation
  The CSS to apply the flip tile animation assumes the reveal interval is always 3 seconds
  Perhaps use animationDelay to control when the animation happens
  */

  const [revealIntervalSeconds, setRevealIntervalSeconds] = useState(
    props.gamemodeSettings?.revealIntervalSeconds ?? DEFAULT_REVEAL_INTERVAL
  );

  // What is the maximum starting number which should be used (based on difficulty)?
  function getStartingNumberLimit(): number {
    switch (numberSize) {
      case "small": {
        return 100;
      }
      case "medium": {
        return 250;
      }
      case "large": {
        return 1000;
      }
    }
  }

  // What is the maximum number which should be used with the given operator (based on difficulty)?
  function getOperandLimit(operator: string) {
    switch (numberSize) {
      case "small": {
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
      case "medium": {
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
      case "large": {
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
            const random_divisor = randomIntFromInterval(2, getOperandLimit(operator_symbol)!);
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
          tile_number = randomIntFromInterval(2, getOperandLimit(operator_symbol)!);
          break;
        }

        case "+": {
          tile_number = randomIntFromInterval(1, getOperandLimit(operator_symbol)!);
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
          else if (targetNumber < getOperandLimit(operator_symbol)!) {
            // Only subtract a random value which is smaller than targetNumber
            tile_number = randomIntFromInterval(1, targetNumber - 1);
          } else {
            // Proceed as normal
            tile_number = randomIntFromInterval(1, getOperandLimit(operator_symbol)!);
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

  // Generate (all/numTiles number) of tiles
  function generateAllTiles() {
    // Array of arrays of tile display values (e.g +89) for each checkpoint
    const newTiles: string[][] = [];
    // Target number after each checkpoint
    const newTargetNumbers: number[] = [];

    for (let i = 0; i < numCheckpoints; i++) {
      // Use/carry on from previous checkpoint target (unless first checkpoint which uses a random number)
      const checkpointStartingNumber = newTargetNumbers[i - 1] ?? randomIntFromInterval(1, getStartingNumberLimit());

      // Start a tiles array, starting with the number
      const checkpointTiles: string[] = [checkpointStartingNumber.toString()];

      // Keep a running target number
      let runningTotal = checkpointStartingNumber;

      // For each tile in the checkpoint
      for (let i = 0; i < numTiles; i++) {
        // Generate a new tile from the existing target number
        const { tile, newRunningTotal } = generateTile(runningTotal);

        // Add the tile string (display value) to array for this checkpoint
        checkpointTiles.push(tile);

        // Update the running target number
        runningTotal = newRunningTotal;
      }

      // Push this checkpoint's tiles to larger array
      newTiles.push(checkpointTiles);

      // The running total now becomes the target number
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
  }

  // TODO: Handling mid-game changes - apply this to other modes

  // Any of the game mode settings are changed then reset the game
  React.useEffect(() => {
    ResetGame();
  }, [isTimerEnabled, totalSeconds, numTiles, numberSize, numCheckpoints, revealIntervalSeconds]);
  // TODO: Probably best these settings are part of a single object

  React.useEffect(() => {
    // If all tiles have been initialised
    if (tiles.length > 0) {
      return;
    }

    generateAllTiles();
  }, [tiles, numTiles]);

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
      if (numRevealedTiles > numTiles) {
        setRevealState({ type: "finished" });
        clearInterval(timer);
      } else {
        setRevealState({
          type: "in-progress",
          revealedTiles: numRevealedTiles,
        });
        setTargetTransitioned(true);
      }
    }, revealIntervalSeconds * 1000);

    return () => clearInterval(timer);
  }, [numTiles, revealIntervalSeconds, revealState]);

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
    const lastCheckpoint = currentCheckpoint === numCheckpoints - 1;

    let message_notification;

    // Current checkpoint guess correct and more checkpoints to go
    if (successCondition && !lastCheckpoint) {
      message_notification = (
        <>
          <MessageNotification type="success">
            <strong>Correct!</strong>
            <br></br>
            <span>{`${currentCheckpoint + 1} / ${numCheckpoints} checkpoints completed`}</span>
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
            <span>{`Completed all ${numCheckpoints} checkpoints!`}</span>
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
    if (isTimerEnabled) {
      // Reset the timer if it is enabled in the game options
      setRemainingSeconds(totalSeconds);
    }
    generateAllTiles();
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

  function generateSettingsOptions(): React.ReactNode {
    const MIN_NUM_TILES = 2;
    const MAX_NUM_TILES = 10;

    const MIN_NUM_CHECKPOINTS = 1;
    const MAX_NUM_CHECKPOINTS = 10;

    const MIN_REVEAL_INTERVAL = 1;
    const MAX_REVEAL_INTERVAL = 5;

    // TODO: Why declare undefined variable, why not just return JSX below?
    let settings;

    settings = (
      <>
        <label>
          <input
            type="number"
            value={numTiles}
            min={MIN_NUM_TILES}
            max={MAX_NUM_TILES}
            onChange={(e) => {
              setNumTiles(e.target.valueAsNumber);
            }}
          ></input>
          Number of tiles
        </label>
        <label>
          <input
            type="number"
            value={numCheckpoints}
            min={MIN_NUM_CHECKPOINTS}
            max={MAX_NUM_CHECKPOINTS}
            onChange={(e) => {
              setNumCheckpoints(e.target.valueAsNumber);
            }}
          ></input>
          Number of checkpoints
        </label>
        <label>
          <select
            onChange={(e) => {
              setNumberSize(e.target.value as numberSizeOption);
            }}
            className="numberSize_input"
            name="numberSize"
            value={numberSize}
          >
            {numberSizeOptions.map((sizeOption) => (
              <option key={sizeOption} value={sizeOption}>
                {sizeOption}
              </option>
            ))}
          </select>
          Number size
        </label>
        <label>
          <input
            type="number"
            value={revealIntervalSeconds}
            min={MIN_REVEAL_INTERVAL}
            max={MAX_REVEAL_INTERVAL}
            onChange={(e) => {
              setRevealIntervalSeconds(e.target.valueAsNumber);
            }}
          ></input>
          Reveal interval
        </label>
        <>
          <label>
            <input
              checked={isTimerEnabled}
              type="checkbox"
              onChange={() => {
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
      {!props.isCampaignLevel && (
        <div className="gamemodeSettings">
          <GamemodeSettingsMenu>{generateSettingsOptions()}</GamemodeSettingsMenu>
        </div>
      )}
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
