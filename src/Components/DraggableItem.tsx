import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface DraggableItemProps {
  id: number;
  children?: React.ReactNode;
}

const DraggableItem = (props: DraggableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div className="content">{props.children}</div>
    </div>
  );
};

export default DraggableItem;
