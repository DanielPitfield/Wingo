import { numbleGridShape, numbleGridSize } from "../Pages/NumbleConfig";

export type NumbleRowValues = { rowNumber: number; values: number[] };

const hexagon25 = [
  { rowNumber: 1, values: [1, 3, 6, 10, 15] },
  { rowNumber: 2, values: [2, 5, 9, 14, 19] },
  { rowNumber: 3, values: [4, 8, 13, 18, 22] },
  { rowNumber: 4, values: [7, 12, 17, 21, 24] },
  { rowNumber: 5, values: [11, 16, 20, 23, 25] },
];

const hexagon64 = [
  { rowNumber: 1, values: [1, 3, 6, 10, 15, 21, 28, 36] },
  { rowNumber: 2, values: [2, 5, 9, 14, 20, 27, 35, 43] },
  { rowNumber: 3, values: [4, 8, 13, 19, 26, 34, 42, 49] },
  { rowNumber: 4, values: [7, 12, 18, 25, 33, 41, 48, 54] },
  { rowNumber: 5, values: [11, 17, 24, 32, 40, 47, 53, 58] },
  { rowNumber: 6, values: [16, 23, 31, 39, 46, 52, 57, 61] },
  { rowNumber: 7, values: [22, 30, 38, 45, 51, 56, 60, 63] },
  { rowNumber: 8, values: [29, 37, 44, 50, 55, 59, 62, 64] },
];

const hexagon100 = [
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

function getSquareRowValues(gridSize: numbleGridSize): NumbleRowValues[] {
  // Because the shape is square, the row length is the square root of the gridSize
  const rowLength = Math.sqrt(gridSize);

  // The row length is also the same as the number of rows (again due to the shape being square)
  const squareRowValues = Array.from({ length: rowLength }).map((_, rowIndex) => {
    // The values for a specific row
    const rowValues = Array.from({ length: rowLength }, (_, i) => (rowIndex * rowLength) + i + 1);
    return { rowNumber: rowIndex + 1, values: rowValues };
  });

  console.log(squareRowValues);
  return squareRowValues;
}

// Returns which pin values are on which rows
export function getNumbleRowValues(gridShape: numbleGridShape, gridSize: numbleGridSize): NumbleRowValues[] {
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
      return getSquareRowValues(gridSize);
    }
  }
}
