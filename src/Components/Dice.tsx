import React, { useState } from "react";
import { SettingsData } from "../Data/SaveData";

interface Props {
  value: number;
  settings: SettingsData;
}

const Dice = (props: Props) => {
  const [applyAnimation, setApplyAnimation] = useState(false);

  React.useEffect(() => {
    setApplyAnimation(false);

    const timeoutId = window.setTimeout(() => setApplyAnimation(true), 100);

    return () => window.clearTimeout(timeoutId);
  }, [props.value]);

  return (
    <div
      className="dice_square"
      data-animation-setting={props.settings.graphics.animation}
      data-apply-animation={applyAnimation}
    >
      {props.value}
    </div>
  );
};

export default Dice;
