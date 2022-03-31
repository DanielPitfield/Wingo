import React from "react";
import { Page } from "./App";
import { AreaConfig } from "./Area";
import { LevelConfig } from "./Level";
import { SaveData } from "./SaveData";

// Define the game areas
export const areas: AreaConfig[] = [
  {
    // TODO: Tutorial

    // START
    name: "Start",
    // The properties of the level to unlock this area
    unlock_level: {
      // TODO: How to specify new lines?
      hint: "Every area must first be unlocked by guessing the name of the area\nSince this is the tutorial, we'll tell you that the answer is: START\nTry entering the word START",
      isUnlockLevel: true,
      levelProps: {
        mode: "repeat",
        targetWord: "start",
        enforceFullLengthGuesses: true,
        defaultWordLength: 5,
        defaultnumGuesses: 6,
        keyboard: true,
        firstLetterProvided: true,
        puzzleLeaveNumBlanks: 0,
        puzzleRevealMs: 0,
        timerConfig: { isTimed: false },
      },
    },
    levels: [],
  },
  {
    name: "Space",
    unlock_level: {
      hint: "Unlock this area",
      isUnlockLevel: true,
      levelProps: {
        mode: "repeat",
        targetWord: "space",
        enforceFullLengthGuesses: true,
        defaultWordLength: 5,
        defaultnumGuesses: 6,
        keyboard: true,
        firstLetterProvided: true,
        puzzleLeaveNumBlanks: 0,
        puzzleRevealMs: 0,
        timerConfig: { isTimed: false },
      },
    },

    levels: [],
  },

  {
    name: "Cars",
    unlock_level: {
      hint: "Unlock this area",
      isUnlockLevel: true,
      levelProps: {
        mode: "repeat",
        targetWord: "cars",
        enforceFullLengthGuesses: true,
        defaultWordLength: 5,
        defaultnumGuesses: 6,
        keyboard: true,
        firstLetterProvided: true,
        puzzleLeaveNumBlanks: 0,
        puzzleRevealMs: 0,
        timerConfig: { isTimed: false },
      },
    },

    levels: [],
  },
];

export const Campaign: React.FC<{
  setSelectedArea: (areaConfig: AreaConfig) => void;
  setSelectedCampaignLevel: (level: LevelConfig) => void;
  setPage: (page: Page) => void;
}> = (props) => {
  return (
    // AREA SELECTION
    <div className="campaign">
      {areas.map((area, index) => {
        // Find out if area is locked, unlockable or unlocked
        const campaignProgress = SaveData.getCampaignProgress();
        const areaInfo = campaignProgress.find((x) => x.name === area.name);
        const unlock_status = areaInfo?.status;
        const current_level = areaInfo?.current_level;

        return (
          <button
            className="area-button"
            data-unlock-status={unlock_status}
            disabled={unlock_status === "locked"}
            key={area.name}
            onClick={() => {
              // Button should be disabled, but just in case
              if (unlock_status === "locked") {
                return;
              }
              // Go straight to level to unlock/discover the theme
              else if (unlock_status === "unlockable") {
                props.setSelectedArea(area);
                props.setSelectedCampaignLevel(area.unlock_level);
                props.setPage("campaign/area/level");
              }
              // Already unlocked, go to level selection screen
              else {
                props.setSelectedArea(area);
                props.setPage("campaign/area");
              }
            }}
          >
            <strong className="area-name">
              {unlock_status === "unlocked" ? `${index + 1}. ${area.name}` : `${index + 1}. ???`}
            </strong>
            <span className="level-count">
              {unlock_status === "unlocked" && current_level ? `${current_level - 1} / ${area.levels.length}` : "? / ?"}
            </span>
          </button>
        );
      })}
    </div>
  );
};
