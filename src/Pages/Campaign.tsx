import { PagePath } from "../Data/PageNames";
import { AreaConfig } from "./Area";
import { Button } from "../Components/Button";
import { getId, LevelConfig } from "../Components/Level";
import { CampaignSaveData, SaveData, SettingsData } from "../Data/SaveData";
import { Theme } from "../Data/Themes";
import { AllCampaignAreas } from "../Data/CampaignAreas/AllCampaignAreas";
import BackgroundImageSrc from "../Data/Images/background.png";
import { FiCheck, FiLock, FiPlay } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

interface CampaignProps {
  theme: Theme;
  settings: SettingsData;
  onlyShowCurrentArea?: boolean;
  setTheme: (theme: Theme) => void;
  setSelectedArea: (areaConfig: AreaConfig) => void;
  setSelectedCampaignLevel: (level: LevelConfig) => void;
}

/** The entire campaign, showing the list of areas */
export const Campaign = (props: CampaignProps) => {
  const navigate = useNavigate();

  /** */
  function onAreaClick(area: AreaConfig, unlockStatus: CampaignSaveData["areas"][0]["status"]) {
    // Button should be disabled, but just in case
    if (unlockStatus === "locked") {
      return;
    }

    props.setTheme(area.theme);

    // Go straight to level to unlock/discover the theme
    if (unlockStatus === "unlockable") {
      props.setSelectedArea(area);
      props.setSelectedCampaignLevel(area.unlock_level);
      navigate("/campaign/area/level");
    }
    // Already unlocked, go to level selection screen
    else {
      props.setSelectedArea(area);
      navigate("/campaign/area");
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
        const unlockStatus =
          areaInfo?.status ||
          (isFirstArea ||
          AllCampaignAreas[index - 1].levels.every((l) => previousAreaInfo?.completedLevelIds.includes(getId(l.level)))
            ? "unlockable"
            : "locked");

        const currentLevelCount = areaInfo?.completedLevelIds.filter((x) => x !== "unlock").length || 0;
        const isCompleted = area.levels.every((l) => areaInfo?.completedLevelIds.includes(getId(l.level)));

        if (props.onlyShowCurrentArea && (unlockStatus === "locked" || isCompleted)) {
          return null;
        }

        return (
          <div
            className="widget area-button"
            data-unlock-status={unlockStatus}
            key={area.name}
            style={{
              backgroundImage: `url(${
                unlockStatus === "unlockable" ? BackgroundImageSrc : area.theme.backgroundImageSrc
              })`,
              backgroundSize: "100%",
            }}
          >
            <strong className="area-name widget-subtitle">Area {index + 1}</strong>
            <strong className="area-name widget-title">{unlockStatus === "unlocked" ? area.name : `???`}</strong>
            <span className="level-count widget-button-wrapper">
              <Button
                mode={unlockStatus === "locked" || isCompleted ? "default" : "accept"}
                disabled={unlockStatus === "locked"}
                settings={props.settings}
                onClick={() => onAreaClick(area, unlockStatus)}
              >
                {unlockStatus === "locked" ? (
                  <>
                    <FiLock /> Unlock
                  </>
                ) : isCompleted ? (
                  <>
                    <FiCheck /> Completed!
                  </>
                ) : props.onlyShowCurrentArea ? (
                  <>
                    <FiPlay /> Continue Campaign
                  </>
                ) : (
                  <>
                    <FiPlay /> Explore
                  </>
                )}
              </Button>
              {unlockStatus === "unlocked" ? `${Math.max(0, currentLevelCount - 1)} / ${area.levels.length}` : "? / ?"}
            </span>
          </div>
        );
      })}
    </div>
  );
};
