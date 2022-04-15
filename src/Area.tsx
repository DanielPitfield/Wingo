import React from "react";
import { Page } from "./App";
import { Button } from "./Button";
import { LevelConfig } from "./Level";
import { SaveData } from "./SaveData";

export interface AreaConfig {
  name: string;
  unlock_level: LevelConfig;
  levels: LevelConfig[];
}

export const Area: React.FC<{
  area: AreaConfig;
  setSelectedCampaignLevel: (level: LevelConfig) => void;
  setPage: (page: Page) => void;
}> = (props) => {
  return (
    // LEVEL SELECTION
    <div className="area widgets" data-area-name={props.area.name}>
      {props.area.levels.map((level, i) => {
        const campaignProgress = SaveData.getCampaignProgress();
        const areaInfo = campaignProgress.areas.find((x) => x.name === props.area.name);
        const level_unlocked = (areaInfo?.completedLevelCount || 0) >= i;

        return (
          <div className="level-button widget" key={`Area ${areaInfo?.name} Level ${i + 1}`}>
            <strong className="level-number widget-title">{i + 1}</strong>
            <p>{level.levelProps.mode}</p>
            <span className="widget-button-wrapper">
              <Button
                mode={level_unlocked ? "accept" : "default"}
                disabled={!level_unlocked}
                onClick={() => {
                  if (level_unlocked) {
                    props.setSelectedCampaignLevel(level);
                    props.setPage("campaign/area/level");
                  }
                }}
              >
                {level_unlocked ? "Go" : "?"}
              </Button>
            </span>
          </div>
        );
      })}
    </div>
  );
};
