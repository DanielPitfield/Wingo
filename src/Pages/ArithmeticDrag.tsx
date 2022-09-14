import React, { useState } from "react";
import { arrayMove, OrderGroup } from "react-draggable-order";
import { PageName } from "../PageNames";
import { Button } from "../Components/Button";
import { operators, operatorSymbols } from "./NumbersGameConfig";
import GamemodeSettingsMenu from "../Components/GamemodeSettingsMenu";
import LetterTile from "../Components/LetterTile";
import { MessageNotification } from "../Components/MessageNotification";
import { randomIntFromInterval } from "./Numble";
import ProgressBar, { GreenToRedColorTransition } from "../Components/ProgressBar";
import { SaveData, SettingsData } from "../Data/SaveData";
import { Theme } from "../Data/Themes";
import { pickRandomElementFrom } from "./WingoConfig";
import { DraggableItem } from "../Components/DraggableItem";
import { LEVEL_FINISHING_TEXT } from "../Components/Level";
import { getGamemodeDefaultTimerValue } from "../Data/DefaultTimerValues";
import { shuffleArray } from "../Data/shuffleArray";

// Const Contexts: https://stackoverflow.com/questions/44497388/typescript-array-to-string-literal-type
export const arithmeticNumberSizes = ["small", "medium", "large"] as const;
export type arithmeticNumberSize = typeof arithmeticNumberSizes[number];

const arithmeticModes = ["order", "match"] as const;
export type arithmeticMode = typeof arithmeticModes[number];

export interface ArithmeticDragProps {
  campaignConfig:
    | {
        isCampaignLevel: true;
        // How many expressions must be ordered/matched correctly to pass the campaign level?
        targetScore: number;
      }
    | { isCampaignLevel: false };

  mode: arithmeticMode;

  gamemodeSettings: {
    /* TODO: Difficulty presets
    All these settings control the difficulty for this mode

    Maybe offer difficulty dropdown/select with Easy, Normal, Hard presets 
    (i.e predetermined configurations of these settings)

    But then also offer a Custom option, where the user can fine tune these settings themselves
    (when the Custom option is selected, the inputs for the settings appear)
    */

    // How many expressions (to match or order)?
    numTiles: number;
    // How big/difficult are the numbers used in these expressions?
    numberSize: arithmeticNumberSize;
    // How many operands/numbers in these expressions?
    numOperands: number;
    // How many times can you check your attempts?
    numGuesses: number;
    timerConfig: { isTimed: true; seconds: number } | { isTimed: false };
  };
}

interface Props extends ArithmeticDragProps {
  page: PageName;
  theme: Theme;
  settings: SettingsData;
  setPage: (page: PageName) => void;
  setTheme: (theme: Theme) => void;
  addGold: (gold: number) => void;
  onComplete: (wasCorrect: boolean) => void;
}

/** */
const ArithmeticDrag = (props: Props) => {
  const [inProgress, setInProgress] = useState(true);
  const [expressionTiles, setExpressionTiles] = useState<
    { expression: string; total: number; status: "incorrect" | "correct" | "not set" }[]
  >([]);
  // For the match game mode type
  const [resultTiles, setResultTiles] = useState<{ total: number; status: "incorrect" | "correct" | "not set" }[]>([]);

  const [gamemodeSettings, setGamemodeSettings] = useState<ArithmeticDragProps["gamemodeSettings"]>(
    props.gamemodeSettings
  );

  const [remainingGuesses, setRemainingGuesses] = useState(gamemodeSettings.numGuesses);

  const [remainingSeconds, setRemainingSeconds] = useState(
    props.gamemodeSettings?.timerConfig?.isTimed === true
      ? props.gamemodeSettings?.timerConfig.seconds
      : getGamemodeDefaultTimerValue(props.page)
  );

  const [mostRecentTotalSeconds, setMostRecentTotalSeconds] = useState(
    props.gamemodeSettings?.timerConfig?.isTimed === true
      ? props.gamemodeSettings?.timerConfig.seconds
      : getGamemodeDefaultTimerValue(props.page)
  );

  // What is the maximum starting number which should be used (based on difficulty)?
  function getStartingNumberLimit(): number {
    switch (gamemodeSettings.numberSize) {
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
    switch (gamemodeSettings.numberSize) {
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

  // How many operator symbols are there in the given expression string?
  function countOperators(expression: string): number {
    const expressionSymbols = expression.split("");
    return expressionSymbols.filter((character) => operatorSymbols.includes(character)).length;
  }

  /**
   * Generates a new valid tile
   * @returns Object of tile information (display string and evaluation result)
   */
  function generateTile(): { expression: string; total: number; status: "not set" } {
    // First number of the tile expression
    const startingNumber = randomIntFromInterval(1, getStartingNumberLimit());

    // Begin the expression and total as this value (as string and as number)
    let expression = startingNumber.toString();
    let total = startingNumber;

    // Always one less operator than the number of operands in an expression
    const numOperators = gamemodeSettings.numOperands - 1;

    // Until expression has the required number of operators (is correct length)
    while (countOperators(expression) < numOperators) {
      // Choose one of the four operators
      let operator = pickRandomElementFrom(operators);
      let operatorSymbol = operator.name;
      let operand: number | undefined = undefined;

      switch (operatorSymbol) {
        case "÷": {
          // Number of attempts to find a clean divisor
          const maxLimit = 10;

          let failCount = 0;

          // Loop max_limit times in the attempt of finding a clean divisor
          do {
            const randomDivisor = randomIntFromInterval(2, getOperandLimit(operatorSymbol)!);
            // Clean division (result would be integer)
            if (total % randomDivisor === 0 && total > 0) {
              // Use that divisor as tile number
              operand = randomDivisor;
            } else {
              failCount += 1;
            }
          } while (operand === undefined && failCount < maxLimit); // Stop once an operand has been determined or after max_limit number of attempts to find an operator
          break;
        }

        case "×": {
          // Lower threshold of 2 (no point multiplying by 1)
          operand = randomIntFromInterval(2, getOperandLimit(operatorSymbol)!);
          break;
        }

        case "+": {
          operand = randomIntFromInterval(1, getOperandLimit(operatorSymbol)!);
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
          else if (total < getOperandLimit(operatorSymbol)!) {
            // Only subtract a random value which is smaller than targetNumber
            operand = randomIntFromInterval(1, total - 1);
          } else {
            // Proceed as normal
            operand = randomIntFromInterval(1, getOperandLimit(operatorSymbol)!);
          }
        }
      }

      // An operator and operand were determined in this iteration
      if (operand !== undefined) {
        // Add both to expression string
        expression = expression + operatorSymbol + operand.toString();

        // Insert closing bracket after operand following the first operator (when there are 3 operands)
        if (countOperators(expression) === 1 && gamemodeSettings.numOperands === 3) {
          expression = expression + ")";
        }

        // Calculate the new total
        total = operator.function(total, operand);
      }
    }

    // Insert starting bracket with three operands
    if (gamemodeSettings.numOperands === 3) {
      expression = "(" + expression;
    }

    // Once expression is desired length, return
    return { expression: expression, total: total, status: "not set" };
  }

  // Generate (all/numTiles number) of tiles
  function generateAllTiles() {
    const newExpressionTiles: { expression: string; total: number; status: "not set" }[] = Array.from({
      length: gamemodeSettings.numTiles,
    }).map((x) => generateTile());

    setExpressionTiles(newExpressionTiles);

    // Result tiles (only needed in match mode)
    if (props.mode === "match") {
      // Tiles displaying the expression totals, shuffled and all given the 'not set' status
      const newResultTiles: { total: number; status: "not set" }[] = shuffleArray(
        newExpressionTiles.map((x) => x.total)
      ).map((total) => ({ total: total, status: "not set" }));

      setResultTiles(newResultTiles);
    }
  }

  // Reset game after change of settings (stops cheating by changing settings partway through a game)
  React.useEffect(() => {
    if (props.campaignConfig.isCampaignLevel) {
      return;
    }

    ResetGame();

    // Save the latest gamemode settings for this mode
    SaveData.setArithmeticDragGamemodeSettings(props.page, gamemodeSettings);
  }, [gamemodeSettings]);

  // Create the tiles to be revealed (only once on start)
  React.useEffect(() => {
    // If all tiles have been initialised already
    if (expressionTiles.length > 0) {
      return;
    }

    generateAllTiles();
  }, [expressionTiles, resultTiles]);

  // (Guess) Timer Setup
  React.useEffect(() => {
    if (!gamemodeSettings.timerConfig.isTimed || !inProgress) {
      return;
    }

    const timerGuess = setInterval(() => {
      if (remainingSeconds > 0) {
        setRemainingSeconds(remainingSeconds - 1);
      } else {
        setInProgress(false);
      }
    }, 1000);
    return () => {
      clearInterval(timerGuess);
    };
  }, [setRemainingSeconds, remainingSeconds, gamemodeSettings.timerConfig.isTimed]);

  /**
   * LetterTile Debug: letter={`R: ${tile.total}`}
   * @returns
   */
  function displayTiles() {
    let Grid = [];

    Grid.push(
      <div className="draggable_expressions">
        <OrderGroup mode={"between"}>
          {expressionTiles.map((tile, index) => (
            <DraggableItem
              key={index}
              index={index}
              onMove={(toIndex) => {
                if (inProgress) {
                  // The new order after the drag + all statuses reset
                  const newExpressionTiles = arrayMove(expressionTiles, index, toIndex).map((tile) => {
                    tile.status = "not set";
                    return tile;
                  });
                  setExpressionTiles(newExpressionTiles);

                  // Just statuses reset
                  setResultTiles(
                    resultTiles.map((tile) => {
                      tile.status = "not set";
                      return tile;
                    })
                  );
                }
              }}
            >
              <LetterTile letter={tile.expression} status={tile.status} settings={props.settings} />
            </DraggableItem>
          ))}
        </OrderGroup>
      </div>
    );

    if (props.mode === "match" && resultTiles.length > 0) {
      Grid.push(
        <div className="draggable_results">
          <OrderGroup mode={"between"}>
            {resultTiles.map((tile, index) => (
              <DraggableItem
                key={index}
                index={index}
                onMove={(toIndex) => {
                  if (inProgress) {
                    // The new order after the drag + all statuses reset
                    const newResultTiles = arrayMove(resultTiles, index, toIndex).map((tile) => {
                      tile.status = "not set";
                      return tile;
                    });
                    setResultTiles(newResultTiles);

                    // Just statuses reset
                    setExpressionTiles(
                      expressionTiles.map((tile) => {
                        tile.status = "not set";
                        return tile;
                      })
                    );
                  }
                }}
              >
                <LetterTile letter={tile.total.toString()} status={tile.status} settings={props.settings} />
              </DraggableItem>
            ))}
          </OrderGroup>
        </div>
      );
    }

    return Grid;
  }

  function checkTiles() {
    const tileTotals = expressionTiles.map((x) => x.total);

    let newExpressionTiles = expressionTiles.slice();
    let newResultTiles = resultTiles.slice();

    // Smallest to largest
    if (props.mode === "order") {
      // Sort the tile totals into ascending order
      const sortedTotals = tileTotals.sort((x, y) => {
        return x - y;
      });

      newExpressionTiles = expressionTiles.map((x, index) => {
        // Tile is in correct position
        if (expressionTiles[index].total === sortedTotals[index]) {
          // Change status to correct
          x.status = "correct";
        } else {
          x.status = "incorrect";
        }
        return x;
      });
    }
    // Match expression with result
    else if (props.mode === "match") {
      newExpressionTiles = expressionTiles.map((x, index) => {
        // Expression matched with correct result
        if (expressionTiles[index].total === resultTiles[index].total) {
          // Change status to correct
          x.status = "correct";
        } else {
          x.status = "incorrect";
        }
        return x;
      });
      // Also update status of result tiles
      newResultTiles = resultTiles.map((x, index) => {
        if (expressionTiles[index].total === resultTiles[index].total) {
          x.status = "correct";
        } else {
          x.status = "incorrect";
        }
        return x;
      });
    }

    // Set so that the change in statuses are rendered
    setExpressionTiles(newExpressionTiles);
    setResultTiles(newResultTiles);

    // Are all the tiles in the correct position?
    const allCorrect = newExpressionTiles.filter((x) => x.status === "correct").length === expressionTiles.length;

    // Or on last remaining guess
    if (allCorrect || remainingGuesses <= 1) {
      // Game over
      setInProgress(false);
    } else {
      // Otherwise, decrease number of guesses left
      setRemainingGuesses(remainingGuesses - 1);
    }
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

    const numCorrectTiles = expressionTiles.filter((x) => x.status === "correct").length;

    return (
      <>
        <MessageNotification type={numCorrectTiles === expressionTiles.length ? "success" : "error"}>
          <strong>
            {numCorrectTiles === expressionTiles.length
              ? "All tiles in the correct order!"
              : `${numCorrectTiles} tiles correct`}
          </strong>
        </MessageNotification>

        <br />

        <Button mode="accept" settings={props.settings} onClick={() => ResetGame()}>
          {props.campaignConfig.isCampaignLevel ? LEVEL_FINISHING_TEXT : "Restart"}
        </Button>
      </>
    );
  }

  function ResetGame() {
    if (!inProgress) {
      const numCorrectTiles = expressionTiles.filter((x) => x.status === "correct").length;
      // Achieved target score if a campaign level, otherwise just all answers were correct
      const wasCorrect = props.campaignConfig.isCampaignLevel
        ? numCorrectTiles >= Math.min(props.campaignConfig.targetScore, expressionTiles.length)
        : numCorrectTiles === expressionTiles.length;
      props.onComplete(wasCorrect);
    }

    setInProgress(true);
    setRemainingGuesses(gamemodeSettings.numGuesses);
    if (gamemodeSettings.timerConfig.isTimed) {
      // Reset the timer if it is enabled in the game options
      setRemainingSeconds(gamemodeSettings.timerConfig.seconds);
    }
    generateAllTiles();
  }

  function generateSettingsOptions(): React.ReactNode {
    const MIN_NUM_TILES = 2;
    const MAX_NUM_TILES = 10;

    const MIN_NUM_OPERANDS = 2;
    const MAX_NUM_OPERANDS = 3;

    return (
      <>
        <label>
          <input
            type="number"
            value={gamemodeSettings.numTiles}
            min={MIN_NUM_TILES}
            max={MAX_NUM_TILES}
            onChange={(e) => {
              const newGamemodeSettings = {
                ...gamemodeSettings,
                numTiles: e.target.valueAsNumber,
              };
              setGamemodeSettings(newGamemodeSettings);
            }}
          ></input>
          Number of expressions
        </label>
        <label>
          <input
            type="number"
            value={gamemodeSettings.numOperands}
            min={MIN_NUM_OPERANDS}
            max={MAX_NUM_OPERANDS}
            onChange={(e) => {
              const newGamemodeSettings = {
                ...gamemodeSettings,
                numOperands: e.target.valueAsNumber,
              };
              setGamemodeSettings(newGamemodeSettings);
            }}
          ></input>
          Number of operands
        </label>
        <label>
          <select
            onChange={(e) => {
              const newGamemodeSettings = {
                ...gamemodeSettings,
                numberSize: e.target.value as arithmeticNumberSize,
              };
              setGamemodeSettings(newGamemodeSettings);
            }}
            className="numberSize_input"
            name="numberSize"
            value={gamemodeSettings.numberSize}
          >
            {arithmeticNumberSizes.map((sizeOption) => (
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
            value={gamemodeSettings.numGuesses}
            min={1}
            max={10}
            onChange={(e) => {
              setRemainingGuesses(e.target.valueAsNumber);
              const newGamemodeSettings = {
                ...gamemodeSettings,
                numGuesses: e.target.valueAsNumber,
              };
              setGamemodeSettings(newGamemodeSettings);
            }}
          ></input>
          Number of guesses
        </label>
        <>
          <label>
            <input
              checked={gamemodeSettings.timerConfig.isTimed}
              type="checkbox"
              onChange={() => {
                // If currently timed, on change, make the game not timed and vice versa
                const newTimer: { isTimed: true; seconds: number } | { isTimed: false } = gamemodeSettings.timerConfig
                  .isTimed
                  ? { isTimed: false }
                  : { isTimed: true, seconds: mostRecentTotalSeconds };
                const newGamemodeSettings = { ...gamemodeSettings, timerConfig: newTimer };
                setGamemodeSettings(newGamemodeSettings);
              }}
            ></input>
            Timer
          </label>
          {gamemodeSettings.timerConfig.isTimed && (
            <label>
              <input
                type="number"
                value={gamemodeSettings.timerConfig.seconds}
                min={10}
                max={120}
                step={5}
                onChange={(e) => {
                  setRemainingSeconds(e.target.valueAsNumber);
                  setMostRecentTotalSeconds(e.target.valueAsNumber);
                  const newGamemodeSettings = {
                    ...gamemodeSettings,
                    timerConfig: { isTimed: true, seconds: e.target.valueAsNumber },
                  };
                  setGamemodeSettings(newGamemodeSettings);
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
    <div
      className="App numbers_arithmetic"
      style={{ backgroundImage: `url(${props.theme.backgroundImageSrc})`, backgroundSize: "100% 100%" }}
    >
      {!props.campaignConfig.isCampaignLevel && (
        <div className="gamemodeSettings">
          <GamemodeSettingsMenu>{generateSettingsOptions()}</GamemodeSettingsMenu>
        </div>
      )}

      <div className="outcome">{displayOutcome()}</div>
      {inProgress && <MessageNotification type="default">{`Guesses left: ${remainingGuesses}`}</MessageNotification>}
      <div className="tile_row">{displayTiles()}</div>
      {inProgress && (
        <Button
          mode={remainingGuesses <= 1 ? "accept" : "default"}
          settings={props.settings}
          onClick={() => checkTiles()}
        >
          Submit guess
        </Button>
      )}
      <div>
        {gamemodeSettings.timerConfig.isTimed && (
          <ProgressBar
            progress={remainingSeconds}
            total={gamemodeSettings.timerConfig.seconds}
            display={{ type: "transition", colorTransition: GreenToRedColorTransition }}
          ></ProgressBar>
        )}
      </div>
    </div>
  );
};

export default ArithmeticDrag;
