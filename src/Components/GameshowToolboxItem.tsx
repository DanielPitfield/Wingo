import React from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { pageDescription } from "../PageDescriptions";
import { Button } from "./Button";

interface Props {
  gameshowMode: pageDescription;
  onClick: (gameshowMode: pageDescription) => void;
}

export const GameshowToolboxItem: React.FC<Props> = (props) => {
  return (
    <Button
      className="gameshow-available-gamemode"
      mode={"default"}
      onClick={() => props.onClick(props.gameshowMode)}
    >
      <AiOutlinePlus /> {props.gameshowMode.title}
    </Button>
  );
};