import React from "react";
import NumberTile from "./NumberTile";

interface Props {
  onClick: (value: number | null, id: {type: "original", index: number} | {type: "intermediary", rowIndex: number}) => void;
  isReadOnly: boolean;
  expression: {
    number: number | null;
    picked: boolean;
  }[];
  length: number;
}

export const CountdownRow: React.FC<Props> = (props) => {
  /**
   * 
   * @returns 
   */
  function CreateRow() {
    const tileArray = [];

    for (let i = 0; i < props.length; i++) {
      tileArray.push(
        <NumberTile
          key={i}
          number={props.expression?.[i].number}
          disabled={props.expression?.[i].picked}
          isReadOnly={props.isReadOnly}
          onClick={() => props.onClick(props.expression?.[i].number, {type: "original", index: i} )}
          onRightClick={() => {}}
        ></NumberTile>
      );
    }

    return tileArray;
  }

  return (
    <div className="number_row">
      <>{CreateRow()}</>
    </div>
  );
};
