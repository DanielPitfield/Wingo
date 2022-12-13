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
  const originalNumbers = props.numberTileStatuses.filter((x) => x.type === "original");

  return (
    <div className="number_row">
      {originalNumbers.map((originalNumberInfo, index) => {
        return (
          <NumberTile
            key={index}
            number={originalNumberInfo.number}
            disabled={props.disabled || originalNumberInfo.picked}
            onClick={() => props.onClick(originalNumberInfo.number, { type: "original", index: index })}
          />
        );
      })}
    </div>
  );
};

export default NumberSelectionRow;
