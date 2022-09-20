import { NumbleRowValues } from "./getNumbleRowValues";

export type HexagonPinAdjacency = {
  leftAbove: number | null;
  rightAbove: number | null;
  leftBelow: number | null;
  rightBelow: number | null;
  left: number | null;
  right: number | null;
};

// Gets the adjacent pins of an individual pin (for hexagon grid shape)
export function getHexagonAdjacentPins(pinNumber: number, rowValues: NumbleRowValues[]): HexagonPinAdjacency | null {
  // Information about the entire row (of the pin)
  const pinRow = rowValues.find((row) => row.values.includes(pinNumber));

  if (!pinRow) {
    return null;
  }

  // Which row is the pin on?
  const pinRowNumber = pinRow.rowNumber;

  // How far along the row is the pin?
  const positionIndex = pinRow.values.findIndex((x) => x === pinNumber);

  // A pin has 6 adjacent pins (2 above, 2 below, 1 left, 1 right)
  const leftAbove = rowValues.find((row) => row.rowNumber === pinRowNumber + 1)?.values[positionIndex - 1];
  const rightAbove = rowValues.find((row) => row.rowNumber === pinRowNumber + 1)?.values[positionIndex];

  const leftBelow = rowValues.find((row) => row.rowNumber === pinRowNumber - 1)?.values[positionIndex];
  const rightBelow = rowValues.find((row) => row.rowNumber === pinRowNumber - 1)?.values[positionIndex + 1];

  const left = rowValues.find((row) => row.rowNumber === pinRowNumber)?.values[positionIndex - 1];
  const right = rowValues.find((row) => row.rowNumber === pinRowNumber)?.values[positionIndex + 1];

  return {
    leftAbove: leftAbove ?? null,
    rightAbove: rightAbove ?? null,
    leftBelow: leftBelow ?? null,
    rightBelow: rightBelow ?? null,
    left: left ?? null,
    right: right ?? null,
  } as HexagonPinAdjacency;
}