import React from "react";
import "./index.scss";

export const GreenToRedColorTransition: ColorTransition = {
  hexColorAt100: "#208c08",
  hexColorAt90: "#0da319",
  hexColorAt80: "#82af0e",
  hexColorAt70: "#71af0e",
  hexColorAt60: "#8aaf0e",
  hexColorAt50: "#af840e",
  hexColorAt40: "#cead08",
  hexColorAt30: "#ce8908",
  hexColorAt20: "#aa2a03",
  hexColorAt10: "#aa1603",
};

interface ColorTransition {
  hexColorAt100: string;
  hexColorAt90: string;
  hexColorAt80: string;
  hexColorAt70: string;
  hexColorAt60: string;
  hexColorAt50: string;
  hexColorAt40: string;
  hexColorAt30: string;
  hexColorAt20: string;
  hexColorAt10: string;
}

interface Props {
  progress: number;
  total: number;
  display: { type: "transition"; colorTransition: ColorTransition } | { type: "solid"; color: string };
}

const ProgressBar: React.FC<Props> = (props) => {
  const percentage = Math.min(100, (props.progress / props.total) * 100);

  const backgroundColor =
    props.display.type === "solid" ? props.display.color : getColor(props.display.colorTransition, percentage);

  /**
   *
   * @param colorTransition
   * @param percentage
   * @returns
   */
  function getColor(colorTransition: ColorTransition, percentage: number): string {
    if (percentage > 90) {
      return colorTransition.hexColorAt100;
    }

    if (percentage > 80) {
      return colorTransition.hexColorAt90;
    }

    if (percentage > 70) {
      return colorTransition.hexColorAt80;
    }

    if (percentage > 60) {
      return colorTransition.hexColorAt70;
    }

    if (percentage > 50) {
      return colorTransition.hexColorAt60;
    }

    if (percentage > 40) {
      return colorTransition.hexColorAt50;
    }

    if (percentage > 30) {
      return colorTransition.hexColorAt40;
    }

    if (percentage > 20) {
      return colorTransition.hexColorAt30;
    }

    if (percentage > 10) {
      return colorTransition.hexColorAt20;
    }

    return colorTransition.hexColorAt10;
  }

  return (
    <div className="progress_bar">
      <div className="progress_bar_content">{props.children}</div>
      <div className="progress_bar_progress" style={{ width: `${percentage}%`, backgroundColor }}></div>
    </div>
  );
};

export default ProgressBar;
