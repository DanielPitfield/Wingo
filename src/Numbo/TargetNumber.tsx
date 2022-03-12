import React from "react";
import '../index.scss';

interface Props {

}

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

const TargetNumber: React.FC<Props> = () => {
  return (
    <div className="target_number">
      {getRandomInt(200, 999)}
    </div>
  );
}

export default TargetNumber;