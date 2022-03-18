import React from "react";
import '../index.scss';

interface Props {
  //evaluateNumberRow: () => void;
}

const EqualsTile: React.FC<Props> = (props) => {
  return (
    <div className="equals_tile" /*onClick={props.evaluateNumberRow}*/>
      =
    </div>
  );
}

export default EqualsTile;