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

export const NumberSelectionRow = (props: Props) => {
  function CreateRow() {
    let tileArray = [];

    const originalNumbers = props.numberTileStatuses.filter((x) => x.type === "original");

    for (const [index, originalNumberInfo] of originalNumbers.entries()) {
      tileArray.push(
        <NumberTile
          key={index}
          number={originalNumberInfo.number}
          disabled={props.disabled || originalNumberInfo.picked}
          onClick={() => props.onClick(originalNumberInfo.number, { type: "original", index: index })}
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
