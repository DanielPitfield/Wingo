import React, { useEffect } from "react";
import { Logo } from "./Logo";
import BackgroundSrc from "./images/background.png";
import { useIntroMusic } from "./Sounds";
import { SettingsData } from "./SaveData";
import { StudioLogo } from "./StudioLogo";

export const SplashScreen: React.FC<{ loadingState: "loading" | "loaded"; settings: SettingsData }> = (props) => {
  const [playIntroSrc] = useIntroMusic(props.settings);

  useEffect(() => playIntroSrc(), [playIntroSrc]);

  return (
    <div className="splash-screen" style={{ backgroundImage: `url(${BackgroundSrc})` }}>
      <div className="main-menu-wrapper" data-loading-state={props.loadingState}>
        <div className="game-name">
          <div className="game-name-label">
            <Logo></Logo>
          </div>
        </div>
        <StudioLogo />
      </div>
    </div>
  );
};
