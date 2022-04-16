import React from "react";
import { Page } from "./App";
import { AreaConfig } from "./Area";
import { Button } from "./Button";
import { LevelConfig } from "./Level";
import { CampaignSaveData, SaveData } from "./SaveData";
import SpaceBackgroundImageSrc from "./images/space.webp";
import LakeBackgroundImageSrc from "./images/lake.jpg";

// Define the game areas
export const areas: AreaConfig[] = [
  {
    // TODO: Tutorial

    // START node
    name: "Start",
    backgroundImageSrc: LakeBackgroundImageSrc,
    // The properties of the level to unlock this area
    unlock_level: {
      hint: (
        <>
          Every area must first be unlocked by guessing the name of the area
          <br />
          Since this is the tutorial, we'll tell you that the answer is: <strong>START</strong>
          <br />
          Try entering the word <strong>START</strong>
        </>
      ),
      isUnlockLevel: true,
      levelProps: {
        mode: "repeat",
        targetWord: "start",
        enforceFullLengthGuesses: true,
        defaultWordLength: 5,
        defaultnumGuesses: 6,
        keyboard: true,
        firstLetterProvided: true,
        checkInDictionary: false,
        puzzleLeaveNumBlanks: 0,
        puzzleRevealMs: 0,
        timerConfig: { isTimed: false },
      },
    },
    levels: [],
  },
  // Area 1 - Space
  {
    name: "Space",
    backgroundImageSrc: SpaceBackgroundImageSrc,
    unlock_level: {
      hint: <>Unlock this area</>,
      isUnlockLevel: true,
      levelProps: {
        mode: "repeat",
        targetWord: "space",
        enforceFullLengthGuesses: true,
        defaultWordLength: 5,
        defaultnumGuesses: 6,
        keyboard: true,
        firstLetterProvided: false,
        checkInDictionary: false,
        puzzleLeaveNumBlanks: 0,
        puzzleRevealMs: 0,
        timerConfig: { isTimed: false },
      },
    },

    levels: [
      {
        hint: <>Only known inhabitted planet</>,
        levelProps: {
          mode: "repeat",
          targetWord: "earth",
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
      {
        hint: <>Planet of men</>,
        levelProps: {
          mode: "repeat",
          targetWord: "mars",
          enforceFullLengthGuesses: true,
          defaultWordLength: 4,
          defaultnumGuesses: 6,
          keyboard: true,
          firstLetterProvided: false,
          puzzleLeaveNumBlanks: 0,
          puzzleRevealMs: 0,
          timerConfig: { isTimed: false },
        },
      },
      {
        hint: <>Path followed around a bigger object</>,
        levelProps: {
          mode: "repeat",
          targetWord: "orbit",
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
      {
        hint: <>Planet of women</>,
        levelProps: {
          mode: "repeat",
          targetWord: "venus",
          enforceFullLengthGuesses: true,
          defaultWordLength: 5,
          defaultnumGuesses: 6,
          keyboard: true,
          firstLetterProvided: false,
          puzzleLeaveNumBlanks: 0,
          puzzleRevealMs: 0,
          timerConfig: { isTimed: false },
        },
      },
      {
        hint: <>Planet sharing a name with a metal</>,
        levelProps: {
          mode: "repeat",
          targetWord: "mercury",
          enforceFullLengthGuesses: true,
          defaultWordLength: 5,
          defaultnumGuesses: 6,
          keyboard: true,
          firstLetterProvided: false,
          puzzleLeaveNumBlanks: 0,
          puzzleRevealMs: 0,
          timerConfig: { isTimed: false },
        },
      },
      {
        hint: <>Attractive force</>,
        levelProps: {
          mode: "repeat",
          targetWord: "gravity",
          enforceFullLengthGuesses: true,
          defaultWordLength: 7,
          defaultnumGuesses: 6,
          keyboard: true,
          firstLetterProvided: true,
          puzzleLeaveNumBlanks: 4,
          puzzleRevealMs: 1500,
          timerConfig: { isTimed: false },
        },
      },
      {
        hint: <>Planet with a storm greater in size than the earth</>,
        levelProps: {
          mode: "repeat",
          targetWord: "jupiter",
          enforceFullLengthGuesses: true,
          defaultWordLength: 7,
          defaultnumGuesses: 6,
          keyboard: true,
          firstLetterProvided: true,
          puzzleLeaveNumBlanks: 0,
          puzzleRevealMs: 0,
          timerConfig: { isTimed: false },
        },
      },
      {
        hint: <>Gravitationally bound collection of stars</>,
        levelProps: {
          mode: "repeat",
          targetWord: "galaxy",
          enforceFullLengthGuesses: true,
          defaultWordLength: 6,
          defaultnumGuesses: 6,
          keyboard: true,
          firstLetterProvided: true,
          puzzleLeaveNumBlanks: 0,
          puzzleRevealMs: 0,
          timerConfig: { isTimed: false },
        },
      },
      {
        hint: <>Planet of the sea</>,
        levelProps: {
          mode: "repeat",
          targetWord: "neptune",
          enforceFullLengthGuesses: true,
          defaultWordLength: 7,
          defaultnumGuesses: 6,
          keyboard: true,
          firstLetterProvided: false,
          puzzleLeaveNumBlanks: 0,
          puzzleRevealMs: 0,
          timerConfig: { isTimed: false },
        },
      },
      {
        hint: <>Outburst of energy from a star</>,
        levelProps: {
          mode: "repeat",
          targetWord: "flare",
          enforceFullLengthGuesses: true,
          defaultWordLength: 5,
          defaultnumGuesses: 6,
          keyboard: true,
          firstLetterProvided: false,
          puzzleLeaveNumBlanks: 3,
          puzzleRevealMs: 1500,
          timerConfig: { isTimed: false },
        },
      },
      {
        hint: <>Planet with icy rings</>,
        levelProps: {
          mode: "repeat",
          targetWord: "saturn",
          enforceFullLengthGuesses: true,
          defaultWordLength: 6,
          defaultnumGuesses: 6,
          keyboard: true,
          firstLetterProvided: false,
          puzzleLeaveNumBlanks: 0,
          puzzleRevealMs: 0,
          timerConfig: { isTimed: false },
        },
      },
      {
        hint: <>Radient emission</>,
        levelProps: {
          mode: "repeat",
          targetWord: "aurora",
          enforceFullLengthGuesses: true,
          defaultWordLength: 6,
          defaultnumGuesses: 6,
          keyboard: true,
          firstLetterProvided: false,
          puzzleLeaveNumBlanks: 3,
          puzzleRevealMs: 1500,
          timerConfig: { isTimed: false },
        },
      },
      {
        hint: <>Planet that spins on its side</>,
        levelProps: {
          mode: "repeat",
          targetWord: "uranus",
          enforceFullLengthGuesses: true,
          defaultWordLength: 6,
          defaultnumGuesses: 6,
          keyboard: true,
          firstLetterProvided: false,
          puzzleLeaveNumBlanks: 0,
          puzzleRevealMs: 0,
          timerConfig: { isTimed: false },
        },
      },
      {
        hint: <>Super heated gas</>,
        levelProps: {
          mode: "repeat",
          targetWord: "plasma",
          enforceFullLengthGuesses: true,
          defaultWordLength: 6,
          defaultnumGuesses: 7,
          keyboard: true,
          firstLetterProvided: true,
          puzzleLeaveNumBlanks: 3,
          puzzleRevealMs: 1500,
          timerConfig: { isTimed: false },
        },
      },
    ],
  },

  {
    name: "Cars",
    backgroundImageSrc: SpaceBackgroundImageSrc,
    unlock_level: {
      hint: <>Unlock this area</>,
      isUnlockLevel: true,
      levelProps: {
        mode: "repeat",
        targetWord: "cars",
        enforceFullLengthGuesses: true,
        defaultWordLength: 5,
        defaultnumGuesses: 6,
        keyboard: true,
        firstLetterProvided: true,
        checkInDictionary: false,
        puzzleLeaveNumBlanks: 0,
        puzzleRevealMs: 0,
        timerConfig: { isTimed: false },
      },
    },

    levels: [],
  },

  {
    name: "Travel",
    unlock_level: {
      hint: <>Unlock this area</>,
      isUnlockLevel: true,
      levelProps: {
        mode: "repeat",
        targetWord: "travel",
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
    name: "Fantasy",
    unlock_level: {
      hint: <>Unlock this area</>,
      isUnlockLevel: true,
      levelProps: {
        mode: "repeat",
        targetWord: "fantasy",
        enforceFullLengthGuesses: true,
        defaultWordLength: 7,
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
  /** */
  function onAreaClick(area: AreaConfig, unlock_status: CampaignSaveData["areas"][0]["status"]) {
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
  }
  return (
    // AREA SELECTION
    <div className="campaign widgets">
      {areas.map((area, index) => {
        // Find out if area is locked, unlockable or unlocked
        const campaignProgress = SaveData.getCampaignProgress();
        const areaInfo = campaignProgress.areas.find((x) => x.name === area.name);
        const previousAreaInfo =
          index === 0 ? undefined : campaignProgress.areas.find((x) => x.name === areas[index - 1].name);
        const unlock_status =
          areaInfo?.status ||
          (index === 0 || previousAreaInfo?.completedLevelCount === areas[index - 1].levels.length
            ? "unlockable"
            : "locked");
        const current_level = areaInfo?.completedLevelCount || 0;
        const isCompleted = (areaInfo?.completedLevelCount || 0) >= area.levels.length;

        return (
          <div
            className="widget area-button"
            data-unlock-status={unlock_status}
            key={area.name}
            style={{ backgroundImage: `url(${area.backgroundImageSrc})` }}
          >
            <strong className="area-name widget-subtitle">Area {index + 1}</strong>
            <strong className="area-name widget-title">{unlock_status === "unlocked" ? area.name : `???`}</strong>
            <span className="level-count widget-button-wrapper">
              <Button
                mode={unlock_status === "locked" || isCompleted ? "default" : "accept"}
                disabled={unlock_status === "locked"}
                onClick={() => onAreaClick(area, unlock_status)}
              >
                {unlock_status === "locked" ? "Unlock" : isCompleted ? "Completed!" : "Explore"}
              </Button>
              {unlock_status === "unlocked" ? `${Math.max(0, current_level - 1)} / ${area.levels.length}` : "? / ?"}
            </span>
          </div>
        );
      })}
    </div>
  );
};
