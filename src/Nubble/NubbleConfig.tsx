import React from "react";
import "../index.scss";
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
            // Use square adjacent mappings for now
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
  return (
    <Nubble
      theme={props.theme}
      numDice={props.numDice}
      diceMin={props.diceMin}
      diceMax={props.diceMax}
      gridSize={props.gridSize}
      gridShape={props.gridShape}
      determinePoints={determinePoints}
      determinePointColourMappings={determinePointColourMappings}
      determineAdjacentMappings={determineAdjacentMappings}
      numTeams={props.numTeams}
      timeLengthMins={props.timeLengthMins}
      gameOverOnIncorrectPick={props.gameOverOnIncorrectPick}
    ></Nubble>
  );
};

export default NubbleConfig;
