import { AiFillCloseSquare } from "react-icons/ai";
import { pageDescription } from "../Data/PageDescriptions";
import { DraggableItem } from "./DraggableItem";

interface Props {
  id: number;
  gameshowMode: pageDescription;
  onClick: (index: number) => void;
}

export const GameshowOrderItem = (props: Props) => {
  // TODO: Add more sub-elements that allow configuration of the properties of the gamemode (e.g wordLength)
  return (
    <DraggableItem id={props.id}>
      <div className="gameshow-queued-gamemode">{props.gameshowMode.title}</div>
      <AiFillCloseSquare onClick={() => props.onClick(props.id)} />
    </DraggableItem>
  );
};
