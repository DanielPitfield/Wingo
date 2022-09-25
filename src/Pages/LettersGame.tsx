import React, { useState } from "react";
import { Button } from "../Components/Button";
import LettersGameGamemodeSettings from "../Components/GamemodeSettingsOptions/LettersGameGamemodeSettings";
import { Keyboard } from "../Components/Keyboard";
import { LetterSelectionRow } from "../Components/LetterSelectionRow";
import { LEVEL_FINISHING_TEXT } from "../Components/Level";
import { MessageNotification } from "../Components/MessageNotification";
import ProgressBar, { GreenToRedColorTransition } from "../Components/ProgressBar";
import { WordRow } from "../Components/WordRow";
import { PageName } from "../Data/PageNames";
import { SettingsData } from "../Data/SaveData";
import { Theme } from "../Data/Themes";
import { getAllWordsOfLength } from "../Helper Functions/getAllWordsOfLength";
import { getGamemodeDefaultTimerValue } from "../Helper Functions/getGamemodeDefaultTimerValue";
import { getNewGamemodeSettingValue } from "../Helper Functions/getGamemodeSettingsNewValue";
import { getRandomElementFrom } from "../Helper Functions/getRandomElementFrom";
import { isLettersGameGuessValid } from "../Helper Functions/isLettersGameGuessValid";
import { shuffleArray } from "../Helper Functions/shuffleArray";
import { LettersGameConfigProps } from "./LettersGameConfig";

interface Props {
  campaignConfig: LettersGameConfigProps["campaignConfig"];
  gamemodeSettings: LettersGameConfigProps["gamemodeSettings"];

  letterTileStatuses: {
    letter: string | null;
    picked: boolean;
  }[];

  guesses: string[];
  currentWord: string;
  inProgress: boolean;
  inDictionary: boolean;
  hasSubmitLetter: boolean;
  // TODO: Target word needed?
  targetWord: string;
  remainingSeconds: number;

  page: PageName;
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

  updateRemainingSeconds: (newSeconds: number) => void;

  ResetGame: () => void;
  ContinueGame: () => void;
  gameshowScore?: number;
}

const LettersGame = (props: Props) => {
  // Currently selected guess, to be used as the final guess when time runs out
  const [bestGuess, setBestGuess] = useState("");

  const SELECTION_WORD_NUM_LETTERS = props.letterTileStatuses.filter(
    (letterStatus) => letterStatus.letter !== null
  ).length;
  // Check if letter selection has finished
  const IS_SELECTION_FINISHED = SELECTION_WORD_NUM_LETTERS === props.gamemodeSettings.numLetters;

  const [mostRecentTotalSeconds, setMostRecentTotalSeconds] = useState(
    props.gamemodeSettings?.timerConfig?.isTimed === true
      ? props.gamemodeSettings?.timerConfig.seconds
      : getGamemodeDefaultTimerValue(props.page)
  );

  function getWeightedLetter(letterWeightings: { letter: string; weighting: number }[]) {
    let weightedArray: string[] = [];

    // For each object in input array
    for (let i = 0; i < letterWeightings.length; i++) {
      // For the 'weighting' value number of times
      for (let j = 0; j < letterWeightings[i].weighting; j++) {
        // Push the related letter to the array
        weightedArray.push(letterWeightings[i].letter);
      }
    }

    // Select a random value from this array
    return getRandomElementFrom(weightedArray);
  }

  function getVowel(): string {
    // Already have enough letters, don't add any more
    if (SELECTION_WORD_NUM_LETTERS === props.gamemodeSettings.numLetters) {
      return "";
    }

    // Scrabble distribution (https://en.wikipedia.org/wiki/Scrabble_letter_distributions)
    let vowelWeightings = [
      { letter: "a", weighting: 9 },
      { letter: "e", weighting: 12 },
      { letter: "i", weighting: 9 },
      { letter: "o", weighting: 8 },
      { letter: "u", weighting: 4 },
    ];

    return getWeightedLetter(vowelWeightings);
  }

  function getConsonant(): string {
    // Already have enough letters, don't add any more
    if (SELECTION_WORD_NUM_LETTERS === props.gamemodeSettings.numLetters) {
      return "";
    }

    let consonantWeightings = [
      { letter: "b", weighting: 2 },
      { letter: "c", weighting: 2 },
      { letter: "d", weighting: 4 },
      { letter: "f", weighting: 2 },
      { letter: "g", weighting: 3 },
      { letter: "h", weighting: 2 },
      { letter: "j", weighting: 1 },
      { letter: "k", weighting: 1 },
      { letter: "l", weighting: 4 },
      { letter: "m", weighting: 2 },
      { letter: "n", weighting: 6 },
      { letter: "p", weighting: 2 },
      { letter: "q", weighting: 1 },
      { letter: "r", weighting: 6 },
      { letter: "s", weighting: 4 },
      { letter: "t", weighting: 6 },
      { letter: "v", weighting: 2 },
      { letter: "w", weighting: 2 },
      { letter: "x", weighting: 1 },
      { letter: "y", weighting: 2 },
      { letter: "z", weighting: 1 },
    ];

    return getWeightedLetter(consonantWeightings);
  }

  function quickLetterSelection() {
    let newLettersGameWord = "";

    // Build word by randomly adding vowels and consonants
    for (let i = 0; i < props.gamemodeSettings.numLetters; i++) {
      let x = Math.floor(Math.random() * 2) === 0;
      // Equal chance (to add a vowel or consonant)
      if (x) {
        newLettersGameWord += getVowel();
      } else {
        newLettersGameWord += getConsonant();
      }
    }

    // Set the entire word at once
    props.onSubmitSelectionWord(newLettersGameWord);
  }

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
          disabled={IS_SELECTION_FINISHED}
          settings={props.settings}
          onClick={() => props.onSubmitSelectionLetter(getVowel())}
        >
          Vowel
        </Button>
        <Button
          mode={"default"}
          disabled={IS_SELECTION_FINISHED}
          settings={props.settings}
          onClick={() => props.onSubmitSelectionLetter(getConsonant())}
        >
          Consonant
        </Button>
        <Button
          mode={"default"}
          disabled={SELECTION_WORD_NUM_LETTERS !== 0 || IS_SELECTION_FINISHED}
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
        page={props.page}
        isReadOnly={false}
        inProgress={props.inProgress}
        isVertical={false}
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

  function getBestWords(lettersGameSelectionWord: string) {
    const MAX_WORDS_TO_RETURN = 5;

    // Array to store best words that are found
    let bestWords: string[] = [];

    // Start with bigger words first
    for (let wordLength = lettersGameSelectionWord.length; wordLength >= 4; wordLength--) {
      // The words which can be made with the selected letters
      const validWords: string[] = getAllWordsOfLength(wordLength).filter((word) =>
        isLettersGameGuessValid(word, lettersGameSelectionWord)
      );

      bestWords = bestWords.concat(validWords);

      if (bestWords.length >= MAX_WORDS_TO_RETURN) {
        break;
      }
    }

    return shuffleArray(bestWords).slice(0, MAX_WORDS_TO_RETURN);
  }

  function displayOutcome(): React.ReactNode {
    // Game has not yet ended (currently only when when timer runs out)
    if (props.inProgress) {
      return;
    }

    if (props.remainingSeconds > 0) {
      return;
    }

    // Create a list of the longest words that can be made with the available letters
    const bestWords = getBestWords(
      props.letterTileStatuses
        .filter((letterStatus) => letterStatus.letter !== null)
        .map((letterStatus) => letterStatus.letter)
        .join("")
    );
    const bestWordsList = (
      <ul className="best_words_list">
        {bestWords.map((bestWord) => (
          <li key={bestWord}>{bestWord}</li>
        ))}
      </ul>
    );

    const GOLD_PER_LETTER = 30;

    let outcomeNotification;

    if (bestGuess) {
      // Reward gold based on how long the selected guess is
      props.addGold(bestGuess.length * GOLD_PER_LETTER);

      outcomeNotification = (
        <>
          <MessageNotification type="success">
            <strong>{bestGuess.toUpperCase()}</strong>
            <br />
            <strong>{bestGuess.length} points</strong>
          </MessageNotification>
          {bestWordsList}
        </>
      );
    } else {
      outcomeNotification = (
        <>
          <MessageNotification type="error">
            <strong>No guess was made</strong>
            <br />
            <strong>0 points</strong>
          </MessageNotification>
          {bestWordsList}
        </>
      );
    }

    return outcomeNotification;
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
      {!props.campaignConfig.isCampaignLevel && !props.gameshowScore && (
        <div className="gamemodeSettings">
          <LettersGameGamemodeSettings
            gamemodeSettings={props.gamemodeSettings}
            handleSimpleGamemodeSettingsChange={handleSimpleGamemodeSettingsChange}
            handleTimerToggle={handleTimerToggle}
            setMostRecentTotalSeconds={setMostRecentTotalSeconds}
            updateRemainingSeconds={props.updateRemainingSeconds}
          ></LettersGameGamemodeSettings>
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

      {props.settings.gameplay.keyboard && (
        <Keyboard
          page={props.page}
          onEnter={props.onEnter}
          onSubmitLetter={props.onSubmitKeyboardLetter}
          onBackspace={props.onBackspace}
          guesses={props.guesses}
          targetWord={props.targetWord}
          inDictionary={props.inDictionary}
          letterStatuses={[]}
          settings={props.settings}
          disabled={!props.inProgress}
          hasBackspace={true}
          hasEnter={true}
        />
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

      <div className="letters-game-guesses">
        {props.guesses.map((guess) => (
          <>{guess}</>
        ))}
      </div>
    </div>
  );
};

export default LettersGame;
