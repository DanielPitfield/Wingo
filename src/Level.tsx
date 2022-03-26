import React from "react";
import { Page } from "./App";
import { MessageNotification } from "./MessageNotification";
import WordleConfig, { WordleConfigProps } from "./WordleConfig";

export interface LevelConfig {
  description: string;
  levelProps: WordleConfigProps;
}

export const Level: React.FC<{
  level: LevelConfig;
  page: Page;
  setPage: (page: Page) => void;
  addGold: (gold: number) => void;
}> = (props) => {
  return (
    <div className="level">
      <MessageNotification type="default">{props.level.description}</MessageNotification>
      <WordleConfig
        {...props.level.levelProps}
        page={props.page}
        setPage={props.setPage}
        addGold={props.addGold}
        finishingButtonText={"Back to area"}
        onComplete={() => {
          props.setPage("campaign/area");
        }}
      />
    </div>
  );
};
