import React from "react";
import { Page } from "../App";
import { CountdownLettersConfigProps } from "../CountdownLetters/CountdownLetters";
import { MessageNotification } from "../MessageNotification";
import { PuzzleConfig, PuzzleConfigProps } from "../Puzzles/PuzzleConfig";
import { SettingsData } from "../SaveData";
import { Theme } from "../Themes";
import WordleConfig, { WordleConfigProps } from "../WordleConfig";
import { AreaConfig } from "./Area";

export interface LevelConfig {
  hint?: React.ReactNode;
  isUnlockLevel?: boolean;
  level:
    | {
        gameCategory: "wingo";
        levelProps: WordleConfigProps;
      }
    | {
        gameCategory: "countdown_letters";
        levelProps: CountdownLettersConfigProps;
      }
    | {
        gameCategory: "puzzle";
        levelProps: PuzzleConfigProps;
      };
}

/**
 * Gets a unique identifier for the specified level.
 * @param level Level for which to get the ID.
 * @returns Unique identifier of the level.
 */
export function getId(level: LevelConfig["level"]): string {
  switch (level.gameCategory) {
    case "wingo":
      return `${level.gameCategory}-${level.levelProps.mode}-${level.levelProps.targetWord}`;

    case "puzzle":
      return `${level.gameCategory}-${level.levelProps.mode}-${level.levelProps.correctAnswerDescription}`;

    case "countdown_letters":
      return `${level.gameCategory}-${level.levelProps.mode}-${level.levelProps.countdownWord}`;
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
    switch (props.level.level.gameCategory) {
      case "wingo":
        return (
          <WordleConfig
            {...props.level.level.levelProps}
            page={props.page}
            setTheme={props.setTheme}
            setPage={props.setPage}
            addGold={props.addGold}
            finishingButtonText="Back to area"
            settings={props.settings}
            onComplete={(wasCorrect) => {
              if (wasCorrect) {
                props.onCompleteLevel(props.level.isUnlockLevel || false, props.level);
              }

              // Go to level selection (likely to choose next level)
              props.setPage("campaign/area");
            }}
          />
        );

      case "puzzle":
        return (
          <PuzzleConfig
            theme={{ ...props.theme, backgroundImageSrc: "" }}
            setTheme={props.setTheme}
            defaultPuzzle={props.level.level.levelProps}
            finishingButtonText="Back to Area"
            settings={props.settings}
            onComplete={(wasCorrect) => {
              if (wasCorrect) {
                props.onCompleteLevel(props.level.isUnlockLevel || false, props.level);
              }

              // Go to level selection (likely to choose next level)
              props.setPage("campaign/area");
            }}
          />
        );
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
