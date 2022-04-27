import React, { useState } from "react";
import { Page, pages } from "../App";
import { Button } from "../Button";
import { getId, LevelConfig } from "./Level";
import { MessageNotification } from "../MessageNotification";
import { SaveData, SettingsData } from "../SaveData";
import { Theme } from "../Themes";
import { usePopper } from "react-popper";

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
  setPage: (page: Page) => void;
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
            onClickLevel={setSelectedLevel}
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

export const LevelNode: React.FC<{
  level: LevelConfig;
  isSelected: boolean;
  index: number;
  area: AreaConfig;
  settings: SettingsData;
  onClickLevel: (level: LevelConfig | null) => void;
  setTheme: (theme: Theme) => void;
  setSelectedCampaignLevel: (level: LevelConfig) => void;
  setPage: (page: Page) => void;
}> = (props) => {
  const [referenceElement, setReferenceElement] = useState(null);
  const [popperElement, setPopperElement] = useState(null);
  const [arrowElement, setArrowElement] = useState(null);
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: "auto",
    strategy: "absolute",
    modifiers: [{ name: "arrow", options: { element: arrowElement } }],
  });

  const campaignProgress = SaveData.getCampaignProgress();
  const areaInfo = campaignProgress.areas.find((x) => x.name === props.area.name);

  // Determine whether this is the first level
  const isFirstLevel = props.index === 0;

  // Find the previous level (unless this is the first level)
  const previousLevel = isFirstLevel ? undefined : props.area.levels[props.index - 1];

  // Determine whether the level has already been completed
  const level_completed = areaInfo?.completedLevelIds.some((x) => x === getId(props.level.level)) || false;

  // Determine whether the level has been unlocked (i.e. the previous level has been completed)
  const level_unlocked =
    !previousLevel || areaInfo?.completedLevelIds.some((x) => x === getId(previousLevel.level)) || false;

  // Get the level page info
  const levelInfo = pages.find(
    (x) => x.page === `${props.level.level.gameCategory}/${props.level.level.levelProps.mode}`
  );

  return (
    <>
      <button
        className="level-button button-node"
        ref={setReferenceElement as any}
        key={`Area ${areaInfo?.name} Level ${props.index + 1}`}
        onClick={() => props.onClickLevel(props.isSelected ? null : props.level)}
        onMouseOver={() => props.onClickLevel(props.isSelected ? null : props.level)}
        onMouseLeave={() => props.onClickLevel(null)}
        data-is-completed={level_completed}
        data-is-unlocked={level_unlocked}
        data-animation-setting={props.settings.graphics.animation}
        style={
          props.level.levelButtonCoords
            ? {
                position: "absolute",
                top: `${props.level.levelButtonCoords.y}%`,
                left: `${props.level.levelButtonCoords.x}%`,
              }
            : undefined
        }
      >
        {props.index + 1}
      </button>

      {props.isSelected && (
        <div className="popper-overlay" ref={setPopperElement as any} style={styles.popper} {...attributes.popper}>
          <div
            className="level-button widget"
            key={`Area ${areaInfo?.name} Level ${props.index + 1}`}
            data-is-completed={level_completed}
            data-is-unlocked={level_unlocked}
          >
            <strong className="widget-subtitle">
              <span className="level-number">Level {props.index + 1}</span>
              <span className="level-status">{level_unlocked ? "" : "Locked"}</span>
            </strong>
            <p className="level-mode">
              {levelInfo?.title || levelInfo?.shortTitle || props.level.level.levelProps.mode}
            </p>
            <span className="widget-button-wrapper">
              <Button
                mode={level_unlocked && !level_completed ? "accept" : "default"}
                disabled={!level_unlocked}
                settings={props.settings}
                onClick={() => {
                  if (level_unlocked) {
                    props.setSelectedCampaignLevel(props.level);
                    props.setPage("campaign/area/level");
                  }
                }}
              >
                {level_completed ? "Completed!" : level_unlocked ? "Go" : "?"}
              </Button>
            </span>
            <div ref={setArrowElement as any} style={styles.arrow} />
          </div>
        </div>
      )}
    </>
  );
};
