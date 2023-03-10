import React from "react";
import Button from "./Button";

interface ModalProps {
  name: string;
  mode: "default" | "info" | "success" | "error";
  title: React.ReactNode;
  children?: React.ReactNode;
  onClose: () => void;
}

const Modal = (props: ModalProps) => {
  return (
    <div className="modal" data-modal-name={props.name}>
      <div className="modal-wrapper">
        <div className="modal-header" data-mode={props.mode}>
          <h3 className="modal-title">{props.title}</h3>
          <Button mode="default" className="modal-close-button" onClick={props.onClose}>
            X
          </Button>
        </div>
        <div className="modal-body">{props.children}</div>
      </div>
    </div>
  );
};

export default Modal;
