import React, { MouseEventHandler } from "react";
import { SaveData, SettingsData } from "../Data/SaveData";
import { useClickChime } from "../Data/Sounds";

type Props = {
  mode: "destructive" | "accept" | "default";
  children?: React.ReactNode;
  settings?: SettingsData;
  className?: string;
  status?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  useSoundEffect?: boolean;
  additionalProps?: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
};

export const Button = (props: Props) => {
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
