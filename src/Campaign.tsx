import React, { useState } from "react";
import { Page } from "./App";
import { AreaConfig } from "./Area";
import { LevelConfig } from "./Level";

// Define the game areas
const areas: AreaConfig[] = [
  {
    name: "Tutorial",
    description: "Learn the basics of the game",
    // The properties of the level to unlock this area
    unlock_level: {
      description: "Unlock Tutorial Area",
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
    levels: [
      // Define the levels in each area
      {
        description: "",
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
    ],
  },
  /*
  { name: "Bravo", description: "", levels: [] },
  { name: "Charlie", description: "", levels: [] },
  */
];

export const Campaign: React.FC<{
  setSelectedArea: (areaConfig: AreaConfig) => void;
  setSelectedCampaignLevel: (level: LevelConfig) => void;
  setPage: (page: Page) => void;
}> = (props) => {
  const defaultAreaStatuses: {
    name: string;
    status: "locked" | "unlockable" | "unlocked";
  }[] = areas.map((area) => ({
    name: area.name,
    // TODO: Status is read from saveData
    status: "unlockable",
  }));

  const [areaStatuses, setareaStatuses] = useState<
    {
      name: string;
      status: "locked" | "unlockable" | "unlocked";
    }[]
  >(defaultAreaStatuses);

  return (
    <div className="campaign">
      {areas.map((area) => (
        <button
          className="area-button"
          //data-unlock-status={unlock_status}
          //disabled={unlock_status === "locked"}
          key={area.name}
          onClick={() => {
            // TODO: How to make this a higher scope?
            const unlock_status = areaStatuses.find((x) => x.name === area.name)?.status;

            // Button should be disabled, but just in case
            if (unlock_status === "locked") {
              return;
            } 
            // Go straight to level to unlock/discover the theme
            else if (unlock_status === "unlockable") {
              props.setSelectedCampaignLevel(area.unlock_level);
              props.setPage("campaign/area/level");
            }
            // Already unlocked, go to area selection screen 
            else {
              props.setSelectedArea(area);
              props.setPage("campaign/area");
            }
          }}
        >
          <strong className="area-name">{/* unlock_status === "unlocked" ? */ area.name /* : "???" */}</strong>
          <span className="description">{area.description}</span>
          <span className="level-count">{area.levels.length} levels</span>
        </button>
      ))}
    </div>
  );
};
