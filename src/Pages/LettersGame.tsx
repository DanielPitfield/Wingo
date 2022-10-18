import React, { useState } from "react";
import { Button } from "../Components/Button";
import LettersGameGamemodeSettings from "../Components/GamemodeSettingsOptions/LettersGameGamemodeSettings";
import { Keyboard } from "../Components/Keyboard";
import { LetterSelectionRow } from "../Components/LetterSelectionRow";
import { LEVEL_FINISHING_TEXT } from "../Components/Level";
import { MessageNotification } from "../Components/MessageNotification";
import ProgressBar, { GreenToRedColorTransition } from "../Components/ProgressBar";
import { WordRow } from "../Components/WordRow";
import { PagePath } from "../Data/PageNames";

import { Theme } from "../Data/Themes";
import { getGamemodeDefaultTimerValue } from "../Helpers/getGamemodeDefaultTimerValue";
import { getNewGamemodeSettingValue } from "../Helpers/getGamemodeSettingsNewValue";
import { LettersGameConfigProps, LettersGameTileStatus } from "./LettersGameConfig";
import { useLocation } from "react-router-dom";
import { getWeightedLetter } from "../Helpers/getWeightedLetter";
import { consonantWeightings, vowelWeightings } from "../Data/LettersGameWeightings";
import { getBestLettersGameWords } from "../Helpers/getBestLettersGameWords";
import { SettingsData } from "../Data/SaveData/Settings";

interface Props {
  campaignConfig: LettersGameConfigProps["campaignConfig"];
  gamemodeSettings: LettersGameConfigProps["gamemodeSettings"];

  letterTileStatuses: LettersGameTileStatus[];

  guesses: string[];
  currentWord: string;
  inProgress: boolean;
  inDictionary: boolean;
  hasLetterSelectionFinished: boolean;
  targetWord: string;
  remainingSeconds: number;
  totalSeconds: number;

  theme: Theme;
  settings: SettingsData;
  setTheme: (theme: Theme) => void;
  addGold: (gold: number) => void;
  onEnter: () => void;

  onSubmitSelectionLetter: (letter: string) => void;
  onSubmitSelectionWord: (word: string) => void;

  onClickSelectionLetter: (letter: string | null, index: number) => void;
  onSubmitKeyboardLetter: (letter: string) => void;
  onBackspace: () => void;

  updateGamemodeSettings: (newGamemodeSettings: LettersGameConfigProps["gamemodeSettings"]) => void;
  resetCountdown: () => void;
  setTotalSeconds: (numSeconds: number) => void;

  ResetGame: () => void;
  ContinueGame: () => void;
  gameshowScore?: number;
}

const LettersGame = (props: Props) => {
  const location = useLocation().pathname as PagePath;

  const [keyboardDisabled, setKeyboardDisabled] = useState(false);

  // Currently selected guess, to be used as the final guess when time runs out
  const [bestGuess, setBestGuess] = useState("");

  const [mostRecentTotalSeconds, setMostRecentTotalSeconds] = useState(
    props.gamemodeSettings?.timerConfig?.isTimed === true
      ? props.gamemodeSettings?.timerConfig?.seconds
      : getGamemodeDefaultTimerValue(location)
  );

  const getVowel = (): string => {
    // Already have enough letters, don't add any more
    if (props.hasLetterSelectionFinished) {
      return "";
    }

    return getWeightedLetter(vowelWeightings);
  };

  const getConsonant = (): string => {
    // Already have enough letters, don't add any more
    if (props.hasLetterSelectionFinished) {
      return "";
    }

    return getWeightedLetter(consonantWeightings);
  };

  const quickLetterSelection = () => {
    const selectionWordLetters = Array(props.gamemodeSettings.numLetters)
      .fill("")
      .map((_) => {
        // Equal chance to be true or false
        const x = Math.floor(Math.random() * 2) === 0;
        // Equal chance (to add a vowel or consonant)
        return x ? getVowel() : getConsonant();
      });

    // Set the entire word at once
    props.onSubmitSelectionWord(selectionWordLetters.join(""));
  };

  const getSelectionWord = (): string => {
    return props.letterTileStatuses
      .filter((letterStatus) => letterStatus.letter !== null)
      .map((letterStatus) => letterStatus.letter)
      .join("");
  };

  function displayGrid(): React.ReactNode {
    // Read only letter selection WordRow
    const letterSelection = (
      <LetterSelectionRow
        key={"letters-game/read-only"}
        letterTileStatuses={props.letterTileStatuses}
        settings={props.settings}
        disabled={!props.inProgress}
        onClick={props.onClickSelectionLetter}
      />
    );

    // Buttons to add letters to letter selection row
    const addLetterButtons = (
      <div className="add-letter-buttons-wrapper">
        <Button
          mode={"default"}
          disabled={props.hasLetterSelectionFinished}
          settings={props.settings}
          onClick={() => props.onSubmitSelectionLetter(getVowel())}
        >
          Vowel
        </Button>
        <Button
          mode={"default"}
          disabled={props.hasLetterSelectionFinished}
          settings={props.settings}
          onClick={() => props.onSubmitSelectionLetter(getConsonant())}
        >
          Consonant
        </Button>
        <Button
          mode={"default"}
          disabled={
            // There is atleast one already selected letter
            props.letterTileStatuses.some((letterStatus) => letterStatus.letter !== null) ||
            // The entire selection is finished
            props.hasLetterSelectionFinished
          }
          settings={props.settings}
          onClick={quickLetterSelection}
        >
          Quick Pick
        </Button>
      </div>
    );

    // WordRow to enter words using available letters
    const inputRow = (
      <WordRow
        key={"letters-game/input"}
        isReadOnly={false}
        inProgress={props.inProgress}
        word={props.currentWord}
        length={props.gamemodeSettings.numLetters}
        targetWord={props.targetWord}
        hasSubmit={!props.inProgress}
        inDictionary={props.inDictionary}
        settings={props.settings}
        applyAnimation={false}
      ></WordRow>
    );

    return (
      <div className="letters-game-wrapper" key={"letter_selection"}>
        {letterSelection}
        {addLetterButtons}
        {inputRow}
      </div>
    );
  }

  function displayOutcome(): React.ReactNode {
    // Game has not yet ended (currently only when when timer runs out)
    if (props.inProgress) {
      return;
    }

    if (props.remainingSeconds > 0) {
      return;
    }

    const bestWords = getBestLettersGameWords(getSelectionWord());

    // Create a list of the longest words that can be made with the available letters
    const bestWordsList = (
      <ul className="best_words_list">
        {bestWords.map((bestWord) => (
          <li key={bestWord}>{bestWord}</li>
        ))}
      </ul>
    );

    if (bestGuess) {
      const GOLD_PER_LETTER = 30;
      // Reward gold based on how long the selected guess is
      props.addGold(bestGuess.length * GOLD_PER_LETTER);
    }

    return (
      <>
        <MessageNotification type="success">
          <strong>{bestGuess ? bestGuess.toUpperCase() : "No guess was made"}</strong>
          <br />
          <strong>{bestGuess ? bestGuess.length : "0"} points</strong>
        </MessageNotification>
        {bestWordsList}
      </>
    );
  }

  // Automatically choose the best word guessed so far
  React.useEffect(() => {
    // Compares words and returns a single value of the longest word
    const longestWord = props.guesses.reduce(
      (currentWord, nextWord) => (currentWord.length > nextWord.length ? currentWord : nextWord),
      ""
    );

    setBestGuess(longestWord);
  }, [props.guesses]);

  function displayGameshowScore(): React.ReactNode {
    if (props.gameshowScore === undefined || props.gameshowScore === null) {
      return;
    }

    return (
      <MessageNotification type="default">
        <strong>Gameshow points: </strong>
        {props.gameshowScore}
      </MessageNotification>
    );
  }

  const handleTimerToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGamemodeSettings: LettersGameConfigProps["gamemodeSettings"] = {
      ...props.gamemodeSettings,
      timerConfig: e.target.checked ? { isTimed: true, seconds: mostRecentTotalSeconds } : { isTimed: false },
    };

    props.updateGamemodeSettings(newGamemodeSettings);
  };

  const handleSimpleGamemodeSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGamemodeSettings: LettersGameConfigProps["gamemodeSettings"] = {
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
      {!props.campaignConfig.isCampaignLevel && props.gameshowScore === undefined && (
        <div className="gamemodeSettings">
          <LettersGameGamemodeSettings
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

      {props.gameshowScore !== undefined && <div className="gameshow-score">{displayGameshowScore()}</div>}

      <div>{displayOutcome()}</div>

      <div>
        {!props.inProgress && props.remainingSeconds <= 0 && (
          <Button
            mode={"accept"}
            settings={props.settings}
            // Reset the game (but callback the score that was just achieved)
            onClick={props.ResetGame}
            additionalProps={{ autoFocus: true }}
          >
            {props.gameshowScore !== undefined
              ? "Next round"
              : props.campaignConfig.isCampaignLevel
              ? LEVEL_FINISHING_TEXT
              : "Restart"}
          </Button>
        )}
      </div>

      <div className="letters-game-word-grid">{displayGrid()}</div>

      <Keyboard
        onEnter={props.onEnter}
        onSubmitLetter={props.onSubmitKeyboardLetter}
        onBackspace={props.onBackspace}
        guesses={props.guesses}
        targetWord={props.targetWord}
        inDictionary={props.inDictionary}
        letterStatuses={[]}
        settings={props.settings}
        disabled={keyboardDisabled || !props.inProgress}
        hasBackspace={true}
        hasEnter={true}
      />

      <div>
        {props.gamemodeSettings.timerConfig.isTimed && (
          <ProgressBar
            progress={props.remainingSeconds}
            total={props.gamemodeSettings.timerConfig.seconds}
            display={{ type: "transition", colorTransition: GreenToRedColorTransition }}
          ></ProgressBar>
        )}
      </div>

      <div className="letters-game-guesses">
        {props.guesses.map((guess) => (
          <>{guess}</>
        ))}
      </div>
    </div>
  );
};

export default LettersGame;
