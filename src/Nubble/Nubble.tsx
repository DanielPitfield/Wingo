import React, { useState } from "react";
import "../index.css";
import DiceGrid from "./DiceGrid";

interface Props {
  numDice: number;
  diceMin: number;
  diceMax: number;
  gridSize: 25 | 64 | 100;
  numTeams: number;
  timeLengthMins: number;
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
    const newValidValues = getValidValues();
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

  function randomIntFromInterval(min: number, max: number) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  function randomDiceNumber() {
    return randomIntFromInterval(props.diceMin, props.diceMax);
  }

  function rollDice() {
    // Determine random dice values for all the dice
    setdiceValues(
      Array.from({ length: props.numDice }).map((x) => randomDiceNumber())
    );
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

  function getValidValues(): number[] {
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
    function combRep(
      arr: { name: string; function: (num1: number, num2: number) => number }[],
      l: number
    ) {
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

    // --- OPERATORS (+ - / *) ---
    const operators = [
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

    // This does not include permutations having the same operator more than once
    let operatorPermutations = permutator(operators);

    // This adds permutations with repetition of operators (length 5 just to be safe)
    for (let i = 1; i <= operators.length + 1; i++) {
      // Array of permutations of length i
      let newPermutations = combRep(operators, i);
      // Add on to operatorPermutations array
      operatorPermutations = operatorPermutations.concat(newPermutations);
    }

    // Make a copy of all the unique permutations so far
    let operatorSubsetPermutations = operatorPermutations.slice();

    for (let i = 0; i < operatorPermutations.length; i++) {
      // 3 value subsets
      operatorSubsetPermutations.push(operatorPermutations[i].slice(0, 3));
      // 2 value subsets
      operatorSubsetPermutations.push(operatorPermutations[i].slice(0, 2));
      // 1 value subsets
      operatorSubsetPermutations.push([operatorPermutations[i][0]]);
    }

    // Remove any subset larger in length than 3
    const operatorSubsetPermutationsFiltered = Array.from(
      operatorSubsetPermutations
    ).filter((x) => x.length <= 3);

    // --- OPERANDS (1-6) ---

    // All the different permutations of the 4 dice values
    const operandPermutations = permutator(diceValues);

    // Start new array as copy of progress so far (operandPermutations)
    let operandSubsetPermutations = operandPermutations.slice();

    for (let i = 0; i < operandPermutations.length; i++) {
      // 3 value subset
      operandSubsetPermutations.push(operandPermutations[i].slice(0, 3));
      // 2 value subset
      operandSubsetPermutations.push(operandPermutations[i].slice(0, 2));
      // 1 value subset
      operandSubsetPermutations.push([operandPermutations[i][0]]);
    }

    // Combine the permutations of operands and operators (not yet in reverse polish)
    var combinations = [];
    for (let i = 0; i < Array.from(operandSubsetPermutations).length; i++) {
      for (
        let j = 0;
        j < Array.from(operatorSubsetPermutationsFiltered).length;
        j++
      ) {
        combinations.push({
          operands: Array.from(operandSubsetPermutations)[i],
          operators: Array.from(operatorSubsetPermutationsFiltered)[j],
        });
      }
    }

    // --- Reverse Polish Expressions ---

    // Array to store the polish_expression arrays
    let polish_expressions_all: Array<
      Array<
        | { name: string; function: (num1: number, num2: number) => number }
        | number
      >
    > = [];

    for (let i = 0; i < combinations.length; i++) {
      // Define an array to push the operands and operators (as functions) to

      if (combinations[i].operands.length === 1) {
        // Add just the number (example: 5)
        polish_expressions_all.push([combinations[i].operands[0]]);
      } else if (
        combinations[i].operands.length === 2 &&
        combinations[i].operators.length === 1
      ) {
        // Add the two numbers followed by operator (example: 5 2 +)
        polish_expressions_all.push([
          combinations[i].operands[0],
          combinations[i].operands[1],
          combinations[i].operators[0],
        ]);
      } else if (
        combinations[i].operands.length === 3 &&
        combinations[i].operators.length === 2
      ) {
        // (example: 5 2 + 3 *)
        polish_expressions_all.push([
          combinations[i].operands[0],
          combinations[i].operands[1],
          combinations[i].operators[0],
          combinations[i].operands[2],
          combinations[i].operators[1],
        ]);
      } else if (
        combinations[i].operands.length === 4 &&
        combinations[i].operators.length === 3
      ) {
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
      } else {
        // Invalid expression
      }
    }

    // Remove empty/unformed polish expressions
    polish_expressions_all = Array.from(polish_expressions_all).filter(
      (x) => x.length >= 1
    );

    // --- Evaluating Expressions ---
    var calculatedValues = new Set<number>();

    // Check whether expression part is an operator
    function isOperator(
      expression_part:
        | { name: string; function: (num1: number, num2: number) => number }
        | number
    ): boolean {
      return typeof expression_part !== "number";
    }

    // Check whether expression part is an operand (number)
    function isOperand(
      expression_part:
        | { name: string; function: (num1: number, num2: number) => number }
        | number
    ): boolean {
      return typeof expression_part === "number";
    }

    // Check whether expression skeleton matches with provided expression
    function checkSkeleton(
      expression: any[],
      skeleton: ((expression_part: any) => boolean)[]
    ): boolean {
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
        if (
          checkSkeleton(expression, [
            isOperand,
            isOperand,
            isOperator,
            isOperand,
            isOperator,
          ])
        ) {
          const [firstNum, secondNum, firstOperator, thirdNum, secondOperator] =
            expression;

          const firstCalculation = (firstOperator as any).function(
            firstNum,
            secondNum
          );
          const result = (secondOperator as any).function(
            firstCalculation,
            thirdNum
          );
          calculatedValues.add(result);
        }
      } else if (expression.length === 7) {
        if (
          checkSkeleton(expression, [
            isOperand,
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
          ] = expression;

          const firstCalculation = (firstOperator as any).function(
            firstNum,
            secondNum
          );
          const secondCalculation = (secondOperator as any).function(
            firstCalculation,
            thirdNum
          );
          const result = (thirdOperator as any).function(
            secondCalculation,
            fourthNum
          );
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
          ] = expression;

          const firstCalculation = (firstOperator as any).function(
            firstNum,
            secondNum
          );

          const secondCalculation = (secondOperator as any).function(
            thirdNum,
            fourthNum
          );

          const result = (thirdOperator as any).function(
            firstCalculation,
            secondCalculation
          );

          calculatedValues.add(result);
        }
      }
    }

    // Remove results which aren't integers or are outside range of (0, gridSize)
    const validValues = Array.from(calculatedValues).filter(
      (x) => x > 0 && x <= props.gridSize && Math.round(x) === x
    );

    return Array.from(validValues);
  }

  function onClick(i: number) {
    if (!validValues || !validValues.includes(i)) {
      // No valid values or number is invalid
      return;
    } else {
      // Keep track that pin has now been correctly picked
      let newPickedPins = pickedPins.slice();
      newPickedPins.push(i);
      setPickedPins(newPickedPins);

      // Find out how many points the pin is worth
      const pinScore = gridPoints.find((x) => x.number === i)?.points;
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
      let colour = pointColourMappings.find(
        (x) => x.points === determinePoints(i)
      )?.colour;
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

  return (
    <div className="App">
      <DiceGrid
        numDice={props.numDice}
        diceValues={diceValues}
        rollDice={rollDice}
      ></DiceGrid>
      <div className="nubble-grid">{populateGrid()}</div>
      <div className="nubble-score">{totalPoints}</div>
    </div>
  );
};

export default Nubble;
