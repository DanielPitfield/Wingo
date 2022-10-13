import React, { useState } from "react";
import { PagePath } from "../Data/PageNames";
import { Button } from "../Components/Button";
import LetterTile from "../Components/LetterTile";
import { MessageNotification } from "../Components/MessageNotification";
import ProgressBar, { GreenToRedColorTransition } from "../Components/ProgressBar";
import { Theme } from "../Data/Themes";
import { DraggableItem } from "../Components/DraggableItem";
import { LEVEL_FINISHING_TEXT } from "../Components/Level";
import { shuffleArray } from "../Helpers/shuffleArray";
import { operatorSymbols, operators } from "../Data/Operators";
import { getGamemodeDefaultTimerValue } from "../Helpers/getGamemodeDefaultTimerValue";
import { getRandomElementFrom } from "../Helpers/getRandomElementFrom";
import { getRandomIntFromRange } from "../Helpers/getRandomIntFromRange";
import { getNewGamemodeSettingValue } from "../Helpers/getGamemodeSettingsNewValue";
import ArithmeticDragGamemodeSettings from "../Components/GamemodeSettingsOptions/ArithmeticDragGamemodeSettings";
import { useLocation } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { SettingsData } from "../Data/SaveData/Settings";
import { setMostRecentArithmeticDragGamemodeSettings } from "../Data/SaveData/MostRecentGamemodeSettings";

// Const Contexts: https://stackoverflow.com/questions/44497388/typescript-array-to-string-literal-type
export const arithmeticNumberSizes = ["small", "medium", "large"] as const;
export type arithmeticNumberSize = typeof arithmeticNumberSizes[number];

const arithmeticModes = ["order", "match"] as const;
export type arithmeticMode = typeof arithmeticModes[number];

type ExpressionTile = {
  id: number;
  expression: string;
  total: number;
  status: "incorrect" | "correct" | "not set";
};

type ResultTile = { id: number; total: number; status: "incorrect" | "correct" | "not set" };

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
  theme: Theme;
  settings: SettingsData;
  setTheme: (theme: Theme) => void;
  addGold: (gold: number) => void;
  onComplete: (wasCorrect: boolean) => void;
}

const ArithmeticDrag = (props: Props) => {
  const location = useLocation().pathname as PagePath;

  // dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [inProgress, setInProgress] = useState(true);

  const [parent] = useAutoAnimate<HTMLDivElement>();

  const [expressionTiles, setExpressionTiles] = useState<ExpressionTile[]>([]);
  // For the match game mode type
  const [resultTiles, setResultTiles] = useState<ResultTile[]>([]);

  const [gamemodeSettings, setGamemodeSettings] = useState<ArithmeticDragProps["gamemodeSettings"]>(
    props.gamemodeSettings
  );

  const [remainingGuesses, setRemainingGuesses] = useState(gamemodeSettings.numGuesses);

  const [remainingSeconds, setRemainingSeconds] = useState(
    props.gamemodeSettings?.timerConfig?.isTimed === true
      ? props.gamemodeSettings?.timerConfig?.seconds
      : getGamemodeDefaultTimerValue(location)
  );

  const [mostRecentTotalSeconds, setMostRecentTotalSeconds] = useState(
    props.gamemodeSettings?.timerConfig?.isTimed === true
      ? props.gamemodeSettings?.timerConfig?.seconds
      : getGamemodeDefaultTimerValue(location)
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
  const countOperators = (expression: string): number => {
    const expressionSymbols = expression.split("");
    return expressionSymbols.filter((character) => operatorSymbols.includes(character)).length;
  };

  /**
   * Generates a new valid tile
   * @returns Object of tile information (display string and evaluation result)
   */
  function generateTile(id: number): ExpressionTile {
    // First number of the tile expression
    const startingNumber = getRandomIntFromRange(1, getStartingNumberLimit());

    // Begin the expression and total as this value (as string and as number)
    let expression = startingNumber.toString();
    let total = startingNumber;

    // Always one less operator than the number of operands in an expression
    const numOperators = gamemodeSettings.numOperands - 1;

    // Until expression has the required number of operators (is correct length)
    while (countOperators(expression) < numOperators) {
      // Choose one of the four operators
      let operator = getRandomElementFrom(operators);
      let operatorSymbol = operator.name;
      let operand: number | undefined = undefined;

      switch (operatorSymbol) {
        case "÷": {
          // Number of attempts to find a clean divisor
          const maxLimit = 10;

          let failCount = 0;

          // Loop max_limit times in the attempt of finding a clean divisor
          do {
            const randomDivisor = getRandomIntFromRange(2, getOperandLimit(operatorSymbol)!);
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
          operand = getRandomIntFromRange(2, getOperandLimit(operatorSymbol)!);
          break;
        }

        case "+": {
          operand = getRandomIntFromRange(1, getOperandLimit(operatorSymbol)!);
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
            operand = getRandomIntFromRange(1, total - 1);
          } else {
            // Proceed as normal
            operand = getRandomIntFromRange(1, getOperandLimit(operatorSymbol)!);
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
    return { id: id, expression: expression, total: total, status: "not set" };
  }

  // Generate (all/numTiles number) of tiles
  function generateAllTiles() {
    const newExpressionTiles: ExpressionTile[] = Array.from({
      length: gamemodeSettings.numTiles,
    }).map((_, index) => generateTile(index + 1));

    setExpressionTiles(newExpressionTiles);

    // Result tiles (only needed in match mode)
    if (props.mode === "match") {
      // Tiles displaying the expression totals, shuffled and all given the 'not set' status
      const newResultTiles: ResultTile[] = shuffleArray(newExpressionTiles).map((tile, index) => ({
        id: index + 1,
        total: tile.total,
        status: "not set",
      }));

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
    setMostRecentArithmeticDragGamemodeSettings(location, gamemodeSettings);
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

  function handleDragEnd<
    T extends { id: number },
    TOpposite extends { id: number; status: "incorrect" | "correct" | "not set" }
  >(
    event: DragEndEvent,
    // tiles uses generic type which extends id (acting as a general constraint)
    tiles: T[],
    // oppositeTiles uses another generic type (with id and status general constraints)
    oppositeTiles: TOpposite[],
    setTiles: (tiles: T[]) => void,
    setOppositeTiles: (oppositeTiles: TOpposite[]) => void
  ) {
    const { active, over } = event;

    // Drag was started but the order of the tiles wasn't changed
    if (active.id === over?.id) {
      return;
    }

    // The tile which is being dragged
    const oldTile: T | undefined = tiles.find((tile) => tile.id === active.id);
    // The tile below where the tile being dragged has been dragged to
    const newTile: T | undefined = tiles.find((tile) => tile.id === over?.id);

    // Either of the required tiles for the switch to be made are missing
    if (!oldTile || !newTile) {
      return;
    }

    // Find the indexes of the tiles within the wordTiles array
    const oldIndex: number = tiles.indexOf(oldTile);
    const newIndex: number = tiles.indexOf(newTile);

    // Switch the positions of the tiles (using the indexes)
    const newTiles: T[] = arrayMove(tiles, oldIndex, newIndex);

    // Reset status of tiles when moved
    setTiles(newTiles.map((tile) => ({ ...tile, status: "not set" })));
    setOppositeTiles(oppositeTiles.map((tile) => ({ ...tile, status: "not set" })));
  }

  /**
   * LetterTile Debug: letter={`R: ${tile.total}`}
   * @returns
   */
  function displayTiles(): React.ReactNode {
    const draggableExpressionTiles = (
      <div className="draggable_expressions" ref={parent}>
        {expressionTiles.map((tile) => (
          <DraggableItem key={tile.id} id={tile.id}>
            <LetterTile letter={tile.expression} status={tile.status} settings={props.settings} />
          </DraggableItem>
        ))}
      </div>
    );

    const draggableResultTiles = (
      <div className="draggable_results" ref={parent}>
        {resultTiles.map((tile) => (
          <DraggableItem key={tile.id} id={tile.id}>
            <LetterTile letter={tile.total.toString()} status={tile.status} settings={props.settings} />
          </DraggableItem>
        ))}
      </div>
    );

    return (
      <>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(event) => handleDragEnd(event, expressionTiles, resultTiles, setExpressionTiles, setResultTiles)}
        >
          <SortableContext items={expressionTiles} strategy={verticalListSortingStrategy}>
            {draggableExpressionTiles}
          </SortableContext>
        </DndContext>

        {props.mode === "match" && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event) =>
              handleDragEnd(event, resultTiles, expressionTiles, setResultTiles, setExpressionTiles)
            }
          >
            <SortableContext items={resultTiles} strategy={verticalListSortingStrategy}>
              {draggableResultTiles}
            </SortableContext>
          </DndContext>
        )}
      </>
    );
  }

  function checkTiles() {
    const tileTotals = expressionTiles.map((x) => x.total);

    let newExpressionTiles: ExpressionTile[] = expressionTiles.slice();
    let newResultTiles: ResultTile[] = resultTiles.slice();

    // Smallest to largest
    if (props.mode === "order") {
      // Sort the tile totals into ascending order
      const sortedTotals = tileTotals.sort((x, y) => {
        return x - y;
      });

      newExpressionTiles = expressionTiles.map((tile, index) => {
        // Tile is in correct position
        const isTileCorrect = expressionTiles[index].total === sortedTotals[index];
        tile.status = isTileCorrect ? "correct" : "incorrect";
        return tile;
      });
    }

    // Match expression with result
    if (props.mode === "match") {
      newExpressionTiles = expressionTiles.map((tile, index) => {
        // Expression matched with correct result
        const isTileCorrect = expressionTiles[index].total === resultTiles[index].total;
        tile.status = isTileCorrect ? "correct" : "incorrect";
        return tile;
      });

      // Also update status of result tiles
      newResultTiles = resultTiles.map((tile, index) => {
        const isTileCorrect = expressionTiles[index].total === resultTiles[index].total;
        tile.status = isTileCorrect ? "correct" : "incorrect";
        return tile;
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

  const handleNumberSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newGamemodeSettings: ArithmeticDragProps["gamemodeSettings"] = {
      ...gamemodeSettings,
      numberSize: e.target.value as arithmeticNumberSize,
    };

    setGamemodeSettings(newGamemodeSettings);
  };

  const handleTimerToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGamemodeSettings: ArithmeticDragProps["gamemodeSettings"] = {
      ...gamemodeSettings,
      timerConfig: e.target.checked ? { isTimed: true, seconds: mostRecentTotalSeconds } : { isTimed: false },
    };

    setGamemodeSettings(newGamemodeSettings);
  };

  const handleSimpleGamemodeSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGamemodeSettings: ArithmeticDragProps["gamemodeSettings"] = {
      ...gamemodeSettings,
      [e.target.name]: getNewGamemodeSettingValue(e),
    };

    setGamemodeSettings(newGamemodeSettings);
  };

  return (
    <div
      className="App numbers_arithmetic"
      style={{ backgroundImage: `url(${props.theme.backgroundImageSrc})`, backgroundSize: "100% 100%" }}
    >
      {!props.campaignConfig.isCampaignLevel && (
        <div className="gamemodeSettings">
          <ArithmeticDragGamemodeSettings
            gamemodeSettings={gamemodeSettings}
            handleNumberSizeChange={handleNumberSizeChange}
            handleTimerToggle={handleTimerToggle}
            handleSimpleGamemodeSettingsChange={handleSimpleGamemodeSettingsChange}
            setMostRecentTotalSeconds={setMostRecentTotalSeconds}
            setRemainingSeconds={setRemainingSeconds}
            onLoadPresetGamemodeSettings={setGamemodeSettings}
            onShowOfAddPresetModal={() => {}}
            onHideOfAddPresetModal={() => {}}
          />
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
