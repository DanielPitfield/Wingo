import React, { MouseEventHandler } from "react";
import "./index.css";

export const Button: React.FC<{
  mode: "destructive" | "accept" | "default";
  status?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}> = (props) => {
  return (
    <button
      className={`btn ${props.mode}`}
      onClick={props.onClick}
      data-status={props.status}
    >
      {props.children}
    </button>
  );
};
