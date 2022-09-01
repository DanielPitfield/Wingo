import React, { MutableRefObject, useRef } from "react";
import { useOrder } from "react-draggable-order";

interface Props {
  children?: React.ReactNode;
  index: number;
  onMove: (toIndex: number) => void;
}

export const DraggableItem = (props: Props) => {
  const elementRef = useRef<HTMLDivElement>() as MutableRefObject<HTMLDivElement>;
  const wrapperRef = useRef<HTMLDivElement>() as MutableRefObject<HTMLDivElement>;

  const { mouseDown, mouseMove, touchStart, touchMove, isGrabbing, isHover, elementStyle } = useOrder({
    elementRef,
    wrapperRef,
    index: props.index,
    onMove: props.onMove,
  });

  function renderHandleIcon() {
    return (
      <div className="handle" onMouseDown={mouseDown} onTouchStart={touchStart}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 14h16M4 20h16M4" />
        </svg>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="draggable-item-wrapper" data-is-hovered-over={isHover}>
      <div
        ref={elementRef}
        className="draggable-item"
        data-is-grabbed={isGrabbing}
        style={{ ...elementStyle }}
        onMouseMove={mouseMove}
        onTouchMove={touchMove}
      >
        <div className="content">
          {renderHandleIcon()}
          {props.children}
        </div>
      </div>
    </div>
  );
};
