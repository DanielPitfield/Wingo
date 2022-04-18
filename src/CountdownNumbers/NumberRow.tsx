import React from "react";
import NumberTile from "./NumberTile";
import OperatorTile from "./OperatorTile";
import { Guess } from "./CountdownNumbersConfig";
import { operators } from "../Nubble/getValidValues";

interface Props {
  onClick: (
    value: number | null,
    id: { type: "original"; index: number } | { type: "intermediary"; rowIndex: number }
  ) => void;
  onRightClick: (value: number | null, index: number) => void;
  isReadOnly: boolean;
  hasTimerEnded: boolean;
  expression: Guess;
  rowIndex: number;
  length: number;
  targetNumber: number | null;
  hasSubmit: boolean;
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

  if (!result) {
    return null;
  }

  if (result === Math.round(result)) {
    return result;
  }

  return null;
}

export const NumberRow: React.FC<Props> = (props) => {
  return (
    <div className="number_row">
      <NumberTile
        key="first-operand"
        number={props.expression ? props.expression.operand1 : null}
        disabled={false}
        isReadOnly={props.isReadOnly}
      />

      <OperatorTile
        key="first-operator"
        hasTimerEnded={props.hasTimerEnded}
        targetNumber={props.targetNumber}
        setOperator={props.setOperator}
        operator={props.expression ? props.expression.operator : "+"}
      />

      <NumberTile
        key="second-operand"
        number={props.expression ? props.expression.operand2 : null}
        disabled={false}
        isReadOnly={props.isReadOnly}
      />

      <div key="equals" className="equals_tile">
        =
      </div>

      <NumberTile
        key="row_result"
        number={calculateTotal(props.expression) || null}
        disabled={false}
        isReadOnly={props.isReadOnly}
        onClick={() =>
          props.onClick(calculateTotal(props.expression) || null, { type: "intermediary", rowIndex: props.rowIndex })
        }
      />
    </div>
  );
};
