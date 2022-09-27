import { ErrorBoundary } from "react-error-boundary";
import { FiArrowLeft, FiHelpCircle, FiSettings } from "react-icons/fi";
import { pageDescriptions } from "../Data/PageDescriptions";
import { SaveData, SettingsData } from "../Data/SaveData";
import { VERSION } from "../Data/Version";
import { ErrorFallback } from "../Pages/ErrorFallback";
import { Button } from "./Button";
import HelpInformation from "./HelpInformation";
import { useNavigate, useLocation } from "react-router-dom";
import { PagePath } from "../Data/PageNames";
import GoldCoin from "../Data/Images/gold.png";
import { useState } from "react";
import { isCampaignAreaPath, isCampaignLevelPath } from "../Helper Functions/CampaignPathChecks";

interface Props {
  settings: SettingsData;
  gold: number;
  children: React.ReactNode;
}

// TODO: The components in each route should be nested inside this div
export const PageWrapper = (props: Props) => {
  // What is the current path?
  const location = useLocation().pathname as PagePath;

  const navigate = useNavigate();

  // Modal explaining current gamemode is shown?
  const [isHelpInfoShown, setIsHelpInfoShown] = useState(false);

  return (
    <div className="app" data-automation-id="app" data-automation-page-name={location}>
      {location !== "/splash-screen" && location !== "/TitlePage" && (
        <>
          <div className="toolbar">
            {location !== "/home" && (
              <nav className="navigation">
                <Button
                  mode="default"
                  className="back-button"
                  settings={props.settings}
                  onClick={() => {
                    setIsHelpInfoShown(false);

                    if (isCampaignLevelPath(location)) {
                      navigate("/campaign/areas/:areaName");
                    } else if (isCampaignAreaPath(location)) {
                      navigate("/campaign");
                    } else {
                      navigate("/home");
                    }
                  }}
                >
                  <FiArrowLeft /> Back
                </Button>
              </nav>
            )}
            <h1 className="title">{pageDescriptions.find((x) => x.path === location)?.title}</h1>
            {Boolean(pageDescriptions.find((x) => x.path === location)?.helpInfo) && (
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
                navigate("/props.settings");
                setIsHelpInfoShown(false);
              }}
            >
              <FiSettings /> Settings
            </Button>
            <div className="gold_counter" onClick={() => navigate("/challenges")}>
              <img className="gold_coin_image" src={GoldCoin} alt="Gold" />
              {props.gold.toLocaleString("en-GB")}
            </div>
          </div>
        </>
      )}
      {props.children}
      <ErrorBoundary
        fallbackRender={({ error, resetErrorBoundary }) => (
          <ErrorFallback
            error={error}
            resetErrorBoundary={resetErrorBoundary}
            settingsData={SaveData.getSettings()}
            version={VERSION}
          ></ErrorFallback>
        )}
        onReset={() => window.location.reload()}
      >
        {/*pageComponent*/}
      </ErrorBoundary>
      {Boolean(isHelpInfoShown && location !== "/home" && location !== "/TitlePage" && location !== "/settings") && (
        <HelpInformation onClose={() => setIsHelpInfoShown(false)}></HelpInformation>
      )}
      <div className="version">{VERSION}</div>
    </div>
  );
};
