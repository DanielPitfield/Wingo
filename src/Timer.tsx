import React, { useState } from "react";
import "./index.css";

interface Props {
  elapsedSeconds: number;
  totalSeconds: number;
}

const Timer: React.FC<Props> = (props) => {
  return (
    <div className="timer">
      <div
        className="timer_progress"
        style={{ width: `${(props.elapsedSeconds / props.totalSeconds) * 100}%` }}
      ></div>
    </div>
  );
};

export default Timer;
