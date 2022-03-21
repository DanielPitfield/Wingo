import React from "react";
import EqualsTile from "./EqualsTile";
import NumberTile from "./NumberTile";
import OperatorTile from "./OperatorTile";
import { operators } from "../Nubble/Nubble";
import { Guess } from "./CountdownNumbersConfig";

interface Props {
  onClick: (value: number) => void;
  onContextMenu: (value: number | null) => void;
  isReadOnly: boolean;
  hasTimerEnded: boolean;
  expression: Guess;
  length: number;
  targetNumber: number | null;
  hasSubmit: boolean;
  setOperator: (operator: (typeof operators)[0]["name"]) => void;
}

export const NumberRow: React.FC<Props> = (props) => {
  function calculateTotal(): number | null {    
    const operator = operators.find(x => x.name === props.expression.operator);
    
    if (!operator) {
      throw new Error("Unable to find operator");
    }
    
    // Either operand is missing, show nothing
    if (props.expression.operand1 === null || props.expression.operand2 === null) {
      return null;
    }

    return operator.function(props.expression.operand1, props.expression.operand2);
  }


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
          onContextMenu={() => props.onContextMenu(props.expression.operand1)}
        ></NumberTile>
      );
      TileArray.push(<OperatorTile hasTimerEnded={props.hasTimerEnded} setOperator={props.setOperator} operator={props.expression.operator} key={"first-operator"}></OperatorTile>);
      TileArray.push(
        <NumberTile
          key={"second-operand"}
          number={props.expression.operand2}
          disabled={false}
          isReadOnly={props.isReadOnly}
          onClick={() => {}}
          onContextMenu={() => props.onContextMenu(props.expression.operand2)}
        ></NumberTile>
      );
      TileArray.push(
        <EqualsTile
          key={"equals"}
        ></EqualsTile>
      );
      TileArray.push(
        <NumberTile
          key={"row_result"}
          number={calculateTotal() || null}
          disabled = {false}
          isReadOnly={props.isReadOnly}
          onClick={() =>{}}
          onContextMenu={() => {}}
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
