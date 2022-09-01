import React, { useState } from "react";
import { SettingsData } from "../Data/SaveData";
import { PageName } from "../PageNames";
import { Theme } from "../Data/Themes";
import { pageDescription, pageDescriptions } from "../PageDescriptions";
import { OrderGroup } from "react-draggable-order";
import { GameshowToolboxItem } from "../Components/GameshowToolboxItem";
import { GameshowOrderItem } from "../Components/GameshowOrderItem";

export interface CustomGameshowProps {
  campaignConfig:
    | {
        isCampaignLevel: true;
        // What score must be achieved to pass the campaign level?
        targetScore: number;
      }
    | { isCampaignLevel: false };
}

interface Props extends CustomGameshowProps {
  page: PageName;
  theme: Theme;
  settings: SettingsData;
  setPage: (page: PageName) => void;
  setTheme: (theme: Theme) => void;
  addGold: (gold: number) => void;
  onComplete: (wasCorrect: boolean) => void;
}

const gameshowTypes = ["Custom", "Wingo", "LettersNumbers"] as const;
export type gameshowType = typeof gameshowTypes[number];

export const CustomGameshow = (props: Props) => {
  const [currentGameshowType, setCurrentGameshowType] = useState<gameshowType>("Custom");
  const [availableModes, setAvailableModes] = useState<pageDescription[]>(getAvailableModes());
  const [queuedModes, setQueuedModes] = useState<pageDescription[]>([]);

  React.useEffect(() => {
    // The type of gameshow has now changed, start with an empty queue
    setQueuedModes([]);
    // Update the modes which can be added to the queue
    setAvailableModes(getAvailableModes());
  }, [currentGameshowType]);

  // Which gamemodes can be added to the CustomGameshow queue (based on the gameshow type)?
  function getAvailableModes(): pageDescription[] {
    return currentGameshowType === "Custom"
      ? // Any playable mode
        pageDescriptions.filter((page) => page.isPlayable)
      : // Any mode tagged with the current gameshow type
        pageDescriptions.filter((page) => page.gameshowType === currentGameshowType && page.isPlayable);
  }

  // Append mode (the available mode which was clicked) to queue
  function addModeToQueue(gameshowMode: pageDescription) {
    const newQueuedModes = queuedModes.slice();
    newQueuedModes.push(gameshowMode);
    setQueuedModes(newQueuedModes);
  }

  // Delete the mode from the current queue
  function removeModeFromQueue(index: number) {
    // Take copy
    const newQueuedModes = queuedModes.slice();
    // Remove clicked mode
    newQueuedModes.splice(index, 1);
    setQueuedModes(newQueuedModes);
  }

  // List of buttons (which add to the queue when clicked)
  function displayAvailableModes() {
    return (
      <div className="gameshow-available-modes-wrapper">
        {availableModes.map((gameshowMode) => (
          <GameshowToolboxItem gameshowMode={gameshowMode} onClick={addModeToQueue}></GameshowToolboxItem>
        ))}
      </div>
    );
  }

  // The order of gamemodes (the CustomGameshow will have)
  function displayQueuedModes() {
    const draggableItemProps = {
      queuedModes: queuedModes,
      setQueuedModes: setQueuedModes,
      onClick: removeModeFromQueue,
    };

    return (
      <div className="gameshow-queued-modes-wrapper">
        <OrderGroup mode={"between"}>
          {queuedModes?.map((gameshowMode, index) => (
            <GameshowOrderItem {...draggableItemProps} gameshowMode={gameshowMode} index={index}></GameshowOrderItem>
          ))}
        </OrderGroup>
      </div>
    );
  }

  return (
    <>
      <label>
        <select
          onChange={(e) => {
            setCurrentGameshowType(e.target.value as gameshowType);
          }}
          className="gameshowType-input"
          name="gameshowType"
          value={currentGameshowType}
        >
          {gameshowTypes.map((gameshowType) => (
            <option key={gameshowType} value={gameshowType}>
              {gameshowType}
            </option>
          ))}
        </select>
        Gameshow type
      </label>

      <div className="custom-gameshow-wrapper">
        {displayQueuedModes()}
        {displayAvailableModes()}
      </div>
    </>
  );
};
