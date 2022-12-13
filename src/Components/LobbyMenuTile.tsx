import { BsInfoCircleFill } from "react-icons/bs";
import { PageDescription } from "../Data/PageDescriptions";
import { SettingsData } from "../Data/SaveData/Settings";

interface LobbyMenuTileProps {
  page: PageDescription;
  settings: SettingsData;
}

const LobbyMenuTile = (props: LobbyMenuTileProps) => {
  return (
    <div className="widget" key={props.page.title}>
      <img src={""} alt={props.page.title} />

      <div className="widget-title">
        {props.page.shortTitle ?? props.page.title ?? "(Unnamed)"}
        {props.page.description && <BsInfoCircleFill className="icon tooltip-icon" />}
        <p className="tooltip">{props.page.description}</p>
      </div>
    </div>
  );
};

export default LobbyMenuTile;
