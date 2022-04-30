import React, { MouseEventHandler } from "react";
import "./index.scss";
import { SaveData, SettingsData } from "./SaveData";
import { useClickChime } from "./Sounds";

export const Button: React.FC<{
  mode: "destructive" | "accept" | "default";
  settings?: SettingsData;
  className?: string;
  status?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  useSoundEffect?: boolean;
  additionalProps?: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
}> = (props) => {
  const [playClickSoundEffect] = useClickChime(props.settings || SaveData.DISABLED_SETTINGS);

  return (
    <button
      {...props.additionalProps}
      className={`btn ${props.mode} ${props.className || ""}`}
      onClick={(e) => {
        props.onClick?.(e);

        if (props.useSoundEffect !== false) {
          playClickSoundEffect();
        }
      }}
      disabled={props.disabled}
      data-status={props.status}
    >
      {props.children}
    </button>
  );
};
