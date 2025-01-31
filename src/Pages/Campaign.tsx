import { AreaConfig } from "./Area";
import Button from "../Components/Button";
import { Theme } from "../Data/Themes";
import { AllCampaignAreas } from "../Data/CampaignAreas/AllCampaignAreas";
import { FiCheck, FiLock, FiPlay } from "react-icons/fi";
import { useNavigate } from "react-router";
import { CampaignSaveData, getCampaignProgress } from "../Data/SaveData/CampaignProgress";
import { SettingsData } from "../Data/SaveData/Settings";

interface CampaignProps {
  theme: Theme;
  settings: SettingsData;
  onlyShowCurrentArea?: boolean;
  setTheme: (theme: Theme) => void;
}

/** The entire campaign, showing the list of areas */
const Campaign = (props: CampaignProps) => {
  const navigate = useNavigate();

  function onAreaClick(area: AreaConfig, unlockLevelStatus: CampaignSaveData["areas"][0]["status"]) {
    // The button to start the level should be disabled, but just in case
    if (unlockLevelStatus === "locked") {
      return;
    }

    props.setTheme(area.theme);

    // Go straight to unlock level
    if (unlockLevelStatus === "unlockable") {
      navigate(`/Campaign/Areas/${area.name}/Levels/0`);
      return;
    }

    // Already completed unlock level, go to level selection screen
    navigate(`/Campaign/Areas/${area.name}`);
  }

  const campaignProgress = getCampaignProgress();

  return (
    // AREA SELECTION
    <div className="campaign widgets">
      {AllCampaignAreas.filter((x) => x.levels.length > 0).map((area, index) => {
        // Need to find out if area is locked, unlockable or unlocked, so start by getting the saved information about the area
        const areaInfo = campaignProgress.areas.find((x) => x.name === area.name);

        // Determine whether this is the first area
        const isFirstArea = index === 0;

        // Find the previous area info (unless this is the first area)
        const previousAreaInfo = isFirstArea
          ? undefined
          : campaignProgress.areas.find((x) => x.name === AllCampaignAreas[index - 1].name);

        const isPreviousAreaCompleted = !previousAreaInfo
          ? // If the information about the previous area couldn't be found
            false
          : // Have all the levels in the previous area been completed?
            AllCampaignAreas[index - 1].levels.length === previousAreaInfo?.completedLevelNumbers.length;

        // If there is no save data for status, what will the unlock status be?
        const fallbackUnlockStatus = isFirstArea || isPreviousAreaCompleted ? "unlockable" : "locked";

        // Try and get the unlock status from the save data, or if not found, use above fallback
        const unlockStatus = areaInfo?.status ?? fallbackUnlockStatus;

        const numCompletedLevels = areaInfo?.completedLevelNumbers.length;
        const isAreaCompleted = numCompletedLevels === area.levels.length;

        if (props.onlyShowCurrentArea && (unlockStatus === "locked" || isAreaCompleted)) {
          return null;
        }

        return (
          <div
            className="widget area-button"
            data-unlock-status={unlockStatus}
            key={area.name}
            style={{
              backgroundImage: `url(${area.theme.backgroundImageSrc})`,
              backgroundSize: "100%",
            }}
          >
            <strong className="area-name widget-subtitle">Area {index + 1}</strong>
            <strong className="area-name widget-title">{unlockStatus === "unlocked" ? area.name : `???`}</strong>
            <span className="level-count widget-button-wrapper">
              <Button
                mode={unlockStatus === "locked" || isAreaCompleted ? "default" : "accept"}
                disabled={unlockStatus === "locked"}
                settings={props.settings}
                onClick={() => onAreaClick(area, unlockStatus)}
              >
                {unlockStatus === "locked" ? (
                  <>
                    <FiLock /> Unlock
                  </>
                ) : isAreaCompleted ? (
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
              {unlockStatus === "unlocked" && numCompletedLevels !== undefined
                ? `${Math.max(0, numCompletedLevels - 1)} / ${area.levels.length}`
                : "? / ?"}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default Campaign;
