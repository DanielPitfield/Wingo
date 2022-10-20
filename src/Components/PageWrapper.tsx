import { ErrorBoundary } from "react-error-boundary";
import { FiArrowLeft, FiHelpCircle, FiSettings } from "react-icons/fi";
import { pageDescriptions } from "../Data/PageDescriptions";
import { VERSION } from "../Data/Version";
import { ErrorFallback } from "../Pages/ErrorFallback";
import { Button } from "./Button";
import HelpInformation from "./HelpInformation";
import { useNavigate, useLocation } from "react-router-dom";
import { PagePath } from "../Data/PageNames";
import GoldCoin from "../Data/Images/gold.png";
import { useState } from "react";
import { isCampaignAreaPath, isCampaignLevelPath } from "../Helpers/CampaignPathChecks";
import { getAreaBacktrackPath } from "../Helpers/getAreaBacktrackPath";
import { getSettings, SettingsData } from "../Data/SaveData/Settings";

interface Props {
  settings: SettingsData;
  gold: number;
  children: React.ReactNode;
}

export const PageWrapper = (props: Props) => {
  // What is the current path?
  const location = useLocation().pathname as PagePath;

  const navigate = useNavigate();

  const wrappedPage = pageDescriptions.find((page) => page.path === location);

  // Modal explaining current gamemode, should it be currently shown?
  const [isHelpInfoShown, setIsHelpInfoShown] = useState(false);

  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <ErrorFallback
          error={error}
          resetErrorBoundary={resetErrorBoundary}
          settingsData={getSettings()}
        ></ErrorFallback>
      )}
      onReset={() => navigate(0)}
    >
      <div className="app" data-automation-id="app" data-automation-page-name={location}>
        {location !== "/Splashscreen" && location !== "/TitlePage" && (
          <>
            <div className="toolbar">
              {location !== "/Home" && (
                <nav className="navigation">
                  <Button
                    mode="default"
                    className="back-button"
                    settings={props.settings}
                    onClick={() => {
                      setIsHelpInfoShown(false);

                      if (isCampaignLevelPath(location)) {
                        navigate(getAreaBacktrackPath(location));
                      } else if (isCampaignAreaPath(location)) {
                        navigate("/Campaign");
                      } else {
                        navigate("/Home");
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
                  onClick={() => setIsHelpInfoShown(true)}
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
                  setIsHelpInfoShown(false);
                }}
              >
                <FiSettings /> Settings
              </Button>

              <div className="gold_counter" onClick={() => navigate("/Challenges")}>
                <img className="gold_coin_image" src={GoldCoin} alt="Gold" />
                {props.gold.toLocaleString("en-GB")}
              </div>
            </div>
          </>
        )}

        {props.children}

        {isHelpInfoShown && wrappedPage?.helpInfo !== undefined && (
          <HelpInformation onClose={() => setIsHelpInfoShown(false)}></HelpInformation>
        )}

        <div className="version">{VERSION}</div>
      </div>
    </ErrorBoundary>
  );
};
