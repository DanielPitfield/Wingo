import React from "react";
import NumberTile from "./NumberTile";
import OperatorTile from "./OperatorTile";
import { Guess, operators } from "./CountdownNumbersConfig";

interface Props {
  onClick: (
    value: number | null,
    id: { type: "original"; index: number } | { type: "intermediary"; rowIndex: number }
  ) => void;
  hasTimerEnded: boolean;
  expression: Guess;
  rowIndex: number;
  targetNumber: number | null;
  hasSubmit: boolean;
  disabled: boolean;
  indetermediaryGuessStatuses: {
    type: "intermediary";
    wordIndex: number;
    number: number | null;
    picked: boolean;
  }[];
  setOperator: (operator: typeof operators[0]["name"]) => void;
}

/**
 *
 * @param guess
 * @returns
 */
export function calculateTotal(guess: Guess): number | null {
  if (!guess) {
    return null;
  }

  const operator = operators.find((x) => x.name === guess.operator);

  if (!operator) {
    return null;
  }

  // Either operand is missing, show nothing
  if (guess.operand1 === null || guess.operand2 === null) {
    return null;
  }

  const result = operator.function(guess.operand1, guess.operand2);

  // If the result is not generated correctly
  if (!result) {
    return null;
  }

  // If the result is fractional
  if (result !== Math.round(result)) {
    return null;
  }

  // If the result is negative
  if (result < 0) {
    return null;
  }

  return result;
}

export const NumberRow: React.FC<Props> = (props) => {
  return (
    <div className="number_row">
      <NumberTile
        key="first-operand"
        number={props.expression ? props.expression.operand1 : null}
        disabled={props.disabled || calculateTotal(props.expression) !== null || props.expression.operand1 === null}
      />

      <OperatorTile
        key="first-operator"
        hasTimerEnded={props.hasTimerEnded}
        targetNumber={props.targetNumber}
        setOperator={props.setOperator}
        disabled={props.disabled || calculateTotal(props.expression) !== null}
        operator={props.expression ? props.expression.operator : "+"}
      />

      <NumberTile
        key="second-operand"
        number={props.expression ? props.expression.operand2 : null}
        disabled={props.disabled || calculateTotal(props.expression) !== null || props.expression.operand2 === null}
      />

      <div key="equals" className="equals_tile" data-disabled={true} data-is-readonly={false}>
        =
      </div>

      <NumberTile
        key="row_result"
        number={calculateTotal(props.expression) || null}
        disabled={
          props.disabled ||
          props.indetermediaryGuessStatuses.find((x) => x.wordIndex === props.rowIndex)?.picked === true ||
          calculateTotal(props.expression) === null
        }
        onClick={() =>
          props.onClick(calculateTotal(props.expression) || null, { type: "intermediary", rowIndex: props.rowIndex })
        }
      />
    </div>
  );
};
