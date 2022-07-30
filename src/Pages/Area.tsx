import React, { useState } from "react";
import { PageName } from "../PageNames";
import { LevelConfig } from "../Components/Level";
import { MessageNotification } from "../Components/MessageNotification";
import { SettingsData } from "../Data/SaveData";
import { Theme } from "../Data/Themes";
import { LevelNode } from "../Components/LevelNode";

export interface AreaConfig {
  name: string;
  unlock_level: LevelConfig;
  levels: LevelConfig[];
  theme: Theme;
}

/** Portion of the campaign, with many levels */
export const Area: React.FC<{
  area: AreaConfig;
  settings: SettingsData;
  setTheme: (theme: Theme) => void;
  setSelectedCampaignLevel: (level: LevelConfig) => void;
  setPage: (page: PageName) => void;
}> = (props) => {
  const [selectedLevel, setSelectedLevel] = useState<LevelConfig | null>(null);

  // LEVEL SELECTION
  return (
    <div
      className="area"
      style={{
        backgroundImage: `url(${props.area.theme.backgroundImageSrc})`,
        backgroundSize: "100%",
      }}
    >
      <section className="area-header">
        <h2 className="area-header-title">{props.area.name}</h2>
      </section>
      <div className="widgets">
        {props.area.levels.map((l, index) => (
          <LevelNode
            key={index}
            level={l}
            isSelected={selectedLevel === l}
            index={index}
            area={props.area}
            setTheme={props.setTheme}
            setPage={props.setPage}
            settings={props.settings}
            setSelectedCampaignLevel={props.setSelectedCampaignLevel}
            onHoverLevel={setSelectedLevel}
          />
        ))}
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
