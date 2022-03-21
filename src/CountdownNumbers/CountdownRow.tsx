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
      TileArray.push(
        <NumberTile
          key={i}
          number={props.expression?.[i].number}
          disabled={props.expression?.[i].picked}
          isReadOnly={props.isReadOnly}
          onClick={() => props.onClick(props.expression?.[i].number)}
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
