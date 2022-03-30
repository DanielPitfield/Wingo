import React from "react";
import { Page } from "./App";
import { LevelConfig } from "./Level";

export interface AreaConfig {
  name: string;
  unlock_level: LevelConfig;
  levels: LevelConfig[];
}

export const Area: React.FC<{
  area: AreaConfig;
  areaStatuses: {
    name: string;
    status: "locked" | "unlockable" | "unlocked";
    current_level: number;
  }[];
  setSelectedCampaignLevel: (level: LevelConfig) => void;
  setPage: (page: Page) => void;
}> = (props) => {
  return (
    // LEVEL SELECTION
    <div className="area">
      {props.area.levels.map((level, i) => {
        const areaInfo = props.areaStatuses.find((x) => x.name === props.area.name);
        const level_unlocked = areaInfo?.current_level ? i <= areaInfo?.current_level : false;
        <button
          className="level-button"
          disabled={!level_unlocked}
          key={level.hint}
          onClick={() => {
            if (level_unlocked) {
              props.setSelectedCampaignLevel(level);
              props.setPage("campaign/area/level");
            }
          }}
        >
          <strong className="level-name">{i + 1}</strong>
          <span className="level-description">{level.hint}</span>
        </button>;
      })}
    </div>
  );
};
