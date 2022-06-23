import React, { useState } from "react";
import { Keyboard } from "../Keyboard";
import { MAX_TARGET_WORD_LENGTH, MIN_TARGET_WORD_LENGTH, Page } from "../App";
import { WordRow } from "../WordRow";
import { Button } from "../Button";
import { MessageNotification } from "../MessageNotification";
import ProgressBar, { GreenToRedColorTransition } from "../ProgressBar";
import { isWordValid } from "./CountdownLettersConfig";
import { wordLengthMappingsGuessable } from "../WordleConfig";
import { Theme } from "../Themes";
import { SaveData, SettingsData } from "../SaveData";
import GamemodeSettingsMenu from "../GamemodeSettingsMenu";

interface Props {
  isCampaignLevel: boolean;
  mode: "countdown_letters_casual" | "countdown_letters_realistic";

  gamemodeSettings: {
    numLetters: number;
    timerConfig: { isTimed: true; seconds: number } | { isTimed: false };
  };

  remainingSeconds: number;
  guesses: string[];
  countdownWord: string;
  currentWord: string;
  inProgress: boolean;
  inDictionary: boolean;
  hasSubmitLetter: boolean;
  targetWord: string;
  letterStatuses: {
    letter: string;
    status: "" | "contains" | "correct" | "not set" | "not in word";
  }[];
  theme: Theme;
  settings: SettingsData;
  setTheme: (theme: Theme) => void;
  setPage: (page: Page) => void;
  addGold: (gold: number) => void;
  onEnter: () => void;
  onSubmitCountdownLetter: (letter: string) => void;
  onSubmitCountdownWord: (word: string) => void;
  onSubmitLetter: (letter: string) => void;
  onBackspace: () => void;

  updateGamemodeSettings: (newGamemodeSettings: {
    numLetters: number;
    timerConfig: { isTimed: true; seconds: number } | { isTimed: false };
  }) => void;

  updateRemainingSeconds: (newSeconds: number) => void;

  ResetGame: (wasCorrect: boolean, answer: string, targetAnswer: string, score: number | null) => void;
  ContinueGame: () => void;
  gameshowScore?: number;
}

const CountdownLetters: React.FC<Props> = (props) => {
  // Currently selected guess, to be used as the final guess when time runs out
  const [selectedFinalGuess, setSelectedFinalGuess] = useState("");
  // Stores whether a manual selection has been made (to stop us overwriting that manual decision)
  const [manualGuessSelectionMade, setManualGuessSelectionMade] = useState(false);
  const [gameId, setGameId] = useState<string | null>(null);
  // Check if letter selection has finished
  const IS_SELECTION_FINISHED = props.countdownWord.length === props.gamemodeSettings.numLetters;

  const DEFAULT_TIMER_VALUE = 30;
  const [mostRecentTotalSeconds, setMostRecentTotalSeconds] = useState(
    props.gamemodeSettings?.timerConfig?.isTimed === true
      ? props.gamemodeSettings?.timerConfig.seconds
      : DEFAULT_TIMER_VALUE
  );

  // TODO: Save CountdownLetters game
  React.useEffect(() => {
    if (!IS_SELECTION_FINISHED) {
      return;
    }

    if (!props.targetWord) {
      return;
    }

    const gameId = SaveData.addGameToHistory("countdown/letters", {
      timestamp: new Date().toISOString(),
      gameCategory: "countdown_letters",
      levelProps: {
        countdownWord: props.countdownWord,
        guesses: props.guesses,
        mode: props.mode,
      },
    });

    setGameId(gameId);
  }, [props.mode, props.targetWord, IS_SELECTION_FINISHED]);

  // Create grid of rows (for guessing words)
  function populateGrid(wordLength: number) {
    function getWeightedLetter(letter_weightings: { letter: string; weighting: number }[]) {
      var weighted_array: string[] = [];

      // For each object in input array
      for (let i = 0; i < letter_weightings.length; i++) {
        // For the 'weighting' value number of times
        for (var j = 0; j < letter_weightings[i].weighting; j++) {
          // Push the related letter to the array
          weighted_array.push(letter_weightings[i].letter);
        }
      }

      // Select a random value from this array
      return weighted_array[Math.round(Math.random() * (weighted_array.length - 1))];
    }

    function getVowel(): string {
      // Already 9 picked letters, don't add any more
      if (props.countdownWord.length === 9) {
        return "";
      }

      // Scrabble distribution (https://en.wikipedia.org/wiki/Scrabble_letter_distributions)
      let vowel_weightings = [
        { letter: "a", weighting: 9 },
        { letter: "e", weighting: 12 },
        { letter: "i", weighting: 9 },
        { letter: "o", weighting: 8 },
        { letter: "u", weighting: 4 },
      ];

      /*
      if (!useWeightings) {
        const randomIndex = Math.round(
          Math.random() * (vowel_weightings.length - 1)
        );
        const randomLetter = vowel_weightings[randomIndex].letter;
        return randomLetter;
      } else {
        const weighted_vowel = getWeightedLetter(vowel_weightings);
        return weighted_vowel;
      }
      */

      const weighted_vowel = getWeightedLetter(vowel_weightings);
      return weighted_vowel;
    }

    function getConsonant(): string {
      if (props.countdownWord.length === 9) {
        return "";
      }

      let consonant_weightings = [
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

      /*
      if (!useWeightings) {
        const randomIndex = Math.round(
          Math.random() * (consonant_weightings.length - 1)
        );
        const randomLetter = consonant_weightings[randomIndex].letter;
        return randomLetter;
      } else {
        const weighted_consonant = getWeightedLetter(consonant_weightings);
        return weighted_consonant;
      }
      */

      const weighted_consonant = getWeightedLetter(consonant_weightings);
      return weighted_consonant;
    }

    function quickLetterSelection() {
      let newCountdownWord = "";

      // Build word by randomly adding vowels and consonants
      for (let i = 0; i < wordLength; i++) {
        let x = Math.floor(Math.random() * 2) === 0;
        // Equal chance (to add a vowel or consonant)
        if (x) {
          newCountdownWord += getVowel();
        } else {
          newCountdownWord += getConsonant();
        }
      }
      // Set the entire word at once
      props.onSubmitCountdownWord(newCountdownWord);
    }

    var Grid = [];

    // Read only letter selection WordRow
    Grid.push(
      <div key={"letter_selection"} className="countdown-letters-wrapper">
        <WordRow
          mode={props.mode}
          isReadOnly={true}
          inProgress={props.inProgress}
          word={props.countdownWord}
          isVertical={false}
          length={wordLength}
          targetWord={""}
          hasSubmit={false}
          inDictionary={props.inDictionary}
          settings={props.settings}
          applyAnimation={false}
        />
        <div className="add-letter-buttons-wrapper">
          <Button
            mode={"default"}
            disabled={IS_SELECTION_FINISHED}
            settings={props.settings}
            onClick={() => props.onSubmitCountdownLetter(getVowel())}
          >
            Vowel
          </Button>
          <Button
            mode={"default"}
            disabled={IS_SELECTION_FINISHED}
            settings={props.settings}
            onClick={() => props.onSubmitCountdownLetter(getConsonant())}
          >
            Consonant
          </Button>
          <Button
            mode={"default"}
            disabled={props.countdownWord.length !== 0 || IS_SELECTION_FINISHED}
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
        key={"countdown/letters_input"}
        mode={props.mode}
        isReadOnly={false}
        inProgress={props.inProgress}
        isVertical={false}
        word={props.currentWord}
        length={wordLength}
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
    let settings;

    settings = (
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

    return settings;
  }

  // TODO: Add game to SaveData history
  // TODO: Calculate gold reward
  function getBestWords(countdownWord: string) {
    const MAX_WORDS_TO_RETURN = 5;

    // Array to store best words that are found
    const best_words = [];

    // Start with bigger words first
    for (let i = countdownWord.length; i >= 4; i--) {
      // Get word array containng words of i size
      const wordArray = wordLengthMappingsGuessable.find((x) => x.value === i)?.array!;
      // Safety check for wordArray
      if (wordArray) {
        // Check the entire array for any valid words
        for (const word of wordArray) {
          // Safety check for word
          if (word) {
            if (isWordValid(countdownWord, word)) {
              // Push to array if word is valid
              best_words.push(word);

              if (best_words.length >= MAX_WORDS_TO_RETURN) {
                return best_words;
              }
            }
          }
        }
      }
    }

    return best_words;
  }

  function displayOutcome() {
    // Game has not yet ended (currently only when when timer runs out)
    if (props.inProgress) {
      return;
    }

    // Create a list of the longest words that can be made with the available letters
    const bestWords = getBestWords(props.countdownWord);
    const bestWordsList = (
      <ul className="best_words_list">
        {bestWords.map((bestWord) => (
          <li key={bestWord}>{bestWord}</li>
        ))}
      </ul>
    );

    let outcome: "success" | "failure" | "in-progress" = "in-progress";
    const GOLD_PER_LETTER = 30;

    let outcomeNoticiation;

    if (!selectedFinalGuess) {
      // finalGuess is empty (no guess was made), no points
      outcome = "failure";
      outcomeNoticiation = (
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

    if (props.mode === "countdown_letters_casual") {
      // Already evaluated that guess is valid, so just display result
      outcome = "success";
      // Reward gold based on how long the selected guess is
      props.addGold(selectedFinalGuess.length * GOLD_PER_LETTER);
      outcomeNoticiation = (
        <>
          <MessageNotification type="success">
            <strong>{selectedFinalGuess.toUpperCase()}</strong>
            <br />
            <strong>{selectedFinalGuess.length} points</strong>
          </MessageNotification>
          {bestWordsList}
        </>
      );
    }
    // Realistic mode, guess (has not yet and so) needs to be evaluated
    else if (props.inDictionary && isWordValid(props.countdownWord, selectedFinalGuess)) {
      outcome = "success";
      props.addGold(selectedFinalGuess.length * GOLD_PER_LETTER);
      outcomeNoticiation = (
        <>
          <MessageNotification type="success">
            <strong>{selectedFinalGuess.toUpperCase()}</strong>
            <br />
            <strong>{selectedFinalGuess.length} points</strong>
          </MessageNotification>
          {bestWordsList}
        </>
      );
    } else {
      // Invalid word
      outcome = "failure";
      outcomeNoticiation = (
        <>
          <MessageNotification type="error">
            <strong>{selectedFinalGuess.toUpperCase()} is an invalid word</strong>
            <br />
            <strong>0 points</strong>
          </MessageNotification>
          {bestWordsList}
        </>
      );
    }

    // TODO: Save CountdownLetters round
    if (gameId) {
      SaveData.addCompletedRoundToGameHistory(gameId, {
        timestamp: new Date().toISOString(),
        gameCategory: "wingo",
        outcome,
        levelProps: {
          countdownWord: props.countdownWord,
          guesses: props.guesses,
          mode: props.mode,
        },
      });
    }

    return outcomeNoticiation;
  }

  // Set the selected final guess to the longest word (as long as `manualGuessSelectionMade` is false)
  React.useEffect(() => {
    // If a manual selection has been made
    if (manualGuessSelectionMade) {
      // Keep it as the manual selection
      return;
    }

    // Compares words and returns a single value of the longest word
    const longestWord = props.guesses.reduce(
      (currentWord, nextWord) => (currentWord.length > nextWord.length ? currentWord : nextWord),
      ""
    );

    setSelectedFinalGuess(longestWord);
  }, [manualGuessSelectionMade, props.guesses]);

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
    <div className="App" style={{ backgroundImage: `url(${props.theme.backgroundImageSrc})`, backgroundSize: "100%" }}>
      {!props.isCampaignLevel && !props.gameshowScore && (
        <div className="gamemodeSettings">
          <GamemodeSettingsMenu>{generateSettingsOptions()}</GamemodeSettingsMenu>
        </div>
      )}

      {props.gameshowScore !== undefined && <div className="gameshow-score">{displayGameshowScore()}</div>}

      <div>{displayOutcome()}</div>

      <div>
        {!props.inProgress && (
          <Button
            mode={"accept"}
            settings={props.settings}
            // Reset the game (but callback the score that was just achieved)
            onClick={() =>
              props.ResetGame(
                // correct?
                selectedFinalGuess ? selectedFinalGuess.length > 0 : false,
                // guess made
                selectedFinalGuess ? selectedFinalGuess : "",
                // target word
                "",
                // score
                selectedFinalGuess ? selectedFinalGuess.length : 0
              )
            }
            additionalProps={{ autoFocus: true }}
          >
            {props.gameshowScore !== undefined ? "Next round" : "Restart"}
          </Button>
        )}
      </div>

      <div className="countdown/word_grid">{populateGrid(props.gamemodeSettings.numLetters)}</div>

      <div className="keyboard">
        <Keyboard
          mode={"countdown/letters"}
          onEnter={props.onEnter}
          onSubmitLetter={props.onSubmitLetter}
          onBackspace={props.onBackspace}
          guesses={props.guesses}
          targetWord={props.targetWord}
          inDictionary={props.inDictionary}
          letterStatuses={props.letterStatuses}
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

      <div className="countdown/letters_guesses">
        {props.guesses.map((guess, i) => (
          <label key={i} className="countdown/letters_guess_label">
            <input
              type="radio"
              checked={selectedFinalGuess === guess}
              onChange={(event) => {
                setManualGuessSelectionMade(true);
                setSelectedFinalGuess(event.target.value);
              }}
              className="countdown/letters_guess_input"
              name="countdown/letters_guess"
              value={guess}
            />
            {guess}
          </label>
        ))}
      </div>
    </div>
  );
};

export default CountdownLetters;
