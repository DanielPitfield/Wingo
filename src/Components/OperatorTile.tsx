import React from "react";
import { operators } from "../Pages/NumbersGameConfig";

interface Props {
  hasTimerEnded: boolean;
  targetNumber: number | null;
  disabled: boolean;
  operator: typeof operators[0]["name"];
  setOperator: (operator: typeof operators[0]["name"]) => void;
}

/** */
const OperatorTile = (props: Props) => {
  /** */
  function cycleOperator() {
    // Allow changing operator after a target number has been decided and before the timer runs out
    if (!props.hasTimerEnded && props.targetNumber) {
      const currentIndex = operators.findIndex((x) => x.name === props.operator);
      const isLastOperator = currentIndex === operators.length - 1;
      const nextOperator = !isLastOperator ? operators[currentIndex + 1].name : operators[0].name;

      props.setOperator(nextOperator);
    }
  }

  return (
    <div className="operator_tile" onClick={cycleOperator} data-disabled={props.disabled} data-is-readonly={false}>
      {props.operator}
    </div>
  );
};

export default OperatorTile;
