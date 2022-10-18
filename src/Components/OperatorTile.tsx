import { operators } from "../Data/Operators";

interface Props {
  targetNumber: number | null;
  disabled: boolean;
  operator: typeof operators[0]["name"];
  setOperator: (operator: typeof operators[0]["name"]) => void;
}

const OperatorTile = (props: Props) => {
  function cycleOperator() {
    if (props.disabled) {
      return;
    }

    if (props.targetNumber === undefined) {
      return;
    }

    const currentIndex = operators.findIndex((x) => x.name === props.operator);
    const isLastOperator = currentIndex === operators.length - 1;
    const nextOperator = !isLastOperator ? operators[currentIndex + 1].name : operators[0].name;

    props.setOperator(nextOperator);
  }

  return (
    <div className="operator_tile" onClick={cycleOperator} data-disabled={props.disabled} data-is-readonly={false}>
      {props.operator}
    </div>
  );
};

export default OperatorTile;
