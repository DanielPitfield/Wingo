import React, { useState } from "react";
import "../index.scss";
import { SettingsData } from "../SaveData";

interface Props {
  value: number;
  settings: SettingsData;
}

const Dice: React.FC<Props> = (props) => {
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
