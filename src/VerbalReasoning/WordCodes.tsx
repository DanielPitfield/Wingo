import { stringify } from "querystring";
import React, { useState } from "react";
import { shuffleArray } from "../NumbersArithmetic/ArithmeticDrag";
import { wordLengthMappingsTargets } from "../WordleConfig";
import { Page } from "./../App";
import { Button } from "./../Button";
import { DEFAULT_ALPHABET, Keyboard } from "./../Keyboard";
import LetterTile from "./../LetterTile";
import { MessageNotification } from "./../MessageNotification";
import { NumPad } from "./../NumPad";
import ProgressBar, { GreenToRedColorTransition } from "./../ProgressBar";
import { SettingsData } from "./../SaveData";
import { useClickChime, useCorrectChime, useFailureChime, useLightPingChime } from "./../Sounds";
import { Theme } from "./../Themes";

interface Props {
  numWords: number;
  wordLength: number;
  numAdditionalLetters: number;
  numCodes: number;
  numQuestions: number;
  timerConfig: { isTimed: false } | { isTimed: true; seconds: number };
  theme: Theme;
  settings: SettingsData;
  setPage: (page: Page) => void;
}

/** */
const WordCodes: React.FC<Props> = (props) => {
  // Max number of characters permitted in a guess
  const MAX_LENGTH = 6;

  const [inProgress, setInProgress] = useState(true);
  const [guess, setGuess] = useState("");
  const [wordCodes, setWordCodes] = useState<{ word: string; code: string | null }[]>([]);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [numCorrectAnswers, setNumCorrectAnswers] = useState(0);
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

  // Determine word codes
  React.useEffect(() => {
    // Word codes already initialised
    if (wordCodes.length > 0) {
      return;
    }

    const newWordCodes = getWordCodes();
    setWordCodes(newWordCodes);
  }, []);

  // Each time a guess is submitted
  React.useEffect(() => {
    if (inProgress) {
      return;
    }

    if (!guess || guess.length < 1) {
      return;
    }

    const successCondition = true;

    if (successCondition) {
      playCorrectChimeSoundEffect();
      setNumCorrectAnswers(numCorrectAnswers + 1);
    } else {
      playFailureChimeSoundEffect();
    }
  }, [inProgress, guess]);

  // Determines whether a word can be made only using the specified valid letters
  function isWordValid(validLetters: string[], word: string) {
    // Letters of the word
    const wordLetters = word.split("");

    for (let i = 0; i < wordLetters.length; i++) {
      const letter = wordLetters[i];
      // Any of the word's letters are not a valid letter
      if (!validLetters.includes(letter)) {
        return false;
      }
    }
    return true;
  }

  function getWordCodes(): { word: string; code: string }[] {
    // The word array containing all the words of the specified length
    const targetWordArray = wordLengthMappingsTargets.find((x) => x.value === props.wordLength)?.array!;
    // Choose a random word from this array
    const originalWord = targetWordArray[Math.round(Math.random() * (targetWordArray.length - 1))];
    // The letters of this original word
    let validLetters = originalWord.split("");

    // Add some additional letters the words can be made from (more letters should make the game harder)
    while (validLetters.length < props.wordLength + props.numAdditionalLetters) {
      const randomLetter = DEFAULT_ALPHABET[Math.round(Math.random() * (DEFAULT_ALPHABET.length - 1))];

      if (!validLetters.includes(randomLetter)) {
        validLetters.push(randomLetter);
      }
    }

    // Add a number code to each of the valid letters
    let letterCodes = validLetters.map((letter, i) => {
      return { letter: letter, code: i };
    });

    // Get only the words made from these valid letters
    const original_matches = targetWordArray.filter((word) => isWordValid(validLetters, word));

    // Choose/determine a subset of these words
    let words: string[] = [];

    while (words.length < props.numWords) {
      const randomWord = original_matches[Math.round(Math.random() * (original_matches.length - 1))];

      if (!words.includes(randomWord)) {
        words.push(randomWord);
      }
    }

    // Finds the code for a given word
    function getCode(word: string): string {
      const wordLetters = word.split("");
      let code_string = "";

      for (let i = 0; i < wordLetters.length; i++) {
        // Current letter of word
        const letter = wordLetters[i];
        // Find code from lookup table
        const letterCode = letterCodes.find((x) => x.letter === letter)?.code.toString();
        // Append to code string for entire word
        code_string += letterCode;
      }

      return code_string;
    }

    // Determine the code for each of these words
    const newWordCodes = words.map((word, index) => {
      return { word: word, code: getCode(word) };
    });

    return newWordCodes;
  }

  function displayOutcome(): React.ReactNode {
    // Game still in progress, don't display anything
    if (inProgress) {
      return;
    }

    return <br></br>;
  }

  // Restart with new set of questions
  function ResetGame() {
    setInProgress(true);
    setGuess("");
    setQuestionNumber(0);
    setNumCorrectAnswers(0);

    if (props.timerConfig.isTimed) {
      // Reset the timer if it is enabled in the game options
      setSeconds(props.timerConfig.seconds);
    }
  }

  // Next question
  function ContinueGame() {
    setInProgress(true);
    setGuess("");
    setQuestionNumber(questionNumber + 1);
  }

  function onBackspace() {
    if (!inProgress) {
      return;
    }

    if (guess.length === 0) {
      return;
    }

    setGuess(guess.substring(0, guess.length - 1));
  }

  function onSubmitLetter(letter: string) {
    if (!inProgress) {
      return;
    }

    if (guess.length >= MAX_LENGTH) {
      return;
    }

    setGuess(letter);
  }

  function onSubmitNumber(number: number) {
    if (!inProgress) {
      return;
    }

    if (guess.length >= MAX_LENGTH) {
      return;
    }

    setGuess(`${guess}${number}`);
  }

  return (
    <div
      className="App algebra"
      style={{ backgroundImage: `url(${props.theme.backgroundImageSrc})`, backgroundSize: "100%" }}
    >
      <div className="outcome">{displayOutcome()}</div>
      <div className="guess">
        <LetterTile letter={guess} status="not set" settings={props.settings}></LetterTile>
      </div>

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

export default WordCodes;
