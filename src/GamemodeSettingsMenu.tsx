import React from "react";
import "./index.scss";
import Collapsible from "react-collapsible";
import { MessageNotification } from "./MessageNotification";

interface Props {
  //onClick?: () => void;
}

const GamemodeSettingsMenu: React.FC<Props> = (props) => {
  return (
    <Collapsible
      className="gamemode-settings-wrapper"
      trigger="Settings"
      triggerOpenedClassName="settings-button"
      triggerClassName="settings-button"
    >
      <MessageNotification type="default">
        <div className="gamemode-settings-body">{props.children}</div>
      </MessageNotification>
    </Collapsible>
  );
};

export default GamemodeSettingsMenu;
