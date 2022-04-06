import {
  expression_trees_3,
  expression_trees_4,
  expression_trees_5,
  expression_trees_6,
} from "./ReversePolish/expression_trees";

var rpn = require("rpn");

// --- OPERATORS (+ - / *) ---
export const operators: { name: "/" | "-" | "+" | "*"; function: (num1: number, num2: number) => number }[] = [
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

export const operators_symbols = ["/", "-", "+", "*"];

// Returns permutations of input array, https://stackoverflow.com/a/20871714
export function permutator<T>(inputArr: T[]): T[][] {
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
function combRep(arr: string[], l: number) {
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

function getOperatorPermutations(numOperands: number): string[][] {
  // Permutations with no repetition
  let operatorPermutations = permutator(operators_symbols);

  // Permutations with repetition
  for (let i = 1; i <= numOperands + 1; i++) {
    // Array of permutations of length i
    let newPermutations = combRep(operators_symbols, i);
    // Add on to operatorPermutations array
    operatorPermutations = operatorPermutations.concat(newPermutations);
  }

  // Make a copy of the permutations so far
  let operatorSubsetPermutations = operatorPermutations.slice();

  // Add smaller length subsets (to new copy)
  for (let i = 0; i < operatorPermutations.length; i++) {
    for (let j = 1; j < numOperands; j++) {
      operatorSubsetPermutations.push(operatorPermutations[i].slice(0, j));
    }
  }

  // Remove any subset larger in length than the (number of values - 1)
  const operatorSubsetPermutationsFiltered = operatorSubsetPermutations.filter((x) => x.length <= numOperands - 1);

  return operatorSubsetPermutationsFiltered;
}

function getOperandPermutations(inputNumbers: number[]): number[][] {
  // Permutations of the inputNumbers
  const operandPermutations = permutator(inputNumbers);

  // Start new array as copy of progress so far (operandPermutations)
  let operandSubsetPermutations = operandPermutations.slice();

  // Add smaller length subsets
  for (let i = 0; i < operandPermutations.length; i++) {
    for (let j = 1; j < inputNumbers.length; j++) {
      operandSubsetPermutations.push(operandPermutations[i].slice(0, j));
    }
  }

  return operandSubsetPermutations;
}

function getCombinations(inputNumbers: number[]): {
  operands: number[];
  operators: string[];
}[] {
  const operatorPermutations = getOperatorPermutations(inputNumbers.length);
  const operandPermutations = getOperandPermutations(inputNumbers);

  // Combine the permutations of operands and operators (not yet in reverse polish)
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
  return combinations;
}

function getExpressionTrees(combination: { operands: number[]; operators: string[] }): string[] {
  const numOperands = combination.operands.length;
  const numOperators = combination.operators.length;

  if (numOperands === 3 && numOperators === 2) {
    return expression_trees_3;
  } else if (numOperands === 4 && numOperators === 3) {
    return expression_trees_4;
  } else if (numOperands === 5 && numOperators === 4) {
    return expression_trees_5;
  } else if (numOperands === 6 && numOperators === 5) {
    return expression_trees_6;
  } else {
    return [];
  }
}

function getPolishExpressionsFromCombination(combination: {
  operands: number[];
  operators: string[];
}): Array<Array<string | number>> {
  // All the reverse polish expressions for this combination
  let expressions: Array<Array<string | number>> = [];

  // Get the expression trees for the length of combination
  const expression_trees = getExpressionTrees(combination);

  for (let i = 0; i < expression_trees.length; i++) {
    // Split each expression tree into the operand (0) and operator (1) parts
    const expression_tree_parts = expression_trees[i].split("");
    let operandCount = 0;
    let operatorCount = 0;

    // The reverse polish expression for the current expression tree
    let expression: Array<string | number> = [];

    for (let j = 0; j < expression_tree_parts.length; j++) {
      // Number/operand
      if (expression_tree_parts[j] === "0") {
        expression.push(combination.operands[operandCount]);
        // Increment count so that the next time around the next operand in the combination is used
        operandCount += 1;
      }
      // Operator
      else if (expression_tree_parts[j] === "1") {
        expression.push(combination.operators[operatorCount]);
        operatorCount += 1;
      }
    }

    // Add to bigger array
    expressions.push(expression);
  }

  return expressions;
}

function getAllPolishExpressions(
  combinations: {
    operands: number[];
    operators: string[];
  }[]
): Array<Array<string | number>> {
  let polish_expressions: Array<Array<string | number>> = [];

  // Add the polish expressions for every combination
  for (let i = 0; i < combinations.length; i++) {
    polish_expressions = polish_expressions.concat(getPolishExpressionsFromCombination(combinations[i]));
  }

  console.log(polish_expressions);
  return polish_expressions;
}

export function getValidValues(inputNumbers: number[], maxLimit: number): number[] {
  const combinations = getCombinations(inputNumbers);
  const polish_expressions = getAllPolishExpressions(combinations);

  const unique_polish_expressions_strings = Array.from(new Set<string>(polish_expressions.map(x => x.join(" "))));

  var calculatedValues = [];

  for (const string of unique_polish_expressions_strings) {
    const result = rpn(string);
    if (result && result > 0 && result <= maxLimit && Number.isInteger(result)) {
      calculatedValues.push(result);
    }
  }

  const validValues = new Set<number>(calculatedValues);

  console.log(validValues);
  return Array.from(validValues);
}