import React, { MouseEventHandler } from "react";
import { DISABLED_SETTINGS, SettingsData } from "../Data/SaveData/Settings";
import { useClickChime } from "../Data/Sounds";

interface ButtonProps {
  mode: "destructive" | "accept" | "default";
  children?: React.ReactNode;
  settings?: SettingsData;
  className?: string;
  status?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  useSoundEffect?: boolean;
  additionalProps?: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
}

const Button = (props: ButtonProps) => {
  const [playClickSoundEffect] = useClickChime(props.settings ?? DISABLED_SETTINGS);

  return (
    <button
      {...props.additionalProps}
      className={`btn ${props.mode} ${props.className ?? ""}`}
      onClick={(e) => {
        props.onClick?.(e);

        if (props.useSoundEffect) {
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

export default Button;
