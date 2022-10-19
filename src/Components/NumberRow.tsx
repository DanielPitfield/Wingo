import NumberTile from "./NumberTile";
import OperatorTile from "./OperatorTile";
import { Guess, IntermediaryTileStatus } from "../Pages/NumbersGameConfig";
import { operators } from "../Data/Operators";
import { getNumbersGameGuessTotal } from "../Helpers/getNumbersGameGuessTotal";

interface Props {
  onClick: (
    value: number | null,
    id: { type: "original"; index: number } | { type: "intermediary"; rowIndex: number }
  ) => void;
  expression: Guess;
  rowIndex: number;
  targetNumber: number | null;
  hasSubmit: boolean;
  disabled: boolean;
  intermediaryTileStatuses: IntermediaryTileStatus[];
  setOperator: (operator: typeof operators[0]["name"]) => void;
}

export const NumberRow = (props: Props) => {
  return (
    <div className="number_row">
      <NumberTile
        key="first-operand"
        number={props.expression.operand1 ?? null}
        disabled={
          props.disabled || getNumbersGameGuessTotal(props.expression) !== null || props.expression.operand1 === null
        }
      />

      <OperatorTile
        key="first-operator"
        targetNumber={props.targetNumber}
        setOperator={props.setOperator}
        disabled={props.disabled || getNumbersGameGuessTotal(props.expression) !== null}
        operator={props.expression.operator ?? "+"}
      />

      <NumberTile
        key="second-operand"
        number={props.expression.operand2 ?? null}
        disabled={
          props.disabled || getNumbersGameGuessTotal(props.expression) !== null || props.expression.operand2 === null
        }
      />

      <div key="equals" className="equals_tile" data-disabled={true} data-is-readonly={false}>
        =
      </div>

      <NumberTile
        key="row_result"
        number={getNumbersGameGuessTotal(props.expression)}
        disabled={
          props.disabled ||
          props.intermediaryTileStatuses.find((x) => x.wordIndex === props.rowIndex)?.picked === true ||
          getNumbersGameGuessTotal(props.expression) === null
        }
        onClick={() =>
          props.onClick(getNumbersGameGuessTotal(props.expression), {
            type: "intermediary",
            rowIndex: props.rowIndex,
          })
        }
      />
    </div>
  );
};
