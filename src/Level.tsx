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
          if (props.level.isUnlockLevel) {
            props.onCompleteLevel(props.level);
          }
          props.setPage("campaign/area");
        }}
      />
    </div>
  );
};
