import { useNavigate } from "react-router-dom";
import { FiPlay } from "react-icons/fi";
import { BsInfoCircleFill } from "react-icons/bs";
import { pageDescription } from "../Data/PageDescriptions";
import { Button } from "./Button";
import { SettingsData } from "../Data/SaveData/Settings";

interface LobbyMenuTileProps {
  page: pageDescription;
  settings: SettingsData;
}

export const LobbyMenuTile = (props: LobbyMenuTileProps) => {
  const navigate = useNavigate();

  return (
    <li className="widget" key={props.page.title}>
      <span className="widget-title">
        {props.page.shortTitle ?? props.page.title ?? "(Unnamed)"}
        {props.page.description && <BsInfoCircleFill className="icon tooltip-icon" />}
        <p className="tooltip">{props.page.description}</p>
      </span>

      <div className="widget-button-wrapper">
        <Button
          mode="accept"
          data-game-mode={props.page}
          settings={props.settings}
          onClick={() => {
            navigate(props.page.path);
          }}
        >
          <FiPlay />
          Play
        </Button>
      </div>
    </li>
  );
};
