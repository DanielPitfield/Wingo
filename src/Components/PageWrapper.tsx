import { ErrorBoundary } from "react-error-boundary";
import { pageDescriptions } from "../Data/PageDescriptions";
import { VERSION } from "../Data/Version";
import ErrorFallback from "../Pages/ErrorFallback";
import HelpInformation from "./HelpInformation";
import { useNavigate, useLocation } from "react-router-dom";
import { PagePath } from "../Data/PageNames";
import { useState } from "react";
import { getSettings, SettingsData } from "../Data/SaveData/Settings";
import Toolbar from "./Toolbar";

interface PageWrapperProps {
  settings: SettingsData;
  gold: number;
  children: React.ReactNode;
}

const PageWrapper = (props: PageWrapperProps) => {
  const location = useLocation().pathname as PagePath;
  const navigate = useNavigate();
  const wrappedPage = pageDescriptions.find((page) => page.path === location);

  // Modal explaining current gamemode, should it be currently shown?
  const [isHelpInfoShown, setIsHelpInfoShown] = useState(false);

  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <ErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} settingsData={getSettings()} />
      )}
      onReset={() => navigate(0)}
    >
      <div className="app" data-automation-id="app" data-automation-page-name={location}>
        <Toolbar settings={props.settings} gold={props.gold} setIsHelpInfoShown={setIsHelpInfoShown} />

        {props.children}

        {isHelpInfoShown && wrappedPage?.helpInfo !== undefined && (
          <HelpInformation onClose={() => setIsHelpInfoShown(false)} />
        )}

        <div className="version">{VERSION}</div>
      </div>
    </ErrorBoundary>
  );
};

export default PageWrapper;
