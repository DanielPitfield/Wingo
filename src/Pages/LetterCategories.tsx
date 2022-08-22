import React, { useState } from "react";
import { Keyboard } from "../Components/Keyboard";
import { PageName } from "../PageNames";
import { WordRow } from "../Components/WordRow";
import { Button } from "../Components/Button";
import { MessageNotification } from "../Components/MessageNotification";
import ProgressBar, { GreenToRedColorTransition } from "../Components/ProgressBar";
import { Theme } from "../Data/Themes";
import { SettingsData } from "../Data/SaveData";
import GamemodeSettingsMenu from "../Components/GamemodeSettingsMenu";
import { LEVEL_FINISHING_TEXT } from "../Components/Level";
import { MAX_NUM_CATEGORIES } from "../Data/GamemodeSettingsInputLimits";
import { getGamemodeDefaultTimerValue } from "../Data/DefaultTimerValues";

interface Props {
  campaignConfig:
    | {
        isCampaignLevel: true;
        // How many categories must be successfully answered to pass the campaign level?
        targetScore: number;
      }
    | { isCampaignLevel: false };

  gamemodeSettings: {
    numCategories: number;
    timerConfig: { isTimed: true; seconds: number } | { isTimed: false };
  };

  remainingSeconds: number;
  wordLength: number;
  guesses: string[];
  currentWord: string;
  wordIndex: number;
  inProgress: boolean;
  hasSubmitLetter: boolean;
  correctGuessesCount: number;
  categoryRequiredStartingLetter: string;
  chosenCategoryMappings: { name: string; targetWordArray: string[] }[];

  page: PageName;
  theme: Theme;
  settings: SettingsData;
  setPage: (page: PageName) => void;
  onEnter: () => void;
  onSubmitLetter: (letter: string) => void;
  onBackspace: () => void;

  updateGamemodeSettings: (newGamemodeSettings: {
    numCategories: number;
    timerConfig: { isTimed: true; seconds: number } | { isTimed: false };
  }) => void;
  updateRemainingSeconds: (newSeconds: number) => void;

  ResetGame: () => void;
}

const LetterCategories: React.FC<Props> = (props) => {
  const [mostRecentTotalSeconds, setMostRecentTotalSeconds] = useState(
    props.gamemodeSettings?.timerConfig?.isTimed === true
      ? props.gamemodeSettings?.timerConfig.seconds
      : getGamemodeDefaultTimerValue(props.page)
  );

  // Create grid of rows (for guessing words)
  function populateGrid() {
    let Grid = [];

    for (const [index, categoryMapping] of props.chosenCategoryMappings.entries()) {
      let word;

      if (props.wordIndex === index) {
        /* 
        If the wordIndex and the row number are the same
        (i.e the row is currently being used)
        Show the currentWord
        */
        word = props.currentWord;
      } else if (props.wordIndex <= index) {
        /*
        If the wordIndex is behind the currently iterated row
        (i.e the row has not been used yet)
        Show an empty string 
        */
        word = "";
      } else {
        /* 
        If the wordIndex is ahead of the currently iterated row
        (i.e the row has already been used)
        Show the respective guessed word
        */
        word = props.guesses[index];
      }

      // If the name can be determined, show a lebel next to the WordRow
      const row = categoryMapping.name ? (
        <div className="word-row-category-wrapper" key={index}>
          <div className="word-row-category-name">{categoryMapping.name}</div>
          <WordRow
            key={`letters_categories/row/${index}`}
            page={props.page}
            isReadOnly={false}
            inProgress={props.inProgress}
            isVertical={false}
            word={word}
            length={props.wordLength}
            targetWord={""}
            targetArray={categoryMapping.targetWordArray}
            hasSubmit={props.wordIndex > index || !props.inProgress}
            inDictionary={true}
            settings={props.settings}
          />
        </div>
      ) : /* Otherwise, just show the WordRow, without a label */ (
        <WordRow
          key={`letters_categories/row/${index}`}
          page={props.page}
          isReadOnly={false}
          inProgress={props.inProgress}
          isVertical={false}
          word={word}
          length={props.wordLength}
          targetWord={""}
          targetArray={categoryMapping.targetWordArray}
          hasSubmit={props.wordIndex > index || !props.inProgress}
          inDictionary={true}
          settings={props.settings}
        />
      );

      Grid.push(row);
    }

    return Grid;
  }

  function generateSettingsOptions(): React.ReactNode {
    return (
      <>
        <label>
          <input
            type="number"
            value={props.gamemodeSettings.numCategories}
            min={2}
            max={MAX_NUM_CATEGORIES}
            onChange={(e) => {
              const newGamemodeSettings = {
                ...props.gamemodeSettings,
                numCategories: e.target.valueAsNumber,
              };
              props.updateGamemodeSettings(newGamemodeSettings);
            }}
          ></input>
          Number of categories
        </label>
        <>
          <label>
            <input
              checked={props.gamemodeSettings.timerConfig.isTimed}
              type="checkbox"
              onChange={() => {
                // If currently timed, on change, make the game not timed and vice versa
                const newTimer: { isTimed: true; seconds: number } | { isTimed: false } = props.gamemodeSettings
                  .timerConfig.isTimed
                  ? { isTimed: false }
                  : { isTimed: true, seconds: mostRecentTotalSeconds };
                const newGamemodeSettings = { ...props.gamemodeSettings, timerConfig: newTimer };
                props.updateGamemodeSettings(newGamemodeSettings);
              }}
            ></input>
            Timer
          </label>
          {props.gamemodeSettings.timerConfig.isTimed && (
            <label>
              <input
                type="number"
                value={props.gamemodeSettings.timerConfig.seconds}
                min={10}
                max={120}
                step={5}
                onChange={(e) => {
                  props.updateRemainingSeconds(e.target.valueAsNumber);
                  setMostRecentTotalSeconds(e.target.valueAsNumber);
                  const newGamemodeSettings = {
                    ...props.gamemodeSettings,
                    timer: { isTimed: true, seconds: e.target.valueAsNumber },
                  };
                  props.updateGamemodeSettings(newGamemodeSettings);
                }}
              ></input>
              Seconds
            </label>
          )}
        </>
      </>
    );
  }

  function displayOutcome(): React.ReactNode {
    // Game still in progress, don't display anything
    if (props.inProgress) {
      return;
    }

    // All correct
    if (props.correctGuessesCount === props.gamemodeSettings.numCategories) {
      return (
        <MessageNotification type="success">
          You guessed a correct word for <strong>all</strong> {props.correctGuessesCount} categories!
        </MessageNotification>
      );
    }
    // All incorrect
    else if (props.correctGuessesCount === 0) {
      return (
        <MessageNotification type="error">
          You didn't guess a correct word for <strong>any</strong> of the{" "}
          <strong>{props.gamemodeSettings.numCategories}</strong> categories
        </MessageNotification>
      );
    }
    // Some (atleast one) words were right
    else {
      return (
        <MessageNotification type="default">
          You guessed a correct word for <strong>{props.correctGuessesCount}</strong> of the{" "}
          <strong>{props.gamemodeSettings.numCategories}</strong> categories
        </MessageNotification>
      );
    }
  }

  return (
    <div
      className="App"
      style={{ backgroundImage: `url(${props.theme.backgroundImageSrc})`, backgroundSize: "100% 100%" }}
    >
      <div>{displayOutcome()}</div>
      <div>
        {!props.inProgress && (
          <Button
            mode="accept"
            settings={props.settings}
            onClick={() => props.ResetGame()}
            additionalProps={{ autoFocus: true }}
          >
            {props.campaignConfig.isCampaignLevel ? LEVEL_FINISHING_TEXT : "Restart"}
          </Button>
        )}
      </div>

      {!props.campaignConfig.isCampaignLevel && (
        <div className="gamemodeSettings">
          <GamemodeSettingsMenu>{generateSettingsOptions()}</GamemodeSettingsMenu>
        </div>
      )}

      <div className="word_grid">{populateGrid()}</div>

      <div className="keyboard">
        <Keyboard
          mode={"LettersCategories"}
          onEnter={props.onEnter}
          onSubmitLetter={props.onSubmitLetter}
          onBackspace={props.onBackspace}
          guesses={props.guesses}
          targetWord={""}
          inDictionary={true}
          letterStatuses={[]}
          settings={props.settings}
          disabled={!props.inProgress}
          showKeyboard={props.settings.gameplay.keyboard}
        />
      </div>

      <div>
        {props.gamemodeSettings.timerConfig.isTimed && (
          <ProgressBar
            progress={props.remainingSeconds}
            total={props.gamemodeSettings.timerConfig.seconds}
            display={{ type: "transition", colorTransition: GreenToRedColorTransition }}
          ></ProgressBar>
        )}
      </div>
    </div>
  );
};

export default LetterCategories;
