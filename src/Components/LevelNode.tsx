import { useState } from "react";
import { pageDescriptions } from "../Data/PageDescriptions";
import { LevelConfig } from "./Level";
import { Theme } from "../Data/Themes";
import { usePopper } from "react-popper";
import { useClickChime } from "../Data/Sounds";
import { AreaConfig } from "../Pages/Area";
import { useNavigate } from "react-router-dom";
import { DISABLED_SETTINGS, SettingsData } from "../Data/SaveData/Settings";
import { getCampaignProgress } from "../Data/SaveData/CampaignProgress";

interface LevelNodeProps {
  level: LevelConfig;
  isSelected: boolean;
  levelNumber: number;
  area: AreaConfig;
  settings: SettingsData;
  onHoverLevel: (level: LevelConfig | null) => void;
  setTheme: (theme: Theme) => void;
}

export const LevelNode = (props: LevelNodeProps) => {
  const navigate = useNavigate();

  const [referenceElement, setReferenceElement] = useState(null);
  const [popperElement, setPopperElement] = useState(null);
  const [arrowElement, setArrowElement] = useState(null);
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: "auto",
    strategy: "absolute",
    modifiers: [{ name: "arrow", options: { element: arrowElement } }],
  });
  const [playClickSoundEffect] = useClickChime(props.settings ?? DISABLED_SETTINGS);

  const campaignProgress = getCampaignProgress();

  const areaInfo = campaignProgress.areas.find((x) => x.name === props.area.name);

  console.log("Area Info: " + areaInfo);

  // Determine whether this is the first level
  const isFirstLevel = props.levelNumber === 1;

  // Find the previous level (unless this is the first level)
  const previousLevel = isFirstLevel ? undefined : props.area.levels[props.levelNumber - 1];

  console.log("Area Info - Completed Levels: " + areaInfo?.completedLevelNumbers);

  // Determine whether the level has already been completed
  const isLevelCompleted = Array.from(areaInfo?.completedLevelNumbers || []).includes(props.levelNumber.toString());

  // Determine whether the level has been unlocked (i.e. the previous level has been completed)
  const isLevelUnlocked = !previousLevel
    ? areaInfo?.status === "unlocked"
    : areaInfo?.completedLevelNumbers.has((props.levelNumber - 1).toString());

  // Get the level page info
  const levelInfo = pageDescriptions.find((x) => x.path === props.level.level.page);

  if (props.level.type !== "level") {
    return null;
  }

  return (
    <>
      <button
        className="level-button button-node"
        ref={setReferenceElement as any}
        key={`Area ${areaInfo?.name} Level ${props.levelNumber}`}
        onClick={() => {
          if (isLevelUnlocked && !isLevelCompleted) {
            playClickSoundEffect();
            navigate(`/Campaign/Areas/${areaInfo?.name}/Levels/${props.levelNumber}`);
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
        {props.levelNumber}
      </button>

      {props.isSelected && (
        <div className="popper-overlay" ref={setPopperElement as any} style={styles.popper} {...attributes.popper}>
          <div
            className="level-button widget"
            key={`Area ${areaInfo?.name} Level ${props.levelNumber}`}
            data-is-completed={isLevelCompleted}
            data-is-unlocked={isLevelUnlocked}
          >
            <strong className="widget-subtitle">
              <span className="level-status">
                {isLevelCompleted ? "Completed" : isLevelUnlocked ? "Unlocked!" : "Locked"}
              </span>
              <span className="level-number">Level {props.levelNumber}</span>
            </strong>
            <p className="level-mode">{levelInfo?.title || levelInfo?.shortTitle}</p>
            <div ref={setArrowElement as any} style={styles.arrow} />
          </div>
        </div>
      )}
    </>
  );
};
