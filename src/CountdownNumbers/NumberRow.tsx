import React from "react";
import EqualsTile from "./EqualsTile";
import NumberTile from "./NumberTile";
import OperatorTile from "./OperatorTile";
import { operators } from "../Nubble/Nubble";
import { Guess } from "./CountdownNumbersConfig";

interface Props {
  onClick: (value: number) => void;
  isReadOnly: boolean;
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
    
    if (props.expression.operand1 === null || props.expression.operand2 === null) {
      return null;
    }

    return operator.function(props.expression.operand1, props.expression.operand2);
  }


  function CreateRow() {
    var TileArray = [];

    // if (props.isReadOnly) {
    //   for (let i = 0; i < props.length; i++) {
    //     TileArray.push(
    //       <NumberTile
    //         key={i}
    //         number={props.expression?.[i]}
    //         isReadOnly={props.isReadOnly}
    //         onClick={() => props.onClick(props.expression?.[i])}
    //       ></NumberTile>
    //     );
    //   }
    // } else {
      TileArray.push(
        <NumberTile
          key={"first-operand"}
          number={props.expression.operand1}
          isReadOnly={props.isReadOnly}
          onClick={() => {}}
        ></NumberTile>
      );
      TileArray.push(<OperatorTile setOperator={props.setOperator} operator={props.expression.operator} key={"first-operator"}></OperatorTile>);
      TileArray.push(
        <NumberTile
          key={"second-operand"}
          number={props.expression.operand2}
          isReadOnly={props.isReadOnly}
          onClick={() => {}}
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
          number={calculateTotal() || -1}
          isReadOnly={props.isReadOnly}
          onClick={() =>{}}
        ></NumberTile>
      );
    // }

    return TileArray;
  }

  return (
    <div className="number_row">
      <>{CreateRow()}</>
    </div>
  );
};
