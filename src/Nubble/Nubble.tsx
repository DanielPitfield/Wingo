import React, { useState } from "react";
import { Button } from "../Button";
import "../index.css";
import DiceGrid from "./DiceGrid";

interface Props {
  numDice: number;
  diceMin: number;
  diceMax: number;
  gridSize: number;
  numTeams: number;
  timeLengthMins: number;
}

const Nubble: React.FC<Props> = (props) => {
  const [diceValues, setdiceValues] = useState<number[]>(
    Array.from({ length: props.numDice }).map((x) => randomDiceNumber())
  );

  function randomIntFromInterval(min: number, max: number) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  function randomDiceNumber() {
    return randomIntFromInterval(props.diceMin, props.diceMax);
  }

  function rollDice() {
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

  function checkValid(value: number) {
    // https://stackoverflow.com/a/20871714
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

    /* permutations[operators] [a,a,a,a]

    ...........

                              [a,b,a,a]

    */

    const operatorPermutations = permutator(operators);
    const operandPermutations = permutator(diceValues);

    var combinations = [];
    for (let i = 0; i < operandPermutations.length; i++) {
      for (let j = 0; j < operatorPermutations.length; j++) {
        combinations.push({
          operands: operandPermutations[i],
          operators: operatorPermutations[j],
        });
      }
    }
    console.log(combinations);

    var validValues = new Set<number>();
    for (let i = 0; i < combinations.length; i++) {
      const combination = combinations[i];

      const num = combination.operators[2].function(
        combination.operators[1].function(
          combination.operators[0].function(
            combination.operands[0],
            combination.operands[1]
          ),
          combination.operands[2]
        ),
        combination.operands[3]
      );

      if (Math.round(num) === num && num > 0) {
        validValues.add(num);
      }
    }
    console.log(validValues);

    //console.log(operatorPermutations);
    //console.log(operandPermutations);
  }

  function populateGrid() {
    var Grid = [];
    for (let i = 1; i <= props.gridSize; i++) {
      Grid.push(
        <button
          className="nubble-button"
          data-isPrime={isPrime(i)}
          onClick={() => checkValid(i)}
        >
          {i}
        </button>
      );
      // TODO: Make this into its own component instead of using Button component?
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
