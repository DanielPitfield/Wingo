import React from "react";
import { Logo } from "./Logo";
import BackgroundSrc from "./images/background.png";

export const SplashScreen: React.FC<{ loadingState: "loading" | "loaded" }> = (props) => {
  return (
    <div className="splash-screen" style={{ backgroundImage: `url(${BackgroundSrc})` }}>
      <div className="main-menu-wrapper" data-loading-state={props.loadingState}>
        <div className="game-name">
          <div className="game-name-label">
            <Logo></Logo>
          </div>
        </div>
        <div className="studio-name">Pitsy Studios</div>
      </div>
    </div>
  );
};
