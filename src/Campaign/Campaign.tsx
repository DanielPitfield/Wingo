import React from "react";
import { Page } from "../App";
import { AreaConfig } from "./Area";
import { Button } from "../Button";
import { getId, LevelConfig } from "./Level";
import { CampaignSaveData, SaveData, SettingsData } from "../SaveData";
import { Theme } from "../Themes";
import { AllCampaignAreas } from "./AllCampaignAreas";

/** The entire campaign, showing the list of areas */
export const Campaign: React.FC<{
  theme: Theme;
  settings: SettingsData;
  onlyShowCurrentArea?: boolean;
  setTheme: (theme: Theme) => void;
  setSelectedArea: (areaConfig: AreaConfig) => void;
  setSelectedCampaignLevel: (level: LevelConfig) => void;
  setPage: (page: Page) => void;
}> = (props) => {
  /** */
  function onAreaClick(area: AreaConfig, unlock_status: CampaignSaveData["areas"][0]["status"]) {
    // Button should be disabled, but just in case
    if (unlock_status === "locked") {
      return;
    }

    props.setTheme(area.theme);

    // Go straight to level to unlock/discover the theme
    if (unlock_status === "unlockable") {
      props.setSelectedArea(area);
      props.setSelectedCampaignLevel(area.unlock_level);
      props.setPage("campaign/area/level");
    }
    // Already unlocked, go to level selection screen
    else {
      props.setSelectedArea(area);
      props.setPage("campaign/area");
    }
  }

  return (
    // AREA SELECTION
    <div className="campaign widgets">
      {AllCampaignAreas.filter((x) => x.levels.length > 0).map((area, index) => {
        // Find out if area is locked, unlockable or unlocked
        const campaignProgress = SaveData.getCampaignProgress();
        const areaInfo = campaignProgress.areas.find((x) => x.name === area.name);

        // Determine whether this is the first area
        const isFirstArea = index === 0;

        // Find the previous area info (unless this is the first area)
        const previousAreaInfo = isFirstArea
          ? undefined
          : campaignProgress.areas.find((x) => x.name === AllCampaignAreas[index - 1].name);

        // Get the unlock status from the save data, or if not found, determine if all levels from the previous area are completed (unless this is the first area)
        const unlock_status =
          areaInfo?.status ||
          (isFirstArea ||
          AllCampaignAreas[index - 1].levels.every((l) => previousAreaInfo?.completedLevelIds.includes(getId(l.level)))
            ? "unlockable"
            : "locked");

        const current_level_count = areaInfo?.completedLevelIds.filter((x) => x !== "unlock").length || 0;
        const isCompleted = area.levels.every((l) => areaInfo?.completedLevelIds.includes(getId(l.level)));

        if (props.onlyShowCurrentArea && (unlock_status === "locked" || isCompleted)) {
          return null;
        }

        return (
          <div
            className="widget area-button"
            data-unlock-status={unlock_status}
            key={area.name}
            style={{
              backgroundImage: `url(${area.theme.backgroundImageSrc})`,
              backgroundSize: "100%",
            }}
          >
            <strong className="area-name widget-subtitle">Area {index + 1}</strong>
            <strong className="area-name widget-title">{unlock_status === "unlocked" ? area.name : `???`}</strong>
            <span className="level-count widget-button-wrapper">
              <Button
                mode={unlock_status === "locked" || isCompleted ? "default" : "accept"}
                disabled={unlock_status === "locked"}
                settings={props.settings}
                onClick={() => onAreaClick(area, unlock_status)}
              >
                {unlock_status === "locked"
                  ? "Unlock"
                  : isCompleted
                  ? "Completed!"
                  : props.onlyShowCurrentArea
                  ? "Continue Campaign"
                  : "Explore"}
              </Button>
              {unlock_status === "unlocked"
                ? `${Math.max(0, current_level_count - 1)} / ${area.levels.length}`
                : "? / ?"}
            </span>
          </div>
        );
      })}
    </div>
  );
};
