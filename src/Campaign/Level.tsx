import React from "react";
import { Page } from "../App";
import { MessageNotification } from "../MessageNotification";
import { Theme } from "../Themes";
import WordleConfig, { WordleConfigProps } from "../WordleConfig";

export interface LevelConfig {
  hint?: React.ReactNode;
  isUnlockLevel?: boolean;
  levelProps: WordleConfigProps;
}

/** A level within an area (e.g. one game) */
export const Level: React.FC<{
  level: LevelConfig;
  page: Page;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  setPage: (page: Page) => void;
  addGold: (gold: number) => void;
  onCompleteLevel: (isUnlockLevel: boolean, level: LevelConfig) => void;
}> = (props) => {
  return (
    <div className="level" style={{ backgroundImage: `url(${props.theme.backgroundImageSrc})` }}>
      <MessageNotification type="default">{props.level.hint}</MessageNotification>
      <WordleConfig
        {...props.level.levelProps}
        page={props.page}
        setTheme={props.setTheme}
        setPage={props.setPage}
        addGold={props.addGold}
        finishingButtonText={"Back to area"}
        onComplete={(wasCorrect) => {
          if (wasCorrect) {
            props.onCompleteLevel(props.level.isUnlockLevel || false, props.level);
          }

          if (props.level.isUnlockLevel) {
            // Go back to area selection to show discovered area name
            props.setPage("campaign");
          } else {
            // Go to level selection (likely to choose next level)
            props.setPage("campaign/area");
          }
        }}
      />
    </div>
  );
};
