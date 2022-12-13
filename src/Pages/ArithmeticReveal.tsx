import React, { useState } from "react";
import { PagePath } from "../Data/PageNames";
import MessageNotification from "../Components/MessageNotification";
import LetterTile from "../Components/LetterTile";
import NumPad from "../Components/NumPad";
import ProgressBar, { GreenToRedColorTransition } from "../Components/ProgressBar";
import Button from "../Components/Button";
import { Theme } from "../Data/Themes";
import { arithmeticNumberSize } from "./ArithmeticDrag";
import { LEVEL_FINISHING_TEXT } from "../Components/Level";
import { MAX_NUMPAD_GUESS_LENGTH } from "../Data/GamemodeSettingsInputLimits";
import { operators } from "../Data/Operators";
import { getGamemodeDefaultTimerValue } from "../Helpers/getGamemodeDefaultTimerValue";
import { getQuestionSetOutcome } from "../Helpers/getQuestionSetOutcome";
import { getRandomElementFrom } from "../Helpers/getRandomElementFrom";
import { getRandomIntFromRange } from "../Helpers/getRandomIntFromRange";
import ArithmeticRevealGamemodeSettings from "../Components/GamemodeSettingsOptions/ArithmeticRevealGamemodeSettings";
import { getNewGamemodeSettingValue } from "../Helpers/getGamemodeSettingsNewValue";
import { useLocation } from "react-router-dom";
import { setMostRecentArithmeticRevealGamemodeSettings } from "../Data/SaveData/MostRecentGamemodeSettings";
import { SettingsData } from "../Data/SaveData/Settings";
import { useCountdown } from "usehooks-ts";
import { useCorrectChime, useFailureChime, useLightPingChime, useClickChime } from "../Data/Sounds";

export interface ArithmeticRevealProps {
  campaignConfig:
    | {
        isCampaignLevel: true;
        // How far to progress (how many checkpoints) to pass the campaign level?
        targetScore: number;
      }
    | { isCampaignLevel: false };

  gamemodeSettings: {
    numCheckpoints: number;
    // How many tiles appear EACH checkpoint?
    numTiles: number;
    // How big/difficult are the numbers used in these expressions?
    numberSize: arithmeticNumberSize;
    // The time between tiles appearing
    revealIntervalSeconds: number;
    timerConfig: { isTimed: true; seconds: number } | { isTimed: false };
  };
}

interface Props extends ArithmeticRevealProps {
  theme: Theme;
  settings: SettingsData;
  setTheme: (theme: Theme) => void;
  addGold: (gold: number) => void;
  onComplete: (wasCorrect: boolean) => void;
}

const ArithmeticReveal = (props: Props) => {
  const location = useLocation().pathname as PagePath;

  const [numPadDisabled, setNumPadDisabled] = useState(false);

  const [targetNumbers, setTargetNumbers] = useState<number[]>([]);
  const [revealState, setRevealState] = useState<{ type: "in-progress"; revealedTiles: number } | { type: "finished" }>(
    { type: "in-progress", revealedTiles: 0 }
  );
  const [currentCheckpointIndex, setCurrentCheckpointIndex] = useState(0);
  const [inProgress, setInProgress] = useState(true);
  const [guess, setGuess] = useState("");
  const [tiles, setTiles] = useState<string[][]>([]);
  const [targetTransitioned, setTargetTransitioned] = useState(false);

  /* TODO: Sync Flip animation with reveal animation
    The CSS to apply the flip tile animation assumes the reveal interval is always 3 seconds
    Perhaps use animationDelay to control when the animation happens
  */
  const [gamemodeSettings, setGamemodeSettings] = useState<ArithmeticRevealProps["gamemodeSettings"]>(
    props.gamemodeSettings
  );

  // The starting/total time of the guess timer
  const [totalSeconds, setTotalSeconds] = useState(
    props.gamemodeSettings?.timerConfig?.isTimed === true
      ? props.gamemodeSettings?.timerConfig?.seconds
      : getGamemodeDefaultTimerValue(location)
  );

  // How many seconds left on the guess timer?
  const [remainingSeconds, { startCountdown, stopCountdown, resetCountdown }] = useCountdown({
    countStart: totalSeconds,
    intervalMs: 1000,
  });

  // Sounds
  const [playCorrectChimeSoundEffect] = useCorrectChime(props.settings);
  const [playFailureChimeSoundEffect] = useFailureChime(props.settings);
  const [playLightPingSoundEffect] = useLightPingChime(props.settings);
  const [playClickSoundEffect] = useClickChime(props.settings);

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

  /**
   * Generates a new valid tile from the existing running total (so that the generated tile does not result in a decimal).
   * @param targetNumber Existing running total.
   * @returns New running total and a tile.
   */
  function generateTile(targetNumber: number): { tile: string; newRunningTotal: number } {
    let foundTileNumber = false;

    while (!foundTileNumber) {
      // One of the four operators
      let tileOperator = getRandomElementFrom(operators);
      let operatorSymbol = tileOperator.name;
      let tileNumber: number | undefined = undefined;

      switch (operatorSymbol) {
        case "÷": {
          // Number of attempts to find a clean divisor
          const maxLimit = 10;
          let failCount = 0;

          // Loop max_limit times in the attempt of finding a clean divisor
          do {
            const randomDivisor = getRandomIntFromRange(2, getOperandLimit(operatorSymbol)!);
            // Clean division (result would be integer)
            if (targetNumber % randomDivisor === 0 && targetNumber > 0) {
              // Use that divisor as tile number
              tileNumber = randomDivisor;
            } else {
              failCount += 1;
            }
          } while (tileNumber === undefined && failCount < maxLimit); // Stop once a tile number has been determined or after max_limit number of attempts to find a tile number
          break;
        }

        case "×": {
          // Lower threshold of 2 (no point multiplying by 1)
          tileNumber = getRandomIntFromRange(2, getOperandLimit(operatorSymbol)!);
          break;
        }

        case "+": {
          tileNumber = getRandomIntFromRange(1, getOperandLimit(operatorSymbol)!);
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
          else if (targetNumber < getOperandLimit(operatorSymbol)!) {
            // Only subtract a random value which is smaller than targetNumber
            tileNumber = getRandomIntFromRange(1, targetNumber - 1);
          } else {
            // Proceed as normal
            tileNumber = getRandomIntFromRange(1, getOperandLimit(operatorSymbol)!);
          }
        }
      }

      // The target number was determined in this iteration
      if (tileNumber !== undefined) {
        // Set flag to stop while loop
        foundTileNumber = true;
        // Apply operation shown on current tile and update target number
        const newTargetNumber = tileOperator.function(targetNumber, tileNumber);
        // String of the combination of operator and value
        return {
          tile: operatorSymbol + tileNumber.toString(),
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

    for (let i = 0; i < gamemodeSettings.numCheckpoints; i++) {
      // Use/carry on from previous checkpoint target (unless first checkpoint which uses a random number)
      const checkpointStartingNumber = newTargetNumbers[i - 1] ?? getRandomIntFromRange(1, getStartingNumberLimit());

      // Start a tiles array, starting with the number
      const checkpointTiles: string[] = [checkpointStartingNumber.toString()];

      // Keep a running target number
      let runningTotal = checkpointStartingNumber;

      // For each tile in the checkpoint
      for (let i = 0; i < gamemodeSettings.numTiles; i++) {
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

  // Reset game after change of settings (stops cheating by changing settings partway through a game)
  React.useEffect(() => {
    if (props.campaignConfig.isCampaignLevel) {
      return;
    }

    ResetGame();

    // Save the latest gamemode settings for this mode
    setMostRecentArithmeticRevealGamemodeSettings(gamemodeSettings);
  }, [gamemodeSettings]);

  // Create the tiles to be revealed (only once on start)
  React.useEffect(() => {
    // If all tiles have been initialised already
    if (tiles.length > 0) {
      return;
    }

    generateAllTiles();
  }, [tiles]);

  // Prepare for next checkpoint
  React.useEffect(() => {
    setInProgress(true);
    setRevealState({ type: "in-progress", revealedTiles: 0 });
    setGuess("");

    if (gamemodeSettings.timerConfig.isTimed) {
      resetCountdown();
    }
  }, [currentCheckpointIndex]);

  React.useEffect(() => {
    // If the game has finished
    if (revealState.type === "finished") {
      return;
    }

    // (Reveal Tile) Timer Setup
    const intervalId = setInterval(() => {
      const numRevealedTiles = revealState.type === "in-progress" ? revealState.revealedTiles + 1 : 1;

      // If all tiles have been revealed
      if (numRevealedTiles > gamemodeSettings.numTiles) {
        setRevealState({ type: "finished" });
        clearInterval(intervalId);
      } else {
        setRevealState({
          type: "in-progress",
          revealedTiles: numRevealedTiles,
        });
        setTargetTransitioned(true);
      }
    }, gamemodeSettings.revealIntervalSeconds * 1000);

    return () => clearInterval(intervalId);
  }, [revealState]);

  // Start guess timer (any time the toggle is enabled or the totalSeconds is changed)
  React.useEffect(() => {
    if (!inProgress) {
      return;
    }

    // Only start this timer once all the tiles have been revealed
    if (revealState.type !== "finished") {
      return;
    }

    if (!gamemodeSettings.timerConfig.isTimed) {
      return;
    }

    startCountdown();
  }, [inProgress, revealState, gamemodeSettings.timerConfig.isTimed, totalSeconds]);

  // Check remaining seconds on guess timer
  React.useEffect(() => {
    if (!inProgress) {
      return;
    }

    // Only start this timer once all the tiles have been revealed
    if (revealState.type !== "finished") {
      return;
    }

    if (!gamemodeSettings.timerConfig.isTimed) {
      return;
    }

    if (remainingSeconds <= 0) {
      stopCountdown();
      playFailureChimeSoundEffect();
      setInProgress(false);
    }
  }, [inProgress, revealState, gamemodeSettings.timerConfig.isTimed, remainingSeconds]);

  const isGuessCorrect = (): Boolean => {
    return guess.toUpperCase() === targetNumbers[currentCheckpointIndex].toString().toUpperCase();
  };

  const isLastCheckpoint = () => {
    return currentCheckpointIndex + 1 >= gamemodeSettings.numCheckpoints;
  };

  // Has there been an incorrect checkpoint guess or have all the questions been answered
  const isGameOver = () => {
    const allCheckpointsCompleted = isLastCheckpoint() && !inProgress;
    return !isGuessCorrect() || allCheckpointsCompleted;
  };

  const Outcome = () => {
    if (inProgress) {
      return null;
    }

    const numCorrectAnswers = isGuessCorrect() ? currentCheckpointIndex + 1 : currentCheckpointIndex;

    // Show outcome after current checkpoint geuss (and how many questions are left)
    const currentQuestionOutcome = (
      <MessageNotification type={isGuessCorrect() ? "success" : "error"}>
        <strong>{isGuessCorrect() ? "Correct!" : "Incorrect!"}</strong>
        <br />

        {isGuessCorrect() && !isGameOver() && (
          <>
            <span>{`${numCorrectAnswers} / ${gamemodeSettings.numCheckpoints} checkpoints completed`}</span>
            <br />
          </>
        )}

        {!isGuessCorrect() && (
          <>
            <span>
              The answer was <strong>{targetNumbers[currentCheckpointIndex]}</strong>
            </span>
            <br />

            {tiles[currentCheckpointIndex].join(" ")}
          </>
        )}
      </MessageNotification>
    );

    // The number of correct answers needed for a successful outcome
    const targetScore = props.campaignConfig.isCampaignLevel
      ? Math.min(props.campaignConfig.targetScore, gamemodeSettings.numCheckpoints)
      : gamemodeSettings.numCheckpoints;

    // When the game has finished, show the number of correct answers
    const overallOutcome = (
      <>
        <MessageNotification
          type={getQuestionSetOutcome(numCorrectAnswers, targetScore, props.campaignConfig.isCampaignLevel)}
        >
          <strong>
            {isGuessCorrect() && isLastCheckpoint()
              ? "Completed all checkpoints!"
              : `${numCorrectAnswers} / ${gamemodeSettings.numCheckpoints} checkpoints completed`}
          </strong>
        </MessageNotification>
        <br />
      </>
    );

    const restartButton = (
      <Button mode="accept" onClick={() => ResetGame()} settings={props.settings} additionalProps={{ autoFocus: true }}>
        {props.campaignConfig.isCampaignLevel ? LEVEL_FINISHING_TEXT : "Restart"}
      </Button>
    );

    const continueButton = (
      <Button
        mode="accept"
        onClick={() => setCurrentCheckpointIndex(currentCheckpointIndex + 1)}
        settings={props.settings}
        additionalProps={{ autoFocus: true }}
      >
        Next Checkpoint
      </Button>
    );

    // If no more questions, show restart button, otherwise show continue button
    const nextButton = isGameOver() ? restartButton : continueButton;

    const outcome = (
      <>
        {isGameOver() && overallOutcome}
        {currentQuestionOutcome}
        {nextButton}
      </>
    );

    return outcome;
  };

  function ResetGame() {
    if (!inProgress) {
      // Reached target checkpoint if a campaign level, otherwise reached the end (entered last target number)
      const wasCorrect = props.campaignConfig.isCampaignLevel
        ? currentCheckpointIndex + 1 >= Math.min(props.campaignConfig.targetScore, gamemodeSettings.numCheckpoints)
        : guess === targetNumbers[gamemodeSettings.numCheckpoints - 1].toString();
      props.onComplete(wasCorrect);
    }

    setInProgress(true);
    setGuess("");
    setCurrentCheckpointIndex(0);
    setRevealState({ type: "in-progress", revealedTiles: 0 });
    if (gamemodeSettings.timerConfig.isTimed) {
      // Reset the timer if it is enabled in the game options
      resetCountdown();
    }
    // This will set new tiles and new target numbers
    generateAllTiles();
  }

  function onBackspace() {
    if (guess.length === 0) {
      return;
    }

    setGuess(guess.substring(0, guess.length - 1));
  }

  function onSubmitNumber(number: number) {
    if (guess.length >= MAX_NUMPAD_GUESS_LENGTH) {
      return;
    }

    setGuess(`${guess}${number}`);
  }

  React.useEffect(() => {
    setTargetTransitioned(false);
  }, [targetTransitioned]);

  const handleNumberSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newGamemodeSettings: ArithmeticRevealProps["gamemodeSettings"] = {
      ...gamemodeSettings,
      numberSize: e.target.value as arithmeticNumberSize,
    };

    setGamemodeSettings(newGamemodeSettings);
  };

  const handleTimerToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGamemodeSettings: ArithmeticRevealProps["gamemodeSettings"] = {
      ...gamemodeSettings,
      timerConfig: e.target.checked ? { isTimed: true, seconds: totalSeconds } : { isTimed: false },
    };

    setGamemodeSettings(newGamemodeSettings);
  };

  const handleSimpleGamemodeSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGamemodeSettings: ArithmeticRevealProps["gamemodeSettings"] = {
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
          <ArithmeticRevealGamemodeSettings
            gamemodeSettings={gamemodeSettings}
            handleNumberSizeChange={handleNumberSizeChange}
            handleSimpleGamemodeSettingsChange={handleSimpleGamemodeSettingsChange}
            handleTimerToggle={handleTimerToggle}
            resetCountdown={resetCountdown}
            setTotalSeconds={setTotalSeconds}
            onLoadPresetGamemodeSettings={setGamemodeSettings}
            onShowOfAddPresetModal={() => setNumPadDisabled(true)}
            onHideOfAddPresetModal={() => setNumPadDisabled(false)}
          />
        </div>
      )}

      <Outcome />

      {inProgress && revealState.type !== "finished" && (
        <div className="target">
          <LetterTile
            letter={tiles[currentCheckpointIndex]?.[revealState.revealedTiles]}
            status={"not set"}
            settings={props.settings}
          />
        </div>
      )}

      {revealState.type === "finished" && (
        <div className="guess">
          <LetterTile
            letter={guess ? guess : "?"}
            status={inProgress ? "not set" : isGuessCorrect() ? "correct" : "incorrect"}
            settings={props.settings}
          />
        </div>
      )}

      {revealState.type === "finished" && (
        <NumPad
          onEnter={() => setInProgress(false)}
          onBackspace={onBackspace}
          onSubmitNumber={onSubmitNumber}
          settings={props.settings}
          disabled={numPadDisabled || !inProgress}
          hasBackspace={true}
          hasEnter={true}
        />
      )}

      {revealState.type === "finished" && (
        <div>
          {gamemodeSettings.timerConfig.isTimed && (
            <ProgressBar
              progress={remainingSeconds}
              total={gamemodeSettings.timerConfig.seconds}
              display={{ type: "transition", colorTransition: GreenToRedColorTransition }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ArithmeticReveal;
