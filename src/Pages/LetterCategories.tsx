import React, { useState } from "react";
import { Keyboard } from "../Components/Keyboard";
import { WordRow } from "../Components/WordRow";
import { Button } from "../Components/Button";
import { MessageNotification } from "../Components/MessageNotification";
import ProgressBar, { GreenToRedColorTransition } from "../Components/ProgressBar";
import { Theme } from "../Data/Themes";
import { SettingsData } from "../Data/SaveData";
import { LEVEL_FINISHING_TEXT } from "../Components/Level";
import { LetterCategoriesConfigProps } from "./LetterCategoriesConfig";
import { getGamemodeDefaultTimerValue } from "../Helpers/getGamemodeDefaultTimerValue";
import LetterCategoriesGamemodeSettings from "../Components/GamemodeSettingsOptions/LetterCategoriesGamemodeSettings";
import { getNewGamemodeSettingValue } from "../Helpers/getGamemodeSettingsNewValue";
import { useLocation } from "react-router-dom";
import { PagePath } from "../Data/PageNames";

interface Props {
  campaignConfig: LetterCategoriesConfigProps["campaignConfig"];
  gamemodeSettings: LetterCategoriesConfigProps["gamemodeSettings"];

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

  theme: Theme;
  settings: SettingsData;
  onEnter: () => void;
  onSubmitLetter: (letter: string) => void;
  onBackspace: () => void;

  updateGamemodeSettings: (newGamemodeSettings: LetterCategoriesConfigProps["gamemodeSettings"]) => void;
  updateRemainingSeconds: (newSeconds: number) => void;

  ResetGame: () => void;
}

const LetterCategories = (props: Props) => {
  const location = useLocation().pathname as PagePath;

  const [mostRecentTotalSeconds, setMostRecentTotalSeconds] = useState(
    props.gamemodeSettings?.timerConfig?.isTimed === true
      ? props.gamemodeSettings?.timerConfig?.seconds
      : getGamemodeDefaultTimerValue(location)
  );

  // Create grid of rows (for guessing words)
  function displayGrid(): React.ReactNode {
    const Grid = [];

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

      const wordRow = (
        <WordRow
          key={`letters_categories/row/${index}`}
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

      // If the name can be determined, show a label next to the WordRow
      const row = categoryMapping.name ? (
        <div className="word-row-category-wrapper" key={index}>
          <div className="word-row-category-name">{categoryMapping.name}</div>
          {wordRow}
        </div>
      ) : (
        // Otherwise, just show the WordRow, without a label
        wordRow
      );

      Grid.push(row);
    }

    return Grid;
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

  const handleTimerToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGamemodeSettings: LetterCategoriesConfigProps["gamemodeSettings"] = {
      ...props.gamemodeSettings,
      timerConfig: e.target.checked ? { isTimed: true, seconds: mostRecentTotalSeconds } : { isTimed: false },
    };

    props.updateGamemodeSettings(newGamemodeSettings);
  };

  const handleSimpleGamemodeSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGamemodeSettings: LetterCategoriesConfigProps["gamemodeSettings"] = {
      ...props.gamemodeSettings,
      [e.target.name]: getNewGamemodeSettingValue(e),
    };

    props.updateGamemodeSettings(newGamemodeSettings);
  };

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
          <LetterCategoriesGamemodeSettings
            gamemodeSettings={props.gamemodeSettings}
            handleSimpleGamemodeSettingsChange={handleSimpleGamemodeSettingsChange}
            handleTimerToggle={handleTimerToggle}
            setMostRecentTotalSeconds={setMostRecentTotalSeconds}
            updateRemainingSeconds={props.updateRemainingSeconds}
          ></LetterCategoriesGamemodeSettings>
        </div>
      )}

      <div className="word_grid">{displayGrid()}</div>

      {props.settings.gameplay.keyboard && (
        <div className="keyboard">
          <Keyboard
            onEnter={props.onEnter}
            onSubmitLetter={props.onSubmitLetter}
            onBackspace={props.onBackspace}
            guesses={props.guesses}
            targetWord={""}
            inDictionary={true}
            letterStatuses={[]}
            settings={props.settings}
            disabled={!props.inProgress}
            hasBackspace={true}
            hasEnter={true}
          />
        </div>
      )}

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
