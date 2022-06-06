import React from "react";
import "./index.scss";
import Collapsible from "react-collapsible";

interface Props {
  //onClick?: () => void;
}

const GamemodeSettingsMenu: React.FC<Props> = (props) => {
  return (
    <Collapsible trigger="Settings">
      {props.children}
    </Collapsible>
  );
};

export default GamemodeSettingsMenu;
