import React from "react";
import { Keyboard } from "../Keyboard";
import { Page } from "../App";
import { WordRow } from "../WordRow";
import { Button } from "../Button";
import { MessageNotification } from "../MessageNotification";
import ProgressBar, { GreenToRedColorTransition } from "../ProgressBar";
import { Theme } from "../Themes";
import { SettingsData } from "../SaveData";
import GamemodeSettingsMenu from "../GamemodeSettingsMenu";

interface Props {
  isCampaignLevel: boolean;
  
  gamemodeSettings: {
    numCategories: number;
    timerConfig: { isTimed: true; remainingSeconds: number; totalSeconds: number } | { isTimed: false };
  };

  wordLength: number;
  numGuesses: number;
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

  // Gamemode settings callbacks
  updateNumCategories: (newNumCategories: number) => void;
  updateTimer: () => void;
  updateTimerLength: (newSeconds: number) => void;

  ResetGame: () => void;
}

const LetterCategories: React.FC<Props> = (props) => {
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

  function generateSettingsOptions(): React.ReactNode {
    let settings;

    settings = (
      <>
        <label>
          <input
            type="number"
            value={props.gamemodeSettings.numCategories}
            min={3}
            max={6}
            onChange={(e) => {
              props.updateNumCategories(e.target.valueAsNumber);
            }}
          ></input>
          Number of categories
        </label>
        <>
          <label>
            <input
              checked={props.gamemodeSettings.timerConfig.isTimed}
              type="checkbox"
              onChange={props.updateTimer}
            ></input>
            Timer
          </label>
          {props.gamemodeSettings.timerConfig.isTimed && (
            <label>
              <input
                type="number"
                value={props.gamemodeSettings.timerConfig.totalSeconds}
                min={10}
                max={120}
                step={5}
                onChange={(e) => {
                  props.updateTimerLength(e.target.valueAsNumber);
                }}
              ></input>
              Seconds
            </label>
          )}
        </>
      </>
    );

    return settings;
  }

  function displayOutcome(): JSX.Element {
    // Game still in progress, don't display anything
    if (props.inProgress) {
      return <></>;
    }

    // All correct
    if (props.correctGuessesCount === props.numGuesses) {
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
          You didn't guess a correct word for <strong>any</strong> of the <strong>{props.numGuesses}</strong> categories
        </MessageNotification>
      );
    }
    // Some (atleast one) words were right
    else {
      return (
        <MessageNotification type="default">
          You guessed a correct word for <strong>{props.correctGuessesCount}</strong> of the{" "}
          <strong>{props.numGuesses}</strong> categories
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
        <GamemodeSettingsMenu>{generateSettingsOptions()}</GamemodeSettingsMenu>
      </div>)}

      <div className="word_grid">{populateGrid(props.numGuesses, props.wordLength)}</div>

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
            progress={props.gamemodeSettings.timerConfig.remainingSeconds}
            total={props.gamemodeSettings.timerConfig.totalSeconds}
            display={{ type: "transition", colorTransition: GreenToRedColorTransition }}
          ></ProgressBar>
        )}
      </div>
    </div>
  );
};

export default LetterCategories;
