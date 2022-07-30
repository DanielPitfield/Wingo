import React from "react";
import NumberTile from "./NumberTile";

interface Props {
  onClick: (
    value: number | null,
    id: { type: "original"; index: number } | { type: "intermediary"; rowIndex: number }
  ) => void;
  disabled: boolean;
  numberTileStatuses: {
    type: "original" | "intermediary";
    number: number | null;
    picked: boolean;
  }[];
}

export const NumberSelectionRow: React.FC<Props> = (props) => {
  /**
   *
   * @returns
   */
  function CreateRow() {
    const tileArray = [];
    const originalNumbers = props.numberTileStatuses.filter((x) => x.type === "original");

    for (let i = 0; i < originalNumbers.length; i++) {
      tileArray.push(
        <NumberTile
          key={i}
          number={originalNumbers?.[i].number}
          disabled={props.disabled || originalNumbers?.[i].picked}
          onClick={() => props.onClick(originalNumbers?.[i].number, { type: "original", index: i })}
        />
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
