import React from "react";
import EqualsTile from "./EqualsTile";
import NumberTile from "./NumberTile";
import OperatorTile from "./OperatorTile";
import { Guess } from "./CountdownNumbersConfig";
import { operators } from "../Nubble/getValidValues";

interface Props {
  onClick: (value: number | null, id: {type: "original", index: number} | {type: "intermediary", rowIndex: number}) => void;
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

export function calculateTotal(guess: Guess): number | null {
  const operator = operators.find((x) => x.name === guess.operator);

  if (!operator) {
    throw new Error("Unable to find operator");
  }

  // Either operand is missing, show nothing
  if (guess.operand1 === null || guess.operand2 === null) {
    return null;
  }

  const result = operator.function(guess.operand1, guess.operand2);

  if (result === Math.round(result)) {
    return result;
  }

  return null;
}

export const NumberRow: React.FC<Props> = (props) => {
  function CreateRow() {
    var TileArray = [];
    TileArray.push(
      <NumberTile
        key={"first-operand"}
        number={props.expression.operand1}
        disabled={false}
        isReadOnly={props.isReadOnly}
        // Do nothing on left click
        onClick={() => {}}
        // Remove operand from current guess on right click
        onRightClick={() => {
          // if (!props.isReadOnly) {
          //   props.onRightClick(props.expression.operand1, 0);
          // }
        }}
      ></NumberTile>
    );
    TileArray.push(
      <OperatorTile
        hasTimerEnded={props.hasTimerEnded}
        targetNumber={props.targetNumber}
        setOperator={props.setOperator}
        operator={props.expression.operator}
        key={"first-operator"}
      ></OperatorTile>
    );
    TileArray.push(
      <NumberTile
        key={"second-operand"}
        number={props.expression.operand2}
        disabled={false}
        isReadOnly={props.isReadOnly}
        onClick={() => {}}
        onRightClick={() => {
          // if (!props.isReadOnly) {
          //   props.onRightClick(props.expression.operand2, 2);
          // }
        }}
      ></NumberTile>
    );
    TileArray.push(<EqualsTile key={"equals"}></EqualsTile>);
    TileArray.push(
      <NumberTile
        key={"row_result"}
        number={calculateTotal(props.expression) || null}
        disabled={false}
        isReadOnly={props.isReadOnly}
        onClick={() => props.onClick(calculateTotal(props.expression) || null, {type: "intermediary", rowIndex: props.rowIndex })}
        // TODO: Right click on result too
        onRightClick={() => {}}
      ></NumberTile>
    );

    return TileArray;
  }

  return (
    <div className="number_row">
      <>{CreateRow()}</>
    </div>
  );
};
