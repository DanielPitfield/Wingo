import React from "react";
import { PageName } from "../PageNames";
import LettersGameConfig, { LettersGameConfigProps } from "../Pages/LettersGameConfig";
import NumbersGameConfig, { NumbersGameConfigProps } from "../Pages/NumbersGameConfig";
import LetterCategoriesConfig, { LetterCategoriesConfigProps } from "../Pages/LetterCategoriesConfig";
import { MessageNotification } from "./MessageNotification";
import NumbleConfig, { NumbleConfigProps } from "../Pages/NumbleConfig";
import ArithmeticDrag, { ArithmeticDragProps } from "../Pages/ArithmeticDrag";
import ArithmeticReveal, { ArithmeticRevealProps } from "../Pages/ArithmeticReveal";
import OnlyConnect, { GroupWallProps } from "../Pages/OnlyConnect";
import { SettingsData } from "../Data/SaveData";
import { Theme } from "../Data/Themes";
import Algebra, { AlgebraProps } from "../Pages/Algebra";
import NumberSets, { NumberSetsProps } from "../Pages/NumberSets";
import SameLetterWords, { SameLetterWordsProps } from "../Pages/SameLetterWords";
import WordCodes, { WordCodesProps } from "../Pages/WordCodes";
import WingoConfig, { WingoConfigProps } from "../Pages/WingoConfig";
import { AreaConfig } from "../Pages/Area";

// TODO: Lots of new modes which have been added which aren't supported by this type
export type LevelConfig = {
  hint?: React.ReactNode;
  level:
    | {
        gameCategory: "Wingo";
        page: PageName;
        levelProps: WingoConfigProps;
      }
    | {
        gameCategory: "LetterCategories";
        page: PageName;
        levelProps: LetterCategoriesConfigProps;
      }
    | {
        gameCategory: "LettersGame";
        page: PageName;
        levelProps: LettersGameConfigProps;
      }
    | {
        gameCategory: "NumbersGame";
        page: PageName;
        levelProps: NumbersGameConfigProps;
      }
    | {
        gameCategory: "ArithmeticReveal";
        page: PageName;
        levelProps: ArithmeticRevealProps;
      }
    | {
        gameCategory: "ArithmeticDrag/Match";
        page: PageName;
        levelProps: ArithmeticDragProps;
      }
    | {
        gameCategory: "GroupWall";
        page: PageName;
        levelProps: GroupWallProps;
      }
    | {
        gameCategory: "SameLetterWords";
        page: PageName;
        levelProps: SameLetterWordsProps;
      }
    | {
        gameCategory: "NumberSets";
        page: PageName;
        levelProps: NumberSetsProps;
      }
    | {
        gameCategory: "Algebra";
        page: PageName;
        levelProps: AlgebraProps;
      }
    | {
        gameCategory: "WordCodes";
        page: PageName;
        levelProps: WordCodesProps;
      }
    | {
        gameCategory: "Numble";
        page: PageName;
        levelProps: NumbleConfigProps;
      };

  // TODO: LevelConfigs (remaining unimplemented modes)
  /*
    | "PuzzleSequence"
    | "LettersNumbersGameshow"
    | "Wingo/Gameshow";
  */
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
      return `${pageString}-${level.levelProps.defaultSet?.question ?? ""}`;

    case "Algebra":
      return `${pageString}-${level.levelProps.defaultTemplate?.questions ?? ""}`;

    case "WordCodes":
      return `${pageString}-${level.levelProps.mode}`;

    case "Numble":
      return pageString;

    // TODO: Unique identifier for level (remaining unimplemented modes)
    /*
      | "PuzzleSequence"
      | "LettersNumbersGameshow"
      | "Wingo/Gameshow";
    */
  }
}

export const LEVEL_FINISHING_TEXT = "Back to area";

/** A level within an area (e.g. one game) */
export const Level: React.FC<{
  area: AreaConfig;
  level: LevelConfig;
  page: PageName;
  theme: Theme;
  settings: SettingsData;
  setTheme: (theme: Theme) => void;
  setPage: (page: PageName) => void;
  addGold: (gold: number) => void;
  onCompleteLevel: (
    completedLevelConfig:
      | { isCampaignLevel: false }
      | { isCampaignLevel: true; levelConfig: LevelConfig; isUnlockLevel: boolean; wasCorrect: boolean }
  ) => void;
}> = (props) => {
  function renderGame() {
    const commonProps = {
      page: props.page,
      theme: props.theme,
      settings: props.settings,
      setPage: props.setPage,
      setTheme: props.setTheme,
      addGold: props.addGold,
      onCompleteLevel: props.onCompleteLevel,
    };

    switch (props.level.level.gameCategory) {
      case "Wingo":
        return <WingoConfig {...props.level.level.levelProps} {...commonProps} />;

      case "LetterCategories":
        return <LetterCategoriesConfig {...props.level.level.levelProps} {...commonProps} />;

      case "LettersGame":
        return <LettersGameConfig {...props.level.level.levelProps} {...commonProps} />;

      case "NumbersGame":
        return <NumbersGameConfig {...props.level.level.levelProps} {...commonProps} />;

      case "ArithmeticReveal":
        return <ArithmeticReveal {...props.level.level.levelProps} {...commonProps} />;

      case "ArithmeticDrag/Match":
        return <ArithmeticDrag {...props.level.level.levelProps} {...commonProps} />;

      case "GroupWall":
        return <OnlyConnect {...props.level.level.levelProps} {...commonProps} />;

      case "SameLetterWords":
        return <SameLetterWords {...props.level.level.levelProps} {...commonProps} />;

      case "NumberSets":
        return <NumberSets {...props.level.level.levelProps} {...commonProps} />;

      case "Algebra":
        return <Algebra {...props.level.level.levelProps} {...commonProps} />;

      case "WordCodes":
        return <WordCodes {...props.level.level.levelProps} {...commonProps} />;

      case "Numble":
        return <NumbleConfig {...props.level.level.levelProps} {...commonProps} />;

      // TODO: Render Campaign level (remaining unimplemented modes)
      /*
        | "PuzzleSequence"
        | "LettersNumbersGameshow"
        | "Wingo/Gameshow";
      */
    }
  }
  return (
    <div
      className="level"
      style={{ backgroundImage: `url(${props.theme.backgroundImageSrc})`, backgroundSize: "100% 100%" }}
    >
      <section className="area-header">
        <h2 className="area-header-title">{props.area.name}</h2>
      </section>
      {props.level.hint && <MessageNotification type="default">{props.level.hint}</MessageNotification>}
      {renderGame()}
    </div>
  );
};
