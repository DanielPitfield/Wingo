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

const hexagon25: NumblePointColourRange[] = [
  { start: 1, end: 6, points: 20, colour: "orange" },
  { start: 7, end: 10, points: 50, colour: "yellow" },
  { start: 11, end: 15, points: 100, colour: "dark-blue" },
  { start: 16, end: 19, points: 200, colour: "green" },
  { start: 20, end: 22, points: 300, colour: "purple" },
  { start: 23, end: 25, points: 500, colour: "red" },
];

const hexagon64: NumblePointColourRange[] = [
  { start: 1, end: 10, points: 10, colour: "orange" },
  { start: 11, end: 21, points: 20, colour: "yellow" },
  { start: 22, end: 36, points: 50, colour: "dark-blue" },
  { start: 37, end: 49, points: 100, colour: "green" },
  { start: 50, end: 58, points: 250, colour: "purple" },
  { start: 59, end: 64, points: 500, colour: "red" },
];

const hexagon100: NumblePointColourRange[] = [
  { start: 1, end: 15, points: 10, colour: "orange" },
  { start: 16, end: 28, points: 20, colour: "light-blue" },
  { start: 29, end: 45, points: 50, colour: "yellow" },
  { start: 46, end: 64, points: 100, colour: "dark-blue" },
  { start: 65, end: 79, points: 200, colour: "green" },
  { start: 80, end: 90, points: 300, colour: "purple" },
  { start: 91, end: 100, points: 500, colour: "red" },
];

const square25: NumblePointColourRange[] = [
  { start: 1, end: 5, points: 50, colour: "yellow" },
  { start: 6, end: 10, points: 100, colour: "dark-blue" },
  { start: 11, end: 15, points: 200, colour: "green" },
  { start: 16, end: 20, points: 300, colour: "purple" },
  { start: 21, end: 25, points: 500, colour: "red" },
];

const square64: NumblePointColourRange[] = [
  { start: 1, end: 8, points: 10, colour: "orange" },
  { start: 9, end: 16, points: 20, colour: "light-blue" },
  { start: 17, end: 24, points: 50, colour: "yellow" },
  { start: 25, end: 32, points: 100, colour: "dark-blue" },
  { start: 33, end: 40, points: 150, colour: "pink" },
  { start: 41, end: 48, points: 200, colour: "green" },
  { start: 49, end: 56, points: 300, colour: "purple" },
  { start: 57, end: 64, points: 500, colour: "red" },
];

const square100: NumblePointColourRange[] = [
  { start: 1, end: 10, points: 10, colour: "orange" },
  { start: 11, end: 20, points: 20, colour: "light-blue" },
  { start: 21, end: 30, points: 50, colour: "yellow" },
  { start: 31, end: 40, points: 100, colour: "dark-blue" },
  { start: 41, end: 50, points: 150, colour: "pink" },
  { start: 51, end: 60, points: 200, colour: "green" },
  { start: 61, end: 70, points: 250, colour: "blue-gray" },
  { start: 71, end: 80, points: 300, colour: "purple" },
  { start: 81, end: 90, points: 400, colour: "dark-orange" },
  { start: 91, end: 100, points: 500, colour: "red" },
];

export function getNumblePointColourMapping(gridShape: numbleGridShape, gridSize: numbleGridSize): NumblePointColourRange[] {
  switch (gridShape) {
    case "hexagon": {
      switch (gridSize) {
        case 25: {
          return hexagon25;
        }

        case 64: {
          return hexagon64;
        }

        case 100: {
          return hexagon100;
        }

        default: {
          return hexagon100;
        }
      }
    }

    case "square": {
      switch (gridSize) {
        case 25: {
          return square25;
        }

        case 64: {
          return square64;
        }

        case 100: {
          return square100;
        }

        default: {
          return square100;
        }
      }
    }
  }
}
