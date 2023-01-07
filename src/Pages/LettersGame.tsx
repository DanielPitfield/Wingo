import React, { useState } from "react";
import  Button  from "../Components/Button";
import LettersGameGamemodeSettings from "../Components/GamemodeSettingsOptions/LettersGameGamemodeSettings";
import  Keyboard  from "../Components/Keyboard";
import { LEVEL_FINISHING_TEXT } from "../Components/Level";
import  MessageNotification  from "../Components/MessageNotification";
import ProgressBar, { GreenToRedColorTransition } from "../Components/ProgressBar";
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
import LettersGameGrid from "../Components/LettersGameGrid";

interface LettersGameProps {
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
}

const LettersGame = (props: LettersGameProps) => {
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

  const getSelectionWord = (): string => {
    return props.letterTileStatuses
      .filter((letterStatus) => letterStatus.letter !== null)
      .map((letterStatus) => letterStatus.letter)
      .join("");
  };


  const Outcome = () => {
    // Game has not yet ended (currently only when when timer runs out)
    if (props.inProgress) {
      return null;
    }

    if (props.remainingSeconds > 0) {
      return null;
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

    return (
      <MessageNotification type="success">
        <strong>{bestGuess ? bestGuess.toUpperCase() : "No guess was made"}</strong>
        <br />
        <strong>{bestGuess ? bestGuess.length : "0"} points</strong>
        <br />
        {bestWordsList}
      </MessageNotification>
    );
  };

  // Automatically choose the best word guessed so far
  React.useEffect(() => {
    // Compares words and returns a single value of the longest word
    const longestWord = props.guesses.reduce(
      (currentWord, nextWord) => (currentWord.length > nextWord.length ? currentWord : nextWord),
      ""
    );

    setBestGuess(longestWord);
  }, [props.guesses]);

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
      {!props.campaignConfig.isCampaignLevel && (
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

      <Outcome />

      <div>
        {!props.inProgress && props.remainingSeconds <= 0 && (
          <Button
            mode={"accept"}
            settings={props.settings}
            // Reset the game (but callback the score that was just achieved)
            onClick={props.ResetGame}
            additionalProps={{ autoFocus: true }}
          >
            {props.campaignConfig.isCampaignLevel
              ? LEVEL_FINISHING_TEXT
              : "Restart"}
          </Button>
        )}
      </div>

      <LettersGameGrid {...props} />

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
          />
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
