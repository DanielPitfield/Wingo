import React from "react";
import EqualsTile from "./EqualsTile";
import NumberTile from "./NumberTile";
import OperatorTile from "./OperatorTile";

interface Props {
  isReadOnly: boolean;
  expression: number[];
  length: number;
  targetNumber: string;
  hasSubmit: boolean;
}

export const NumberRow: React.FC<Props> = (props) => {
  function CreateRow() {
    var TileArray = [];

    if (props.isReadOnly) {
      for (let i = 0; i < props.length; i++) {
        TileArray.push(
          <NumberTile
            key={i}
            number={props.expression?.[i]}
            //onClick={props.onClick}
          ></NumberTile>
        );
      }
    } else {
      TileArray.push(
        <NumberTile
          key={"first-operand"}
          number={props.expression?.[0]}
          //onClick={props.onClick}
        ></NumberTile>
      );
      TileArray.push(<OperatorTile key={"first-operator"}></OperatorTile>);
      TileArray.push(
        <NumberTile
          key={"second-operand"}
          number={props.expression?.[1]}
          //onClick={props.onClick}
        ></NumberTile>
      );
      TileArray.push(
        <EqualsTile
          key={"equals"}
          //onClick={props.onClick}
        ></EqualsTile>
      );
      TileArray.push(
        <NumberTile
          key={"row_result"}
          number={-1}
          //onClick={props.onClick}
        ></NumberTile>
      );
    }

    return TileArray;
  }

  return (
    <div className="number_row">
      <>{CreateRow()}</>
    </div>
  );
};
