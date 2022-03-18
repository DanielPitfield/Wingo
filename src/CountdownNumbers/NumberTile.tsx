import React from "react";
import '../index.scss';

interface Props {
  //onClick: () => void;
  number: number
}

const NumberTile: React.FC<Props> = (props) => {
  return (
    <div className="number_tile" /*(onClick={props.onClick}*/>
      {props.number}
    </div>
  );
}

export default NumberTile;