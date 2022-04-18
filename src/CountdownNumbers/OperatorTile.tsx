import React from "react";
import "../index.scss";
import { operators } from "./CountdownNumbersConfig";

interface Props {
  hasTimerEnded: boolean;
  targetNumber: number | null;
  operator: typeof operators[0]["name"];
  setOperator: (operator: typeof operators[0]["name"]) => void;
}

/** */
const OperatorTile: React.FC<Props> = (props) => {
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
    <div className="operator_tile" onClick={cycleOperator}>
      {props.operator}
    </div>
  );
};

export default OperatorTile;
