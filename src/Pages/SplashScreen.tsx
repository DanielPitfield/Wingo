import React, { useEffect } from "react";
import { Logo } from "../Components/Logo";
import BackgroundSrc from "../Data/Images/background.png";
import { useIntroMusic } from "../Data/Sounds";
import { SettingsData } from "../Data/SaveData";
import { StudioLogo } from "../Components/StudioLogo";

export const SplashScreen = (props: { loadingState: "loading" | "loaded"; settings: SettingsData }) => {
  const [playIntroSrc] = useIntroMusic(props.settings);

  useEffect(() => playIntroSrc(), [playIntroSrc]);

  return (
    <div className="splash-screen" style={{ backgroundImage: `url(${BackgroundSrc})` }}>
      <div className="main-menu-wrapper" data-loading-state={props.loadingState}>
        <div className="game-name">
          <div className="game-name-label">
            <Logo settings={props.settings}></Logo>
          </div>
        </div>
        <StudioLogo />
      </div>
    </div>
  );
};
