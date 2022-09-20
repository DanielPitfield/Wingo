import NumberTile from "./NumberTile";
import OperatorTile from "./OperatorTile";
import { Guess, operators } from "../Pages/NumbersGameConfig";

interface Props {
  onClick: (
    value: number | null,
    id: { type: "original"; index: number } | { type: "intermediary"; rowIndex: number }
  ) => void;
  hasTimerEnded: boolean;
  expression: Guess;
  rowIndex: number;
  targetNumber: number | null;
  hasSubmit: boolean;
  disabled: boolean;
  intermediaryGuessStatuses: {
    type: "intermediary";
    wordIndex: number;
    number: number | null;
    picked: boolean;
  }[];
  setOperator: (operator: typeof operators[0]["name"]) => void;
}

export const NumberRow = (props: Props) => {
  return (
    <div className="number_row">
      <NumberTile
        key="first-operand"
        number={props.expression ? props.expression.operand1 : null}
        disabled={props.disabled || calculateTotal(props.expression) !== null || props.expression.operand1 === null}
      />

      <OperatorTile
        key="first-operator"
        hasTimerEnded={props.hasTimerEnded}
        targetNumber={props.targetNumber}
        setOperator={props.setOperator}
        disabled={props.disabled || calculateTotal(props.expression) !== null}
        operator={props.expression ? props.expression.operator : "+"}
      />

      <NumberTile
        key="second-operand"
        number={props.expression ? props.expression.operand2 : null}
        disabled={props.disabled || calculateTotal(props.expression) !== null || props.expression.operand2 === null}
      />

      <div key="equals" className="equals_tile" data-disabled={true} data-is-readonly={false}>
        =
      </div>

      <NumberTile
        key="row_result"
        number={calculateTotal(props.expression) || null}
        disabled={
          props.disabled ||
          props.intermediaryGuessStatuses.find((x) => x.wordIndex === props.rowIndex)?.picked === true ||
          calculateTotal(props.expression) === null
        }
        onClick={() =>
          props.onClick(calculateTotal(props.expression) || null, { type: "intermediary", rowIndex: props.rowIndex })
        }
      />
    </div>
  );
};
