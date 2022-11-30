import React, { useEffect } from "react";
import { Logo } from "../Components/Logo";
import BackgroundSrc from "../Data/Images/background.png";
import BackgroundDarkThemeSrc from "../Data/Images/background-dark-theme.png";
import { useIntroMusic } from "../Data/Sounds";

import { StudioLogo } from "../Components/StudioLogo";
import { SettingsData } from "../Data/SaveData/Settings";

interface SplashScreenProps {
  loadingState: "loading" | "loaded";
  settings: SettingsData;
}

export const SplashScreen = (props: SplashScreenProps) => {
  const [playIntroSrc] = useIntroMusic(props.settings);

  useEffect(() => playIntroSrc(), [playIntroSrc]);

  return (
    <div
      className="splash-screen"
      style={{ backgroundImage: `url(${!props.settings.graphics.darkMode ? BackgroundSrc : BackgroundDarkThemeSrc})` }}
    >
      <div className="main-menu-wrapper" data-loading-state={props.loadingState}>
        <div className="game-name">
          <div className="game-name-label">
            <Logo settings={props.settings} />
          </div>
        </div>
        <StudioLogo />
      </div>
    </div>
  );
};
