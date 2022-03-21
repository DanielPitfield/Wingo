import React from "react";
import NumberTile from "./NumberTile";

interface Props {
  onClick: (value: number | null) => void;
  isReadOnly: boolean;
  expression: {
    number: number | null;
    picked: boolean;
  }[];
  length: number;
}

export const CountdownRow: React.FC<Props> = (props) => {
  function CreateRow() {
    var TileArray = [];
    for (let i = 0; i < props.length; i++) {
      // If picked property is true, use number property value, otherwise use null
      const number = props.expression?.[i].picked ? props.expression?.[i].number : null
      TileArray.push(
        <NumberTile
          key={i}
          number={number}
          isReadOnly={props.isReadOnly}
          onClick={() => props.onClick(number)}
          onContextMenu={() => {}}
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
