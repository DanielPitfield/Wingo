import React from "react";
import NumberTile from "./NumberTile";

interface Props {
  onClick: (
    value: number | null,
    id: { type: "original"; index: number } | { type: "intermediary"; rowIndex: number }
  ) => void;
  disabled: boolean;
  countdownStatuses: {
    type: "original" | "intermediary";
    number: number | null;
    picked: boolean;
  }[];
}

export const CountdownRow: React.FC<Props> = (props) => {
  /**
   *
   * @returns
   */
  function CreateRow() {
    const tileArray = [];
    const rowLength = props.countdownStatuses.filter(x => x.type === "original").length;

    for (let i = 0; i < rowLength; i++) {
      tileArray.push(
        <NumberTile
          key={i}
          number={props.countdownStatuses?.[i].number}
          disabled={props.disabled || props.countdownStatuses?.[i].picked}
          onClick={() => props.onClick(props.countdownStatuses?.[i].number, { type: "original", index: i })}
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
