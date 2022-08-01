import React, { useState } from "react";
import { Button } from "../Components/Button";
import { NumberPuzzle } from "../Data/NumbersGameSolver";
import GamemodeSettingsMenu from "../Components/GamemodeSettingsMenu";
import { MessageNotification } from "../Components/MessageNotification";
import ProgressBar, { GreenToRedColorTransition } from "../Components/ProgressBar";
import { SaveData, SettingsData } from "../Data/SaveData";
import { Theme } from "../Data/Themes";
import DiceGrid from "../Components/DiceGrid";
import {
  DEFAULT_NUMBLE_GUESS_TIMER_VALUE,
  DEFAULT_NUMBLE_TIMER_VALUE,
  getNextTeamNumberWithRemainingTime,
  HexagonPinAdjacency,
  numbleGridShape,
  numbleGridShapes,
  numbleGridSize,
  numbleGridSizes,
} from "./NumbleConfig";
import { LEVEL_FINISHING_TEXT } from "../Components/Level";

interface Props {
  campaignConfig:
    | {
        isCampaignLevel: true;
        // What score must be achieved to pass the campaign level?
        targetScore: number;
        // How many pins can be selected before game ends?
        maxNumSelectedPins: number;
      }
    | { isCampaignLevel: false };
  theme: Theme;
  status:
    | "dice-rolling"
    | "dice-rolled-awaiting-pick"
    | "picked-awaiting-dice-roll"
    | "game-over-incorrect-tile"
    | "game-over-target-score"
    | "game-over-no-more-pins"
    | "game-over-timer-ended";
  setStatus: (
    newStatus:
      | "dice-rolling"
      | "dice-rolled-awaiting-pick"
      | "picked-awaiting-dice-roll"
      | "game-over-incorrect-tile"
      | "game-over-target-score"
      | "game-over-no-more-pins"
      | "game-over-timer-ended"
  ) => void;
  currentTeamNumber: number;
  setCurrentTeamNumber: (teamNumber: number) => void;
  gamemodeSettings: {
    numDice: number;
    diceMin: number;
    diceMax: number;
    gridShape: numbleGridShape;
    gridSize: numbleGridSize;
    numTeams: number;
    isGameOverOnIncorrectPick: boolean;
    guessTimerConfig:
      | {
          isTimed: true;
          seconds: number;
          timerBehaviour: { isGameOverWhenNoTimeLeft: true } | { isGameOverWhenNoTimeLeft: false; pointsLost: number };
        }
      | { isTimed: false };
    timerConfig: { isTimed: true; seconds: number } | { isTimed: false };
  };

  remainingGuessTimerSeconds: number;
  updateRemainingGuessTimerSeconds: (newGuessTimerSeconds: number) => void;

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

  updateGamemodeSettings: (newGamemodeSettings: {
    numDice: number;
    diceMin: number;
    diceMax: number;
    gridShape: numbleGridShape;
    gridSize: numbleGridSize;
    numTeams: number;
    isGameOverOnIncorrectPick: boolean;
    guessTimerConfig:
      | {
          isTimed: true;
          seconds: number;
          timerBehaviour: { isGameOverWhenNoTimeLeft: true } | { isGameOverWhenNoTimeLeft: false; pointsLost: number };
        }
      | { isTimed: false };
    timerConfig: { isTimed: true; seconds: number } | { isTimed: false };
  }) => void;

  determineHexagonRowValues: () => { rowNumber: number; values: number[] }[];
  determinePoints: (value: number) => number;
  determinePointColourMappings: () => { points: number; colour: string }[];
  determineSquareAdjacentMappings: () => {
    pin: number;
    adjacent_pins: number[];
  }[];
  determineHexagonAdjacentMappings: () => {
    pin: number;
    adjacent_pins: HexagonPinAdjacency;
  }[];

  settings: SettingsData;
}

export function randomIntFromInterval(min: number, max: number) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const Numble: React.FC<Props> = (props) => {
  const [diceValues, setdiceValues] = useState<number[]>(
    Array.from({ length: props.gamemodeSettings.numDice }).map((x) => randomDiceNumber())
  );
  const [pickedPins, setPickedPins] = useState<{ pinNumber: number; teamNumber: number }[]>([]);
  const gridPoints = Array.from({ length: props.gamemodeSettings.gridSize }).map((_, i) => ({
    number: i + 1,
    points: props.determinePoints(i + 1),
  }));

  const initialScores = Array.from({ length: props.gamemodeSettings.numTeams }).map((_, i) => ({
    teamNumber: i,
    total: 0,
  }));

  const [totalPoints, setTotalPoints] = useState(initialScores);

  const [mostRecentGuessTimerTotalSeconds, setMostRecentGuessTimerTotalSeconds] = useState(
    props.gamemodeSettings?.guessTimerConfig?.isTimed === true
      ? props.gamemodeSettings?.guessTimerConfig.seconds
      : DEFAULT_NUMBLE_GUESS_TIMER_VALUE
  );

  const [mostRecentTotalSeconds, setMostRecentTotalSeconds] = useState(
    props.gamemodeSettings?.timerConfig?.isTimed === true
      ? props.gamemodeSettings?.timerConfig.seconds
      : DEFAULT_NUMBLE_TIMER_VALUE
  );

  const teamNumberColourMappings = [
    { teamNumber: 0, teamName: "Blue" },
    { teamNumber: 1, teamName: "Red" },
    { teamNumber: 2, teamName: "Green" },
    { teamNumber: 3, teamName: "Yellow" },
  ];

  // Determine valid results on update of diceValues (at start and on roll of dice)
  React.useEffect(() => {
    props.setStatus("dice-rolled-awaiting-pick");
  }, [diceValues]);

  // Game timer handling
  React.useEffect(() => {
    // TODO: Move status to NumbleConfig and set within timer useEffect()?
    if (!props.gamemodeSettings.timerConfig.isTimed) {
      return;
    }

    if (!props.teamTimers || props.teamTimers.length <= 0) {
      return;
    }

    // Have all teams used all their time?
    const numRemainingTeams = props.teamTimers.filter((team) => team.remainingSeconds > 0).length;
    const isGameOver = numRemainingTeams === 0;

    // Game over when all timers have run out
    if (isGameOver) {
      props.setStatus("game-over-timer-ended");
    }
  }, [props.gamemodeSettings.timerConfig.isTimed, props.teamTimers]);

  // Guess timer handling
  React.useEffect(() => {
    if (!props.gamemodeSettings.guessTimerConfig.isTimed) {
      return;
    }

    if (props.remainingGuessTimerSeconds > 0) {
      return;
    }

    if (!props.teamTimers || props.teamTimers.length <= 0) {
      return;
    }

    if (props.gamemodeSettings.guessTimerConfig.timerBehaviour.isGameOverWhenNoTimeLeft) {
      // Set current team's remaining time to zero
      const newTeamTimers = props.teamTimers.map((teamTimerInfo) => {
        if (teamTimerInfo.teamNumber === props.currentTeamNumber) {
          return { ...teamTimerInfo, remainingSeconds: 0 };
        }
        return teamTimerInfo;
      });
      props.updateTeamTimers(newTeamTimers);
    } else {
      // Subtract specified penalty from total score of current team
      const currentPoints = totalPoints.find(
        (totalPointsInfo) => totalPointsInfo.teamNumber === props.currentTeamNumber
      )?.total;

      if (!currentPoints) {
        return;
      }

      const penalty = props.gamemodeSettings.guessTimerConfig.timerBehaviour.pointsLost;
      const newScore = Math.max(0, currentPoints - penalty);

      const newTotalPoints = totalPoints.map((totalPointsInfo) => {
        if (totalPointsInfo.teamNumber === props.currentTeamNumber) {
          return { ...totalPointsInfo, total: newScore };
        }
        return totalPointsInfo;
      });
      setTotalPoints(newTotalPoints);
    }
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

    // Only campaign checks from now on
    if (!props.campaignConfig.isCampaignLevel) {
      return;
    }

    // Reached max allowed number of selected pins
    if (pickedPins.length === props.campaignConfig.maxNumSelectedPins) {
      props.setStatus("game-over-no-more-pins");
    }

    const score = totalPoints[0].total ?? 0;

    // Reached target score
    if (score >= props.campaignConfig.targetScore) {
      props.setStatus("game-over-target-score");
    }
  }, [pickedPins]);

  // Reset game when any settings are changed
  React.useEffect(() => {
    // TODO: There is a very similar useEffect() to this within NumbleConfig
    if (props.campaignConfig.isCampaignLevel) {
      return;
    }

    ResetGame();

    // Save the latest gamemode settings
    SaveData.setNumbleConfigGamemodeSettings(props.gamemodeSettings);
  }, [props.gamemodeSettings]);

  /**
   *
   * @returns
   */
  function randomDiceNumber() {
    return randomIntFromInterval(props.gamemodeSettings.diceMin, props.gamemodeSettings.diceMax);
  }

  /**
   *
   * @returns
   */
  function rollDice() {
    // Dice is now being rolled
    props.setStatus("dice-rolling");

    // Reset guess timer back to full
    if (props.gamemodeSettings.guessTimerConfig.isTimed) {
      props.updateRemainingGuessTimerSeconds(mostRecentGuessTimerTotalSeconds);
    }

    // Determine random dice values for all the dice
    setdiceValues(Array.from({ length: props.gamemodeSettings.numDice }).map((x) => randomDiceNumber()));
  }

  /**
   *
   * @param value
   * @returns
   */
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

  /**
   *
   * @param pinNumber
   * @returns
   */
  function isAdjacentBonus(pinNumber: number): boolean {
    if (props.gamemodeSettings.gridShape === "square") {
      // Pin adjacency information
      const adjacentMappings = props.determineSquareAdjacentMappings();
      // Adjacent pins of the clicked pin
      const adjacentPins = adjacentMappings.find((x) => x.pin === pinNumber)?.adjacent_pins;

      if (!adjacentPins) {
        return false;
      }

      // All the adjacent pins which have also previously been picked
      const pickedAdjacentPins = pickedPins.filter((x) => adjacentPins?.includes(x.pinNumber));

      // The pin and the 3 adjacent pins to make a 2x2 square
      if (pickedAdjacentPins.length >= 3) {
        return true;
      } else {
        return false;
      }
    } else if (props.gamemodeSettings.gridShape === ("hexagon" as numbleGridShape)) {
      // Pin adjacency information
      const adjacentMappings = props.determineHexagonAdjacentMappings();
      // Adjacent pins of the clicked pin
      const adjacentPins = adjacentMappings.find((x) => x.pin === pinNumber)?.adjacent_pins;

      if (!adjacentPins) {
        return false;
      }

      const pickedPinNumbers = pickedPins.map((x) => x.pinNumber);

      // The pin and two adjacent pins forming a triangle can happen in six ways

      // In a clockwise direction...
      const topTriangle =
        adjacentPins.leftAbove !== null &&
        pickedPinNumbers.includes(adjacentPins.leftAbove) &&
        adjacentPins.rightAbove !== null &&
        pickedPinNumbers.includes(adjacentPins.rightAbove);

      const topRightTriangle =
        adjacentPins.rightAbove !== null &&
        pickedPinNumbers.includes(adjacentPins.rightAbove) &&
        adjacentPins.right !== null &&
        pickedPinNumbers.includes(adjacentPins.right);

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

      if (
        topTriangle ||
        topRightTriangle ||
        bottomRightTriangle ||
        bottomTriangle ||
        bottomLeftTriangle ||
        topLeftTriangle
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      // Unexpected grid shape
      return false;
    }
  }

  // Determine and set the next team to play
  function nextTeamTurn() {
    const newCurrentTeamNumber = getNextTeamNumberWithRemainingTime(props.currentTeamNumber, props.teamTimers);
    if (newCurrentTeamNumber !== null) {
      props.setCurrentTeamNumber(newCurrentTeamNumber);
      // Next team rolls their own dice values
      props.setStatus("picked-awaiting-dice-roll");
    }
  }

  /**
   *
   * @param pinNumber
   * @returns
   */
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

    // There are no solutions (ways of making the selected number)
    if (solutions.length < 1) {
      if (props.gamemodeSettings.isGameOverOnIncorrectPick && props.gamemodeSettings.numTeams === 1) {
        props.setStatus("game-over-incorrect-tile"); // End game
      } else if (props.gamemodeSettings.isGameOverOnIncorrectPick && props.gamemodeSettings.numTeams > 1) {
        // Set current team's remaining time to zero
        const newTeamTimers = props.teamTimers.map((teamTimerInfo) => {
          if (teamTimerInfo.teamNumber === props.currentTeamNumber) {
            return { ...teamTimerInfo, remainingSeconds: 0 };
          }
          return teamTimerInfo;
        });
        props.updateTeamTimers(newTeamTimers);
      }
      nextTeamTurn();
      return;
    }

    // Keep track that the pin has now been correctly picked
    const newPickedPins = pickedPins.slice();
    newPickedPins.push({ pinNumber, teamNumber: props.currentTeamNumber });
    setPickedPins(newPickedPins);

    // Find out how many base points the pin is worth
    let pinScore = gridPoints.find((x) => x.number === pinNumber)?.points ?? 0;

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
      const currentScore = totalPoints.find(
        (totalPointsInfo) => totalPointsInfo.teamNumber === props.currentTeamNumber
      )?.total;

      if (currentScore === undefined) {
        return;
      }

      const newScore = currentScore + pinScore;
      const newTotalPoints = totalPoints.map((totalPointsInfo) => {
        if (totalPointsInfo.teamNumber === props.currentTeamNumber) {
          return { ...totalPointsInfo, total: newScore };
        }
        return totalPointsInfo;
      });

      setTotalPoints(newTotalPoints);
    }

    nextTeamTurn();
  }

  // Array (length of rowLength) of buttons
  function populateRow(rowLength: number, rowNumber: number) {
    // Calculate the middle row
    const middle = Math.sqrt(props.gamemodeSettings.gridSize) / 2;

    // Calculate the offset from the middle row (negative offset applied to rows below middle)
    const offset = (middle - rowNumber) * -1;

    // How much to slant the parallelogram
    const X_SLANT = 2.45;
    const Y_SLANT = 1.8;

    // Information regarding which pin values are on the current row (for hexagon grid shape)
    const rowInformation = props.determineHexagonRowValues().find((row) => rowNumber === row.rowNumber);

    // Information regarding what colour the rows are and how many points are awarded for each row
    const pointColourInformation = props.determinePointColourMappings();

    return (
      <div
        className="numble-grid-row"
        style={{
          transform:
            props.gamemodeSettings.gridShape === ("hexagon" as numbleGridShape)
              ? `translate(${offset * 10 * X_SLANT}px, ${offset * 10 * Y_SLANT}px)`
              : undefined,
        }}
      >
        {Array.from({ length: rowLength }).map((_, i) => {
          if (props.gamemodeSettings.gridShape === "square") {
            // What was the highest value included in the previous row?
            const prevRowEndingValue = (rowNumber - 1) * rowLength;
            // Start from that value and add the index to it (index is zero based, so add an additional one)
            const value = prevRowEndingValue + i + 1;
            // Has the pin already been picked?
            const isPicked = pickedPins.map((x) => x.pinNumber).includes(value);
            // What colour should the pin be?
            const colour = pointColourInformation.find((x) => x.points === props.determinePoints(value))?.colour;

            return (
              <button
                key={i}
                className="numble-button"
                data-prime={isPrime(value)}
                data-shape={props.gamemodeSettings.gridShape}
                data-picked={isPicked}
                data-team-number={pickedPins.find((x) => x.pinNumber === value)?.teamNumber}
                data-colour={colour}
                onClick={() => onClick(value)}
                disabled={isPicked || props.status !== "dice-rolled-awaiting-pick"}
              >
                {value}
              </button>
            );
          } else if (props.gamemodeSettings.gridShape === ("hexagon" as numbleGridShape)) {
            const value = rowInformation?.values[i];

            if (!value) {
              return;
            }

            const isPicked = pickedPins.map((x) => x.pinNumber).includes(value);
            const colour = pointColourInformation.find((x) => x.points === props.determinePoints(value))?.colour;

            return (
              <button
                key={i}
                className="numble-button"
                data-prime={isPrime(value)}
                data-shape={props.gamemodeSettings.gridShape}
                data-picked={isPicked}
                data-team-number={pickedPins.find((x) => x.pinNumber === value)?.teamNumber}
                data-colour={colour}
                onClick={() => onClick(value)}
                disabled={isPicked || props.status !== "dice-rolled-awaiting-pick"}
              >
                <span className="top"></span>
                <span className="middle">{value}</span>
                <span className="bottom"></span>
              </button>
            );
          }
        })}
      </div>
    );
  }

  /**
   *
   * @returns
   */
  function populateGrid() {
    var Grid = [];

    const rowLength = Math.sqrt(props.gamemodeSettings.gridSize);

    // Start with higher value rows (so that they are rendered first, at the top of the grid)
    for (let i = rowLength; i >= 1; i--) {
      Grid.push(populateRow(rowLength, i));
    }
    return Grid;
  }

  /**
   *
   * @returns
   */
  function displayPinScores() {
    const pinScores = [];
    const pointColourMappings = props.determinePointColourMappings();

    // Create read-only numble pin of each colour with text of how many points it awards
    for (const row of pointColourMappings) {
      pinScores.push(
        <button
          key={row.colour}
          className="numble-button-display"
          data-prime={false}
          data-picked={false}
          data-colour={row.colour}
          disabled={false}
        >
          {row.points}
        </button>
      );
    }

    // Use the last/highest row colour to show prime numble pin
    const lastPointColourMapping = pointColourMappings[pointColourMappings.length - 1];

    // Create a prime numble pin (a pin with a border) to show it awards double points
    pinScores.push(
      <button
        key={"prime-read-only"}
        className="numble-button-display"
        data-prime={true}
        data-picked={false}
        data-colour={lastPointColourMapping.colour}
        disabled={false}
      >
        {lastPointColourMapping.points * 2}
      </button>
    );

    return pinScores;
  }

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

  function displayOutcome() {
    if (isGameInProgress()) {
      return;
    }

    // Singleplayer
    if (props.gamemodeSettings.numTeams === 1) {
      const finalScore = totalPoints[0].total;

      if (props.status === "game-over-incorrect-tile") {
        // Can only end with this status in singleplayer
        return (
          <MessageNotification type="error">
            <strong>Game over</strong>
            <br />
            Incorrect pin
            <br />
            Final Score: {finalScore ?? 0}
          </MessageNotification>
        );
      } else if (props.campaignConfig.isCampaignLevel && props.status === "game-over-target-score") {
        return (
          <MessageNotification type="success">
            <strong>Game Over</strong>
            <br />
            Reached target score of {props.campaignConfig.targetScore}
            <br />
            Final Score: {finalScore ?? 0}
          </MessageNotification>
        );
      } else if (props.status === "game-over-timer-ended") {
        return (
          <MessageNotification type="default">
            <strong>Game Over</strong>
            <br />
            No remaining time
            <br />
            Final Score: {finalScore ?? 0}
          </MessageNotification>
        );
      } else if (props.status === "game-over-no-more-pins") {
        return (
          <MessageNotification type="default">
            <strong>Game over</strong>
            <br />
            All pins picked
            <br />
            Final Score: {finalScore ?? 0}
          </MessageNotification>
        );
      }
    }
    // Multiplayer
    else if (props.gamemodeSettings.numTeams > 1) {
      // TODO: Better way of doing all this, reduce()?
      const teamScores = totalPoints.map((team) => team.total);
      const winningScore = Math.max(...teamScores);

      // There may be a draw and so more than one team number (and name)
      const winningTeamNumbers = totalPoints
        .filter((team) => team.total === winningScore)
        .map((team) => team.teamNumber);
      const winningTeamNames = teamNumberColourMappings
        .filter((team) => winningTeamNumbers.includes(team.teamNumber))
        .map((team) => team.teamName);

      const outcomeString =
        winningTeamNames.length === 1 ? `${winningTeamNames[0]} team wins!` : `Draw - ${winningTeamNames.join(", ")}`;

      if (props.status === "game-over-timer-ended") {
        return (
          <MessageNotification type="default">
            <strong>Game Over</strong>
            <br />
            No remaining time
            <br />
            {outcomeString}
            <br />
            {totalPoints.map((teamPoints) => (
              <>
                <br></br>
                <>{`${teamNumberColourMappings.find((x) => x.teamNumber === teamPoints.teamNumber)?.teamName}: ${
                  totalPoints.find((x) => x.teamNumber === teamPoints.teamNumber)?.total
                }`}</>
              </>
            ))}
          </MessageNotification>
        );
      } else if (props.status === "game-over-no-more-pins") {
        return (
          <MessageNotification type="default">
            <strong>Game Over</strong>
            <br />
            All pins picked
            <br />
            {outcomeString}
            <br />
            {totalPoints.map((teamPoints) => (
              <>
                <br></br>
                <>{`${teamNumberColourMappings.find((x) => x.teamNumber === teamPoints.teamNumber)?.teamName}: ${
                  totalPoints.find((x) => x.teamNumber === teamPoints.teamNumber)?.total
                }`}</>
              </>
            ))}
          </MessageNotification>
        );
      }
    }
  }

  function ResetGame() {
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
    setTotalPoints(initialScores);
    // First team is next to play
    props.setCurrentTeamNumber(0);
    // The quanity of dice (numDice) only updates after rolling
    rollDice();
  }

  function generateSettingsOptions(): React.ReactNode {
    return (
      <>
        <label>
          <input
            type="number"
            value={props.gamemodeSettings.numDice}
            min={2}
            max={6}
            onChange={(e) => {
              const newGamemodeSettings = {
                ...props.gamemodeSettings,
                numDice: e.target.valueAsNumber,
              };
              props.updateGamemodeSettings(newGamemodeSettings);
            }}
          ></input>
          Number of dice
        </label>

        <label>
          <input
            type="number"
            value={props.gamemodeSettings.diceMin}
            min={1}
            max={props.gamemodeSettings.diceMax}
            onChange={(e) => {
              const newGamemodeSettings = {
                ...props.gamemodeSettings,
                diceMin: e.target.valueAsNumber,
              };
              props.updateGamemodeSettings(newGamemodeSettings);
            }}
          ></input>
          Minimum dice value
        </label>

        <label>
          <input
            type="number"
            value={props.gamemodeSettings.diceMax}
            min={props.gamemodeSettings.diceMin}
            max={100}
            onChange={(e) => {
              const newGamemodeSettings = {
                ...props.gamemodeSettings,
                diceMax: e.target.valueAsNumber,
              };
              props.updateGamemodeSettings(newGamemodeSettings);
            }}
          ></input>
          Maximum dice value
        </label>

        <label>
          <select
            onChange={(e) => {
              const newGamemodeSettings = {
                ...props.gamemodeSettings,
                gridShape: e.target.value as numbleGridShape,
              };
              props.updateGamemodeSettings(newGamemodeSettings);
            }}
            className="numbleGridShape_input"
            name="numbleGridShape"
            value={props.gamemodeSettings.gridShape as numbleGridShape}
          >
            {numbleGridShapes.map((numbleGridShape) => (
              <option key={numbleGridShape} value={numbleGridShape}>
                {numbleGridShape}
              </option>
            ))}
          </select>
          Grid Shape
        </label>

        <label>
          <select
            onChange={(e) => {
              const newGamemodeSettings = {
                ...props.gamemodeSettings,
                gridSize: parseInt(e.target.value) as numbleGridSize,
              };
              props.updateGamemodeSettings(newGamemodeSettings);
            }}
            className="numbleGridSize_input"
            name="numbleGridSize"
            value={props.gamemodeSettings.gridSize as numbleGridSize}
          >
            {numbleGridSizes.map((numbleGridSize) => (
              <option key={numbleGridSize} value={numbleGridSize}>
                {numbleGridSize}
              </option>
            ))}
          </select>
          Grid Size
        </label>

        <label>
          <input
            type="number"
            value={props.gamemodeSettings.numTeams}
            min={1}
            max={4}
            onChange={(e) => {
              const newGamemodeSettings = {
                ...props.gamemodeSettings,
                numTeams: e.target.valueAsNumber,
              };
              props.updateGamemodeSettings(newGamemodeSettings);
            }}
          ></input>
          Number of teams
        </label>

        <label>
          <input
            checked={props.gamemodeSettings.isGameOverOnIncorrectPick}
            type="checkbox"
            onChange={() => {
              const newGamemodeSettings = {
                ...props.gamemodeSettings,
                isGameOverOnIncorrectPick: !props.gamemodeSettings.isGameOverOnIncorrectPick,
              };
              props.updateGamemodeSettings(newGamemodeSettings);
            }}
          ></input>
          Incorrect pick ends game
        </label>

        <>
          <label>
            <input
              checked={props.gamemodeSettings.guessTimerConfig.isTimed}
              type="checkbox"
              onChange={() => {
                const newGuessTimer:
                  | {
                      isTimed: true;
                      seconds: number;
                      timerBehaviour:
                        | { isGameOverWhenNoTimeLeft: true }
                        | { isGameOverWhenNoTimeLeft: false; pointsLost: number };
                    }
                  | { isTimed: false } =
                  // If currently timed, make the game not timed and vice versa
                  props.gamemodeSettings.guessTimerConfig.isTimed
                    ? { isTimed: false }
                    : {
                        isTimed: true,
                        seconds: mostRecentGuessTimerTotalSeconds,
                        timerBehaviour: { isGameOverWhenNoTimeLeft: false, pointsLost: 0 },
                      };
                const newGamemodeSettings = { ...props.gamemodeSettings, guessTimerConfig: newGuessTimer };
                props.updateGamemodeSettings(newGamemodeSettings);
              }}
            ></input>
            Guess Timer
          </label>
          {props.gamemodeSettings.guessTimerConfig.isTimed && (
            <>
              <label>
                <input
                  type="number"
                  value={props.gamemodeSettings.guessTimerConfig.seconds}
                  min={5}
                  max={120}
                  step={5}
                  onChange={(e) => {
                    props.updateRemainingGuessTimerSeconds(e.target.valueAsNumber);
                    setMostRecentGuessTimerTotalSeconds(e.target.valueAsNumber);
                    const newGuessTimer = {
                      ...props.gamemodeSettings.guessTimerConfig,
                      seconds: e.target.valueAsNumber,
                    };
                    const newGamemodeSettings = {
                      ...props.gamemodeSettings,
                      guessTimerConfig: newGuessTimer,
                    };
                    props.updateGamemodeSettings(newGamemodeSettings);
                  }}
                ></input>
                Seconds
              </label>

              <label>
                <input
                  checked={props.gamemodeSettings.guessTimerConfig.timerBehaviour.isGameOverWhenNoTimeLeft}
                  type="checkbox"
                  onChange={() => {
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
                  }}
                ></input>
                Guess timer ends game
              </label>

              {!props.gamemodeSettings.guessTimerConfig.timerBehaviour.isGameOverWhenNoTimeLeft && (
                <label>
                  <input
                    type="number"
                    value={props.gamemodeSettings.guessTimerConfig.timerBehaviour.pointsLost}
                    min={0}
                    max={100}
                    step={5}
                    onChange={(e) => {
                      const newGuessTimer = {
                        ...props.gamemodeSettings.guessTimerConfig,
                        timerBehaviour: { isGameOverWhenNoTimeLeft: false, pointsLost: e.target.valueAsNumber },
                      };
                      const newGamemodeSettings = {
                        ...props.gamemodeSettings,
                        guessTimerConfig: newGuessTimer,
                      };
                      props.updateGamemodeSettings(newGamemodeSettings);
                    }}
                  ></input>
                  Points lost
                </label>
              )}
            </>
          )}
        </>

        <>
          <label>
            <input
              checked={props.gamemodeSettings.timerConfig.isTimed}
              type="checkbox"
              onChange={() => {
                // If currently timed, on change, make the game not timed and vice versa
                const newTimer: { isTimed: true; seconds: number } | { isTimed: false } = props.gamemodeSettings
                  .timerConfig.isTimed
                  ? { isTimed: false }
                  : { isTimed: true, seconds: mostRecentTotalSeconds };
                const newGamemodeSettings = { ...props.gamemodeSettings, timerConfig: newTimer };
                props.updateGamemodeSettings(newGamemodeSettings);
              }}
            ></input>
            Timer
          </label>
          {props.gamemodeSettings.timerConfig.isTimed && (
            <label>
              <input
                type="number"
                value={props.gamemodeSettings.timerConfig.seconds}
                min={30}
                max={1200}
                step={10}
                onChange={(e) => {
                  // Set all teams' remaining and total time left to this new value
                  const newTeamTimers = props.teamTimers.map((teamTimerInfo) => {
                    return {
                      ...teamTimerInfo,
                      remainingSeconds: e.target.valueAsNumber,
                      totalSeconds: e.target.valueAsNumber,
                    };
                  });
                  props.updateTeamTimers(newTeamTimers);

                  setMostRecentTotalSeconds(e.target.valueAsNumber);

                  const newGamemodeSettings = {
                    ...props.gamemodeSettings,
                    timerConfig: { isTimed: true, seconds: e.target.valueAsNumber },
                  };
                  props.updateGamemodeSettings(newGamemodeSettings);
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
      className="App"
      style={{ backgroundImage: `url(${props.theme.backgroundImageSrc})`, backgroundSize: "100% 100%" }}
    >
      <div>{displayOutcome()}</div>

      <div>
        {!isGameInProgress() && (
          <Button
            mode="accept"
            settings={props.settings}
            onClick={() => ResetGame()}
            additionalProps={{ autoFocus: true }}
          >
            {props.campaignConfig.isCampaignLevel ? LEVEL_FINISHING_TEXT : "Restart"}
          </Button>
        )}
      </div>

      {!props.campaignConfig.isCampaignLevel && (
        <div className="gamemodeSettings">
          <GamemodeSettingsMenu>{generateSettingsOptions()}</GamemodeSettingsMenu>
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

      <div>
        {props.gamemodeSettings.guessTimerConfig.isTimed && (
          <ProgressBar
            progress={props.remainingGuessTimerSeconds}
            total={props.gamemodeSettings.guessTimerConfig.seconds}
            display={{ type: "transition", colorTransition: GreenToRedColorTransition }}
          ></ProgressBar>
        )}
      </div>

      <div className="numble-grid" data-shape={props.gamemodeSettings.gridShape}>
        {populateGrid()}
      </div>

      <div className="numble-score-wrapper">
        <div className="teams-info-wrapper">
          {totalPoints.map((teamPoints) => (
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
                  {totalPoints.find((x) => x.teamNumber === teamPoints.teamNumber)?.total}
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
        <div className="numble-pin-scores">{displayPinScores()}</div>
      </div>
    </div>
  );
};

export default Numble;
