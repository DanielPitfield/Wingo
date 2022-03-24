import React from "react";
import { Page } from "./App";
import { LevelConfig } from "./Level";

export interface AreaConfig {
  name: string;
  description: string;
  levels: LevelConfig[];
}

export const Area: React.FC<{
  area: AreaConfig;
  setSelectedCampaignLevel: (level: LevelConfig) => void;
  setPage: (page: Page) => void;
}> = (props) => {
  return (
    <div className="area">
      {props.area.levels.map((level, i) => (
        <button
          className="level-button"
          key={level.description}
          onClick={() => {
            props.setSelectedCampaignLevel(level);
            props.setPage("campaign-level");
          }}
        >
          <strong className="level-name">Level {i + 1}</strong>
          <span className="level-description">{level.description}</span>
        </button>
      ))}
    </div>
  );
};
