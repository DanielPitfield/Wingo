import { useState } from "react";
import { LevelConfig } from "../Components/Level";
import { MessageNotification } from "../Components/MessageNotification";
import { SettingsData } from "../Data/SaveData";
import { Theme } from "../Data/Themes";
import { LevelNode } from "../Components/LevelNode";
import { useNavigate, useParams } from "react-router-dom";
import { AllCampaignAreas } from "../Data/CampaignAreas/AllCampaignAreas";

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
export const Area = (props: AreaProps) => {
  // TODO: Remove this once params is used for Levels too
  const [selectedLevel, setSelectedLevel] = useState<LevelConfig | null>(null);

  const navigate = useNavigate();
  const params = useParams();

  const getAreaConfig = (areaName: string | undefined): AreaConfig | null => {
    return AllCampaignAreas.find((area) => area.name === areaName) ?? null;
  };

  // Find the selected area using the areaName paramater (the dynamic segment of the URL)
  const selectedArea: AreaConfig | null = getAreaConfig(params.areaName);

  // The area couldn't be found
  if (selectedArea === null) {
    // Go back to campaign page
    navigate("/campaign");
    // TODO: Gone back to a previous page, but must render something here?
    return <></>;
  }

  // LEVEL SELECTION
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
        {selectedArea.levels.map((level, index) => (
          <LevelNode
            key={index}
            level={level}
            isSelected={selectedLevel === level}
            index={index}
            area={selectedArea}
            setTheme={props.setTheme}
            settings={props.settings}
            // TODO: Does this setSelectedLevel to level?
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
