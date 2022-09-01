import React from "react";
import { arrayMove } from "react-draggable-order";
import { AiFillCloseSquare, AiOutlinePlus } from "react-icons/ai";
import { pageDescription } from "../PageDescriptions";
import { DraggableItem } from "./DraggableItem";

interface Props {
  gameshowMode: pageDescription;
  index: number;
  queuedModes: pageDescription[];
  setQueuedModes: (queuedModes: pageDescription[]) => void;
  onClick: (index: number) => void;
}

export const GameshowOrderItem = (props: Props) => {
  // TODO: Elements that allow configuration of the properties of the gamemode (e.g wordLength)
  return (
    <DraggableItem
      key={props.index}
      index={props.index}
      onMove={(toIndex) => props.setQueuedModes(arrayMove(props.queuedModes, props.index, toIndex))}
    >
      <div className="gameshow-queued-gamemode">{props.gameshowMode.title}</div>
      <AiFillCloseSquare onClick={() => props.onClick(props.index)} />
    </DraggableItem>
  );
};
