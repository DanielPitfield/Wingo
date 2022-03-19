import React from "react";
import '../index.scss';

interface Props {
  onClick: () => void;
  onContextMenu: () => void;
  isReadOnly: boolean;
  number: number | null
}

const NumberTile: React.FC<Props> = (props) => {
  return (
    <div className="number_tile" onClick={props.onClick} onContextMenu={props.onContextMenu}>
      {props.number}
    </div>
  );
}

export default NumberTile;