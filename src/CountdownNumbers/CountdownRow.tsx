import React from "react";
import EqualsTile from "./EqualsTile";
import NumberTile from "./NumberTile";
import OperatorTile from "./OperatorTile";
import { operators } from "../Nubble/Nubble";
import { Guess } from "./CountdownNumbersConfig";

interface Props {
  onClick: (value: number) => void;
  isReadOnly: boolean;
  expression: number[];
  length: number;
}

export const CountdownRow: React.FC<Props> = (props) => {
  function CreateRow() {
    var TileArray = [];
    for (let i = 0; i < props.length; i++) {
      TileArray.push(
        <NumberTile
          key={i}
          number={props.expression?.[i]}
          isReadOnly={props.isReadOnly}
          onClick={() => props.onClick(props.expression?.[i])}
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
