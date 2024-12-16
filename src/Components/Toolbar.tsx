import { FiArrowLeft, FiHelpCircle, FiSettings } from "react-icons/fi";
import { pageDescriptions } from "../Data/PageDescriptions";
import Button from "./Button";
import { useNavigate, useLocation } from "react-router";
import { PagePath } from "../Data/PageNames";
import GoldCoin from "../Data/Images/gold.png";
import { isCampaignAreaPath, isCampaignLevelPath } from "../Helpers/CampaignPathChecks";
import { getAreaBacktrackPath } from "../Helpers/getAreaBacktrackPath";
import { SettingsData } from "../Data/SaveData/Settings";

interface ToolbarProps {
  settings: SettingsData;
  gold: number;
  setIsHelpInfoShown: (isHelpInfoShown: boolean) => void;
}

const Toolbar = (props: ToolbarProps) => {
  const location = useLocation().pathname as PagePath;
  const navigate = useNavigate();
  const wrappedPage = pageDescriptions.find((page) => page.path === location);

  if (location === "/Splashscreen" || location === "/MainMenu") {
    return null;
  }

  return (
    <div className="toolbar">
      {location !== "/LobbyMenu" && (
        <nav className="navigation">
          <Button
            mode="default"
            className="back-button"
            settings={props.settings}
            onClick={() => {
              props.setIsHelpInfoShown(false);

              if (isCampaignLevelPath(location)) {
                navigate(getAreaBacktrackPath(location));
              } else if (isCampaignAreaPath(location)) {
                navigate("/Campaign");
              } else {
                navigate("/LobbyMenu");
              }
            }}
          >
            <FiArrowLeft /> Back
          </Button>
        </nav>
      )}

      <h1 className="title">{wrappedPage?.title}</h1>

      {wrappedPage?.helpInfo !== undefined && (
        <Button
          mode="default"
          className="help-info-button"
          settings={props.settings}
          onClick={() => props.setIsHelpInfoShown(true)}
          additionalProps={{ "aria-label": "help", title: "Get help with this game mode" }}
        >
          <FiHelpCircle /> Help
        </Button>
      )}

      <Button
        mode="default"
        className="props.settings-button"
        settings={props.settings}
        onClick={() => {
          navigate("/Settings");
          props.setIsHelpInfoShown(false);
        }}
      >
        <FiSettings /> Settings
      </Button>

      <div className="gold_counter" onClick={() => navigate("/Challenges")}>
        <img className="gold_coin_image" src={GoldCoin} alt="Gold" />
        {props.gold.toLocaleString("en-GB")}
      </div>
    </div>
  );
};

export default Toolbar;
