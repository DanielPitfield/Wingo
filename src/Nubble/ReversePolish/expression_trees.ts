// At any position, the number of 0s to the left must be >= (the number of 1s) + 1

import { permutator } from "../getValidValues";

export const expression_trees_3 = ["00101", "00011"];

export const expression_trees_4 = ["0010101", "0001101", "0001011", "0000111", "0010011"];

export const expression_trees_5 = [];

export const expression_trees_6 = [
  "00000011111",
  "00000101111",
  "00000110111",
  "00000111011",
  "00000111101",
  "00001001111",
  "00001010111",
  "00001011011",
  "00001011101",
  "00001100111",
  "00001101011",
  "00001101101",
  "00001110011",
  "00001110101",
  "00010001111",
  "00010010111",
  "00010011011",
  "00010011101",
  "00010100111",
  "00010101011",
  "00010101101",
  "00010110011",
  "00010110101",
  "00011000111",
  "00011001011",
  "00011001101",
  "00011010011",
  "00011010101",
  "00100001111",
  "00100010111",
  "00100011011",
  "00100011101",
  "00100100111",
  "00100101011",
  "00100101101",
  "00100110011",
  "00100110101",
  "00101000111",
  "00101001011",
  "00101001101",
  "00101010011",
  "00101010101",
];

// Input: Number of required operands (exlcuding the fixed first 2) followed by required number of operators
// const expressions = [0, 0, 0, 0, 1, 1, 1, 1, 1];

export function generateExpressionTrees(input: number[]): string[] {
  const expressions_permutations = permutator(input);

  // Add fixed first two operands
  const expressions_comp = expressions_permutations.map((x) => [0, 0].concat(x));

  // At any position, the number of 0s to the left must be >= (the number of 1s) + 1
  function validExpression(expression: number[]) {
    // Each number in the expression
    for (let j = 2; j < expression.length; j++) {
      if (expression[j] === 1) {
        const sliced_portion = expression.slice(0, j);
        const numOperands = sliced_portion.filter((x) => x === 0).length;
        const numOperators = sliced_portion.filter((x) => x === 1).length;
        const validExpression = numOperands >= numOperators + 1;
        if (!validExpression) {
          return false;
        }
      }
    }
    return true;
  }

  const valid_expressions: number[][] = [];

  // Each expression
  for (let i = 0; i < expressions_comp.length; i++) {
    const expression = expressions_comp[i];
    if (validExpression(expression)) {
      valid_expressions.push(expression);
    }
  }

  const expr_map = valid_expressions.map((x) => JSON.stringify(x));
  const expr_set = new Set(expr_map);
  const result = Array.from(expr_set);

  return result;
}
