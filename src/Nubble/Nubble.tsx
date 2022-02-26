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

    return Array.from(validValues);
  }

  function onClick(i: number) {
    const validValues = getValidValues();

    if (!validValues.includes(i)) {
      // Invalid
      return;
    }

    alert(gridPoints.find(x => x.number === i)?.points);
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
