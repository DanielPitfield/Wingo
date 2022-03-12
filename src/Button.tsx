import React, { MouseEventHandler } from "react";
import "./index.scss";

export const Button: React.FC<{
  mode: "destructive" | "accept" | "default";
  className?: string;
  status?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean
}> = (props) => {
  return (
    <button
      className={`btn ${props.mode} ${props.className || ""}`}
      onClick={props.onClick}
      disabled={props.disabled}
      data-status={props.status}
    >
      {props.children}
    </button>
  );
};
