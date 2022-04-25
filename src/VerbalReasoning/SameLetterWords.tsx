import React, { useState } from "react";
import { Page } from "../App";
import { Button } from "../Button";
import { MessageNotification } from "../MessageNotification";
import { shuffleArray } from "../NumbersArithmetic/ArithmeticDrag";
import { getPrettyWord } from "../OnlyConnect/GroupWall";
import ProgressBar, { GreenToRedColorTransition } from "../ProgressBar";
import { SettingsData } from "../SaveData";
import { useClickChime, useCorrectChime, useFailureChime, useLightPingChime } from "../Sounds";
import { Theme } from "../Themes";
import { wordLengthMappingsTargets } from "../WordleConfig";

interface Props {
  numMatchingWords: number;
  numTotalWords: number;
  wordLength: number;
  numGuesses: number;
  timerConfig: { isTimed: false } | { isTimed: true; seconds: number };
  theme: Theme;
  settings: SettingsData;
  setPage: (page: Page) => void;
}

/** */
const SameLetterWords: React.FC<Props> = (props) => {
  const [inProgress, setInProgress] = useState(true);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [validWords, setValidWords] = useState<string[]>([]);
  const [gridWords, setGridWords] = useState<string[]>([]);
  const [remainingGuesses, setRemainingGuesses] = useState(props.numGuesses);
  const [seconds, setSeconds] = useState(props.timerConfig.isTimed ? props.timerConfig.seconds : 0);
  const [playCorrectChimeSoundEffect] = useCorrectChime(props.settings);
  const [playFailureChimeSoundEffect] = useFailureChime(props.settings);
  const [playLightPingSoundEffect] = useLightPingChime(props.settings);
  const [playClickSoundEffect] = useClickChime(props.settings);

  // (Guess) Timer Setup
  React.useEffect(() => {
    if (!props.timerConfig.isTimed || !inProgress) {
      return;
    }

    const timerGuess = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      } else {
        playFailureChimeSoundEffect();
        setInProgress(false);
        clearInterval(timerGuess);
      }
    }, 1000);
    return () => {
      clearInterval(timerGuess);
    };
  }, [setSeconds, seconds, props.timerConfig.isTimed]);

  // Populate grid/wall
  React.useEffect(() => {
    // Grid words already initialised
    if (gridWords.length > 0) {
      return;
    }

    const grid_words = getGridWords();
    setGridWords(grid_words);
  }, []);

  // Check selection
  React.useEffect(() => {
    if (!inProgress) {
      return;
    }

    // Not full selection
    if (selectedWords.length !== validWords.length) {
      return;
    }

    // No selected words
    if (selectedWords.length === 0) {
      return;
    }

    // No valid words
    if (validWords.length === 0) {
      return;
    }

    // Decrease number of guesses
    setRemainingGuesses(remainingGuesses - 1);

    // If just used last guess
    if (remainingGuesses <= 1) {
      setInProgress(false);
    }

    // All selected words are valid
    if (selectedWords.every((word) => validWords.includes(word))) {
      playCorrectChimeSoundEffect();
      setInProgress(false);
      // Put correct words at top of grid
      setGridWords(
        gridWords.sort((a, b) => {
          if (validWords.includes(a) && !validWords.includes(b)) {
            return -1;
          } else if (!validWords.includes(a) && validWords.includes(b)) {
            return 1;
          } else {
            return 0;
          }
        })
      );
    } else {
      const INCORRECT_SELECTION_DELAY_MS = 500;
      // Half a second to show incorrect (but complete/full) selection
      setTimeout(() => {
        // Reset the selected words
        setSelectedWords([]);

        playLightPingSoundEffect();
      }, INCORRECT_SELECTION_DELAY_MS);
      return;
    }

    // Reset the selected words
    setSelectedWords([]);
  }, [selectedWords]);

  function handleSelection(word: string) {
    if (!inProgress) {
      return;
    }

    if (!word) {
      return;
    }

    let newSelectedWords = selectedWords.slice();

    // Word is already selected
    if (selectedWords.includes(word)) {
      // Remove word from selection (de-select)
      newSelectedWords = newSelectedWords.filter((x) => x !== word);
    }
    // Room for word to be added to selection
    else if (selectedWords.length < validWords.length) {
      newSelectedWords.push(word);
    }
    // Selection is already full
    else {
      return;
    }

    setSelectedWords(newSelectedWords);
  }

  // (props.numMatching) words within (props.numTotal) words
  function getGridWords(): string[] {
    // Array to hold all the words for the grid
    let grid_words: string[] = [];
    // The word array containing all the words of the specified length
    const targetWordArray = wordLengthMappingsTargets.find((x) => x.value === props.wordLength)?.array!;
    // Choose a random word from this array
    const originalWord = targetWordArray[Math.round(Math.random() * (targetWordArray.length - 1))];
    // The letters a word must have to match the original word (in alphabetical order)
    const validLetters = originalWord.split("").sort((a, b) => a.localeCompare(b));

    function isWordValid(validLetters: string[], word: string) {
      // Letters of the word (in alphabetical order)
      const word_letters = word.split("").sort((a, b) => a.localeCompare(b));
      return word_letters.join("") === validLetters.join("");
    }

    // Matching words
    const original_matches = targetWordArray.filter((word) => isWordValid(validLetters, word));

    // There are as many or less words made of the same letters (than needed)
    if (original_matches.length <= props.numMatchingWords) {
      // Use all the found matches
      grid_words = original_matches;
    } else {
      // Otherwise, select a subset of the matching words (shuffle and slice)
      const shuffled_matches = shuffleArray(original_matches);
      const subset_matches = shuffled_matches.slice(0, props.numMatchingWords);
      grid_words = subset_matches;
    }

    const matching_words = grid_words.slice();
    // Set the correct/matching words
    setValidWords(matching_words);
    console.log(matching_words);

    // Non-matching words
    let fail_count = 0;
    while (grid_words.length < props.numTotalWords && fail_count < 100) {
      // Choose a random word from target array
      const randomWord = targetWordArray[Math.round(Math.random() * (targetWordArray.length - 1))];
      // Not already in array and is NOT a matching word
      if (!grid_words.includes(randomWord) && !isWordValid(validLetters, randomWord)) {
        grid_words.push(randomWord);
      } else {
        fail_count += 1;
      }
    }

    // Shuffle again
    grid_words = shuffleArray(grid_words);

    return grid_words;
  }

  function populateRow(rowNumber: number) {
    return (
      <div className="only-connect-row" key={rowNumber}>
        {Array.from({ /* TODO: Change from always using 4 rows */ length: props.numTotalWords / 4 }).map((_, i) => {
          const index = rowNumber * (props.numTotalWords / 4) + i;
          const word = gridWords[index];

          return (
            <button
              key={index}
              className="only-connect-button"
              data-selected={selectedWords.includes(word)}
              data-row-number={
                (inProgress && selectedWords.includes(word)) || (!inProgress && validWords.includes(word))
                  ? 1
                  : undefined
              }
              onClick={() => {
                handleSelection(word);
                playClickSoundEffect();
              }}
            >
              {word ? getPrettyWord(word) : ""}
            </button>
          );
        })}
      </div>
    );
  }

  function displayGrid() {
    var Grid = [];

    for (let i = 0; i < 4; i++) {
      Grid.push(populateRow(i));
    }

    return Grid;
  }

  /**
   *
   * @returns
   */
  function displayOutcome(): React.ReactNode {
    // Game still in progress, don't display anything
    if (inProgress) {
      return;
    }

    let message_notification;
    const success_condition = selectedWords.length > 0 && selectedWords.every((word) => validWords.includes(word));

    if (success_condition) {
      message_notification = (
        <MessageNotification type="success">
          <strong>All {validWords.length} words with the same letters found!</strong>
        </MessageNotification>
      );
    } else {
      message_notification = (
        <MessageNotification type="error">
          <strong>You didn't find the {validWords.length} words with the same letters</strong>
        </MessageNotification>
      );
    }

    return (
      <>
        {message_notification}

        <br></br>

        <Button mode="accept" settings={props.settings} onClick={() => ResetGame()}>
          Restart
        </Button>
      </>
    );
  }

  function ResetGame() {
    setInProgress(true);
    setSelectedWords([]);
    setValidWords([]);
    setGridWords(getGridWords());
    setRemainingGuesses(props.numGuesses);

    if (props.timerConfig.isTimed) {
      // Reset the timer if it is enabled in the game options
      setSeconds(props.timerConfig.seconds);
    }
  }

  return (
    <div
      className="App same_letter_words"
      style={{ backgroundImage: `url(${props.theme.backgroundImageSrc})`, backgroundSize: "100%" }}
    >
      <div className="outcome">{displayOutcome()}</div>
      {inProgress && <MessageNotification type="default">{`Guesses left: ${remainingGuesses}`}</MessageNotification>}
      <div className="grid">{displayGrid()}</div>
      <div>
        {props.timerConfig.isTimed && (
          <ProgressBar
            progress={seconds}
            total={props.timerConfig.seconds}
            display={{ type: "transition", colorTransition: GreenToRedColorTransition }}
          ></ProgressBar>
        )}
      </div>
    </div>
  );
};

export default SameLetterWords;
