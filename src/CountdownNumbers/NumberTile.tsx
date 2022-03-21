import React from "react";
import '../index.scss';

interface Props {
  onClick: () => void;
  onContextMenu: () => void;
  isReadOnly: boolean;
  number: number | null;
  disabled: boolean;
}

const NumberTile: React.FC<Props> = (props) => {
  return (
    <div className="number_tile" data-disabled={props.disabled} onClick={props.onClick} onContextMenu={props.onContextMenu}>
      {props.number}
    </div>
  );
}

export default NumberTile;