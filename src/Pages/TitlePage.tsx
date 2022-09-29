import { Button } from "../Components/Button";
import { Logo } from "../Components/Logo";
import { SettingsData } from "../Data/SaveData";
import BackgroundSrc from "../Data/Images/background.png";
import { FiCodesandbox, FiPlay, FiSettings, FiShuffle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

interface TitlePageProps {
  settings: SettingsData;
}

export const TitlePage = (props: TitlePageProps) => {
  const navigate = useNavigate();

  return (
    <div className="title-page" style={{ backgroundImage: `url(${BackgroundSrc})` }}>
      <div className="sidebar">
        <div className="sidebar-header">
          <Logo settings={props.settings} />
          <h2 className="sidebar-title">A game of letters, numbers and puzzles!</h2>
        </div>
        <ul className="sidebar-links">
          <li className="sidebar-link">
            <Button mode="accept" onClick={() => navigate("/Campaign")}>
              <FiPlay /> Campaign
            </Button>
          </li>
          <li className="sidebar-link">
            <Button mode="default" onClick={() => navigate("/Random")}>
              <FiShuffle /> Quick game
            </Button>
          </li>
          <li className="sidebar-link">
            <Button mode="default" onClick={() => navigate("/Home")}>
              <FiCodesandbox /> Custom game
            </Button>
          </li>
          <li className="sidebar-link spacer"></li>
          <li className="sidebar-link">
            <Button mode="default" onClick={() => navigate("/Settings")}>
              <FiSettings /> Settings
            </Button>
          </li>
        </ul>
      </div>
    </div>
  );
};
