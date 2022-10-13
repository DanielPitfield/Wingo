import React from "react";
import { PagePath } from "../Data/PageNames";
import LettersGameConfig, { LettersGameConfigProps } from "../Pages/LettersGameConfig";
import NumbersGameConfig, { NumbersGameConfigProps } from "../Pages/NumbersGameConfig";
import LetterCategoriesConfig, { LetterCategoriesConfigProps } from "../Pages/LetterCategoriesConfig";
import { MessageNotification } from "./MessageNotification";
import NumbleConfig, { NumbleConfigProps } from "../Pages/NumbleConfig";
import ArithmeticDrag, { ArithmeticDragProps } from "../Pages/ArithmeticDrag";
import ArithmeticReveal, { ArithmeticRevealProps } from "../Pages/ArithmeticReveal";
import OnlyConnect, { OnlyConnectProps } from "../Pages/OnlyConnect";

import { Theme } from "../Data/Themes";
import Algebra, { AlgebraProps } from "../Pages/Algebra";
import NumberSets, { NumberSetsProps } from "../Pages/NumberSets";
import SameLetterWords, { SameLetterWordsProps } from "../Pages/SameLetterWords";
import WordCodes, { WordCodesProps } from "../Pages/WordCodes";
import WingoConfig, { WingoConfigProps } from "../Pages/WingoConfig";
import { AreaConfig } from "../Pages/Area";
import { LettersNumbersGameshow, LettersNumbersGameshowProps } from "../Pages/LettersNumbersGameshow";
import { WingoGameshow, WingoGameshowProps } from "../Pages/WingoGameshow";
import SequencePuzzle, { SequencePuzzleProps } from "../Pages/SequencePuzzle";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useParams } from "react-router";
import { getAreaConfig } from "../Helpers/getAreaConfig";
import { getLevelConfig } from "../Helpers/getLevelConfig";
import { getAreaBacktrackPath } from "../Helpers/getAreaBacktrackPath";
import { SettingsData } from "../Data/SaveData/Settings";
import { addCompletedCampaignAreaLevel, addCompletedCampaignAreaUnlockLevel } from "../Data/SaveData/CampaignProgress";

export type LevelConfig = {
  hint?: React.ReactNode;
  level:
    | {
        gameCategory: "Wingo";
        page: PagePath;
        levelProps: WingoConfigProps;
      }
    | {
        gameCategory: "LetterCategories";
        page: PagePath;
        levelProps: LetterCategoriesConfigProps;
      }
    | {
        gameCategory: "LettersGame";
        page: PagePath;
        levelProps: LettersGameConfigProps;
      }
    | {
        gameCategory: "NumbersGame";
        page: PagePath;
        levelProps: NumbersGameConfigProps;
      }
    | {
        gameCategory: "ArithmeticReveal";
        page: PagePath;
        levelProps: ArithmeticRevealProps;
      }
    | {
        gameCategory: "ArithmeticDrag/Match";
        page: PagePath;
        levelProps: ArithmeticDragProps;
      }
    | {
        gameCategory: "GroupWall";
        page: PagePath;
        levelProps: OnlyConnectProps;
      }
    | {
        gameCategory: "SameLetterWords";
        page: PagePath;
        levelProps: SameLetterWordsProps;
      }
    | {
        gameCategory: "NumberSets";
        page: PagePath;
        levelProps: NumberSetsProps;
      }
    | {
        gameCategory: "Algebra";
        page: PagePath;
        levelProps: AlgebraProps;
      }
    | {
        gameCategory: "WordCodes";
        page: PagePath;
        levelProps: WordCodesProps;
      }
    | {
        gameCategory: "Numble";
        page: PagePath;
        levelProps: NumbleConfigProps;
      }
    | {
        gameCategory: "LettersNumbersGameshow";
        page: PagePath;
        levelProps: LettersNumbersGameshowProps;
      }
    | {
        gameCategory: "WingoGameshow";
        page: PagePath;
        levelProps: WingoGameshowProps;
      }
    | {
        gameCategory: "SequencePuzzle";
        page: PagePath;
        levelProps: SequencePuzzleProps;
      };
} & (
  | {
      type: "unlock-level";
    }
  | {
      type: "level";
      levelButtonCoords: {
        x: number;
        y: number;
      };
    }
);

export const LEVEL_FINISHING_TEXT = "Back to area";

interface LevelProps {
  theme: Theme;
  settings: SettingsData;
  setTheme: (theme: Theme) => void;
  addGold: (gold: number) => void;
}

/** A level within an area (e.g. one game) */
export const Level = (props: LevelProps) => {
  const { areaName, levelNumber } = useParams();

  // TODO: Params undefined, return <Navigate> component

  const location = useLocation().pathname as PagePath;
  const navigate = useNavigate();

  // Find the selected area using the areaName paramater (the dynamic segment of the URL)
  const selectedArea: AreaConfig | null = getAreaConfig(areaName);

  // Find the selected area using the areaName paramater (the dynamic segment of the URL)
  const selectedLevel: LevelConfig | null = getLevelConfig(areaName, levelNumber);

  // Either, the area or level couldn't be found
  if (selectedArea! === null || selectedLevel! === null) {
    // Go back to area (if that can be found), otherwise go back to campaign
    return <Navigate to={selectedArea ? getAreaBacktrackPath(location) : "/Campaign"} />;
  }

  function renderGame() {
    const commonProps = {
      isCampaignLevel: true,
      theme: props.theme,
      settings: props.settings,
      setTheme: props.setTheme,
      addGold: props.addGold,
      onComplete: (wasCorrect: boolean) => {
        // Update progress to next level (if correct answer)
        if (wasCorrect && selectedLevel?.type === "unlock-level") {
          addCompletedCampaignAreaUnlockLevel(areaName!);
        }
        if (wasCorrect && selectedLevel?.type === "level") {
          addCompletedCampaignAreaLevel(areaName!, levelNumber!);
        }
        
        // Then, go to level selection (to rety level or to choose next level)
        navigate(selectedArea ? getAreaBacktrackPath(location) : "/Campaign");
      },
    };

    switch (selectedLevel!.level.gameCategory) {
      case "Wingo":
        return <WingoConfig {...selectedLevel!.level.levelProps} {...commonProps} />;

      case "LetterCategories":
        return <LetterCategoriesConfig {...selectedLevel!.level.levelProps} {...commonProps} />;

      case "LettersGame":
        return <LettersGameConfig {...selectedLevel!.level.levelProps} {...commonProps} />;

      case "NumbersGame":
        return <NumbersGameConfig {...selectedLevel!.level.levelProps} {...commonProps} />;

      case "ArithmeticReveal":
        return <ArithmeticReveal {...selectedLevel!.level.levelProps} {...commonProps} />;

      case "ArithmeticDrag/Match":
        return <ArithmeticDrag {...selectedLevel!.level.levelProps} {...commonProps} />;

      case "GroupWall":
        return <OnlyConnect {...selectedLevel!.level.levelProps} {...commonProps} />;

      case "SameLetterWords":
        return <SameLetterWords {...selectedLevel!.level.levelProps} {...commonProps} />;

      case "NumberSets":
        return <NumberSets {...selectedLevel!.level.levelProps} {...commonProps} />;

      case "Algebra":
        return <Algebra {...selectedLevel!.level.levelProps} {...commonProps} />;

      case "WordCodes":
        return <WordCodes {...selectedLevel!.level.levelProps} {...commonProps} />;

      case "Numble":
        return <NumbleConfig {...selectedLevel!.level.levelProps} {...commonProps} />;

      case "LettersNumbersGameshow":
        return <LettersNumbersGameshow {...selectedLevel!.level.levelProps} {...commonProps} />;

      case "WingoGameshow":
        return <WingoGameshow {...selectedLevel!.level.levelProps} {...commonProps} />;

      case "SequencePuzzle":
        return <SequencePuzzle {...selectedLevel!.level.levelProps} {...commonProps} />;
    }
  }

  return (
    <div
      className="level"
      style={{ backgroundImage: `url(${props.theme.backgroundImageSrc})`, backgroundSize: "100% 100%" }}
    >
      <section className="area-header">
        <h2 className="area-header-title">{selectedArea!.name}</h2>
      </section>
      {selectedLevel!.hint && <MessageNotification type="default">{selectedLevel!.hint}</MessageNotification>}
      {renderGame()}
    </div>
  );
};
