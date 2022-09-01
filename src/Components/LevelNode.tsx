import { useState } from "react";
import { pageDescriptions } from "../PageDescriptions";
import { PageName } from "../PageNames";
import { getId, LevelConfig } from "./Level";
import { SaveData, SettingsData } from "../Data/SaveData";
import { Theme } from "../Data/Themes";
import { usePopper } from "react-popper";
import { useClickChime } from "../Data/Sounds";
import { AreaConfig } from "../Pages/Area";

type LevelNodeProps = {
  level: LevelConfig;
  isSelected: boolean;
  index: number;
  area: AreaConfig;
  settings: SettingsData;
  onHoverLevel: (level: LevelConfig | null) => void;
  setTheme: (theme: Theme) => void;
  setSelectedCampaignLevel: (level: LevelConfig) => void;
  setPage: (page: PageName) => void;
};

export const LevelNode = (props: LevelNodeProps) => {
  const [referenceElement, setReferenceElement] = useState(null);
  const [popperElement, setPopperElement] = useState(null);
  const [arrowElement, setArrowElement] = useState(null);
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: "auto",
    strategy: "absolute",
    modifiers: [{ name: "arrow", options: { element: arrowElement } }],
  });
  const [playClickSoundEffect] = useClickChime(props.settings || SaveData.DISABLED_SETTINGS);

  const campaignProgress = SaveData.getCampaignProgress();
  const areaInfo = campaignProgress.areas.find((x) => x.name === props.area.name);

  // Determine whether this is the first level
  const isFirstLevel = props.index === 0;

  // Find the previous level (unless this is the first level)
  const previousLevel = isFirstLevel ? undefined : props.area.levels[props.index - 1];

  // Determine whether the level has already been completed
  const isLevelCompleted = areaInfo?.completedLevelIds.some((x) => x === getId(props.level.level)) || false;

  // Determine whether the level has been unlocked (i.e. the previous level has been completed)
  const isLevelUnlocked = !previousLevel
    ? areaInfo?.completedLevelIds.includes("unlock")
    : areaInfo?.completedLevelIds.some((x) => x === getId(previousLevel.level)) || false;

  // Get the level page info
  const levelInfo = pageDescriptions.find((x) => x.page === props.level.level.page);

  if (props.level.type !== "level") {
    return null;
  }

  return (
    <>
      <button
        className="level-button button-node"
        ref={setReferenceElement as any}
        key={`Area ${areaInfo?.name} Level ${props.index + 1}`}
        onClick={() => {
          if (isLevelUnlocked && !isLevelCompleted) {
            playClickSoundEffect();
            props.setSelectedCampaignLevel(props.level);
            props.setPage("campaign/area/level");
          }
        }}
        onMouseOver={() => props.onHoverLevel(props.isSelected ? null : props.level)}
        onMouseLeave={() => props.onHoverLevel(null)}
        data-is-completed={isLevelCompleted}
        data-is-unlocked={isLevelUnlocked}
        data-animation-setting={props.settings.graphics.animation}
        style={{
          position: "absolute",
          top: `${props.level.levelButtonCoords.y}%`,
          left: `${props.level.levelButtonCoords.x}%`,
        }}
      >
        {props.index + 1}
      </button>

      {props.isSelected && (
        <div className="popper-overlay" ref={setPopperElement as any} style={styles.popper} {...attributes.popper}>
          <div
            className="level-button widget"
            key={`Area ${areaInfo?.name} Level ${props.index + 1}`}
            data-is-completed={isLevelCompleted}
            data-is-unlocked={isLevelUnlocked}
          >
            <strong className="widget-subtitle">
              <span className="level-status">
                {isLevelCompleted ? "Completed" : isLevelUnlocked ? "Unlocked!" : "Locked"}
              </span>
              <span className="level-number">Level {props.index + 1}</span>
            </strong>
            <p className="level-mode">{levelInfo?.title || levelInfo?.shortTitle}</p>
            <div ref={setArrowElement as any} style={styles.arrow} />
          </div>
        </div>
      )}
    </>
  );
};
