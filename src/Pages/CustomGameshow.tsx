import React, { useState } from "react";
import { SettingsData } from "../Data/SaveData";
import { Theme } from "../Data/Themes";
import { gamemodeCategories, gamemodeCategory, pageDescription, pageDescriptions } from "../Data/PageDescriptions";
import { OrderGroup } from "react-draggable-order";
import { GameshowToolboxItem } from "../Components/GameshowToolboxItem";
import { GameshowOrderItem } from "../Components/GameshowOrderItem";
import { Button } from "../Components/Button";

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
  theme: Theme;
  settings: SettingsData;
  setTheme: (theme: Theme) => void;
  addGold: (gold: number) => void;
  onComplete: (wasCorrect: boolean) => void;
}

export const CustomGameshow = (props: Props) => {
  const [currentGameshowCategoryFilter, setCurrentGameshowCategoryFilter] = useState<gamemodeCategory>(null);
  const [filteredModes, setFilteredModes] = useState<pageDescription[]>(getFilteredModes());
  const [queuedModes, setQueuedModes] = useState<pageDescription[]>([]);

  React.useEffect(() => {
    // Update the modes which can be added to the queue
    setFilteredModes(getFilteredModes());
  }, [currentGameshowCategoryFilter]);

  // Which gamemodes appear in the toolbox and can be added to the queue?
  function getFilteredModes(): pageDescription[] {
    return currentGameshowCategoryFilter === null
      ? // Any playable mode
        pageDescriptions.filter((page) => page.isRandomlyPlayable && page.isDisplayed)
      : // Any mode tagged with the current filter
        pageDescriptions.filter(
          (page) => page.categoryType === currentGameshowCategoryFilter && page.isRandomlyPlayable && page.isDisplayed
        );
  }

  // Append mode (the available mode which was clicked) to queue
  const addModeToQueue = (gameshowMode: pageDescription) => {
    const newQueuedModes = queuedModes.slice();
    newQueuedModes.push(gameshowMode);
    setQueuedModes(newQueuedModes);
  };

  // Delete the mode from the current queue
  const removeModeFromQueue = (index: number) => {
    // Take copy
    const newQueuedModes = queuedModes.slice();
    // Remove clicked mode
    newQueuedModes.splice(index, 1);
    setQueuedModes(newQueuedModes);
  };

  const clearQueue = () => {
    setQueuedModes([]);
  };

  // List of buttons (which add to the queue when clicked)
  function displayFilteredModes(): React.ReactNode {
    return (
      <div className="gameshow-available-modes-wrapper">
        {filteredModes.map((gameshowMode) => (
          <GameshowToolboxItem gameshowMode={gameshowMode} onClick={addModeToQueue}></GameshowToolboxItem>
        ))}
      </div>
    );
  }

  // The order of gamemodes (the CustomGameshow will have)
  function displayQueuedModes(): React.ReactNode {
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

  // Which gamemode categories can be used as filters?
  const gamemodeCategoryFilters: gamemodeCategory[] = gamemodeCategories.filter(
    (category) =>
      // Don't allow daily/weekly modes in a CustomGameshow
      category !== "Daily / Weekly" &&
      // Don't allow entire gameshow presets in a CustomGameshow
      category !== "Gameshow Presets" &&
      // Add this on at the end (so it's always the first option)
      category !== null &&
      // No point offering a filter for a gamemode category which has no playable modes
      pageDescriptions.filter((page) => page.categoryType === category && page.isDisplayed).length > 0
  );

  // Add the null (any) filter as the first option
  gamemodeCategoryFilters.unshift(null);

  // null as the gamemodeCategory acting as a filter is given the option text of "Any"
  return (
    <>
      <label>
        <select
          onChange={(e) => {
            setCurrentGameshowCategoryFilter(e.target.value === "Any" ? null : (e.target.value as gamemodeCategory));
          }}
          className="gameshowCategoryFilter-input"
          name="gameshowCategoryFilter"
          value={currentGameshowCategoryFilter ?? "Any"}
        >
          {gamemodeCategoryFilters.map((gamemodeCategoryFilter) => (
            <option key={gamemodeCategoryFilter} value={gamemodeCategoryFilter ?? "Any"}>
              {gamemodeCategoryFilter ?? "Any"}
            </option>
          ))}
        </select>
        Gamemode category type
      </label>

      <Button mode="destructive" onClick={clearQueue} settings={props.settings}>
        Clear
      </Button>

      <div className="custom-gameshow-wrapper">
        {displayQueuedModes()}
        {displayFilteredModes()}
      </div>
    </>
  );
};
