import {
  hexagon100_pointColourRanges,
  hexagon25_pointColourRanges,
  hexagon64_pointColourRanges,
} from "../Data/NumbleHexagonPointColourRanges";
import {
  square25_pointColourRanges,
  square64_pointColourRanges,
  square100_pointColourRanges,
} from "../Data/NumbleSquarePointColourRanges";
import { numbleGridShape, numbleGridSize } from "../Pages/NumbleConfig";

export type NumbleColour =
  | "orange"
  | "light-blue"
  | "yellow"
  | "dark-blue"
  | "pink"
  | "green"
  | "blue-gray"
  | "purple"
  | "dark-orange"
  | "red";

/*
The pin number that starts the range
The pin number that ends of the range
How many points is a pin in this range worth?
What colour are all the pins in this range?
*/
export type NumblePointColourRange = { start: number; end: number; points: number; colour: NumbleColour };

export function getNumblePointColourMapping(
  gridShape: numbleGridShape,
  gridSize: numbleGridSize
): NumblePointColourRange[] {
  switch (gridShape) {
    case "hexagon": {
      switch (gridSize) {
        case 25: {
          return hexagon25_pointColourRanges;
        }

        case 64: {
          return hexagon64_pointColourRanges;
        }

        case 100: {
          return hexagon100_pointColourRanges;
        }

        default: {
          return hexagon100_pointColourRanges;
        }
      }
    }

    case "square": {
      switch (gridSize) {
        case 25: {
          return square25_pointColourRanges;
        }

        case 64: {
          return square64_pointColourRanges;
        }

        case 100: {
          return square100_pointColourRanges;
        }

        default: {
          return square100_pointColourRanges;
        }
      }
    }
  }
}
