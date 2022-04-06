import { permutator } from "../getValidValues";

export const expression_trees_3 = generateExpressionTrees(3);

export const expression_trees_4 = generateExpressionTrees(4);

export const expression_trees_5 = generateExpressionTrees(5);

export const expression_trees_6 = generateExpressionTrees(6);

function generateExpressionTrees(numOperands: number): string[] {
  const expression_string: number[] = [];

  // There are 2 fixed operands, that will be handled later on
  for (let i = 0; i < numOperands - 2; i++) {
    expression_string.push(0);
  }

  // 1 less operator than numOperands
  for (let j = 0; j < numOperands - 1; j++) {
    expression_string.push(1);
  }

  // Get all the permutations after the first 2 fixed operands
  const expressions_permutations = permutator(expression_string);

  // Add the first 2 fixed operands at the start of every permutation
  const expressions_full = expressions_permutations.map((x) => [0, 0].concat(x));

  // At any position, the number of 0s to the left must be >= (the number of 1s) + 1
  function validExpression(expression: number[]) {
    // Each number in the expression
    for (let j = 2; j < expression.length; j++) {
      // Start with first 3 elements (fixed 2 to begin with and another)
      const sliced_portion = expression.slice(0, j);
      const numOperands = sliced_portion.filter((x) => x === 0).length;
      const numOperators = sliced_portion.filter((x) => x === 1).length;
      const validExpression = numOperands >= numOperators + 1;
      if (!validExpression) {
        return false;
      }
    }
    return true;
  }

  const valid_expressions: number[][] = [];

  for (let i = 0; i < expressions_full.length; i++) {
    const expression = expressions_full[i];
    if (validExpression(expression)) {
      valid_expressions.push(expression);
    }
  }

  // Convert to string (easier to work with)
  const expr_map = valid_expressions.map((x) => JSON.stringify(x));
  // Unique expression trees only
  const expr_set = new Set(expr_map);
  const expr_arr = Array.from(expr_set);

  // Remove surrounding brackets
  const remove_brackets = expr_arr.map((x) => x.slice(1, x.length - 1));
  // Remove commas
  const result = remove_brackets.map((x) => x.replaceAll(",", ""));

  return result;
}
