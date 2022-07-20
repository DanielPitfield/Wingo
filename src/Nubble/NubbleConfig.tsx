import React, { useState } from "react";
import { Page } from "../App";
import "../index.scss";
import { SaveData, SettingsData } from "../SaveData";
import { Theme } from "../Themes";
import Nubble from "./Nubble";
import { hexagon_100, hexagon_64, hexagon_25, square_100, square_64, square_25 } from "./pointColourMappings";

export const nubbleGridShapes = ["square", "hexagon"] as const;
export type nubbleGridShape = typeof nubbleGridShapes[number];

export const nubbleGridSizes = [25, 64, 100] as const;
export type nubbleGridSize = typeof nubbleGridSizes[number];

export const DEFAULT_NUBBLE_GUESS_TIMER_VALUE = 20;
export const DEFAULT_NUBBLE_TIMER_VALUE = 600;

export interface NubbleConfigProps {
  page: Page;
  theme: Theme;

  campaignConfig:
    | {
        isCampaignLevel: true;
        // What score must be achieved to pass the campaign level?
        targetScore: number;
        // How many pins can be selected before game ends?
        maxNumSelectedPins: number;
      }
    | { isCampaignLevel: false };

  gamemodeSettings?: {
    numDice: number;
    // The lowest value which can be the number shown on a dice
    diceMin: number;
    diceMax: number;
    gridShape: nubbleGridShape;
    gridSize: nubbleGridSize;
    numTeams: number;
    // When a number which can't be made with the dice numbers is picked, does the game end?
    isGameOverOnIncorrectPick: boolean;
    // How long to make a guess after the dice have been rolled?
    guessTimerConfig:
      | {
          isTimed: true;
          seconds: number;
          // Can specify whether game ends when this guess timer runs out or if just some points are lost
          timerBehaviour: { isGameOverWhenNoTimeLeft: true } | { isGameOverWhenNoTimeLeft: false; pointsLost: number };
        }
      | { isTimed: false };
    // How long overall until the game ends?
    timerConfig: { isTimed: true; seconds: number } | { isTimed: false };
  };

  settings: SettingsData;
}

export type HexagonPinAdjacency = {
  leftAbove: number | null;
  rightAbove: number | null;
  leftBelow: number | null;
  rightBelow: number | null;
  left: number | null;
  right: number | null;
};

export function getNextTeamNumberWithRemainingTime(
  currentTeamNumber: number,
  teamTimers: { teamNumber: number; remainingSeconds: number; totalSeconds: number }[]
) {
  /*
  Start the order with team numbers after the current team number
  Then go back to zero and complete the order with team numbers up to the current team number
  */
  const teamsAfter = teamTimers.filter((team) => team.remainingSeconds > 0 && team.teamNumber > currentTeamNumber);
  const teamsBefore = teamTimers.filter((team) => team.remainingSeconds > 0 && team.teamNumber < currentTeamNumber);
  const teamNumbersOrder = teamsAfter.concat(teamsBefore).map((x) => x.teamNumber);

  // This value may be needed in the case that the current team is the only team with time left
  const currentTeamRemainingTime = teamTimers.find((team) => team.teamNumber === currentTeamNumber)?.remainingSeconds;

  // Choose the next team (the first in the new determined order)
  if (teamNumbersOrder.length >= 1) {
    return teamNumbersOrder[0];
  }
  // No other team has time left, but the current team does
  else if (currentTeamRemainingTime !== undefined && currentTeamRemainingTime > 0) {
    return currentTeamNumber;
  }
  // No team has time left
  else {
    return null;
  }
}

const NubbleConfig: React.FC<NubbleConfigProps> = (props) => {
  const DEFAULT_NUM_DICE = 4;
  const DEFAULT_DICE_MIN = 1;
  const DEFAULT_DICE_MAX = 6;
  const DEFAULT_GRID_SHAPE = "hexagon" as nubbleGridShape;
  const DEFAULT_GRID_SIZE = 100;
  const DEFAULT_NUM_TEAMS = 1;
  const MAX_NUM_TEAMS = 4;

  const defaultGamemodeSettings = {
    numDice: props.gamemodeSettings?.numDice ?? DEFAULT_NUM_DICE,
    diceMin: props.gamemodeSettings?.diceMin ?? DEFAULT_DICE_MIN,
    diceMax: props.gamemodeSettings?.diceMax ?? DEFAULT_DICE_MAX,
    gridShape: props.gamemodeSettings?.gridShape ?? DEFAULT_GRID_SHAPE,
    gridSize: props.gamemodeSettings?.gridSize ?? DEFAULT_GRID_SIZE,
    numTeams: props.campaignConfig.isCampaignLevel
      ? 1
      : Math.min(MAX_NUM_TEAMS, props.gamemodeSettings?.numTeams ?? DEFAULT_NUM_TEAMS),
    isGameOverOnIncorrectPick: props.gamemodeSettings?.isGameOverOnIncorrectPick ?? false,
    guessTimerConfig: props.gamemodeSettings?.guessTimerConfig ?? { isTimed: false },
    timerConfig: props.gamemodeSettings?.timerConfig ?? { isTimed: false },
  };

  const [gamemodeSettings, setGamemodeSettings] = useState<{
    numDice: number;
    diceMin: number;
    diceMax: number;
    gridShape: nubbleGridShape;
    gridSize: nubbleGridSize;
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
  }>(defaultGamemodeSettings);

  // The team number of the team that is choosing a pin next
  const [currentTeamNumber, setCurrentTeamNumber] = useState(0);

  const [status, setStatus] = useState<
    | "dice-rolling"
    | "dice-rolled-awaiting-pick"
    | "picked-awaiting-dice-roll"
    | "game-over-incorrect-tile"
    | "game-over-target-score"
    | "game-over-no-more-pins"
    | "game-over-timer-ended"
  >("dice-rolled-awaiting-pick");

  // Guess Timer
  const [remainingGuessTimerSeconds, setRemainingGuessTimerSeconds] = useState(
    props.gamemodeSettings?.guessTimerConfig.isTimed === true
      ? props.gamemodeSettings?.guessTimerConfig.seconds
      : DEFAULT_NUBBLE_GUESS_TIMER_VALUE
  );

  React.useEffect(() => {
    if (!gamemodeSettings.guessTimerConfig.isTimed) {
      return;
    }

    const guessTimer = setInterval(() => {
      if (remainingGuessTimerSeconds > 0) {
        setRemainingGuessTimerSeconds(remainingGuessTimerSeconds - 1);
      }
    }, 1000);
    return () => {
      clearInterval(guessTimer);
    };
  }, [setRemainingGuessTimerSeconds, remainingGuessTimerSeconds, gamemodeSettings.guessTimerConfig.isTimed]);

  function updateRemainingGuessTimerSeconds(newGuessTimerSeconds: number) {
    setRemainingGuessTimerSeconds(newGuessTimerSeconds);
  }

  // Game Timer
  const INITIAL_TIMER_VALUE =
    props.gamemodeSettings?.timerConfig?.isTimed === true
      ? props.gamemodeSettings?.timerConfig.seconds
      : DEFAULT_NUBBLE_TIMER_VALUE;
  // Each team starts with the same initial amount of time
  const initialTeamTimers = Array.from({ length: gamemodeSettings.numTeams }).map((_, i) => ({
    teamNumber: i,
    remainingSeconds: INITIAL_TIMER_VALUE,
    totalSeconds: INITIAL_TIMER_VALUE,
  }));
  const [teamTimers, setTeamTimers] = useState(initialTeamTimers);

  React.useEffect(() => {
    if (!gamemodeSettings.timerConfig.isTimed) {
      return;
    }

    // Only decrease time when dice have been rolled and a pick must be made
    if (status !== "dice-rolled-awaiting-pick") {
      return;
    }

    // Run out of time whilst making guess
    if (teamTimers[currentTeamNumber].remainingSeconds <= 0) {
      // Next team's turn
      const newCurrentTeamNumber = getNextTeamNumberWithRemainingTime(currentTeamNumber, teamTimers);
      if (newCurrentTeamNumber !== null) {
        setCurrentTeamNumber(newCurrentTeamNumber);
        // Next team rolls their own dice values
        setStatus("picked-awaiting-dice-roll");
      }
    }

    const timer = setInterval(() => {
      // The team to play next has time left
      if (teamTimers[currentTeamNumber].remainingSeconds > 0) {
        // Start decrementing their remaining time
        const newTeamTimers = teamTimers.map((teamTimerInfo) => {
          if (teamTimerInfo.teamNumber === currentTeamNumber) {
            return { ...teamTimerInfo, remainingSeconds: teamTimerInfo.remainingSeconds - 1 };
          }
          return teamTimerInfo;
        });
        setTeamTimers(newTeamTimers);
      }
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [setTeamTimers, teamTimers, gamemodeSettings.timerConfig.isTimed, status]);

  React.useEffect(() => {
    // Save the latest gamemode settings
    if (!props.campaignConfig.isCampaignLevel) {
      SaveData.setNubbleConfigGamemodeSettings(gamemodeSettings);
    }
  }, [gamemodeSettings]);

  function updateTeamTimers(
    newTeamTimers: {
      teamNumber: number;
      remainingSeconds: number;
      totalSeconds: number;
    }[]
  ) {
    setTeamTimers(newTeamTimers);
  }

  function updateGamemodeSettings(newGamemodeSettings: {
    numDice: number;
    diceMin: number;
    diceMax: number;
    gridShape: "square" | "hexagon";
    gridSize: 25 | 64 | 100;
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
  }) {
    setGamemodeSettings(newGamemodeSettings);
  }

  // Returns which pin values are on which rows for hexagon grid shape
  function determineHexagonRowValues() {
    switch (gamemodeSettings.gridSize) {
      case 25: {
        return [
          { rowNumber: 1, values: [1, 3, 6, 10, 15] },
          { rowNumber: 2, values: [2, 5, 9, 14, 19] },
          { rowNumber: 3, values: [4, 8, 13, 18, 22] },
          { rowNumber: 4, values: [7, 12, 17, 21, 24] },
          { rowNumber: 5, values: [11, 16, 20, 23, 25] },
        ];
      }
      case 64: {
        return [
          { rowNumber: 1, values: [1, 3, 6, 10, 15, 21, 28, 36] },
          { rowNumber: 2, values: [2, 5, 9, 14, 20, 27, 35, 43] },
          { rowNumber: 3, values: [4, 8, 13, 19, 26, 34, 42, 49] },
          { rowNumber: 4, values: [7, 12, 18, 25, 33, 41, 48, 54] },
          { rowNumber: 5, values: [11, 17, 24, 32, 40, 47, 53, 58] },
          { rowNumber: 6, values: [16, 23, 31, 39, 46, 52, 57, 61] },
          { rowNumber: 7, values: [22, 30, 38, 45, 51, 56, 60, 63] },
          { rowNumber: 8, values: [29, 37, 44, 50, 55, 59, 62, 64] },
        ];
      }
      case 100: {
        return [
          { rowNumber: 1, values: [1, 3, 6, 10, 15, 21, 28, 36, 45, 55] },
          { rowNumber: 2, values: [2, 5, 9, 14, 20, 27, 35, 44, 54, 64] },
          { rowNumber: 3, values: [4, 8, 13, 19, 26, 34, 43, 53, 63, 72] },
          { rowNumber: 4, values: [7, 12, 18, 25, 33, 42, 52, 62, 71, 79] },
          { rowNumber: 5, values: [11, 17, 24, 32, 41, 51, 61, 70, 78, 85] },
          { rowNumber: 6, values: [16, 23, 31, 40, 50, 60, 69, 77, 84, 90] },
          { rowNumber: 7, values: [22, 30, 39, 49, 59, 68, 76, 83, 89, 94] },
          { rowNumber: 8, values: [29, 38, 48, 58, 67, 75, 82, 88, 93, 97] },
          { rowNumber: 9, values: [37, 47, 57, 66, 74, 81, 87, 92, 96, 99] },
          { rowNumber: 10, values: [46, 56, 65, 73, 80, 86, 91, 95, 98, 100] },
        ];
      }
    }
  }

  // Returns the number of points awarded for each colour of pin (imported from pointColourMappings.ts)
  function determinePointColourMappings(): { points: number; colour: string }[] {
    switch (gamemodeSettings.gridShape) {
      case "hexagon": {
        switch (gamemodeSettings.gridSize) {
          case 100: {
            return hexagon_100;
          }
          case 64: {
            return hexagon_64;
          }
          case 25: {
            return hexagon_25;
          }
        }
      }
      case "square": {
        switch (gamemodeSettings.gridSize) {
          case 100: {
            return square_100;
          }
          case 64: {
            return square_64;
          }
          case 25: {
            return square_25;
          }
        }
      }
    }
  }

  // Returns the number of points awarded for a selected pin
  function determinePoints(number: number): number {
    switch (gamemodeSettings.gridShape) {
      case "hexagon": {
        switch (gamemodeSettings.gridSize) {
          case 25: {
            if (number >= 1 && number <= 6) {
              return 20;
            }

            if (number >= 7 && number <= 10) {
              return 50;
            }

            if (number >= 11 && number <= 15) {
              return 100;
            }

            if (number >= 16 && number <= 19) {
              return 200;
            }

            if (number >= 20 && number <= 22) {
              return 300;
            }

            if (number >= 23 && number <= 25) {
              return 500;
            }
            break;
          }

          case 64: {
            if (number >= 1 && number <= 10) {
              return 10;
            }

            if (number >= 11 && number <= 21) {
              return 20;
            }

            if (number >= 22 && number <= 36) {
              return 50;
            }

            if (number >= 37 && number <= 49) {
              return 100;
            }

            if (number >= 50 && number <= 58) {
              return 250;
            }

            if (number >= 59 && number <= 64) {
              return 500;
            }
            break;
          }

          case 100: {
            if (number >= 1 && number <= 15) {
              return 10;
            }

            if (number >= 16 && number <= 28) {
              return 20;
            }

            if (number >= 29 && number <= 45) {
              return 50;
            }

            if (number >= 46 && number <= 64) {
              return 100;
            }

            if (number >= 65 && number <= 79) {
              return 200;
            }

            if (number >= 80 && number <= 90) {
              return 300;
            }

            if (number >= 91 && number <= 100) {
              return 500;
            }
            break;
          }
        }
        break;
      }
      case "square": {
        switch (gamemodeSettings.gridSize) {
          case 25: {
            if (number >= 1 && number <= 5) {
              return 50;
            }

            if (number >= 5 && number <= 10) {
              return 100;
            }

            if (number >= 11 && number <= 15) {
              return 200;
            }

            if (number >= 16 && number <= 20) {
              return 300;
            }

            if (number >= 21 && number <= 25) {
              return 500;
            }
            break;
          }

          case 64: {
            if (number >= 1 && number <= 8) {
              return 10;
            }

            if (number >= 9 && number <= 16) {
              return 20;
            }

            if (number >= 17 && number <= 24) {
              return 50;
            }

            if (number >= 25 && number <= 32) {
              return 100;
            }

            if (number >= 33 && number <= 40) {
              return 150;
            }

            if (number >= 41 && number <= 48) {
              return 200;
            }

            if (number >= 49 && number <= 56) {
              return 300;
            }

            if (number >= 57 && number <= 64) {
              return 500;
            }
            break;
          }

          case 100: {
            if (number >= 1 && number <= 10) {
              return 10;
            }

            if (number >= 11 && number <= 20) {
              return 20;
            }

            if (number >= 21 && number <= 30) {
              return 50;
            }

            if (number >= 31 && number <= 40) {
              return 100;
            }

            if (number >= 41 && number <= 50) {
              return 150;
            }

            if (number >= 51 && number <= 60) {
              return 200;
            }

            if (number >= 61 && number <= 70) {
              return 250;
            }

            if (number >= 71 && number <= 80) {
              return 300;
            }

            if (number >= 81 && number <= 90) {
              return 400;
            }

            if (number >= 91 && number <= 100) {
              return 500;
            }
            break;
          }
        }
      }
    }

    throw new Error(`Unexpected number for grid size: ${gamemodeSettings.gridSize} Number:  ${number}`);
  }

  const rowValues = determineHexagonRowValues();

  // Gets the adjacent pins of an individual pin (for hexagon grid shape)
  function getHexagonAdjacentPins(pin: number): HexagonPinAdjacency {
    // Information about the entire row (of the pin)
    const pinRow = rowValues.find((row) => row.values.includes(pin));

    if (!pinRow) {
      // No adjacent pins are able to be found
      return {
        leftAbove: null,
        rightAbove: null,
        leftBelow: null,
        rightBelow: null,
        left: null,
        right: null,
      } as HexagonPinAdjacency;
    }

    // Which row number has the pin?
    const pinRowNumber = pinRow.rowNumber;

    // How far along the row is the pin?
    const positionIndex = pinRow.values.findIndex((x) => x === pin);

    // A pin can have up to a maximum of 6 adjacent pins (2 above, 2 below, 1 left, 1 right)
    const leftAbove = rowValues.find((row) => row.rowNumber === pinRowNumber + 1)?.values[positionIndex - 1];
    const rightAbove = rowValues.find((row) => row.rowNumber === pinRowNumber + 1)?.values[positionIndex];
    const leftBelow = rowValues.find((row) => row.rowNumber === pinRowNumber - 1)?.values[positionIndex];
    const rightBelow = rowValues.find((row) => row.rowNumber === pinRowNumber - 1)?.values[positionIndex + 1];
    const left = rowValues.find((row) => row.rowNumber === pinRowNumber)?.values[positionIndex - 1];
    const right = rowValues.find((row) => row.rowNumber === pinRowNumber)?.values[positionIndex + 1];

    return {
      leftAbove: leftAbove || null,
      rightAbove: rightAbove || null,
      leftBelow: leftBelow || null,
      rightBelow: rightBelow || null,
      left: left || null,
      right: right || null,
    } as HexagonPinAdjacency;
  }

  // Gets the adjacent pins of an individual pin (for square grid shape)
  function getSquareAdjacentPins(pin: number, gridSize: number): number[] {
    let adjacentPins: number[] = [];

    const rowLength = Math.sqrt(gridSize);

    // Declare functions to add adjacent tiles in each of the four directions
    function addLeft() {
      adjacentPins.push(pin - 1);
    }

    function addRight() {
      adjacentPins.push(pin + 1);
    }

    function addTop() {
      adjacentPins.push(pin - rowLength);
    }

    function addBottom() {
      adjacentPins.push(pin + rowLength);
    }

    // Determine whereabouts the current pin places amongst the grid shape

    // Is the pin a corner of the grid?
    const topLeftCorner = pin === 1;
    const topRightCorner = pin === rowLength;
    const bottomLeftCorner = pin === rowLength * rowLength - rowLength;
    const bottomRightCorner = pin === rowLength * rowLength;

    // Is the pin along a border of the grid?
    const leftBorder = pin % rowLength === 1 && !topLeftCorner && !bottomLeftCorner;
    const rightBorder = pin % rowLength === 0 && !topRightCorner && !bottomRightCorner;
    const topBorder = pin > 1 && pin < rowLength;
    const bottomBorder = pin > rowLength * rowLength - rowLength && pin < rowLength * rowLength;

    // Start with the corners of the square
    if (topLeftCorner) {
      addRight();
      addBottom();
    } else if (topRightCorner) {
      addLeft();
      addBottom();
    } else if (bottomLeftCorner) {
      addRight();
      addTop();
    } else if (bottomRightCorner) {
      addLeft();
      addTop();
    }
    // Now each of the borders (excluding the corner pins)
    else if (leftBorder) {
      addRight();
      addTop();
      addBottom();
    } else if (rightBorder) {
      addLeft();
      addTop();
      addBottom();
    } else if (topBorder) {
      addLeft();
      addRight();
      addBottom();
    } else if (bottomBorder) {
      addLeft();
      addRight();
      addTop();
    }
    // Pin towards the middle of the square
    else {
      addLeft();
      addRight();
      addTop();
      addBottom();
    }

    // Safety check, remove any non-integers or values outside grid range
    adjacentPins = adjacentPins.filter((x) => x > 0 && x <= gridSize && Math.round(x) === x && x !== undefined);

    return adjacentPins;
  }

  // Returns the adjacent pins of every pin (for square grid shape)
  function determineSquareAdjacentMappings(): {
    pin: number;
    adjacent_pins: number[];
  }[] {
    return Array.from({ length: gamemodeSettings.gridSize }).map((_, i) => ({
      pin: i + 1,
      adjacent_pins: getSquareAdjacentPins(i + 1, gamemodeSettings.gridSize),
    }));
  }

  // Returns the adjacent pins of every pin (for hexagon grid shape)
  function determineHexagonAdjacentMappings(): {
    pin: number;
    adjacent_pins: HexagonPinAdjacency;
  }[] {
    return Array.from({ length: gamemodeSettings.gridSize }).map((_, i) => ({
      pin: i + 1,
      adjacent_pins: getHexagonAdjacentPins(i + 1),
    }));
  }

  return (
    <Nubble
      campaignConfig={props.campaignConfig}
      theme={props.theme}
      gamemodeSettings={gamemodeSettings}
      status={status}
      setStatus={setStatus}
      currentTeamNumber={currentTeamNumber}
      setCurrentTeamNumber={setCurrentTeamNumber}
      updateGamemodeSettings={updateGamemodeSettings}
      remainingGuessTimerSeconds={remainingGuessTimerSeconds}
      updateRemainingGuessTimerSeconds={updateRemainingGuessTimerSeconds}
      teamTimers={teamTimers}
      updateTeamTimers={updateTeamTimers}
      determineHexagonRowValues={determineHexagonRowValues}
      determinePoints={determinePoints}
      determinePointColourMappings={determinePointColourMappings}
      determineSquareAdjacentMappings={determineSquareAdjacentMappings}
      determineHexagonAdjacentMappings={determineHexagonAdjacentMappings}
      settings={props.settings}
    ></Nubble>
  );
};

export default NubbleConfig;
