import React, { useState } from "react";
import { SettingsData } from "../Data/SaveData";
import { PageName } from "../PageNames";
import { Theme } from "../Data/Themes";
import { pageDescriptions } from "../PageDescriptions";
import { arrayMove, OrderGroup } from "react-draggable-order";
import { DraggableItem } from "../Components/DraggableItem";

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

export const CustomGameshow: React.FC<Props> = (props) => {
  const [currentGameshowType, setCurrentGameshowType] = useState<gameshowType>("Custom");
  const [queuedModes, setQueuedModes] = useState<
    | {
        page: PageName;
        title: string;
        shortTitle?: string;
        isPlayable: boolean;
        gameshowType?: gameshowType;
        description?: string;
        helpInfo?: JSX.Element;
      }[]
    | null
  >(null);

  React.useEffect(() => {
    const newQueuedModes =
      currentGameshowType === "Custom"
        ? // Any playable mode
          pageDescriptions.filter((page) => page.isPlayable)
        : // Any mode tagged with the current gameshow type
          pageDescriptions.filter((page) => page.gameshowType === currentGameshowType && page.isPlayable);
          
    setQueuedModes(newQueuedModes);
  }, [currentGameshowType]);

  function displayGamemodes() {
    return (
      <div className="gameshow-mode-wrapper">
        <OrderGroup mode={"between"}>
          {queuedModes?.map((gameshowMode, index) => (
            <DraggableItem
              key={index}
              index={index}
              onMove={(toIndex) => setQueuedModes(arrayMove(queuedModes, index, toIndex))}
            >
              <div className="gameshow-gamemode">{gameshowMode.title}</div>
            </DraggableItem>
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

      <div>{displayGamemodes()}</div>
    </>
  );
};
