import React from "react";

export const SplashScreen: React.FC<{ loadingState: "loading" | "loaded" }> = (props) => {
  return (
    <div className="splash-screen">
      <div className="main-menu-wrapper" data-loading-state={props.loadingState}>
        <div className="game-name">
          <div className="left-bracket">{"{"}</div>
          <div className="game-name-label">
            Wingo
          </div>
          <div className="right-bracket">{"}"}</div>
        </div>
        <div className="studio-name">Pitsy Studios</div>
      </div>
    </div>
  );
};
