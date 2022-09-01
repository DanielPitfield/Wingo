import Collapsible from "react-collapsible";
import { MessageNotification } from "./MessageNotification";

interface Props {
  children?: React.ReactNode;
  //onClick?: () => void;
}

const GamemodeSettingsMenu = (props: Props) => {
  return (
    <Collapsible
      className="gamemode-settings-wrapper"
      trigger="Settings"
      triggerOpenedClassName="gamemode-settings-button"
      triggerClassName="gamemode-settings-button"
    >
      <MessageNotification type="default">
        <div className="gamemode-settings-body">{props.children}</div>
      </MessageNotification>
    </Collapsible>
  );
};

export default GamemodeSettingsMenu;
