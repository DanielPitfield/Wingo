import React from "react";
import { Page } from "./App";
import { MessageNotification } from "./MessageNotification";
import WordleConfig, { WordleConfigProps } from "./WordleConfig";

export interface LevelConfig {
  hint?: string;
  isUnlockLevel?: boolean;
  levelProps: WordleConfigProps;
}

export const Level: React.FC<{
  level: LevelConfig;
  page: Page;
  setPage: (page: Page) => void;
  addGold: (gold: number) => void;
  onCompleteLevel: (level: LevelConfig) => void;
}> = (props) => {
  return (
    <div className="level">
      <MessageNotification type="default">{props.level.hint}</MessageNotification>
      <WordleConfig
        {...props.level.levelProps}
        page={props.page}
        setPage={props.setPage}
        addGold={props.addGold}
        finishingButtonText={"Back to area"}
        onComplete={() => {
          props.onCompleteLevel(props.level);
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
