import React from "react";
import { Page } from "../App";
import CountdownLettersConfig, { CountdownLettersConfigProps } from "../CountdownLetters/CountdownLettersConfig";
import CountdownNumbersConfig, { CountdownNumbersConfigProps } from "../CountdownNumbers/CountdownNumbersConfig";
import LetterCategoriesConfig, { LetterCategoriesConfigProps } from "../LetterCategories/LetterCategoriesConfig";
import { MessageNotification } from "../MessageNotification";
import NubbleConfig, { NubbleConfigProps } from "../Nubble/NubbleConfig";
import ArithmeticDrag, { ArithmeticDragProps } from "../NumbersArithmetic/ArithmeticDrag";
import ArithmeticReveal, { ArithmeticRevealProps } from "../NumbersArithmetic/ArithmeticReveal";
import GroupWall, { GroupWallProps } from "../OnlyConnect/GroupWall";
import { SettingsData } from "../SaveData";
import { Theme } from "../Themes";
import Algebra, { AlgebraProps } from "../VerbalReasoning/Algebra/Algebra";
import NumberSets, { NumberSetsProps } from "../VerbalReasoning/NumberSets/NumberSets";
import SameLetterWords, { SameLetterWordsProps } from "../VerbalReasoning/SameLetterWords";
import WordCodes, { WordCodesProps } from "../VerbalReasoning/WordCodes";
import WordleConfig, { WordleConfigProps } from "../WordleConfig";
import { AreaConfig } from "./Area";

// TODO: Lots of new modes which have been added which aren't supported by this type
export type LevelConfig = {
  hint?: React.ReactNode;
  level:
    | {
        gameCategory: "Wingo";
        page: Page;
        levelProps: WordleConfigProps;
      }
    | {
        gameCategory: "LetterCategories";
        page: Page;
        levelProps: LetterCategoriesConfigProps;
      }
    | {
        gameCategory: "CountdownLetters";
        page: Page;
        levelProps: CountdownLettersConfigProps;
      }
    | {
        gameCategory: "CountdownNumbers";
        page: Page;
        levelProps: CountdownNumbersConfigProps;
      }
    | {
        gameCategory: "ArithmeticReveal";
        page: Page;
        levelProps: ArithmeticRevealProps;
      }
    | {
        gameCategory: "ArithmeticDrag";
        page: Page;
        levelProps: ArithmeticDragProps;
      }
    | {
        gameCategory: "GroupWall";
        page: Page;
        levelProps: GroupWallProps;
      }
    | {
        gameCategory: "SameLetterWords";
        page: Page;
        levelProps: SameLetterWordsProps;
      }
    | {
        gameCategory: "NumberSets";
        page: Page;
        levelProps: NumberSetsProps;
      }
    | {
        gameCategory: "Algebra";
        page: Page;
        levelProps: AlgebraProps;
      }
    | {
        gameCategory: "WordCodes";
        page: Page;
        levelProps: WordCodesProps;
      }
    | {
        gameCategory: "Nubble";
        page: Page;
        levelProps: NubbleConfigProps;
      };

  // TODO: LevelConfigs (remaining unimplemented modes)
  /*
    | "puzzle/sequence"
    | "countdown/gameshow"
    | "lingo/gameshow";
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

    case "CountdownLetters":
      return `${pageString}-${level.levelProps.countdownWord}`;

    case "CountdownNumbers":
      return pageString;

    case "ArithmeticReveal":
      return pageString;

    case "ArithmeticDrag":
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

    case "Nubble":
      return pageString;

    // TODO: Unique identifier for level (remaining unimplemented modes)
    /*
      | "puzzle/sequence"
      | "countdown/gameshow"
      | "lingo/gameshow";
    */
  }
}

/** A level within an area (e.g. one game) */
export const Level: React.FC<{
  area: AreaConfig;
  level: LevelConfig;
  page: Page;
  theme: Theme;
  settings: SettingsData;
  setTheme: (theme: Theme) => void;
  setPage: (page: Page) => void;
  addGold: (gold: number) => void;
  onCompleteLevel: (isUnlockLevel: boolean, level: LevelConfig) => void;
}> = (props) => {
  function renderGame() {
    const commonProps = {
      page: props.page,
      theme: props.theme,
      settings: props.settings,
      setPage: props.setPage,
      setTheme: props.setTheme,
      addGold: props.addGold,
      finishingButtonText: "Back to area",
    };

    switch (props.level.level.gameCategory) {
      case "Wingo":
        return (
          <WordleConfig
            {...props.level.level.levelProps}
            {...commonProps}
            onComplete={(wasCorrect) => {
              if (wasCorrect) {
                props.onCompleteLevel(props.level.type === "unlock-level", props.level);
              }
              // Go to level selection (likely to choose next level)
              props.setPage("campaign/area");
            }}
          />
        );

      case "LetterCategories":
        return (
          <LetterCategoriesConfig
            {...props.level.level.levelProps}
            {...commonProps}
            onComplete={(wasCorrect) => {
              if (wasCorrect) {
                props.onCompleteLevel(props.level.type === "unlock-level", props.level);
              }
              props.setPage("campaign/area");
            }}
          />
        );

      case "CountdownLetters":
        return (
          <CountdownLettersConfig
            {...props.level.level.levelProps}
            {...commonProps}
            settings={props.settings}
            onComplete={(wasCorrect) => {
              if (wasCorrect) {
                props.onCompleteLevel(props.level.type === "unlock-level", props.level);
              }
              props.setPage("campaign/area");
            }}
          />
        );

      case "CountdownNumbers":
        return (
          <CountdownNumbersConfig
            {...props.level.level.levelProps}
            {...commonProps}
            onComplete={(wasCorrect) => {
              if (wasCorrect) {
                props.onCompleteLevel(props.level.type === "unlock-level", props.level);
              }
              props.setPage("campaign/area");
            }}
          />
        );

      case "ArithmeticReveal":
        return (
          <ArithmeticReveal
            {...props.level.level.levelProps}
            {...commonProps}
            onComplete={(wasCorrect) => {
              if (wasCorrect) {
                props.onCompleteLevel(props.level.type === "unlock-level", props.level);
              }
              props.setPage("campaign/area");
            }}
          />
        );

      case "ArithmeticDrag":
        return (
          <ArithmeticDrag
            {...props.level.level.levelProps}
            {...commonProps}
            onComplete={(wasCorrect) => {
              if (wasCorrect) {
                props.onCompleteLevel(props.level.type === "unlock-level", props.level);
              }
              props.setPage("campaign/area");
            }}
          />
        );

      case "GroupWall":
        return (
          <GroupWall
            {...props.level.level.levelProps}
            {...commonProps}
            onComplete={(wasCorrect) => {
              if (wasCorrect) {
                props.onCompleteLevel(props.level.type === "unlock-level", props.level);
              }
              props.setPage("campaign/area");
            }}
          />
        );

      case "SameLetterWords":
        return (
          <SameLetterWords
            {...props.level.level.levelProps}
            {...commonProps}
            onComplete={(wasCorrect) => {
              if (wasCorrect) {
                props.onCompleteLevel(props.level.type === "unlock-level", props.level);
              }
              props.setPage("campaign/area");
            }}
          />
        );

      case "NumberSets":
        return (
          <NumberSets
            {...props.level.level.levelProps}
            {...commonProps}
            onComplete={(wasCorrect) => {
              if (wasCorrect) {
                props.onCompleteLevel(props.level.type === "unlock-level", props.level);
              }
              props.setPage("campaign/area");
            }}
          />
        );

      case "Algebra":
        return (
          <Algebra
            {...props.level.level.levelProps}
            {...commonProps}
            onComplete={(wasCorrect) => {
              if (wasCorrect) {
                props.onCompleteLevel(props.level.type === "unlock-level", props.level);
              }
              props.setPage("campaign/area");
            }}
          />
        );

      case "WordCodes":
        return (
          <WordCodes
            {...props.level.level.levelProps}
            {...commonProps}
            onComplete={(wasCorrect) => {
              if (wasCorrect) {
                props.onCompleteLevel(props.level.type === "unlock-level", props.level);
              }
              props.setPage("campaign/area");
            }}
          />
        );

      case "Nubble":
        return (
          <NubbleConfig
            {...props.level.level.levelProps}
            {...commonProps}
            onComplete={(wasCorrect) => {
              if (wasCorrect) {
                props.onCompleteLevel(props.level.type === "unlock-level", props.level);
              }
              props.setPage("campaign/area");
            }}
          />
        );

      // TODO: Render Campaign level (remaining unimplemented modes)
      /*
        | "puzzle/sequence"
        | "countdown/gameshow"
        | "lingo/gameshow";
      */
    }
  }
  return (
    <div
      className="level"
      style={{ backgroundImage: `url(${props.theme.backgroundImageSrc})`, backgroundSize: "100%" }}
    >
      <section className="area-header">
        <h2 className="area-header-title">{props.area.name}</h2>
      </section>
      {props.level.hint && <MessageNotification type="default">{props.level.hint}</MessageNotification>}
      {renderGame()}
    </div>
  );
};
