import React, { useState } from "react";
import '../index.scss';
import { operators } from "../Nubble/Nubble";

interface Props {

}

const OperatorTile: React.FC<Props> = (props) => {
  const [operator, setOperator] = useState("+");

  function cycleOperator() {
    const currentIndex = operators.findIndex(x => x.name === operator);
    const isLastOperator = currentIndex === (operators.length - 1);
    const nextOperator = !isLastOperator ? operators[currentIndex + 1].name : operators[0].name;
    setOperator(nextOperator);
  }
  return (
    <div className="operator_tile" onClick={cycleOperator}>
      {operator}
    </div>
  );
}

export default OperatorTile;