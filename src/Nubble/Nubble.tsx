import React, { useState } from "react";
import "../index.scss";
import DiceGrid from "./DiceGrid";

interface Props {
  numDice: number;
  diceMin: number;
  diceMax: number;
  gridSize: 25 | 64 | 100;
  gridShape: "square" | "parallelogram";
  determinePoints: (value: number) => number;
  determinePointColourMappings: () => {points: number, colour: string }[];
  determineAdjacentMappings: () => {pin: number, adjacent_pins: number[] }[];
  numTeams: number;
  timeLengthMins: number;
}

// --- OPERATORS (+ - / *) ---
export const operators: { name: "/" | "-" | "+" | "*"; function: (num1: number, num2: number) => number }[] = [
  {
    name: "/",
    // TODO: Is having large arrays of these objects (which include these functions) slowing down the function getValidValues()
    function: (num1: number, num2: number): number => num1 / num2,
  },
  {
    name: "-",
    function: (num1: number, num2: number): number => num1 - num2,
  },
  {
    name: "+",
    function: (num1: number, num2: number): number => num1 + num2,
  },
  {
    name: "*",
    function: (num1: number, num2: number): number => num1 * num2,
  },
];

// Returns permutations of input array, https://stackoverflow.com/a/20871714
function permutator<T>(inputArr: T[]): T[][] {
  let result: any[] = [];

  const permute = (arr: [], m = []) => {
    if (arr.length === 0) {
      result.push(m);
    } else {
      for (let i = 0; i < arr.length; i++) {
        let curr = arr.slice();
        let next = curr.splice(i, 1);
        permute(curr.slice() as any, m.concat(next as any));
      }
    }
  };

  permute(inputArr as any);

  return result;
}

// https://stackoverflow.com/questions/32543936/combination-with-repetition
function combRep(arr: { name: string; function: (num1: number, num2: number) => number }[], l: number) {
  if (l === void 0) l = arr.length; // Length of the combinations
  var data = Array(l), // Used to store state
    results = []; // Array of results
  (function f(pos, start) {
    // Recursive function
    if (pos === l) {
      // End reached
      results.push(data.slice()); // Add a copy of data to results
      return;
    }
    for (var i = start; i < arr.length; ++i) {
      data[pos] = arr[i]; // Update data
      f(pos + 1, i); // Call f recursively
    }
  })(0, 0); // Start at index 0
  return results; // Return results
}

// Check whether expression part is an operator
function isOperator(
  expression_part: { name: string; function: (num1: number, num2: number) => number } | number
): boolean {
  return typeof expression_part !== "number";
}

// Check whether expression part is an operand (number)
function isOperand(
  expression_part: { name: string; function: (num1: number, num2: number) => number } | number
): boolean {
  return typeof expression_part === "number";
}

// Check whether expression skeleton matches with provided expression
function checkSkeleton(expression: any[], skeleton: ((expression_part: any) => boolean)[]): boolean {
  for (let i = 0; i < expression.length; i++) {
    if (!skeleton[i](expression[i])) {
      return false; // Skeleton part different from expression part
    }
  }

  return true;
}

export function getValidValues(inputNumbers: number[], maxLimit: number): number[] {
  // Add two duds to circumvent missing values bug
  let operators_duds = operators.slice();

  operators_duds.push({
    name: "-",
    function: (num1: number, num2: number): number => num1 - num2,
  });
  operators_duds.push({
    name: "+",
    function: (num1: number, num2: number): number => num1 + num2,
  });

  // This does not include permutations having the same operator more than once
  let operatorPermutations = permutator(operators_duds);

  // Always atleast the number of operators
  const maxOperatorPermutation_length =
    inputNumbers.length <= operators_duds.length ? operators_duds.length : inputNumbers.length + 1;

  // This adds permutations with repetition of operators
  for (let i = 1; i <= maxOperatorPermutation_length; i++) {
    // Array of permutations of length i
    let newPermutations = combRep(operators_duds, i);
    // Add on to operatorPermutations array
    operatorPermutations = operatorPermutations.concat(newPermutations);
  }

  // Make a copy of the permutations so far
  let operatorSubsetPermutations = operatorPermutations.slice();

  for (let i = 0; i < operatorPermutations.length; i++) {
    for (let j = 1; j < inputNumbers.length; j++) {
      // Add smaller length subsets (to new copy)
      operatorSubsetPermutations.push(operatorPermutations[i].slice(0, j));
    }
  }

  // Remove any subset larger in length than the (number of values - 1)
  const operatorSubsetPermutationsFiltered = operatorSubsetPermutations.filter(
    (x) => x.length <= inputNumbers.length - 1
  );

  // --- OPERANDS (1-6) ---

  // All the different permutations of the inputNumbers (e.g 4 dice values)
  const operandPermutations = permutator(inputNumbers);

  // Start new array as copy of progress so far (operandPermutations)
  let operandSubsetPermutations = operandPermutations.slice();

  for (let i = 0; i < operandPermutations.length; i++) {
    for (let j = 1; j < inputNumbers.length; j++) {
      // Add smaller length subsets
      operandSubsetPermutations.push(operandPermutations[i].slice(0, j));
    }
  }

  // Combine the permutations of operands and operators (not yet in reverse polish)
  var combinations = [];
  for (let i = 0; i < operandSubsetPermutations.length; i++) {
    for (let j = 0; j < operatorSubsetPermutationsFiltered.length; j++) {
      combinations.push({
        operands: operandSubsetPermutations[i],
        operators: operatorSubsetPermutationsFiltered[j],
      });
    }
  }

  // --- Reverse Polish Expressions ---

  // Array to store the polish_expression arrays
  let polish_expressions_all: Array<
    Array<{ name: string; function: (num1: number, num2: number) => number } | number>
  > = [];

  for (let i = 0; i < combinations.length; i++) {
    // Define an array to push the operands and operators (as functions) to

    if (combinations[i].operands.length === 1) {
      // Add just the number (example: 5)
      polish_expressions_all.push([combinations[i].operands[0]]);
    } else if (combinations[i].operands.length === 2 && combinations[i].operators.length === 1) {
      // Add the two numbers followed by operator (example: 5 2 +)
      polish_expressions_all.push([
        combinations[i].operands[0],
        combinations[i].operands[1],
        combinations[i].operators[0],
      ]);
    } else if (combinations[i].operands.length === 3 && combinations[i].operators.length === 2) {
      // (example: 5 2 + 3 *)
      polish_expressions_all.push([
        combinations[i].operands[0],
        combinations[i].operands[1],
        combinations[i].operators[0],
        combinations[i].operands[2],
        combinations[i].operators[1],
      ]);
    } else if (combinations[i].operands.length === 4 && combinations[i].operators.length === 3) {
      // (example: 5 2 + 3 * 4 -)
      polish_expressions_all.push([
        combinations[i].operands[0],
        combinations[i].operands[1],
        combinations[i].operators[0],
        combinations[i].operands[2],
        combinations[i].operators[1],
        combinations[i].operands[3],
        combinations[i].operators[2],
      ]);

      // (example: 2 1 + 5 4 * *)
      polish_expressions_all.push([
        combinations[i].operands[0],
        combinations[i].operands[1],
        combinations[i].operators[0],
        combinations[i].operands[2],
        combinations[i].operands[3],
        combinations[i].operators[1],
        combinations[i].operators[2],
      ]);
    } else if (combinations[i].operands.length === 5 && combinations[i].operators.length === 4) {
      // TODO: Are there more types of polish expression which can be made?

      // (example: 5 2 + 3 * 4 - 1 +)
      polish_expressions_all.push([
        combinations[i].operands[0],
        combinations[i].operands[1],
        combinations[i].operators[0],
        combinations[i].operands[2],
        combinations[i].operators[1],
        combinations[i].operands[3],
        combinations[i].operators[2],
        combinations[i].operands[4],
        combinations[i].operators[3],
      ]);

      // (example: 2 1 + 5 4 * * 3 *)
      polish_expressions_all.push([
        combinations[i].operands[0],
        combinations[i].operands[1],
        combinations[i].operators[0],
        combinations[i].operands[2],
        combinations[i].operands[3],
        combinations[i].operators[1],
        combinations[i].operators[2],
        combinations[i].operands[4],
        combinations[i].operators[3],
      ]);

      // (example: 2 1 + 5 * 4 3 * *)
      polish_expressions_all.push([
        combinations[i].operands[0],
        combinations[i].operands[1],
        combinations[i].operators[0],
        combinations[i].operands[2],
        combinations[i].operators[1],
        combinations[i].operands[3],
        combinations[i].operands[4],
        combinations[i].operators[2],
        combinations[i].operators[3],
      ]);
    }
    // TODO: 6 operand combinations
  }

  // Remove empty/unformed polish expressions
  polish_expressions_all = polish_expressions_all.filter((x) => x.length >= 1);

  // --- Evaluating Expressions ---
  var calculatedValues = new Set<number>();

  for (let i = 0; i < polish_expressions_all.length; i++) {
    const expression = polish_expressions_all[i];

    if (expression.length === 1) {
      if (checkSkeleton(expression, [isOperand])) {
        const [firstNum] = expression;

        const result = firstNum;
        calculatedValues.add(result as any);
      }
    } else if (expression.length === 3) {
      if (checkSkeleton(expression, [isOperand, isOperand, isOperator])) {
        const [firstNum, secondNum, firstOperator] = expression;

        const result = (firstOperator as any).function(firstNum, secondNum);
        calculatedValues.add(result);
      }
    } else if (expression.length === 5) {
      if (checkSkeleton(expression, [isOperand, isOperand, isOperator, isOperand, isOperator])) {
        const [firstNum, secondNum, firstOperator, thirdNum, secondOperator] = expression;

        const firstCalculation = (firstOperator as any).function(firstNum, secondNum);
        const result = (secondOperator as any).function(firstCalculation, thirdNum);
        calculatedValues.add(result);
      }
    } else if (expression.length === 7) {
      if (checkSkeleton(expression, [isOperand, isOperand, isOperator, isOperand, isOperator, isOperand, isOperator])) {
        const [firstNum, secondNum, firstOperator, thirdNum, secondOperator, fourthNum, thirdOperator] = expression;

        const firstCalculation = (firstOperator as any).function(firstNum, secondNum);
        const secondCalculation = (secondOperator as any).function(firstCalculation, thirdNum);
        const result = (thirdOperator as any).function(secondCalculation, fourthNum);
        calculatedValues.add(result);
      } else if (
        checkSkeleton(expression, [isOperand, isOperand, isOperator, isOperand, isOperand, isOperator, isOperator])
      ) {
        const [firstNum, secondNum, firstOperator, thirdNum, fourthNum, secondOperator, thirdOperator] = expression;

        const firstCalculation = (firstOperator as any).function(firstNum, secondNum);
        const secondCalculation = (secondOperator as any).function(thirdNum, fourthNum);
        const result = (thirdOperator as any).function(firstCalculation, secondCalculation);
        calculatedValues.add(result);
      }
    } else if (expression.length === 9) {
      if (
        checkSkeleton(expression, [
          isOperand,
          isOperand,
          isOperator,
          isOperand,
          isOperator,
          isOperand,
          isOperator,
          isOperand,
          isOperator,
        ])
      ) {
        const [
          firstNum,
          secondNum,
          firstOperator,
          thirdNum,
          secondOperator,
          fourthNum,
          thirdOperator,
          fifthNum,
          fourthOperator,
        ] = expression;

        const firstCalculation = (firstOperator as any).function(firstNum, secondNum);
        const secondCalculation = (secondOperator as any).function(firstCalculation, thirdNum);
        const thirdCalculation = (thirdOperator as any).function(secondCalculation, fourthNum);
        const result = (fourthOperator as any).function(thirdCalculation, fifthNum);
        calculatedValues.add(result);
      } else if (
        checkSkeleton(expression, [
          isOperand,
          isOperand,
          isOperator,
          isOperand,
          isOperand,
          isOperator,
          isOperator,
          isOperand,
          isOperator,
        ])
      ) {
        const [
          firstNum,
          secondNum,
          firstOperator,
          thirdNum,
          fourthNum,
          secondOperator,
          thirdOperator,
          fifthNum,
          fourthOperator,
        ] = expression;

        const firstCalculation = (firstOperator as any).function(firstNum, secondNum);
        const secondCalculation = (secondOperator as any).function(thirdNum, fourthNum);
        const thirdCalculation = (thirdOperator as any).function(firstCalculation, secondCalculation);
        const result = (fourthOperator as any).function(thirdCalculation, fifthNum);
        calculatedValues.add(result);
      }
      // (example: 2 1 + 5 * 4 3 * *)
      else if (
        checkSkeleton(expression, [
          isOperand,
          isOperand,
          isOperator,
          isOperand,
          isOperator,
          isOperand,
          isOperand,
          isOperator,
          isOperator,
        ])
      ) {
        const [
          firstNum,
          secondNum,
          firstOperator,
          thirdNum,
          secondOperator,
          fourthNum,
          fifthNum,
          thirdOperator,
          fourthOperator,
        ] = expression;

        const firstCalculation = (firstOperator as any).function(firstNum, secondNum);
        const secondCalculation = (secondOperator as any).function(firstCalculation, thirdNum);
        const thirdCalculation = (thirdOperator as any).function(fourthNum, fifthNum);
        const result = (fourthOperator as any).function(secondCalculation, thirdCalculation);
        calculatedValues.add(result);
      }
    }
  }

  // Remove results which aren't integers or are outside range of (0, maxLimit)
  const validValues = Array.from(calculatedValues).filter((x) => x > 0 && x <= maxLimit && Math.round(x) === x);

  return validValues;
}

const Nubble: React.FC<Props> = (props) => {
  const [diceValues, setdiceValues] = useState<number[]>(
    Array.from({ length: props.numDice }).map((x) => randomDiceNumber())
  );
  const [pickedPins, setPickedPins] = useState<number[]>([]);
  const gridPoints = Array.from({ length: props.gridSize }).map((_, i) => ({
    number: i + 1,
    points: props.determinePoints(i + 1),
  }));
  const [totalPoints, setTotalPoints] = useState(0);
  const [validValues, setValidValues] = useState<number[]>();

  // Determine valid results on update of diceValues (at start and on roll of dice)
  React.useEffect(() => {
    const newValidValues = getValidValues(diceValues, props.gridSize);
    setValidValues(newValidValues);
  }, [diceValues]);

  function randomIntFromInterval(min: number, max: number) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  function randomDiceNumber() {
    return randomIntFromInterval(props.diceMin, props.diceMax);
  }

  function rollDice() {
    // Determine random dice values for all the dice
    setdiceValues(Array.from({ length: props.numDice }).map((x) => randomDiceNumber()));
  }

  function isPrime(value: number) {
    // returns boolean
    if (value <= 1) return false; // negatives
    if (value % 2 === 0 && value > 2) return false; // even numbers
    const s = Math.sqrt(value); // store the square to loop faster
    for (let i = 3; i <= s; i += 2) {
      // start from 3, stop at the square, increment in twos
      if (value % i === 0) return false; // modulo shows a divisor was found
    }
    return true;
  }

  function isAdjacentTriangle(pinNumber: number) {
    // Array deatiling pin adjacency for this gridSize
    const adjacentMappings = props.determineAdjacentMappings();
    console.log(adjacentMappings);
    // Adjacent pins of the clicked pin
    const adjacent_pins = adjacentMappings.find((x) => x.pin === pinNumber)?.adjacent_pins;
    // All the adjacent pins which have also previously been picked
    const picked_adjacent_pins = pickedPins.filter((x) => adjacent_pins?.includes(x));
    // Determine if there is a nubble triangle (3 adjacent picked pins)
    if (picked_adjacent_pins.length >= 3) {
      return true;
    }
    return false;
  }

  function onClick(pinNumber: number) {
    if (!validValues || !validValues.includes(pinNumber) || pinNumber < 1) {
      // No valid values or number is invalid
      return;
    } else {
      // Keep track that the pin has now been correctly picked
      let newPickedPins = pickedPins.slice();
      newPickedPins.push(pinNumber);
      setPickedPins(newPickedPins);

      // Find out how many base points the pin is worth
      let pinScore = gridPoints.find((x) => x.number === pinNumber)?.points;

      if (isPrime(pinNumber)) {
        // Double points if the picked pin is a prime number
        pinScore = pinScore! * 2;
      }

      // Bonus points awarded for nubble triangle
      const adjacentBonus = 200;

      if (isAdjacentTriangle(pinNumber)) {
        pinScore = pinScore! + adjacentBonus;
      }

      // Add points to total points
      if (pinScore) {
        setTotalPoints(totalPoints + pinScore);
      }
    }
  }

  // Array (length of rowLength) of buttons
  function populateRow(rowLength: number, rowNumber: number) {
    return (
      <div className="nubble-grid-row">
        {Array.from({length: rowLength}).map((_, i) => {
          let value = ((rowNumber * rowLength) + i) + 1;
          let isPicked = pickedPins.includes(value);

          const pointColourMappings = props.determinePointColourMappings();
          let colour = pointColourMappings.find((x) => x.points === props.determinePoints(value))?.colour;

          return (
            <button
              key={i}
              className="nubble-button"
              data-prime={isPrime(value)}
              data-picked={isPicked}
              data-colour={colour}
              onClick={() => onClick(value)}
              disabled={isPicked}
            >
              {value}
            </button>
          );
        })}
      </div>
    );
  }

  function populateGrid() {
    var Grid = [];

    if (props.gridShape === "square") {
      const rowLength = Math.sqrt(props.gridSize);
      for (let i = 0; i < rowLength; i++) {
        Grid.push(populateRow(rowLength, i));
      }
    }

    /*
    for (let i = 1; i <= props.gridSize; i++) {
      let isPicked = pickedPins.includes(i);
      let colour = pointColourMappings.find((x) => x.points === props.determinePoints(i))?.colour;
      Grid.push(
        <button
          key={i}
          className="nubble-button"
          data-prime={isPrime(i)}
          data-picked={isPicked}
          data-colour={colour}
          onClick={() => onClick(i)}
          disabled={isPicked}
        >
          {i}
        </button>
      );
    }
    */
    return Grid;
  }

  function displayPinScores() {
    var all_pin_scores = [];
    const pointColourMappings = props.determinePointColourMappings();
    // Create nubble pin of each colour with text of how many points it awards
    for (let i = 0; i < pointColourMappings.length; i++) {
      all_pin_scores.push(
        <button
          key={i}
          // TODO: Change class name so doesnt change colour on hover
          className="nubble-button"
          data-prime={false}
          data-picked={false}
          data-colour={pointColourMappings[i].colour}
          // Do nothing
          onClick={() => onClick(0)}
          disabled={false}
        >
          {pointColourMappings[i].points}
        </button>
      );
    }

    let trimmed_pin_scores = [];
    if (props.gridShape === "square") {
      const numRows = Math.sqrt(props.gridSize);
      trimmed_pin_scores = all_pin_scores.slice(all_pin_scores.length - numRows, all_pin_scores.length);
    }
    else {
      trimmed_pin_scores = all_pin_scores.slice();
    }

    // Create a prime nubble pin to show it awards double points
    trimmed_pin_scores.push(
      <button
        key={"prime-read-only"}
        // TODO: Change class name so doesnt change colour on hover
        className="nubble-button"
        data-prime={true}
        data-picked={false}
        // Choose last colour mapping (red)
        data-colour={pointColourMappings[pointColourMappings.length - 1].colour}
        // Do nothing
        onClick={() => onClick(0)}
        disabled={false}
      >
        {pointColourMappings[pointColourMappings.length - 1].points * 2}
      </button>
    );
    return trimmed_pin_scores;
  }

  return (
    <div className="App">
      <DiceGrid numDice={props.numDice} diceValues={diceValues} rollDice={rollDice}></DiceGrid>
      <div className="nubble-grid">{populateGrid()}</div>
      <div className="nubble-score">{totalPoints}</div>
      <div className="nubble-pin-scores">{displayPinScores()}</div>
    </div>
  );
};

export default Nubble;
