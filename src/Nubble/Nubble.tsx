import React, { useState } from "react";
import "../index.scss";
import DiceGrid from "./DiceGrid";
import { adjacentMappings_25, adjacentMappings_64, adjacentMappings_100 } from "./nubble_adjacent";

interface Props {
  numDice: number;
  diceMin: number;
  diceMax: number;
  gridSize: 25 | 64 | 100;
  numTeams: number;
  timeLengthMins: number;
}

  // --- OPERATORS (+ - / *) ---
  export const operators: {name: "/" | "-" | "+" | "*", function: (num1: number, num2: number) => number}[] = [
    {
      name: "/",
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

export function getValidValues(inputNumbers: number[], maxLimit: number): number[] {
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

  // This does not include permutations having the same operator more than once
  let operatorPermutations = permutator(operators);

  // Always atleast the number of operators (and +1 just to be safe)
  const maxOperatorPermutation_length =
    inputNumbers.length <= operators.length ? operators.length + 1 : inputNumbers.length + 1;

  // This adds permutations with repetition of operators
  for (let i = 1; i <= maxOperatorPermutation_length; i++) {
    // Array of permutations of length i
    let newPermutations = combRep(operators, i);
    // Add on to operatorPermutations array
    operatorPermutations = operatorPermutations.concat(newPermutations);
  }

  // Make a copy of all the unique permutations so far
  let operatorSubsetPermutations = operatorPermutations.slice();

  for (let i = 0; i < operatorPermutations.length; i++) {
    for (let j = 1; j < inputNumbers.length; j++) {
      // Add smaller length subsets
      operatorSubsetPermutations.push(operatorPermutations[i].slice(0, j));
    }
  }

  // Remove any subset larger in length than the (number of values - 1)
  const operatorSubsetPermutationsFiltered = Array.from(operatorSubsetPermutations).filter(
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
  for (let i = 0; i < Array.from(operandSubsetPermutations).length; i++) {
    for (let j = 0; j < Array.from(operatorSubsetPermutationsFiltered).length; j++) {
      combinations.push({
        operands: Array.from(operandSubsetPermutations)[i],
        operators: Array.from(operatorSubsetPermutationsFiltered)[j],
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
  polish_expressions_all = Array.from(polish_expressions_all).filter((x) => x.length >= 1);

  // --- Evaluating Expressions ---
  var calculatedValues = new Set<number>();

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

  // TODO: Still missing some values (try dud in operators?)
  return Array.from(validValues);
}

const Nubble: React.FC<Props> = (props) => {
  const [diceValues, setdiceValues] = useState<number[]>(
    Array.from({ length: props.numDice }).map((x) => randomDiceNumber())
  );
  const [pickedPins, setPickedPins] = useState<number[]>([]);
  const gridPoints = Array.from({ length: props.gridSize }).map((_, i) => ({
    number: i + 1,
    points: determinePoints(i + 1),
  }));
  const [totalPoints, setTotalPoints] = useState(0);
  const [validValues, setValidValues] = useState<number[]>();

  // Determine valid results on update of diceValues (at start and on roll of dice)
  React.useEffect(() => {
    const newValidValues = getValidValues(diceValues, props.gridSize);
    setValidValues(newValidValues);
  }, [diceValues]);

  function determinePoints(number: number): number {
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

    throw new Error("Unexpected number for grid size");
  }

  function getAdjacentMappings() {
    switch (props.gridSize) {
      case 25: {
        return adjacentMappings_25;
      }
      case 64: {
        return adjacentMappings_64;
      }
      case 100: {
        return adjacentMappings_100;
      }
    }
  }

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
    const adjacentMappings = getAdjacentMappings();
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

  const pointColourMappings = [
    { points: 10, colour: "orange" },
    { points: 20, colour: "light-blue" },
    { points: 50, colour: "yellow" },
    { points: 100, colour: "dark-blue" },
    { points: 200, colour: "green" },
    { points: 300, colour: "pink" },
    { points: 500, colour: "red" },
  ];

  function populateGrid() {
    var Grid = [];
    for (let i = 1; i <= props.gridSize; i++) {
      let isPicked = pickedPins.includes(i);
      let colour = pointColourMappings.find((x) => x.points === determinePoints(i))?.colour;
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
    return Grid;
  }

  function displayPinScores() {
    var Grid = [];
    // Create nubble pin of each colour with text of how many points it awards
    for (let i = 0; i < pointColourMappings.length; i++) {
      Grid.push(
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
    // Create a prime nubble pin to show it awards double points
    Grid.push(
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
    return Grid;
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
