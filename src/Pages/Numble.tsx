import React, { useState } from "react";
import Button from "../Components/Button";
import MessageNotification, { MessageNotificationProps } from "../Components/MessageNotification";
import ProgressBar, { GreenToRedColorTransition } from "../Components/ProgressBar";
import { Theme } from "../Data/Themes";
import DiceGrid from "../Components/DiceGrid";
import { NumbleConfigProps, numbleGridShape, numbleGridSize, NumbleStatus } from "./NumbleConfig";
import { LEVEL_FINISHING_TEXT } from "../Components/Level";
import { DEFAULT_NUMBLE_GUESS_TIMER_VALUE } from "../Data/DefaultGamemodeSettings";
import { getGamemodeDefaultTimerValue } from "../Helpers/getGamemodeDefaultTimerValue";
import { getHexagonAdjacentPins } from "../Helpers/getHexagonAdjacentPins";
import {
  getNumblePointColourMapping,
  NumblePointColourRange,
  NumbleColour,
} from "../Helpers/getNumblePointColourMappings";
import { getNumbleRowValues } from "../Helpers/getNumbleRowValues";
import { getSquareAdjacentPins } from "../Helpers/getSquareAdjacentPins";
import { NumberPuzzle } from "../Helpers/NumbersGameSolver";
import { getRandomIntFromRange } from "../Helpers/getRandomIntFromRange";
import { getNewGamemodeSettingValue } from "../Helpers/getGamemodeSettingsNewValue";
import NumbleGamemodeSettings from "../Components/GamemodeSettingsOptions/NumbleGamemodeSettings";
import { useLocation } from "react-router-dom";
import { PagePath } from "../Data/PageNames";
import { SettingsData } from "../Data/SaveData/Settings";

interface NumbleProps {
  campaignConfig: NumbleConfigProps["campaignConfig"];
  gamemodeSettings: NumbleConfigProps["gamemodeSettings"];

  status: NumbleStatus;
  setStatus: (newStatus: NumbleStatus) => void;

  currentTeamNumber: number;
  setCurrentTeamNumber: (teamNumber: number) => void;

  nextTeamTurn: () => void;

  remainingGuessTimerSeconds: number;
  updateRemainingGuessTimerSeconds: (newGuessTimerSeconds: number) => void;

  resetConfig: () => void;

  teamTimers: {
    teamNumber: number;
    remainingSeconds: number;
    totalSeconds: number;
  }[];
  updateTeamTimers: (
    newTeamTimers: {
      teamNumber: number;
      remainingSeconds: number;
      totalSeconds: number;
    }[]
  ) => void;

  updateGamemodeSettings: (newGamemodeSettings: NumbleConfigProps["gamemodeSettings"]) => void;

  onComplete: (wasCorrect: boolean) => void;

  theme: Theme;
  settings: SettingsData;
}

const Numble = (props: NumbleProps) => {
  const location = useLocation().pathname as PagePath;

  // Information as to how the pins are displayed and what pins are on each row
  const rowValues = getNumbleRowValues(props.gamemodeSettings.gridShape, props.gamemodeSettings.gridSize);

  // Information as to how many points and what colour pins are
  const pointColourMapping = getNumblePointColourMapping(
    props.gamemodeSettings.gridShape,
    props.gamemodeSettings.gridSize
  );

  // Get the point and colour information of the pin (find which range it falls within)
  const getPointColourRange = (pinNumber: number): NumblePointColourRange | null => {
    return pointColourMapping.find((row) => row.start <= pinNumber && row.end >= pinNumber) ?? null;
  };

  const getPinBasePoints = (pinNumber: number): number => {
    return getPointColourRange(pinNumber)?.points ?? 0;
  };

  const getPinColour = (pinNumber: number): NumbleColour | null => {
    return getPointColourRange(pinNumber)?.colour ?? null;
  };

  const getRandomDiceNumber = () => {
    return getRandomIntFromRange(props.gamemodeSettings.diceMin, props.gamemodeSettings.diceMax);
  };

  const [diceValues, setDiceValues] = useState<number[]>(
    Array.from({ length: props.gamemodeSettings.numDice }).map((x) => getRandomDiceNumber())
  );
  const [pickedPins, setPickedPins] = useState<{ pinNumber: number; teamNumber: number }[]>([]);

  const initialScores = Array.from({ length: props.gamemodeSettings.numTeams }).map((_, i) => ({
    teamNumber: i,
    total: 0,
  }));

  const [totalScores, setTotalScores] = useState(initialScores);

  const [mostRecentGuessTimerTotalSeconds, setMostRecentGuessTimerTotalSeconds] = useState(
    props.gamemodeSettings?.guessTimerConfig?.isTimed === true
      ? props.gamemodeSettings?.guessTimerConfig.seconds
      : DEFAULT_NUMBLE_GUESS_TIMER_VALUE
  );

  const [mostRecentTotalSeconds, setMostRecentTotalSeconds] = useState(
    props.gamemodeSettings?.timerConfig?.isTimed === true
      ? props.gamemodeSettings?.timerConfig?.seconds
      : getGamemodeDefaultTimerValue(location)
  );

  const teamNumberColourMappings = [
    { teamNumber: 0, teamName: "Blue" },
    { teamNumber: 1, teamName: "Red" },
    { teamNumber: 2, teamName: "Green" },
    { teamNumber: 3, teamName: "Yellow" },
  ];

  React.useEffect(() => {
    ResetGame();
  }, [props.gamemodeSettings]);

  // Determine valid results on update of diceValues (at start and on roll of dice)
  React.useEffect(() => {
    props.setStatus("dice-rolled-awaiting-pick");
  }, [diceValues]);

  // Guess timer
  React.useEffect(() => {
    if (!props.gamemodeSettings.guessTimerConfig.isTimed) {
      return;
    }

    // Still time left
    if (props.remainingGuessTimerSeconds > 0) {
      return;
    }

    /*
    Only worried about deducting points (penalties) here (which happens when the game doesn't end when there is no guess time left)
    Ending the game is handled in NumbleConfig
    */
    if (props.gamemodeSettings.guessTimerConfig.timerBehaviour.isGameOverWhenNoTimeLeft) {
      return;
    }

    const penalty = props.gamemodeSettings.guessTimerConfig.timerBehaviour.pointsLost;

    const newTotalScores = totalScores.map((teamScoreInfo) => {
      // Subtract specified penalty from total score of current team
      if (teamScoreInfo.teamNumber === props.currentTeamNumber) {
        const newScore = Math.max(0, teamScoreInfo.total - penalty);
        return { ...teamScoreInfo, total: newScore };
      }

      return teamScoreInfo;
    });
    setTotalScores(newTotalScores);
  }, [props.gamemodeSettings.guessTimerConfig.isTimed, props.remainingGuessTimerSeconds]);

  React.useEffect(() => {
    // Reset guess timer
    if (props.gamemodeSettings.guessTimerConfig.isTimed) {
      props.updateRemainingGuessTimerSeconds(props.gamemodeSettings.guessTimerConfig.seconds);
    }

    // No more pins to select
    if (pickedPins.length === props.gamemodeSettings.gridSize) {
      props.setStatus("game-over-no-more-pins");
    }

    // Only campaign checks from now on, return early if not a campaign level
    if (!props.campaignConfig.isCampaignLevel) {
      return;
    }

    // Reached max allowed number of selected pins
    if (pickedPins.length === props.campaignConfig.maxNumSelectedPins) {
      props.setStatus("game-over-no-more-pins");
    }

    const score = totalScores[0].total ?? 0;

    // Reached target score
    if (score >= props.campaignConfig.targetScore) {
      props.setStatus("game-over-target-score");
    }
  }, [pickedPins]);

  function rollDice() {
    // Dice is now being rolled
    props.setStatus("dice-rolling");

    // Reset guess timer back to full
    if (props.gamemodeSettings.guessTimerConfig.isTimed) {
      props.updateRemainingGuessTimerSeconds(mostRecentGuessTimerTotalSeconds);
    }

    // Determine random dice values for all the dice
    setDiceValues(Array.from({ length: props.gamemodeSettings.numDice }).map((x) => getRandomDiceNumber()));
  }

  function isPrime(value: number): boolean {
    if (value <= 1) {
      return false;
    }

    // even numbers
    if (value % 2 === 0 && value > 2) {
      return false;
    }

    // store the square to loop faster
    const s = Math.sqrt(value);
    for (let i = 3; i <= s; i += 2) {
      // start from 3, stop at the square, increment in twos
      // modulo shows a divisor was found
      if (value % i === 0) {
        return false;
      }
    }

    return true;
  }

  function isAdjacentBonus(pinNumber: number): boolean {
    // Which pins have been picked so far?
    const pickedPinNumbers = pickedPins.map((x) => x.pinNumber);

    if (props.gamemodeSettings.gridShape === "square") {
      const adjacentPins = getSquareAdjacentPins(pinNumber, props.gamemodeSettings.gridSize);

      if (!adjacentPins) {
        return false;
      }

      // All the adjacent pins which have also previously been picked
      const pickedAdjacentPins = pickedPins.filter((x) => adjacentPins?.includes(x.pinNumber));

      // The pin and the 3 adjacent pins to make a 2x2 square
      return pickedAdjacentPins.length >= 3;
    }

    if (props.gamemodeSettings.gridShape === "hexagon") {
      const adjacentPins = getHexagonAdjacentPins(pinNumber, rowValues);

      if (!adjacentPins) {
        return false;
      }

      // The pin and two adjacent pins forming a triangle can happen in six ways

      // In a clockwise direction...
      const topTriangle =
        adjacentPins?.leftAbove !== null &&
        pickedPinNumbers.includes(adjacentPins?.leftAbove) &&
        adjacentPins?.rightAbove !== null &&
        pickedPinNumbers.includes(adjacentPins?.rightAbove);

      const topRightTriangle =
        adjacentPins?.rightAbove !== null &&
        pickedPinNumbers.includes(adjacentPins?.rightAbove) &&
        adjacentPins?.right !== null &&
        pickedPinNumbers.includes(adjacentPins?.right);

      const bottomRightTriangle =
        adjacentPins.rightBelow !== null &&
        pickedPinNumbers.includes(adjacentPins.rightBelow) &&
        adjacentPins.right !== null &&
        pickedPinNumbers.includes(adjacentPins.right);

      const bottomTriangle =
        adjacentPins.leftBelow !== null &&
        pickedPinNumbers.includes(adjacentPins.leftBelow) &&
        adjacentPins.rightBelow !== null &&
        pickedPinNumbers.includes(adjacentPins.rightBelow);

      const bottomLeftTriangle =
        adjacentPins.leftBelow !== null &&
        pickedPinNumbers.includes(adjacentPins.leftBelow) &&
        adjacentPins.left !== null &&
        pickedPinNumbers.includes(adjacentPins.left);

      const topLeftTriangle =
        adjacentPins.leftAbove !== null &&
        pickedPinNumbers.includes(adjacentPins.leftAbove) &&
        adjacentPins.left !== null &&
        pickedPinNumbers.includes(adjacentPins.left);

      // Any of these conditions
      return (
        topTriangle ||
        topRightTriangle ||
        bottomRightTriangle ||
        bottomTriangle ||
        bottomLeftTriangle ||
        topLeftTriangle
      );
    }

    return false;
  }

  function onClick(pinNumber: number) {
    if (props.status === "dice-rolling") {
      return;
    }

    if (pinNumber < 1) {
      return;
    }

    // Find all the ways the selected pin can be made with the input numbers
    const puzzle = new NumberPuzzle(pinNumber, diceValues);
    const solutions = puzzle.solve().all;

    // There are no ways of making the selected number
    if (solutions.length < 1) {
      // The option controlling if the game ends on an incorrect pick is off
      if (!props.gamemodeSettings.isGameOverOnIncorrectPick) {
        // Ignore, wait for player to choose another number
        return;
      }

      // Singleplayer
      if (props.gamemodeSettings.numTeams === 1) {
        // End game using status
        props.setStatus("game-over-incorrect-tile");
        return;
      }

      // Multiplayer - Set current team's remaining time to zero
      const newTeamTimers = props.teamTimers.map((teamTimerInfo) => {
        if (teamTimerInfo.teamNumber === props.currentTeamNumber) {
          return { ...teamTimerInfo, remainingSeconds: 0 };
        }
        return teamTimerInfo;
      });
      props.updateTeamTimers(newTeamTimers);

      props.nextTeamTurn();

      return;
    }

    // Keep track that the pin has now been correctly picked
    const newPickedPins = pickedPins.slice();
    newPickedPins.push({ pinNumber, teamNumber: props.currentTeamNumber });
    setPickedPins(newPickedPins);

    // Find out how many base points the pin is worth
    let pinScore = getPinBasePoints(pinNumber);

    // Double points if the picked pin is a prime number
    if (isPrime(pinNumber)) {
      pinScore *= 2;
    }

    // Bonus points awarded for numble triangle
    const ADJACENT_BONUS = 200;
    if (isAdjacentBonus(pinNumber)) {
      pinScore += ADJACENT_BONUS;
    }

    // Add points to total points
    if (pinScore) {
      const currentScore = totalScores.find(
        (totalScoresInfo) => totalScoresInfo.teamNumber === props.currentTeamNumber
      )?.total;

      if (currentScore === undefined) {
        return;
      }

      const newScore = currentScore + pinScore;
      const newtotalScores = totalScores.map((totalScoresInfo) => {
        if (totalScoresInfo.teamNumber === props.currentTeamNumber) {
          return { ...totalScoresInfo, total: newScore };
        }
        return totalScoresInfo;
      });

      setTotalScores(newtotalScores);
    }

    props.nextTeamTurn();
  }

  function populateRow(rowNumber: number) {
    // Calculate the middle row
    const middle = Math.sqrt(props.gamemodeSettings.gridSize) / 2;

    // Calculate the offset from the middle row (negative offset applied to rows below middle)
    const offset = (middle - rowNumber) * -1;

    // How much to slant the parallelogram
    const X_SLANT = 2.45;
    const Y_SLANT = 1.8;

    const rowIndex = rowNumber - 1;
    // What pin values are on this row?
    const currentRowValues = rowValues[rowIndex].values;

    return (
      <div
        className="numble-grid-row"
        style={{
          transform:
            props.gamemodeSettings.gridShape === ("hexagon" as numbleGridShape)
              ? `translate(${offset * 10 * X_SLANT}px, ${offset * 10 * Y_SLANT}px)`
              : undefined,
        }}
        key={rowNumber}
      >
        {currentRowValues.map((value) => {
          const buttonBody =
            props.gamemodeSettings.gridShape === "hexagon" ? (
              <>
                <span className="top"></span>
                <span className="middle">{value}</span>
                <span className="bottom"></span>
              </>
            ) : (
              <>{value}</>
            );

          // Has the pin already been picked?
          const isPicked = pickedPins.map((x) => x.pinNumber).includes(value);

          return (
            <button
              key={value}
              className="numble-button"
              data-prime={isPrime(value)}
              data-shape={props.gamemodeSettings.gridShape}
              data-picked={isPicked}
              data-team-number={pickedPins.find((x) => x.pinNumber === value)?.teamNumber}
              data-colour={getPinColour(value)}
              onClick={() => onClick(value)}
              disabled={isPicked || props.status !== "dice-rolled-awaiting-pick"}
            >
              {buttonBody}
            </button>
          );
        })}
      </div>
    );
  }

  const Grid = () => {
    const Grid = [];

    // Start with higher value rows (so that they are rendered first, at the top of the grid)
    for (let i = rowValues.length; i >= 1; i--) {
      Grid.push(populateRow(i));
    }

    return (
      <div className="numble-grid" data-shape={props.gamemodeSettings.gridShape}>
        {Grid}
      </div>
    );
  };

  const PinScores = () => {
    const pinScores = pointColourMapping.map((colourRange) => (
      <button
        key={colourRange.colour}
        className="numble-button-display"
        data-shape={props.gamemodeSettings.gridShape}
        data-prime={false}
        data-picked={false}
        data-colour={colourRange.colour}
        disabled={false}
      >
        {colourRange.points}
      </button>
    ));

    // Use the last/highest row colour to show prime numble pin
    const lastPointColourMapping = pointColourMapping[pointColourMapping.length - 1];

    // Create a prime numble pin (a pin with a border) to show it awards double points
    pinScores.push(
      <button
        key={"prime-read-only"}
        className="numble-button-display"
        data-shape={props.gamemodeSettings.gridShape}
        data-prime={true}
        data-picked={false}
        data-colour={lastPointColourMapping.colour}
        disabled={false}
      >
        {lastPointColourMapping.points * 2}
      </button>
    );

    return <div className="numble-pin-scores">{pinScores}</div>;
  };

  function isGameInProgress() {
    if (
      props.status === "dice-rolling" ||
      props.status === "dice-rolled-awaiting-pick" ||
      props.status === "picked-awaiting-dice-roll"
    ) {
      return true;
    } else {
      return false;
    }
  }

  // The type of message and the displayed message for each singleplayer end game status
  function getOutcomeNotificationMessage(): { messageType: MessageNotificationProps["type"]; message: string } {
    // Can only end with this status in singleplayer
    if (props.status === "game-over-incorrect-tile") {
      return { messageType: "error", message: "Incorrect pin chosen" };
    }
    // Reached the target score for a campaign level
    if (props.campaignConfig.isCampaignLevel && props.status === "game-over-target-score") {
      return { messageType: "success", message: `Reached target score of ${props.campaignConfig.targetScore}` };
    }
    if (props.status === "game-over-timer-ended") {
      return { messageType: "default", message: "No remaining time" };
    }
    if (props.status === "game-over-no-more-pins") {
      return { messageType: "default", message: "All pins picked" };
    }
    return { messageType: "default", message: "" };
  }

  const Outcome = () => {
    if (isGameInProgress()) {
      return null;
    }

    // Singleplayer
    if (props.gamemodeSettings.numTeams === 1) {
      const outcomeMessageInfo = getOutcomeNotificationMessage();
      const finalScore = totalScores[0].total;

      return (
        <MessageNotification type={outcomeMessageInfo.messageType}>
          <strong>Game over</strong>
          <br />
          {outcomeMessageInfo.message}
          <br />
          Final Score: {finalScore ?? 0}
        </MessageNotification>
      );
    }

    // Multiplayer
    if (props.gamemodeSettings.numTeams > 1) {
      // Why has the game ended?
      const gameStatusMessage = props.status === "game-over-timer-ended" ? "No remaining time" : "All pins picked";

      // Determine the winner(s)
      const teamScores = totalScores.map((team) => team.total);
      const highestScore = Math.max(...teamScores);

      // There may be a draw and so more than one team with this highest score
      const winningTeamNumbers = totalScores
        .filter((team) => team.total === highestScore)
        .map((team) => team.teamNumber);

      // Find the team colour(s) of the winning team(s)
      const winningTeamNames = teamNumberColourMappings
        .filter((team) => winningTeamNumbers.includes(team.teamNumber))
        .map((team) => team.teamName);

      // The message stating the winner of the game
      const winningTeamMessage =
        winningTeamNames.length === 1 ? `${winningTeamNames[0]} team wins!` : `Draw - ${winningTeamNames.join(", ")}`;

      // Every team's score shown next to their team colour name
      const formattedScores = (
        <>
          {totalScores.map((teamPoints) => (
            <>
              <br />
              {`${teamNumberColourMappings.find((x) => x.teamNumber === teamPoints.teamNumber)?.teamName}: ${
                totalScores.find((x) => x.teamNumber === teamPoints.teamNumber)?.total
              }`}
            </>
          ))}
        </>
      );

      return (
        <MessageNotification type="default">
          <strong>Game Over</strong>
          <br />
          {gameStatusMessage}
          <br />
          {winningTeamMessage}
          <br />
          {formattedScores}
        </MessageNotification>
      );
    }

    return null;
  };

  function ResetGame() {
    if (!isGameInProgress()) {
      const wasCorrect = props.status === "game-over-target-score";
      props.onComplete(wasCorrect);
    }

    if (props.gamemodeSettings.timerConfig.isTimed) {
      const newRemainingSeconds = props.gamemodeSettings.timerConfig.seconds ?? mostRecentTotalSeconds;

      // Reset all teams' times back to full
      const newTeamTimers = Array.from({ length: props.gamemodeSettings.numTeams }).map((_, i) => ({
        teamNumber: i,
        remainingSeconds: newRemainingSeconds,
        totalSeconds: newRemainingSeconds,
      }));

      props.updateTeamTimers(newTeamTimers);
    }

    // Clear any game progress
    setPickedPins([]);
    setTotalScores(initialScores);

    // First team is next to play
    props.setCurrentTeamNumber(0);

    // The quanity of dice (numDice) only updates after rolling
    rollDice();

    props.resetConfig();
  }

  const handleGridShapeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newGamemodeSettings: NumbleConfigProps["gamemodeSettings"] = {
      ...props.gamemodeSettings,
      gridShape: e.target.value as numbleGridShape,
    };

    props.updateGamemodeSettings(newGamemodeSettings);
  };

  const handleGridSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newGamemodeSettings: NumbleConfigProps["gamemodeSettings"] = {
      ...props.gamemodeSettings,
      gridSize: parseInt(e.target.value) as numbleGridSize,
    };

    props.updateGamemodeSettings(newGamemodeSettings);
  };

  const handleTeamTimersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Set all teams' remaining and total time left to this new value
    const newTeamTimers = props.teamTimers.map((teamTimerInfo) => {
      return {
        ...teamTimerInfo,
        remainingSeconds: e.target.valueAsNumber,
        totalSeconds: e.target.valueAsNumber,
      };
    });
    props.updateTeamTimers(newTeamTimers);
  };

  const handleTimerToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGamemodeSettings: NumbleConfigProps["gamemodeSettings"] = {
      ...props.gamemodeSettings,
      timerConfig: e.target.checked ? { isTimed: true, seconds: mostRecentTotalSeconds } : { isTimed: false },
    };

    props.updateGamemodeSettings(newGamemodeSettings);
  };

  const handleGuessTimerToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGamemodeSettings: NumbleConfigProps["gamemodeSettings"] = {
      ...props.gamemodeSettings,
      guessTimerConfig: e.target.checked
        ? {
            isTimed: true,
            seconds: mostRecentGuessTimerTotalSeconds,
            timerBehaviour: { isGameOverWhenNoTimeLeft: false, pointsLost: 0 },
          }
        : { isTimed: false },
    };

    props.updateGamemodeSettings(newGamemodeSettings);
  };

  const handleGuessTimerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGuessTimer = {
      ...props.gamemodeSettings.guessTimerConfig,
      seconds: e.target.valueAsNumber,
    };

    const newGamemodeSettings = {
      ...props.gamemodeSettings,
      guessTimerConfig: newGuessTimer,
    };

    props.updateGamemodeSettings(newGamemodeSettings);
  };

  const handleGuessTimerBehaviourToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTimerBehaviour:
      | { isGameOverWhenNoTimeLeft: true }
      | { isGameOverWhenNoTimeLeft: false; pointsLost: number } =
      // If game currently ends when uses timer runs out, make it not and vice versa
      props.gamemodeSettings.guessTimerConfig.isTimed &&
      props.gamemodeSettings.guessTimerConfig.timerBehaviour.isGameOverWhenNoTimeLeft
        ? { isGameOverWhenNoTimeLeft: false, pointsLost: 0 }
        : { isGameOverWhenNoTimeLeft: true };

    const newGuessTimer = {
      ...props.gamemodeSettings.guessTimerConfig,
      timerBehaviour: newTimerBehaviour,
    };

    const newGamemodeSettings = {
      ...props.gamemodeSettings,
      guessTimerConfig: newGuessTimer,
    };

    props.updateGamemodeSettings(newGamemodeSettings);
  };

  const handlePointsLostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGuessTimer = {
      ...props.gamemodeSettings.guessTimerConfig,
      timerBehaviour: { isGameOverWhenNoTimeLeft: false, pointsLost: e.target.valueAsNumber },
    };

    const newGamemodeSettings = {
      ...props.gamemodeSettings,
      guessTimerConfig: newGuessTimer,
    };

    props.updateGamemodeSettings(newGamemodeSettings);
  };

  const handleSimpleGamemodeSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGamemodeSettings: NumbleConfigProps["gamemodeSettings"] = {
      ...props.gamemodeSettings,
      [e.target.name]: getNewGamemodeSettingValue(e),
    };

    props.updateGamemodeSettings(newGamemodeSettings);
  };

  return (
    <div
      className="App"
      style={{ backgroundImage: `url(${props.theme.backgroundImageSrc})`, backgroundSize: "100% 100%" }}
    >
      <Outcome />

      {!isGameInProgress() && (
        <div>
          <Button
            mode="accept"
            settings={props.settings}
            onClick={() => ResetGame()}
            additionalProps={{ autoFocus: true }}
          >
            {props.campaignConfig.isCampaignLevel ? LEVEL_FINISHING_TEXT : "Restart"}
          </Button>
        </div>
      )}

      {!props.campaignConfig.isCampaignLevel && (
        <div className="gamemodeSettings">
          <NumbleGamemodeSettings
            gamemodeSettings={props.gamemodeSettings}
            handleGridShapeChange={handleGridShapeChange}
            handleGridSizeChange={handleGridSizeChange}
            handleGuessTimerBehaviourToggle={handleGuessTimerBehaviourToggle}
            handleGuessTimerChange={handleGuessTimerChange}
            handleGuessTimerToggle={handleGuessTimerToggle}
            handlePointsLostChange={handlePointsLostChange}
            handleSimpleGamemodeSettingsChange={handleSimpleGamemodeSettingsChange}
            handleTeamTimersChange={handleTeamTimersChange}
            handleTimerToggle={handleTimerToggle}
            setMostRecentGuessTimerTotalSeconds={setMostRecentGuessTimerTotalSeconds}
            setMostRecentTotalSeconds={setMostRecentTotalSeconds}
            updateRemainingGuessTimerSeconds={props.updateRemainingGuessTimerSeconds}
            onLoadPresetGamemodeSettings={props.updateGamemodeSettings}
            onShowOfAddPresetModal={() => {}}
            onHideOfAddPresetModal={() => {}}
          />
        </div>
      )}

      <DiceGrid
        diceValues={diceValues}
        rollDice={rollDice}
        settings={props.settings}
        disabled={props.status !== "picked-awaiting-dice-roll"}
      >
        {props.status === "dice-rolling"
          ? "Rolling..."
          : props.status === "picked-awaiting-dice-roll"
          ? "Roll Dice"
          : props.status === "dice-rolled-awaiting-pick"
          ? "Pick a nibble"
          : "Game over"}
      </DiceGrid>

      {props.gamemodeSettings.guessTimerConfig.isTimed && (
        <div>
          <ProgressBar
            progress={props.remainingGuessTimerSeconds}
            total={props.gamemodeSettings.guessTimerConfig.seconds}
            display={{ type: "transition", colorTransition: GreenToRedColorTransition }}
          />
        </div>
      )}

      <Grid />

      <div className="numble-score-wrapper">
        <div className="teams-info-wrapper">
          {totalScores.map((teamPoints) => (
            <div
              className="team-info"
              data-team-number={teamPoints.teamNumber}
              data-selected={teamPoints.teamNumber === props.currentTeamNumber}
              key={teamPoints.teamNumber}
            >
              {props.gamemodeSettings.numTeams > 1 && (
                <div className="numble-team-label">
                  {teamNumberColourMappings.find((x) => x.teamNumber === teamPoints.teamNumber)?.teamName}
                </div>
              )}
              <label>
                Score
                <div className="numble-score">
                  {totalScores.find((x) => x.teamNumber === teamPoints.teamNumber)?.total}
                </div>
              </label>
              <label>
                Time
                <div className="numble-timer">
                  {props.teamTimers.find((x) => x.teamNumber === teamPoints.teamNumber)?.remainingSeconds}
                </div>
              </label>
            </div>
          ))}
        </div>
        <PinScores />
      </div>
    </div>
  );
};

export default Numble;
