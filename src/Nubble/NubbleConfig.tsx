import React from "react";
import "../index.scss";
import { SettingsData } from "../SaveData";
import { Theme } from "../Themes";
import { square_100_adj, square_25_adj, square_64_adj } from "./adjacentMappings";
import Nubble from "./Nubble";
import {
  parallelogram_100,
  parallelogram_25,
  parallelogram_64,
  square_100,
  square_25,
  square_64,
} from "./pointColourMappings";

interface Props {
  theme: Theme;
  numDice: number;
  diceMin: number;
  diceMax: number;
  gridSize: 25 | 64 | 100;
  gridShape: "square" | "hexagon";
  numTeams: number;
  timeLengthMins: number;
  settings: SettingsData;
  gameOverOnIncorrectPick?: boolean;
}

const NubbleConfig: React.FC<Props> = (props) => {
  function determinePointColourMappings(): { points: number; colour: string }[] {
    switch (props.gridShape) {
      case "hexagon": {
        switch (props.gridSize) {
          case 100: {
            return parallelogram_100;
          }
          case 64: {
            return parallelogram_64;
          }
          case 25: {
            return parallelogram_25;
          }
        }
      }
      case "square": {
        switch (props.gridSize) {
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

  function determineAdjacentMappings(): { pin: number; adjacent_pins: number[] }[] {
    switch (props.gridShape) {
      case "hexagon": {
        switch (props.gridSize) {
          case 100: {
            // TODO: Use square adjacent mappings for now (change to its own adjacency)
            return square_100_adj;
          }
          case 64: {
            return square_64_adj;
          }
          case 25: {
            return square_25_adj;
          }
        }
      }
      case "square": {
        switch (props.gridSize) {
          case 100: {
            return square_100_adj;
          }
          case 64: {
            return square_64_adj;
          }
          case 25: {
            return square_25_adj;
          }
        }
      }
    }
  }

  function determinePoints(number: number): number {
    switch (props.gridShape) {
      case "hexagon": {
        switch (props.gridSize) {
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
        switch (props.gridSize) {
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

    throw new Error(`Unexpected number for grid size: ${props.gridSize} NUmber:  ${number}`);
  }

  function determineRowValues() {
    switch (props.gridSize) {
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
          { rowNumber: 6, values: [16, 23, 31, 29, 46, 52, 57, 61] },
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
          { rowNumber: 9, values: [37, 47, 57, 66, 74, 81, 87, 92, 97, 99] },
          { rowNumber: 10, values: [46, 56, 65, 73, 80, 86, 91, 95, 98, 100] },
        ];
      }
    }
  }

  return (
    <Nubble
      theme={props.theme}
      numDice={props.numDice}
      diceMin={props.diceMin}
      diceMax={props.diceMax}
      gridSize={props.gridSize}
      gridShape={props.gridShape}
      determineRowValues={determineRowValues}
      determinePoints={determinePoints}
      determinePointColourMappings={determinePointColourMappings}
      determineAdjacentMappings={determineAdjacentMappings}
      numTeams={props.numTeams}
      timeLengthMins={props.timeLengthMins}
      gameOverOnIncorrectPick={props.gameOverOnIncorrectPick}
      settings={props.settings}
    ></Nubble>
  );
};

export default NubbleConfig;
