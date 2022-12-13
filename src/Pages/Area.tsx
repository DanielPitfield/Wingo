import { useState } from "react";
import { LevelConfig } from "../Components/Level";
import MessageNotification from "../Components/MessageNotification";
import { Theme } from "../Data/Themes";
import LevelNode from "../Components/LevelNode";
import { Navigate, useParams } from "react-router-dom";
import { getAreaConfig } from "../Helpers/getAreaConfig";
import { SettingsData } from "../Data/SaveData/Settings";

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

  // Keep track of which level node has most recently been hovered over
  const [selectedLevel, setSelectedLevel] = useState<LevelConfig | null>(null);

  // Find the selected area using the areaName paramater (the dynamic segment of the URL)
  const selectedArea: AreaConfig | null = getAreaConfig(areaName);

  // The area couldn't be found
  if (selectedArea === null) {
    // Go back to campaign page
    return <Navigate to="/Campaign" />;
  }

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
