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

  const [pickedPins, setPickedPins] = useState<number>();
  const gridPoints = Array.from({ length: props.gridSize }).map((_, i) => ({
    number: i + 1,
    points: determinePoints(i + 1),
  }));

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

      const permute = (
        arr: [],
        m = []
      ) => {
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
        name: "*",
        function: (num1: number, num2: number): number => num1 * num2,
      },
      {
        name: "+",
        function: (num1: number, num2: number): number => num1 + num2,
      },
      {
        name: "-",
        function: (num1: number, num2: number): number => num1 - num2,
      },
    ];

    // This does not include permutations having the same operator more than once
    let operatorPermutations = permutator(operators);

    // This adds permutations with repetition of operators
    for (let i = 1; i <= operators.length; i++) {
      // Array of permutations of length i
      let newPermutations = combRep(operators, i);
      // Add on to operatorPermutations array
      operatorPermutations = operatorPermutations.concat(newPermutations);
    }

    // Make a copy of all the unique permutations so far
    const operatorSubsetPermutations = new Set(operatorPermutations.slice());

    for (let i = 0; i < operatorPermutations.length; i++) {
      // 3 value subsets
      operatorSubsetPermutations.add(operatorPermutations[i].slice(0, 3));
      // 2 value subsets
      operatorSubsetPermutations.add(operatorPermutations[i].slice(0, 2));
      // 1 value subsets
      operatorSubsetPermutations.add([operatorPermutations[i][0]]);
    }

    // Remove any subset larger in length than 3
    const operatorSubsetPermutationsFiltered = Array.from(
      operatorSubsetPermutations
    ).filter((x) => x.length <= 3);

    // --- OPERANDS (1-6) ---

    // All the different permutations of the 4 dice values
    const operandPermutations = permutator(diceValues);

    // Start new array as copy of progress so far (operandPermutations)
    const operandSubsetPermutations = new Set(operandPermutations.slice());

    for (let i = 0; i < operandPermutations.length; i++) {
      // 3 value subset
      operandSubsetPermutations.add(operandPermutations[i].slice(0, 3));
      // 2 value subset
      operandSubsetPermutations.add(operandPermutations[i].slice(0, 2));
      // 1 value subset
      operandSubsetPermutations.add([operandPermutations[i][0]]);
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

    // TODO: polish_expressions_all, polish_expression - Types are absurd, must be a better way

    // Array to store the polish_expression arrays
    let polish_expressions_all: Array<
      Array<
        | { name: string; function: (num1: number, num2: number) => number }
        | number
      >
    > = [];

    for (let i = 0; i < combinations.length; i++) {
      // Define an array to push the operands and operators (as functions) to
      var polish_expression: Array<
        | { name: string; function: (num1: number, num2: number) => number }
        | number
      > = [];

      if (combinations[i].operands.length === 1) {
        // Add just the number (example: 5)
        polish_expression.push(combinations[i].operands[0]);
      } else if (
        combinations[i].operands.length === 2 &&
        combinations[i].operators.length === 1
      ) {
        // Add the two numbers followed by operator (example: 5 2 +)
        polish_expression.push(
          combinations[i].operands[0],
          combinations[i].operands[1],
          combinations[i].operators[0]
        );
      } else if (
        combinations[i].operands.length === 3 &&
        combinations[i].operators.length === 2
      ) {
        // (example: 5 2 + 3 *)
        polish_expression.push(
          combinations[i].operands[0],
          combinations[i].operands[1],
          combinations[i].operators[0],
          combinations[i].operands[2],
          combinations[i].operators[1]
        );
      } else if (
        combinations[i].operands.length === 4 &&
        combinations[i].operators.length === 3
      ) {
        // (example: 5 2 + 3 * 4 -)
        polish_expression.push(
          combinations[i].operands[0],
          combinations[i].operands[1],
          combinations[i].operators[0],
          combinations[i].operands[2],
          combinations[i].operators[1],
          combinations[i].operands[3],
          combinations[i].operators[2]
        );

        polish_expressions_all.push(polish_expression); // Push this
        polish_expression = []; // Clear for second type of expression with this length

        // (example: 2 1 + 5 4 * *)
        polish_expression.push(
          combinations[i].operands[0],
          combinations[i].operands[1],
          combinations[i].operators[0],
          combinations[i].operands[2],
          combinations[i].operands[3],
          combinations[i].operators[1],
          combinations[i].operators[2]
        );
        console.log(polish_expression);        
      }
      // Push expression to higher level array
      polish_expressions_all.push(polish_expression);
    }

    // Remove empty/unformed polish expressions
    polish_expressions_all = Array.from(polish_expressions_all).filter(
      (x) => x.length >= 1
    );

    // --- Evaluating Expressions ---
    var calculatedValues = new Set<number>();

    for (let i = 0; i < polish_expressions_all.length; i++) {
      const expression = polish_expressions_all[i];

      if (expression.length === 1) {
        if (typeof expression[0] === "number") {
          const firstNum = expression[0];

          const result = firstNum;
          calculatedValues.add(result);
        }
      } else if (expression.length === 3) {
        if (
          typeof expression[0] === "number" &&
          typeof expression[1] === "number" &&
          typeof expression[2] !== "number"
        ) {
          const firstNum = expression[0];
          const secondNum = expression[1];
          const firstOperator = expression[2];

          const result = firstOperator.function(firstNum, secondNum);
          calculatedValues.add(result);
        }
      } else if (expression.length === 5) {
        if (
          typeof expression[0] === "number" &&
          typeof expression[1] === "number" &&
          typeof expression[2] !== "number" &&
          typeof expression[3] === "number" &&
          typeof expression[4] !== "number"
        ) {
          const firstNum = expression[0];
          const secondNum = expression[1];
          const firstOperator = expression[2];
          const thirdNum = expression[3];
          const secondOperator = expression[4];

          const firstCalculation = firstOperator.function(firstNum, secondNum);
          const result = secondOperator.function(firstCalculation, thirdNum);
          calculatedValues.add(result);
        }
      } else if (expression.length === 7) {
        if (
          typeof expression[0] === "number" &&
          typeof expression[1] === "number" &&
          typeof expression[2] !== "number" &&
          typeof expression[3] === "number" &&
          typeof expression[4] !== "number" &&
          typeof expression[5] === "number" &&
          typeof expression[6] !== "number"
        ) {
          const firstNum = expression[0];
          const secondNum = expression[1];
          const firstOperator = expression[2];
          const thirdNum = expression[3];
          const secondOperator = expression[4];
          const fourthNum = expression[5];
          const thirdOperator = expression[6];

          const firstCalculation = firstOperator.function(firstNum, secondNum);
          const secondCalculation = secondOperator.function(
            firstCalculation,
            thirdNum
          );
          const result = thirdOperator.function(secondCalculation, fourthNum);
          calculatedValues.add(result);
        } else if (
          typeof expression[0] === "number" &&
          typeof expression[1] === "number" &&
          typeof expression[2] !== "number" &&
          typeof expression[3] === "number" &&
          typeof expression[4] === "number" &&
          typeof expression[5] !== "number" &&
          typeof expression[6] !== "number"
        ) {
          const firstNum = expression[0];
          const secondNum = expression[1];
          const firstOperator = expression[2];
          const thirdNum = expression[3];
          const fourthNum = expression[4];
          const secondOperator = expression[5];
          const thirdOperator = expression[6];

          const firstCalculation = firstOperator.function(firstNum, secondNum);
          const secondCalculation = secondOperator.function(
            thirdNum,
            fourthNum
          );
          const result = thirdOperator.function(
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

    // TODO: validValues still missing values
    console.log(validValues);

    return Array.from(validValues);
  }

  function onClick(i: number) {
    const validValues = getValidValues();

    if (!validValues.includes(i)) {
      // Invalid
      return;
    }

    alert(gridPoints.find((x) => x.number === i)?.points);
  }

  function populateGrid() {
    var Grid = [];
    for (let i = 1; i <= props.gridSize; i++) {
      Grid.push(
        <button
          key={i}
          className="nubble-button"
          data-isPrime={isPrime(i)}
          onClick={() => onClick(i)}
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
      <div className="number_grid">{populateGrid()}</div>
    </div>
  );
};

export default Nubble;
