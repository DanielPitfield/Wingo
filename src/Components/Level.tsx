import React from "react";
import { PageName } from "../Data/PageNames";
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
        levelProps: OnlyConnectProps;
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
      }
    | {
        gameCategory: "LettersNumbersGameshow";
        page: PageName;
        levelProps: LettersNumbersGameshowProps;
      }
    | {
        gameCategory: "WingoGameshow";
        page: PageName;
        levelProps: WingoGameshowProps;
      }
    | {
        gameCategory: "SequencePuzzle";
        page: PageName;
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
  area: AreaConfig;
  level: LevelConfig;
  page: PageName;
  theme: Theme;
  settings: SettingsData;
  setTheme: (theme: Theme) => void;
  setPage: (page: PageName) => void;
  addGold: (gold: number) => void;
  onCompleteCampaignLevel: (isUnlockLevel: boolean, level: LevelConfig) => void;
}

/** A level within an area (e.g. one game) */
export const Level = (props: LevelProps) => {
  function renderGame() {
    const commonProps = {
      isCampaignLevel: true,
      page: props.page,
      theme: props.theme,
      settings: props.settings,
      setPage: props.setPage,
      setTheme: props.setTheme,
      addGold: props.addGold,
      onComplete: (wasCorrect: boolean) => {
        // Update progress to next level (if correct answer)
        if (wasCorrect) {
          props.onCompleteCampaignLevel(props.level.type === "unlock-level", props.level);
        }
        // Then, go to level selection (to rety level or to choose next level)
        props.setPage("campaign/area");
      },
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

      case "LettersNumbersGameshow":
        return (
          <LettersNumbersGameshow
            themes={[Themes.GenericLettersGame, Themes.GenericNumbersGame]}
            {...props.level.level.levelProps}
            {...commonProps}
          />
        );

      case "WingoGameshow":
        return <WingoGameshow {...props.level.level.levelProps} {...commonProps} />;

      case "SequencePuzzle":
        return <SequencePuzzle {...props.level.level.levelProps} {...commonProps} />;
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
