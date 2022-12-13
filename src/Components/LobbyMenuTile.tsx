import { useNavigate } from "react-router-dom";
import { FiPlay } from "react-icons/fi";
import { BsInfoCircleFill } from "react-icons/bs";
import { pageDescriptions } from "../Data/PageDescriptions";
import { PagePath } from "../Data/PageNames";
import { Button } from "./Button";
import { SettingsData } from "../Data/SaveData/Settings";

interface LobbyMenuTileProps {
  page: PagePath;
  settings: SettingsData;
}

export const LobbyMenuTile = (props: LobbyMenuTileProps) => {
  const navigate = useNavigate();
  const pageInfo = pageDescriptions.find((x) => x.path === props.page);

  return (
    <li className="widget" key={props.page}>
      <span className="widget-title">
        {pageInfo?.shortTitle || pageInfo?.title || "(Unnamed)"}
        {pageInfo?.description && <BsInfoCircleFill className="icon tooltip-icon" />}
        <p className="tooltip">{pageInfo?.description}</p>
      </span>
      <div className="widget-button-wrapper">
        <Button
          mode="accept"
          data-game-mode={props.page}
          settings={props.settings}
          onClick={() => {
            console.log(props.page);
            navigate(props.page);
          }}
        >
          <FiPlay />
          Play
        </Button>
      </div>
    </li>
  );
};
