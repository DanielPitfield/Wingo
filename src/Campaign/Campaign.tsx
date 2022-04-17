import React from "react";
import { Page } from "../App";
import { AreaConfig } from "./Area";
import { Button } from "../Button";
import { LevelConfig } from "./Level";
import { CampaignSaveData, SaveData } from "../SaveData";
import { Theme } from "../Themes";
import { AllCampaignAreas } from "./AllCampaignAreas";

/** The entire campaign, showing the list of areas */
export const Campaign: React.FC<{
  theme: Theme;
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
      {AllCampaignAreas.map((area, index) => {
        // Find out if area is locked, unlockable or unlocked
        const campaignProgress = SaveData.getCampaignProgress();
        const areaInfo = campaignProgress.areas.find((x) => x.name === area.name);
        const previousAreaInfo =
          index === 0 ? undefined : campaignProgress.areas.find((x) => x.name === AllCampaignAreas[index - 1].name);
        const unlock_status =
          areaInfo?.status ||
          (index === 0 || previousAreaInfo?.completedLevelCount === AllCampaignAreas[index - 1].levels.length
            ? "unlockable"
            : "locked");
        const current_level = areaInfo?.completedLevelCount || 0;
        const isCompleted = (areaInfo?.completedLevelCount || 0) >= area.levels.length;

        if (props.onlyShowCurrentArea && isCompleted) {
          return null;
        }

        return (
          <div
            className="widget area-button"
            data-unlock-status={unlock_status}
            key={area.name}
            style={{ backgroundImage: `url(${area.theme.backgroundImageSrc})` }}
          >
            <strong className="area-name widget-subtitle">Area {index + 1}</strong>
            <strong className="area-name widget-title">{unlock_status === "unlocked" ? area.name : `???`}</strong>
            <span className="level-count widget-button-wrapper">
              <Button
                mode={unlock_status === "locked" || isCompleted ? "default" : "accept"}
                disabled={unlock_status === "locked"}
                onClick={() => onAreaClick(area, unlock_status)}
              >
                {unlock_status === "locked"
                  ? "Unlock"
                  : isCompleted
                  ? "Completed!"
                  : props.onlyShowCurrentArea
                  ? "Continue"
                  : "Explore"}
              </Button>
              {unlock_status === "unlocked" ? `${Math.max(0, current_level - 1)} / ${area.levels.length}` : "? / ?"}
            </span>
          </div>
        );
      })}
    </div>
  );
};
