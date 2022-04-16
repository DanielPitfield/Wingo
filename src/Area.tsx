import React from "react";
import { Page, pages } from "./App";
import { Button } from "./Button";
import { LevelConfig } from "./Level";
import { MessageNotification } from "./MessageNotification";
import { SaveData } from "./SaveData";

export interface AreaConfig {
  name: string;
  unlock_level: LevelConfig;
  levels: LevelConfig[];
  backgroundImageSrc?: string;
}

export const Area: React.FC<{
  area: AreaConfig;
  setSelectedCampaignLevel: (level: LevelConfig) => void;
  setPage: (page: Page) => void;
}> = (props) => {
  return (
    // LEVEL SELECTION
    <div
      className="area widgets"
      style={{ backgroundImage: props.area.backgroundImageSrc && `url(${props.area.backgroundImageSrc})` }}
    >
      {props.area.levels.map((level, i) => {
        const campaignProgress = SaveData.getCampaignProgress();
        const areaInfo = campaignProgress.areas.find((x) => x.name === props.area.name);
        const level_unlocked = (areaInfo?.completedLevelCount || 0) >= i;
        const level_completed = (areaInfo?.completedLevelCount || 0) > i;
        const levelInfo = pages.find((x) => x.page === `wingo/${level.levelProps.mode}`);

        return (
          <div
            className="level-button widget"
            key={`Area ${areaInfo?.name} Level ${i + 1}`}
            data-is-completed={level_completed}
            data-is-unlocked={level_unlocked}
          >
            <strong className="level-number widget-subtitle">Level {i + 1}</strong>
            <p className="level-mode">{levelInfo?.title || levelInfo?.shortTitle || level.levelProps.mode}</p>
            <span className="widget-button-wrapper">
              <Button
                mode={level_unlocked && !level_completed ? "accept" : "default"}
                disabled={!level_unlocked || level_completed}
                onClick={() => {
                  if (level_unlocked) {
                    props.setSelectedCampaignLevel(level);
                    props.setPage("campaign/area/level");
                  }
                }}
              >
                {level_completed ? "Completed!" : level_unlocked ? "Go" : "?"}
              </Button>
            </span>
          </div>
        );
      })}
      {props.area.levels.length === 0 && (
        <span>
          <MessageNotification type="default">
            No levels defined for area <strong>{props.area.name}</strong>
          </MessageNotification>
        </span>
      )}
    </div>
  );
};
