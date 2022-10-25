import React, { useState } from "react";
import { Keyboard } from "../Components/Keyboard";
import { WordRow } from "../Components/WordRow";
import { Button } from "../Components/Button";
import { MessageNotification } from "../Components/MessageNotification";
import ProgressBar, { GreenToRedColorTransition } from "../Components/ProgressBar";
import { Theme } from "../Data/Themes";

import { LEVEL_FINISHING_TEXT } from "../Components/Level";
import { LetterCategoriesConfigProps } from "./LetterCategoriesConfig";
import LetterCategoriesGamemodeSettings from "../Components/GamemodeSettingsOptions/LetterCategoriesGamemodeSettings";
import { getNewGamemodeSettingValue } from "../Helpers/getGamemodeSettingsNewValue";
import { SettingsData } from "../Data/SaveData/Settings";

interface Props {
  campaignConfig: LetterCategoriesConfigProps["campaignConfig"];
  gamemodeSettings: LetterCategoriesConfigProps["gamemodeSettings"];

  remainingSeconds: number;
  totalSeconds: number;
  wordLength: number;
  guesses: string[];
  currentWord: string;
  wordIndex: number;
  inProgress: boolean;
  correctGuessesCount: number;
  categoryRequiredStartingLetter: string;
  chosenCategoryMappings: { name: string; targetWordArray: string[] }[];

  theme: Theme;
  settings: SettingsData;
  onEnter: () => void;
  onSubmitLetter: (letter: string) => void;
  onBackspace: () => void;

  updateGamemodeSettings: (newGamemodeSettings: LetterCategoriesConfigProps["gamemodeSettings"]) => void;
  resetCountdown: () => void;
  setTotalSeconds: (numSeconds: number) => void;

  ResetGame: () => void;
}

const LetterCategories = (props: Props) => {
  const [keyboardDisabled, setKeyboardDisabled] = useState(false);

  const Grid = () => {
    const Grid = [];

    for (const [index, categoryMapping] of props.chosenCategoryMappings.entries()) {
      let word;

      if (props.wordIndex === index) {
        word = props.currentWord;
      } else if (props.wordIndex <= index) {
        word = "";
      } else {
        word = props.guesses[index];
      }

      const wordRow = (
        <WordRow
          key={`letters_categories/row/${index}`}
          isReadOnly={false}
          inProgress={props.inProgress}
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

    return <div className="word_grid">{Grid}</div>;
  };

  const Outcome = () => {
    if (props.inProgress) {
      return null;
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
    if (props.correctGuessesCount === 0) {
      return (
        <MessageNotification type="error">
          You didn't guess a correct word for <strong>any</strong> of the{" "}
          <strong>{props.gamemodeSettings.numCategories}</strong> categories
        </MessageNotification>
      );
    }

    return (
      <MessageNotification type="default">
        You guessed a correct word for <strong>{props.correctGuessesCount}</strong> of the{" "}
        <strong>{props.gamemodeSettings.numCategories}</strong> categories
      </MessageNotification>
    );
  };

  const handleTimerToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGamemodeSettings: LetterCategoriesConfigProps["gamemodeSettings"] = {
      ...props.gamemodeSettings,
      timerConfig: e.target.checked ? { isTimed: true, seconds: props.totalSeconds } : { isTimed: false },
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
      <Outcome />
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
            resetCountdown={props.resetCountdown}
            setTotalSeconds={props.setTotalSeconds}
            onLoadPresetGamemodeSettings={props.updateGamemodeSettings}
            onShowOfAddPresetModal={() => setKeyboardDisabled(true)}
            onHideOfAddPresetModal={() => setKeyboardDisabled(false)}
          />
        </div>
      )}

      <Grid/>

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
          disabled={keyboardDisabled || !props.inProgress}
          hasBackspace={true}
          hasEnter={true}
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
