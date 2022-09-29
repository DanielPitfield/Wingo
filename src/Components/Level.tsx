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
import { SettingsData } from "../Data/SaveData";
import { Theme, Themes } from "../Data/Themes";
import Algebra, { AlgebraProps } from "../Pages/Algebra";
import NumberSets, { NumberSetsProps } from "../Pages/NumberSets";
import SameLetterWords, { SameLetterWordsProps } from "../Pages/SameLetterWords";
import WordCodes, { WordCodesProps } from "../Pages/WordCodes";
import WingoConfig, { WingoConfigProps } from "../Pages/WingoConfig";
import { AreaConfig } from "../Pages/Area";
import { LettersNumbersGameshow, LettersNumbersGameshowProps } from "../Pages/LettersNumbersGameshow";
import { WingoGameshow, WingoGameshowProps } from "../Pages/WingoGameshow";
import SequencePuzzle, { SequencePuzzleProps } from "../Pages/SequencePuzzle";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router";
import { getAreaConfig } from "../Helpers/getAreaConfig";
import { getLevelConfig } from "../Helpers/getLevelConfig";

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

/**
 * Gets a unique identifier for the specified level.
 * @param level Level for which to get the ID.
 * @returns Unique identifier of the level.
 */
export function getId(level: LevelConfig["level"]): string {
  const pageString = level.page.toString();

  // TODO: Mostly does not return a unique identifier (pageString won't be unique)
  switch (level.gameCategory) {
    case "Wingo":
      return `${pageString}-${level.levelProps.targetWord}`;

    case "LetterCategories":
      return pageString;

    case "LettersGame":
      return `${pageString}-${level.levelProps.lettersGameSelectionWord}`;

    case "NumbersGame":
      return pageString;

    case "ArithmeticReveal":
      return pageString;

    case "ArithmeticDrag/Match":
      return pageString;

    case "GroupWall":
      return pageString;

    case "SameLetterWords":
      return pageString;

    case "NumberSets":
      return `${pageString}-${JSON.stringify(level.levelProps.defaultNumberSets) ?? ""}`;

    case "Algebra":
      return `${pageString}-${JSON.stringify(level.levelProps.defaultTemplates) ?? ""}`;

    case "WordCodes":
      return `${pageString}-${level.levelProps.mode}`;

    case "Numble":
      return pageString;

    case "LettersNumbersGameshow":
      return pageString;

    case "WingoGameshow":
      return pageString;

    case "SequencePuzzle":
      return pageString;
  }
}

export const LEVEL_FINISHING_TEXT = "Back to area";

interface LevelProps {
  theme: Theme;
  settings: SettingsData;
  setTheme: (theme: Theme) => void;
  addGold: (gold: number) => void;
  onCompleteCampaignLevel: (areaConfig: AreaConfig, levelConfig: LevelConfig, isUnlockLevel: boolean) => void;
}

/** A level within an area (e.g. one game) */
export const Level = (props: LevelProps) => {
  const navigate = useNavigate();
  const params = useParams();

  // Find the selected area using the areaName paramater (the dynamic segment of the URL)
  const selectedArea: AreaConfig | null = getAreaConfig(params.areaName);

  // Find the selected area using the areaName paramater (the dynamic segment of the URL)
  const selectedLevel: LevelConfig | null = getLevelConfig(params.areaName, params.levelNumber);

  // Either, the area or level couldn't be found
  if (selectedArea! === null || selectedLevel! === null) {
    // Go back to area (if that can be found), otherwise go back to campaign
    navigate(selectedArea ? `/Campaign/Areas/:${selectedArea.name}` : "/Campaign");
    // TODO: Gone back to a previous page, but must render something here?
    return <></>;
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
        if (wasCorrect) {
          props.onCompleteCampaignLevel(selectedArea!, selectedLevel!, selectedLevel!.type === "unlock-level");
        }
        // Then, go to level selection (to rety level or to choose next level)
        navigate(`/Campaign/Areas/${selectedArea?.name}`);
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
        return (
          <LettersNumbersGameshow
            themes={[Themes.GenericLettersGame, Themes.GenericNumbersGame]}
            {...selectedLevel!.level.levelProps}
            {...commonProps}
          />
        );

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
