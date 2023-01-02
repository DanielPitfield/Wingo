import { useState } from "react";
import { LevelConfig } from "../Components/Level";
import MessageNotification from "../Components/MessageNotification";
import { Theme } from "../Data/Themes";
import LevelNode from "../Components/LevelNode";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { getAreaConfig } from "../Helpers/getAreaConfig";
import { SettingsData } from "../Data/SaveData/Settings";
import { getCampaignProgress } from "../Data/SaveData/CampaignProgress";
import Button from "../Components/Button";

export interface AreaConfig {
  name: string;
  unlock_level: LevelConfig;
  levels: LevelConfig[];
  theme: Theme;
}

interface AreaProps {
  settings: SettingsData;
  setTheme: (theme: Theme) => void;
}

/** Portion of the campaign, with many levels */
const Area = (props: AreaProps) => {
  const { areaName } = useParams();
  const navigate = useNavigate();

  // Keep track of which level node has most recently been hovered over
  const [selectedLevel, setSelectedLevel] = useState<LevelConfig | null>(null);

  // Find the selected area using the areaName paramater (the dynamic segment of the URL)
  const selectedArea: AreaConfig | null = getAreaConfig(areaName);

  const campaignProgress = getCampaignProgress();
  const areaInfo = campaignProgress.areas.find((x) => x.name === areaName);

  // The area couldn't be found
  if (selectedArea === null) {
    // Go back to campaign page
    return <Navigate to="/Campaign" />;
  }

  const allLevelsCompleted = selectedArea.levels.every((l, i) => areaInfo?.completedLevelNumbers.includes(`${i + 1}`));

  return (
    <div
      className="area"
      style={{
        backgroundImage: `url(${selectedArea.theme.backgroundImageSrc})`,
        backgroundSize: "100%",
      }}
    >
      <section className="area-header">
        <h2 className="area-header-title">{selectedArea.name}</h2>
      </section>
      <div className="widgets">
        {allLevelsCompleted && (
          <>
            <MessageNotification type="success">
              <strong>All levels completed!</strong>
              <br />
              <br />
              <span style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                Explore the next area:{" "}
                <Button mode="accept" onClick={() => navigate("/Campaign")}>
                  Explore
                </Button>
              </span>
            </MessageNotification>
            <br />
          </>
        )}
        {(!areaInfo || areaInfo.status === "unlockable") && (
          <MessageNotification type="default">
            Unlock this area!
            <br />
            <br />
            <span style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Button mode="accept" onClick={() => navigate(`/Campaign/Areas/${areaName}/Levels/0`)}>
                Unlock
              </Button>
            </span>
          </MessageNotification>
        )}
        {selectedArea.levels.map((level, index) => (
          <LevelNode
            key={index}
            level={level}
            isSelected={selectedLevel === level}
            levelNumber={index + 1}
            area={selectedArea}
            setTheme={props.setTheme}
            settings={props.settings}
            onHoverLevel={setSelectedLevel}
          />
        ))}
        {selectedArea.levels.length === 0 && (
          <span>
            <MessageNotification type="default">
              No levels defined for area <strong>{selectedArea.name}</strong>
            </MessageNotification>
          </span>
        )}
      </div>
    </div>
  );
};

export default Area;
