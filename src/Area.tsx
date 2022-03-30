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
  setSelectedCampaignLevel: (level: LevelConfig) => void;
  setPage: (page: Page) => void;
}> = (props) => {
  return (
    // LEVEL SELECTION
    <div className="area">
      {props.area.levels.map((level, i) => (
        <button
          className="level-button"
          key={level.hint}
          onClick={() => {
            props.setSelectedCampaignLevel(level);
            props.setPage("campaign/area/level");
          }}
        >
          <strong className="level-name">{i + 1}</strong>
          <span className="level-description">{level.hint}</span>
        </button>
      ))}
    </div>
  );
};
