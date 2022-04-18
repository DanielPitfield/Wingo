// From: https://github.com/CGJennings/countdown-solver/blob/main/numbers-round/number-solver.js
// Licence: MIT

type Operator = "+" | "-" | "×" | "÷";

/**
 * The input for a numbers round: a target number and a list of values
 * that can be used to compute the target.
 */
export class NumberPuzzle {
  /** The target number to reach. */
  private target: number;

  /** The numbers to combine to reach the target. */
  private values: number[];

  /**
   * Create a new numbers round. All arguments are optional; any that are
   * omitted will use the standard rules.
   *
   * @param target The target to solve for.
   * @param values Array of the numbers to choose from.
   */
  constructor(target: number, values: number[]) {
    if (target == null) {
      target = 100 + this.random(900);
    }

    this.values = values;
    this.target = target;
  }

  /** Choose a random integer from 0 to n-1. */
  private random(n: number): number {
    return Math.floor(Math.random() * Math.floor(n));
  }

  /**
   * Returns solutions for the puzzle, if any.
   * @returns The best (or closest) solution,
   *     and all exact solutions.
   */
  public solve(): { best: NumberPuzzleValue; all: NumberPuzzleValue[] } {
    let values = this.values.map((n) => new NumberPuzzleValue(n));
    let solutions = {
      best: values[0],
      all: [] as NumberPuzzleValue[],
    };

    values.forEach((v) => consider(v, this.target, solutions));
    solveImplemetation(values, this.target, solutions);
    solutions.all.sort((v1, v2) => v1.compareTo(v2, this.target));

    return solutions;
  }

  public toString(): string {
    return `Try to make ${this.target} using ${this.values.join(", ")}.`;
  }
}

/**
 * Describes one value that may be part of a solution, including a description
 * of all the steps that led up to this value.
 */
export class NumberPuzzleValue {
  public number: number;
  private lhs: NumberPuzzleValue | null = null;
  private rhs: NumberPuzzleValue | null = null;
  private operator: Operator | null = null;
  private steps = 0;

  /**
   * Creates a new Value. The constructor is used to create the starting
   * values that act as inputs to the problem.
   * @param n The input value.
   */
  constructor(n: number) {
    this.number = n;
  }

  /**
   * Returns a new value that combines this value with the specified value
   * using the given operand. This value must be greater than
   * or equal to the rhs value.
   *
   * @param rhs The value to combine with this value.
   * @param operator The arithmetic operation to apply.
   * @returns The derived value, or null if the result is not allowed
   *      (a fraction or number less than one).
   */
  public combine(rhs: NumberPuzzleValue, operator: Operator): NumberPuzzleValue | null {
    let n;

    switch (operator) {
      case "+":
        n = this.number + rhs.number;
        break;

      case "×":
        n = this.number * rhs.number;
        break;

      case "-":
        n = this.number - rhs.number;
        if (n < 1) return null;
        break;

      case "÷":
        n = this.number / rhs.number;
        if (!Number.isInteger(n)) return null;
        break;

      default:
        throw new Error(`unknown operator ${operator}`);
    }

    let v = new NumberPuzzleValue(n);
    v.lhs = this;
    v.rhs = rhs;
    v.operator = operator;
    v.steps = this.steps + rhs.steps + 1;

    return v;
  }

  /**
   * Compares this value to another value, returning zero if the values are equal,
   * a negative number if this value precedes the other value, or a positive number
   * otherwise.
   *
   * @param rhs The value to compare this value to.
   * @param target The round's target number.
   */
  public compareTo(rhs: NumberPuzzleValue, target: number) {
    // pick value closest to target
    const lDist = Math.abs(this.number - target);
    const rDist = Math.abs(rhs.number - target);

    if (lDist !== rDist) {
      return lDist - rDist;
    }

    // pick value that requires the fewest steps
    const lSteps = this.steps;
    const rSteps = rhs.steps;
    if (lSteps !== rSteps) {
      return lSteps - rSteps;
    }

    // pick value with shortest string representation
    return (this.toString()! as string).length - (rhs.toString()! as string).length;
  }

  /**
   * Returns a string that reprents the steps used to create this value as a JavaScript expression.
   */
  private toExpression(): string {
    if (this.lhs == null) {
      return this.number.toString();
    }

    return `(${this.lhs.toExpression()}) ${this.operator} (${this.rhs!.toExpression()})`;
  }

  /**
   * Returns a string that describes the steps needed to reproduce
   * this value from the starting input.
   */
  public toListOfSteps(): string[] {
    // if this is a starting value, then the only "step"
    // involved is that the number itself matches the target
    if (this.lhs == null) {
      return [`${this.number} = ${this.number}`];
    }

    // recursive helper function that walks the history tree,
    // capturing the calculations performed in reverse order
    function steps(v: any): string[] {
      // ignore starting values
      if (v.lhs == null) {
        return [];
      }

      // first gather up the steps from deeper in the tree,
      // then append this step to the end
      const prevSteps = [steps(v.lhs), steps(v.rhs)].flatMap((x) => x);

      return [...prevSteps, `${v.lhs.number} ${v.operator} ${v.rhs.number} = ${v.number}`];
    }

    return steps(this);
  }

  public toString() {
    if (this._simpleExpression == null) {
      let expr = this.toExpression();
      // replace lone numbers in brackets with just the number
      expr = expr.replace(/\((\d+)\)/gu, "$1");

      const plusReduce = /\(\((\d+) \+ (\d+(?: \+ \d+)*)\) \+ (\d+)\)/gu;
      const minusReduce = /\(\((\d+) - (\d+(?: - \d+)*)\) - (\d+)\)/gu;
      const multReduce = /\(\((\d+) × (\d+(?: × \d+)*)\) × (\d+)\)/gu;
      const divReduce = /\(\((\d+) \/ (\d+(?: \/ \d+)*)\) \/ (\d+)\)/gu;

      for (;;) {
        let oldExpr = expr;
        expr = expr.replace(plusReduce, "($1 + $2 + $3)");
        expr = expr.replace(minusReduce, "($1 - $2 - $3)");
        expr = expr.replace(multReduce, "($1 × $2 × $3)");
        expr = expr.replace(divReduce, "($1 / $2 / $3)");
        if (oldExpr === expr) {
          break;
        }
      }

      this._simpleExpression = expr;
    }

    return this._simpleExpression;
  }

  _simpleExpression: string | null = null;
}

/**
 * Consider a potential solution, adding it to the list if relevant.
 *
 * @param value The potential solution to consider.
 * @param target The target number.
 * @param solutions The collection of solutions found so far.
 */
function consider(
  value: NumberPuzzleValue,
  target: number,
  solutions: { best: NumberPuzzleValue; all: NumberPuzzleValue[] }
) {
  if (value.compareTo(solutions.best, target) < 0) {
    solutions.best = value;
  }

  if (value.number === target) {
    solutions.all.push(value);
  }
}

const operations: Operator[] = ["+", "-", "×", "÷"];

/**
 * Implementation of the puzzle solver.
 * @param values The number values to use to make the target.
 * @param target The target number to reach.
 * @param solutions Discovered solutions.
 */
function solveImplemetation(
  values: NumberPuzzleValue[],
  target: number,
  solutions: { best: NumberPuzzleValue; all: NumberPuzzleValue[] }
) {
  for (let i = 0; i < values.length - 1; ++i) {
    for (let j = i + 1; j < values.length; ++j) {
      // get pair of values to combine and ensure they are in sorted order
      let lhs = values[i];
      let rhs = values[j];

      if (lhs.number < rhs.number) {
        [lhs, rhs] = [rhs, lhs];
      }

      // try combining the values with each operation
      for (let op of operations) {
        const result = lhs.combine(rhs, op);
        if (result == null) {
          continue;
        }

        consider(result, target, solutions);

        // if there are more than two values left in the list,
        // we can still make more pairs from the shorter list
        if (values.length > 2) {
          const reducedValues = reduce(values, i, j, result)!;
          solveImplemetation(reducedValues, target, solutions);
        }
      }
    }
  }
}

/**
 * Returns a copy of a value array with the specified elements
 * merged into a single new entry. The indices must be different.
 */
function reduce(
  values: NumberPuzzleValue[],
  skipIndex1: number,
  skipIndex2: number,
  combined: NumberPuzzleValue
): NumberPuzzleValue[] | null {
  if (combined == null) {
    return null;
  }

  const copy = [combined];

  for (let i = 0; i < values.length; ++i) {
    if (i === skipIndex1 || i === skipIndex2) {
      continue;
    }

    copy.push(values[i]);
  }

  return copy;
}
