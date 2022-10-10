import { numbleGridSize } from "../Pages/NumbleConfig";

// Gets the adjacent pins of an individual pin (for square grid shape)
export function getSquareAdjacentPins(pinNumber: number, gridSize: numbleGridSize): number[] | null {
  const adjacentPins: number[] = [];

  const rowLength = Math.sqrt(gridSize);

  // Declare functions to add adjacent tiles in each of the four directions
  function addLeft() {
    adjacentPins.push(pinNumber - 1);
  }

  function addRight() {
    adjacentPins.push(pinNumber + 1);
  }

  function addTop() {
    adjacentPins.push(pinNumber - rowLength);
  }

  function addBottom() {
    adjacentPins.push(pinNumber + rowLength);
  }

  // Determine whereabouts the current pin places amongst the grid shape

  // Is the pin a corner of the grid?
  const topLeftCorner = pinNumber === 1;
  const topRightCorner = pinNumber === rowLength;
  const bottomLeftCorner = pinNumber === rowLength * rowLength - rowLength;
  const bottomRightCorner = pinNumber === rowLength * rowLength;

  // Is the pin along a border of the grid?
  const leftBorder = pinNumber % rowLength === 1 && !topLeftCorner && !bottomLeftCorner;
  const rightBorder = pinNumber % rowLength === 0 && !topRightCorner && !bottomRightCorner;
  const topBorder = pinNumber > 1 && pinNumber < rowLength;
  const bottomBorder = pinNumber > rowLength * rowLength - rowLength && pinNumber < rowLength * rowLength;

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
  return adjacentPins.filter((x) => x > 0 && x <= gridSize && Math.round(x) === x && x !== undefined);
}
