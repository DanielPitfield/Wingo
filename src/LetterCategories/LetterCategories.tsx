import React, { useState } from "react";
import { Keyboard } from "../Keyboard";
import { MAX_NUM_CATEGORIES, Page } from "../App";
import { WordRow } from "../WordRow";
import { Button } from "../Button";
import { MessageNotification } from "../MessageNotification";
import ProgressBar, { GreenToRedColorTransition } from "../ProgressBar";
import { Theme } from "../Themes";
import { SettingsData } from "../SaveData";
import GamemodeSettingsMenu from "../GamemodeSettingsMenu";
import { SettingInfo } from "../Setting";

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
  theme: Theme;
  settings: SettingsData;
  categoryRequiredStartingLetter?: string;
  categoryWordTargets?: string[][];
  categoryNames?: string[];
  finishingButtonText?: string;
  setPage: (page: Page) => void;
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
            key={i}
            mode={"letters_categories"}
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
          key={i}
          mode={"letters_categories"}
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

  function generateSettingsOptions(): SettingInfo[] {
    return [
      // 'Number of Categories' setting
      {
        name: "Number of Categories",
        type: "integer",
        min: 2,
        max: MAX_NUM_CATEGORIES,
        value: props.gamemodeSettings.numCategories,
        onChange: (numCategories) =>
          props.updateGamemodeSettings({
            ...props.gamemodeSettings,
            numCategories,
          }),
      },

      // 'Timer' setting
      {
        name: "Timer",
        type: "boolean",
        value: props.gamemodeSettings.timerConfig.isTimed,
        onChange: (isTimed) => {
          // If currently timed, on change, make the game not timed and vice versa
          props.updateGamemodeSettings({
            ...props.gamemodeSettings,
            timerConfig: !isTimed ? { isTimed: false } : { isTimed: true, seconds: mostRecentTotalSeconds },
          });
        },
      },

      // 'Timer Seconds' setting (only shown if 'Timer' is set true)
      ...(props.gamemodeSettings.timerConfig.isTimed
        ? [
            {
              name: "Seconds",
              type: "integer",
              value: props.gamemodeSettings.timerConfig.seconds,
              min: 10,
              max: 120,
              step: 5,
              onChange: (seconds) => {
                setMostRecentTotalSeconds(seconds);

                props.updateGamemodeSettings({
                  ...props.gamemodeSettings,
                  timerConfig: { isTimed: true, seconds },
                });
              },
            } as SettingInfo,
          ]
        : []),
    ];
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
    <div className="App" style={{ backgroundImage: `url(${props.theme.backgroundImageSrc})`, backgroundSize: "100%" }}>
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
          <GamemodeSettingsMenu settings={generateSettingsOptions()} />
        </div>
      )}

      <div className="word_grid">{populateGrid(props.gamemodeSettings.numCategories, props.wordLength)}</div>

      <div className="keyboard">
        <Keyboard
          mode={"letters_categories"}
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
