import { hexagon25_rowValues, hexagon64_rowValues, hexagon100_rowValues } from "../Data/NumbleHexagonRowValues";
import { numbleGridShape, numbleGridSize } from "../Pages/NumbleConfig";

export type NumbleRowValues = { rowNumber: number; values: number[] };

const getSquareRowValues = (gridSize: numbleGridSize): NumbleRowValues[] => {
  // Because the shape is square, the row length is the square root of the gridSize
  const gridDimension = Math.sqrt(gridSize);

  // The row length is also the same as the number of rows (again due to the shape being square)
  return Array.from({ length: gridDimension }).map((_, rowIndex) => {
    // The values for a specific row
    const rowValues = Array.from({ length: gridDimension }, (_, i) => rowIndex * gridDimension + i + 1);
    return { rowNumber: rowIndex + 1, values: rowValues };
  });
};

// Returns which pin values are on which rows
export function getNumbleRowValues(gridShape: numbleGridShape, gridSize: numbleGridSize): NumbleRowValues[] {
  switch (gridShape) {
    case "hexagon": {
      switch (gridSize) {
        case 25: {
          return hexagon25_rowValues;
        }

        case 64: {
          return hexagon64_rowValues;
        }

        case 100: {
          return hexagon100_rowValues;
        }

        default: {
          return hexagon100_rowValues;
        }
      }
    }

    case "square": {
      return getSquareRowValues(gridSize);
    }
  }
}
