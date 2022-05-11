import React, { useState } from "react";
import { Keyboard } from "../Keyboard";
import { Page } from "../App";
import { WordRow } from "../WordRow";
import { Button } from "../Button";
import { MessageNotification } from "../MessageNotification";
import ProgressBar, { GreenToRedColorTransition } from "../ProgressBar";
import { isWordValid } from "./CountdownLettersConfig";
import { wordLengthMappingsGuessable } from "../WordleConfig";
import { Theme } from "../Themes";
import { SaveData, SettingsData } from "../SaveData";

interface Props {
  mode: "countdown_letters_casual" | "countdown_letters_realistic";
  timerConfig: { isTimed: false } | { isTimed: true; totalSeconds: number; elapsedSeconds: number };
  keyboard: boolean;
  wordLength: number;
  guesses: string[];
  hasTimerEnded: boolean;
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
  ResetGame: (score: number | null) => void;
  ContinueGame: () => void;
  gameshowScore?: number;
}

const CountdownLetters: React.FC<Props> = (props) => {
  // Currently selected guess, to be used as the final guess when time runs out
  const [selectedFinalGuess, setSelectedFinalGuess] = useState("");

  // Stores whether a manual selection has been made (to stop us overwriting that manual decision)
  const [manualGuessSelectionMade, setManualGuessSelectionMade] = useState(false);

  const [gameId, setGameId] = useState<string | null>(null);

  // Check if 9 letters have been selected
  const isSelectionFinished = props.countdownWord.length === 9;

  // TODO: Save CountdownLetters game

  React.useEffect(() => {
    if (!isSelectionFinished) {
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
        keyboard: props.keyboard,
        mode: props.mode,
        timerConfig: props.timerConfig.isTimed
          ? { isTimed: true, seconds: props.timerConfig.totalSeconds }
          : { isTimed: false },
        defaultWordLength: props.wordLength,
      },
    });

    setGameId(gameId);
  }, [props.mode, props.targetWord, isSelectionFinished]);

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
          word={props.countdownWord}
          isVertical={false}
          length={wordLength}
          targetWord={""}
          hasSubmit={false}
          inDictionary={props.inDictionary}
          settings={props.settings}
        />
        <div className="add-letter-buttons-wrapper">
          <Button
            mode={"default"}
            disabled={isSelectionFinished}
            settings={props.settings}
            onClick={() => props.onSubmitCountdownLetter(getVowel())}
          >
            Vowel
          </Button>
          <Button
            mode={"default"}
            disabled={isSelectionFinished}
            settings={props.settings}
            onClick={() => props.onSubmitCountdownLetter(getConsonant())}
          >
            Consonant
          </Button>
          <Button
            mode={"default"}
            disabled={props.countdownWord.length !== 0 || isSelectionFinished}
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
        isVertical={false}
        word={props.currentWord}
        length={wordLength}
        targetWord={props.targetWord}
        hasSubmit={!props.inProgress}
        inDictionary={props.inDictionary}
        settings={props.settings}
      ></WordRow>
    );

    return Grid;
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

    // When timer runs out and if a guess has been made
    if (!props.inProgress && props.hasTimerEnded) {
      if (!selectedFinalGuess) {
        // finalGuess is empty (no guess was made), no points
        outcome = "failure";
        return (
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
        return (
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
        // Realistic mode, guess (has not yet and so) needs to be evaluated
        if (props.inDictionary && isWordValid(props.countdownWord, selectedFinalGuess)) {
          outcome = "success";
          props.addGold(selectedFinalGuess.length * GOLD_PER_LETTER);
          return (
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
          return (
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
      }
    }

    // TODO: Save CountdownLetters round

    if (outcome !== "in-progress" && gameId) {
      SaveData.addCompletedRoundToGameHistory(gameId, {
        timestamp: new Date().toISOString(),
        gameCategory: "wingo",
        outcome,
        levelProps: {
          countdownWord: props.countdownWord,
          guesses: props.guesses,
          keyboard: props.keyboard,
          mode: props.mode,
          timerConfig: props.timerConfig.isTimed
            ? { isTimed: true, seconds: props.timerConfig.totalSeconds }
            : { isTimed: false },
          defaultWordLength: props.wordLength,
        },
      });
    }
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
      {props.gameshowScore !== undefined && <div className="countdown-gameshow-score">{displayGameshowScore()}</div>}

      <div>{displayOutcome()}</div>

      <div>
        {props.hasTimerEnded && !props.inProgress && (
          <Button
            mode={"accept"}
            settings={props.settings}
            // Reset the game (but callback the score that was just achieved)
            onClick={() => props.ResetGame(selectedFinalGuess ? selectedFinalGuess.length : 0)}
            additionalProps={{ autoFocus: true }}
          >
            {props.gameshowScore !== undefined ? "Next round" : "Restart"}
          </Button>
        )}
      </div>

      <div className="countdown/word_grid">{populateGrid(props.wordLength)}</div>

      <div className="keyboard">
        {props.keyboard && (
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
          ></Keyboard>
        )}
      </div>

      <div>
        {props.timerConfig.isTimed && (
          <ProgressBar
            progress={props.timerConfig.elapsedSeconds}
            total={props.timerConfig.totalSeconds}
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
