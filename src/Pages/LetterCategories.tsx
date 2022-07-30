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
import { MAX_NUM_CATEGORIES } from "../Data/DefaultGamemodeSettings";

interface Props {
  isCampaignLevel: boolean;

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
  categoryRequiredStartingLetter?: string;
  categoryWordTargets?: string[][];
  categoryNames?: string[];
  finishingButtonText?: string;

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
  const DEFAULT_TIMER_VALUE = 30;
  const [mostRecentTotalSeconds, setMostRecentTotalSeconds] = useState(
    props.gamemodeSettings?.timerConfig?.isTimed === true
      ? props.gamemodeSettings?.timerConfig.seconds
      : DEFAULT_TIMER_VALUE
  );

  // Create grid of rows (for guessing words)
  function populateGrid(rowNumber: number, wordLength: number) {
    var Grid = [];

    for (let i = 0; i < rowNumber; i++) {
      let word;

      if (props.wordIndex === i) {
        /* 
        If the wordIndex and the row number are the same
        (i.e the row is currently being used)
        Show the currentWord
        */
        word = props.currentWord;
      } else if (props.wordIndex <= i) {
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
        word = props.guesses[i];
      }

      const row = props.categoryNames?.[i] ? (
        <div className="word-row-category-wrapper" key={i}>
          <div className="word-row-category-name">{props.categoryNames?.[i]}</div>
          <WordRow
            key={`letters_categories/row/${i}`}
            page={props.page}
            isReadOnly={false}
            inProgress={props.inProgress}
            isVertical={false}
            word={word}
            length={wordLength}
            targetWord={""}
            targetArray={props.categoryWordTargets ? props.categoryWordTargets[i] : []}
            hasSubmit={props.wordIndex > i || !props.inProgress}
            inDictionary={true}
            settings={props.settings}
          />
        </div>
      ) : (
        <WordRow
          key={`letters_categories/row/${i}`}
          page={props.page}
          isReadOnly={false}
          inProgress={props.inProgress}
          isVertical={false}
          word={word}
          length={wordLength}
          targetWord={""}
          targetArray={props.categoryWordTargets ? props.categoryWordTargets[i] : []}
          hasSubmit={props.wordIndex > i || !props.inProgress}
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

  function displayOutcome(): JSX.Element {
    // Game still in progress, don't display anything
    if (props.inProgress) {
      return <></>;
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
            Restart
          </Button>
        )}
      </div>

      {!props.isCampaignLevel && (
        <div className="gamemodeSettings">
          <GamemodeSettingsMenu>{generateSettingsOptions()}</GamemodeSettingsMenu>
        </div>
      )}

      <div className="word_grid">{populateGrid(props.gamemodeSettings.numCategories, props.wordLength)}</div>

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
