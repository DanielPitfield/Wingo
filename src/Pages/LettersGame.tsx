import React, { useState } from "react";
import { Keyboard } from "../Components/Keyboard";
import { PageName } from "../PageNames";
import { WordRow } from "../Components/WordRow";
import { Button } from "../Components/Button";
import { MessageNotification } from "../Components/MessageNotification";
import ProgressBar, { GreenToRedColorTransition } from "../Components/ProgressBar";
import { isLettersGameGuessValid } from "./LettersGameConfig";
import { pickRandomElementFrom } from "./WingoConfig";
import { Theme } from "../Data/Themes";
import { SettingsData } from "../Data/SaveData";
import GamemodeSettingsMenu from "../Components/GamemodeSettingsMenu";
import { shuffleArray } from "./ArithmeticDrag";
import { LEVEL_FINISHING_TEXT } from "../Components/Level";
import { LetterSelectionRow } from "../LetterSelectionRow";
import { getAllWordsOfLength } from "../Data/Conundrum";
import { MAX_TARGET_WORD_LENGTH, MIN_TARGET_WORD_LENGTH } from "../Data/GamemodeSettingsInputLimits";
import { getGamemodeDefaultTimerValue } from "../Data/DefaultTimerValues";

interface Props {
  campaignConfig:
    | {
        isCampaignLevel: true;
        // What score must be achieved to pass the campaign level?
        targetScore: number;
      }
    | { isCampaignLevel: false };

  gamemodeSettings: {
    numLetters: number;
    timerConfig: { isTimed: true; seconds: number } | { isTimed: false };
  };

  letterTileStatuses: {
    letter: string | null;
    picked: boolean;
  }[];

  guesses: string[];
  currentWord: string;
  inProgress: boolean;
  inDictionary: boolean;
  hasSubmitLetter: boolean;
  targetWord: string;
  remainingSeconds: number;

  page: PageName;
  theme: Theme;
  settings: SettingsData;
  setTheme: (theme: Theme) => void;
  setPage: (page: PageName) => void;
  addGold: (gold: number) => void;
  onEnter: () => void;

  onSubmitSelectionLetter: (letter: string) => void;
  onSubmitSelectionWord: (word: string) => void;

  onClickSelectionLetter: (letter: string | null, index: number) => void;
  onSubmitKeyboardLetter: (letter: string) => void;
  onBackspace: () => void;

  updateGamemodeSettings: (newGamemodeSettings: {
    numLetters: number;
    timerConfig: { isTimed: true; seconds: number } | { isTimed: false };
  }) => void;

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
    return pickRandomElementFrom(weightedArray);
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

  // Create grid of rows (for guessing words)
  function populateGrid() {
    let Grid = [];

    // Read only letter selection WordRow
    Grid.push(
      <div className="letters-game-wrapper" key={"letter_selection"}>
        <LetterSelectionRow
          key={"letters-game/read-only"}
          letterTileStatuses={props.letterTileStatuses}
          settings={props.settings}
          disabled={!props.inProgress}
          onClick={props.onClickSelectionLetter}
        />
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
      </div>
    );

    // WordRow to enter words using available letters
    Grid.push(
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

    return Grid;
  }

  function generateSettingsOptions(): React.ReactNode {
    return (
      <>
        <label>
          <input
            type="number"
            value={props.gamemodeSettings.numLetters}
            min={MIN_TARGET_WORD_LENGTH}
            max={MAX_TARGET_WORD_LENGTH}
            onChange={(e) => {
              const newGamemodeSettings = {
                ...props.gamemodeSettings,
                numLetters: e.target.valueAsNumber,
              };
              props.updateGamemodeSettings(newGamemodeSettings);
            }}
          ></input>
          Number of Letters
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
                    timerConfig: { isTimed: true, seconds: e.target.valueAsNumber },
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

  function displayGameshowScore() {
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

  return (
    <div
      className="App"
      style={{ backgroundImage: `url(${props.theme.backgroundImageSrc})`, backgroundSize: "100% 100%" }}
    >
      {!props.campaignConfig.isCampaignLevel && !props.gameshowScore && (
        <div className="gamemodeSettings">
          <GamemodeSettingsMenu>{generateSettingsOptions()}</GamemodeSettingsMenu>
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

      <div className="letters-game-word-grid">{populateGrid()}</div>

      {props.settings.gameplay.keyboard && (
        <div className="keyboard">
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

      <div className="letters-game-guesses">
        {props.guesses.map((guess) => (
          <>{guess}</>
        ))}
      </div>
    </div>
  );
};

export default LettersGame;
