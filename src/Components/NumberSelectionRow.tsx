import { NumberTileStatus } from "../Pages/NumbersGameConfig";
import NumberTile from "./NumberTile";

interface NumberSelectionRowProps {
  onClick: (
    value: number | null,
    id: { type: "original"; index: number } | { type: "intermediary"; rowIndex: number }
  ) => void;
  disabled: boolean;
  numberTileStatuses: NumberTileStatus[];
}

const NumberSelectionRow = (props: NumberSelectionRowProps) => {
  function CreateRow() {
    let tileArray = [];

    const originalNumbers = props.numberTileStatuses.filter((x) => x.type === "original");

    // TODO: Map over entries?
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

export default NumberSelectionRow;
