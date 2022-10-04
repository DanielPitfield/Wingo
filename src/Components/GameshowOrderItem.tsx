import { AiFillCloseSquare } from "react-icons/ai";
import { pageDescription } from "../Data/PageDescriptions";
import { DraggableItem } from "./DraggableItem";

interface Props {
  id: number;
  gameshowMode: pageDescription;
  onClick: (id: number) => void;
}

export const GameshowOrderItem = (props: Props) => {
  // TODO: Add more sub-elements that allow configuration of the properties of the gamemode (e.g wordLength)
  // TODO: CSS rule .gameshow-queued-gamemode
  // TODO: Remove/close button can't be clicked
  return (
    <DraggableItem id={props.id}>
      <div className="gameshow-queued-gamemode">{props.gameshowMode.title}</div>
      <AiFillCloseSquare onClick={() => props.onClick(props.id)} />
    </DraggableItem>
  );
};
