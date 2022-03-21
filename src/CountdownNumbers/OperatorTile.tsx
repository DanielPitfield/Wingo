import React, { useState } from "react";
import "../index.scss";
import { operators } from "../Nubble/Nubble";

interface Props {
  hasTimerEnded: boolean;
  operator: typeof operators[0]["name"];
  setOperator: (operator: typeof operators[0]["name"]) => void;
}

const OperatorTile: React.FC<Props> = (props) => {
  function cycleOperator() {
    if (!props.hasTimerEnded) {
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
