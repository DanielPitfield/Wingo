import { BsInfoCircleFill } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { PageDescription } from "../Data/PageDescriptions";
import { SettingsData } from "../Data/SaveData/Settings";

interface LobbyMenuTileProps {
  page: PageDescription;
  settings: SettingsData;
}

const LobbyMenuTile = (props: LobbyMenuTileProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="widget" key={props.page.title} onClick={() => navigate(props.page.path)}>
      {props.page.icon ? <props.page.icon className="widget-icon" /> : <BsInfoCircleFill className="widget-icon" />}

      <div className="widget-header">
        <div className="widget-title">{props.page.shortTitle ?? props.page.title ?? "(Unnamed)"}</div>
        <p className="widget-description">{props.page.description}</p>
      </div>
    </div>
  );
};

export default LobbyMenuTile;