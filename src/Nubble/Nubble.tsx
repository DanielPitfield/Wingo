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
    // --- OPERATORS (+ - / *) ---
    const operators = [
      {
        name: "division",
        function: (num1: number, num2: number): number => num1 / num2,
      },
      {
        name: "multiplication",
        function: (num1: number, num2: number): number => num1 * num2,
      },
      {
        name: "addition",
        function: (num1: number, num2: number): number => num1 + num2,
      },
      {
        name: "subtraction",
        function: (num1: number, num2: number): number => num1 - num2,
      },
    ];

    // Returns permutations of input array, https://stackoverflow.com/a/20871714
    function permutator<T>(inputArr: T[]): T[][] {
      let result: any[] = [];

      const permute = (arr: TextDecoderCommon[], m = []) => {
        if (arr.length === 0) {
          result.push(m);
        } else {
          for (let i = 0; i < arr.length; i++) {
            let curr = arr.slice();
            let next = curr.splice(i, 1);
            permute(curr.slice(), m.concat(next as any));
          }
        }
      };

      permute(inputArr as any);

      return result;
    }

    // This does not include permutations having the same operator more than once
    const operatorPermutations_no_repeats = permutator(operators);

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

    const operatorPermutations_repeats_4 = combRep(operators, 4);
    const operatorPermutations_repeats_3 = combRep(operators, 3);
    const operatorPermutations_repeats_2 = combRep(operators, 2);
    const operatorPermutations_repeats_1 = combRep(operators, 1);

    // Combine permutations  with and without repetition of operators (results from both the functions)
    const operatorPermutations = operatorPermutations_no_repeats.concat(
      operatorPermutations_repeats_4,
      operatorPermutations_repeats_3,
      operatorPermutations_repeats_2,
      operatorPermutations_repeats_1
    );

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

    // Use set again to return only unique permutations
    const operatorPermutations_all = new Set(
      operatorSubsetPermutationsFiltered.slice()
    );

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

    // Write out all the operators and operands together (mathematical evaluations)
    var combinations = [];
    for (let i = 0; i < Array.from(operandSubsetPermutations).length; i++) {
      for (let j = 0; j < Array.from(operatorPermutations_all).length; j++) {
        combinations.push({
          operands: Array.from(operandSubsetPermutations)[i],
          operators: Array.from(operatorPermutations_all)[j],
        });
      }
    }

    // Compute the end result of every combination
    var calculatedValues = new Set<number>();
    for (let i = 0; i < combinations.length; i++) {
      if (combinations[i].operands.length === 1) {
        // Only one number
        calculatedValues.add(combinations[i].operands[0]); // That number is valid
      } else if (
        combinations[i].operands.length === 2 &&
        combinations[i].operators.length === 1
      ) {
        const firstNum = combinations[i].operands[0];
        const secondNum = combinations[i].operands[1];
        const firstOperator = combinations[i].operators[0];
        const result = firstOperator.function(firstNum, secondNum);
        calculatedValues.add(result);
      } else if (
        combinations[i].operands.length === 3 &&
        combinations[i].operators.length === 2
      ) {
        const firstNum = combinations[i].operands[0];
        const secondNum = combinations[i].operands[1];
        const thirdNum = combinations[i].operands[2];
        const firstOperator = combinations[i].operators[0];
        const secondOperator = combinations[i].operators[1];
        const firstCalculation = firstOperator.function(firstNum, secondNum);
        const result = secondOperator.function(firstCalculation, thirdNum);
        calculatedValues.add(result);
      } else if (
        combinations[i].operands.length === 4 &&
        combinations[i].operators.length === 3
      ) {
        const firstNum = combinations[i].operands[0];
        const secondNum = combinations[i].operands[1];
        const thirdNum = combinations[i].operands[2];
        const fourthNum = combinations[i].operands[3];
        const firstOperator = combinations[i].operators[0];
        const secondOperator = combinations[i].operators[1];
        const thirdOperator = combinations[i].operators[2];
        const firstCalculation = firstOperator.function(firstNum, secondNum);
        const secondCalculation = secondOperator.function(
          firstCalculation,
          thirdNum
        );
        const result = thirdOperator.function(secondCalculation, fourthNum);
        calculatedValues.add(result);
      }
    }

    // Remove results which aren't integers or are outside range of (0, gridSize)
    const validValues = Array.from(calculatedValues).filter(
      (x) => x > 0 && x <= props.gridSize && Math.round(x) === x
    );
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
