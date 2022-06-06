import React from "react";
import "./index.scss";
import Collapsible from "react-collapsible";

interface Props {
  //onClick?: () => void;
}

const GamemodeSettingsMenu: React.FC<Props> = (props) => {
  return (
    <Collapsible className="gamemode-settings-wrapper" trigger="Settings">
      <div className="gamemode-settings-body">{props.children}</div>
    </Collapsible>
  );
};

export default GamemodeSettingsMenu;
