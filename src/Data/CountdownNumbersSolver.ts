import { NumberPuzzle } from "./CountdownSolver";

onmessage = function (e) {
  // Recieve data
  const targetNumber = e.data.targetNumber;
  const inputNumbers = e.data.inputNumbers;

  // Find solution using NumberPuzzle
  const puzzle = new NumberPuzzle(targetNumber, inputNumbers);
  const solutions = puzzle.solve();

  // Send back solution(s)
  postMessage(solutions);
};

export {};
