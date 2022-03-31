import React from "react";
import { Page } from "./App";
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
    <div className="area">
      {props.area.levels.map((level, i) => {
        const campaignProgress = SaveData.getCampaignProgress();
        const areaInfo = campaignProgress.find((x) => x.name === props.area.name);
        const level_unlocked = areaInfo?.current_level ? i + 1 <= areaInfo?.current_level : false;
        return <button
          className="level-button"
          disabled={!level_unlocked}
          key={`Area ${areaInfo?.name} Level ${i + 1}`}
          onClick={() => {
            if (level_unlocked) {
              props.setSelectedCampaignLevel(level);
              props.setPage("campaign/area/level");
            }
          }}
        >
          <strong className="level-number">{i + 1}</strong>
          <span className="level-description">{level.hint}</span>
        </button>;
      })}
    </div>
  );
};
