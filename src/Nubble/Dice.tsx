import React from "react";
import "../index.css";

interface Props {
  value: number;
}

const Dice: React.FC<Props> = (props) => {
  return <div className="dice_square">{props.value}</div>;
};

export default Dice;