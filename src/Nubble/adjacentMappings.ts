// Square gridShape
const small_size = 25;
export const square_25_adj = Array.from({ length: small_size }).map((_, i) => ({
  pin: i + 1,
  adjacent_pins: getSquareAdjacentPins(i + 1, small_size),
}));

const medium_size = 64;
export const square_64_adj = Array.from({ length: medium_size }).map((_, i) => ({
  pin: i + 1,
  adjacent_pins: getSquareAdjacentPins(i + 1, medium_size),
}));

const large_size = 100;
export const square_100_adj = Array.from({ length: large_size }).map((_, i) => ({
  pin: i + 1,
  adjacent_pins: getSquareAdjacentPins(i + 1, large_size),
}));

function getSquareAdjacentPins(pin: number, gridSize: number): number[] {
  let adjacent_pins: number[] = [];
  const rowLength = Math.sqrt(gridSize);

  // Declare functions to add adjacent tiles in each of the four directions
  function addLeft(pin: number) {
    adjacent_pins.push(pin - 1);
  }

  function addRight(pin: number) {
    adjacent_pins.push(pin + 1);
  }

  function addTop(pin: number) {
    adjacent_pins.push(pin - rowLength);
  }

  function addBottom(pin: number) {
    adjacent_pins.push(pin + rowLength);
  }

  const topLeftCorner = pin === 1;
  const topRightCorner = pin === rowLength;
  const bottomLeftCorner = pin === rowLength * rowLength - rowLength;
  const bottomRightCorner = pin === rowLength * rowLength;

  const leftBorder = pin % rowLength === 1 && !topLeftCorner && !bottomLeftCorner;
  const rightBorder = pin % rowLength === 0 && !topRightCorner && !bottomRightCorner;
  const topBorder = pin > 1 && pin < rowLength;
  const bottomBorder = pin > rowLength * rowLength - rowLength && pin < rowLength * rowLength;

  // Start with the corners of the square
  if (topLeftCorner) {
    addRight(pin);
    addBottom(pin);
  } else if (topRightCorner) {
    addLeft(pin);
    addBottom(pin);
  } else if (bottomLeftCorner) {
    addRight(pin);
    addTop(pin);
  } else if (bottomRightCorner) {
    addLeft(pin);
    addTop(pin);
  }
  // Now each of the borders (excluding the corner pins)
  else if (leftBorder) {
    addRight(pin);
    addTop(pin);
    addBottom(pin);
  } else if (rightBorder) {
    addLeft(pin);
    addTop(pin);
    addBottom(pin);
  } else if (topBorder) {
    addLeft(pin);
    addRight(pin);
    addBottom(pin);
  } else if (bottomBorder) {
    addLeft(pin);
    addRight(pin);
    addTop(pin);
  }
  // Pin towards the middle of the square
  else {
    addLeft(pin);
    addRight(pin);
    addTop(pin);
    addBottom(pin);
  }

  // Safety check, remove any non-integers or values outside grid range
  const valid_adjacent_pins = adjacent_pins.filter((x) => x > 0 && x <= rowLength * rowLength && Math.round(x) === x);

  return valid_adjacent_pins;
}

// Parallelogram gridShape
export const parallelogram_25_adj = [
  { pin: 1, adjacent_pins: [2, 3] },
  { pin: 2, adjacent_pins: [1, 3, 4, 5] },
  { pin: 3, adjacent_pins: [] },
  { pin: 4, adjacent_pins: [] },
  { pin: 5, adjacent_pins: [] },
  { pin: 6, adjacent_pins: [] },
  { pin: 7, adjacent_pins: [] },
  { pin: 8, adjacent_pins: [] },
  { pin: 9, adjacent_pins: [] },
  { pin: 10, adjacent_pins: [] },
  { pin: 11, adjacent_pins: [] },
  { pin: 12, adjacent_pins: [] },
  { pin: 13, adjacent_pins: [] },
  { pin: 14, adjacent_pins: [] },
  { pin: 15, adjacent_pins: [] },
  { pin: 16, adjacent_pins: [] },
  { pin: 17, adjacent_pins: [] },
  { pin: 18, adjacent_pins: [] },
  { pin: 19, adjacent_pins: [] },
  { pin: 20, adjacent_pins: [] },
  { pin: 21, adjacent_pins: [] },
  { pin: 22, adjacent_pins: [] },
  { pin: 23, adjacent_pins: [] },
  { pin: 24, adjacent_pins: [] },
  { pin: 25, adjacent_pins: [] },
];