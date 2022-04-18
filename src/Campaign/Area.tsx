import React from "react";
import { Page, pages } from "../App";
import { Button } from "../Button";
import { getId, LevelConfig } from "./Level";
import { MessageNotification } from "../MessageNotification";
import { SaveData } from "../SaveData";
import { Theme } from "../Themes";

export interface AreaConfig {
  name: string;
  unlock_level: LevelConfig;
  levels: LevelConfig[];
  theme: Theme;
}

/** Portion of the campaign, with many levels */
export const Area: React.FC<{
  area: AreaConfig;
  setTheme: (theme: Theme) => void;
  setSelectedCampaignLevel: (level: LevelConfig) => void;
  setPage: (page: Page) => void;
}> = (props) => {
  // LEVEL SELECTION
  return (
    <div
      className="area"
      style={{ backgroundImage: `url(${props.area.theme.backgroundImageSrc})`, backgroundSize: "100%" }}
    >
      <section className="area-header">
        <h2 className="area-header-title">{props.area.name}</h2>
      </section>
      <div className="widgets">
        {props.area.levels.map((l, index) => {
          const campaignProgress = SaveData.getCampaignProgress();
          const areaInfo = campaignProgress.areas.find((x) => x.name === props.area.name);

          // Determine whether this is the first level
          const isFirstLevel = index === 0;

          // Find the previous level (unless this is the first level)
          const previousLevel = isFirstLevel ? undefined : props.area.levels[index - 1];

          // Determine whether the level has already been completed
          const level_completed = areaInfo?.completedLevelIds.some((x) => x === getId(l.level)) || false;

          // Determine whether the level has been unlocked (i.e. the previous level has been completed)
          const level_unlocked =
            !previousLevel || areaInfo?.completedLevelIds.some((x) => x === getId(previousLevel.level)) || false;

          // Get the level page info
          const levelInfo = pages.find((x) => x.page === `${l.level.gameCategory}/${l.level.levelProps.mode}`);

          return (
            <div
              className="level-button widget"
              key={`Area ${areaInfo?.name} Level ${index + 1}`}
              data-is-completed={level_completed}
              data-is-unlocked={level_unlocked}
            >
              <strong className="level-number widget-subtitle">Level {index + 1}</strong>
              <p className="level-mode">{levelInfo?.title || levelInfo?.shortTitle || l.level.levelProps.mode}</p>
              <span className="widget-button-wrapper">
                <Button
                  mode={level_unlocked && !level_completed ? "accept" : "default"}
                  disabled={!level_unlocked}
                  onClick={() => {
                    if (level_unlocked) {
                      props.setSelectedCampaignLevel(l);
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
    </div>
  );
};
