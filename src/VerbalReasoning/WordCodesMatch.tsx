import { stringify } from "querystring";
import React, { useState } from "react";
import { shuffleArray } from "../NumbersArithmetic/ArithmeticDrag";
import { wordLengthMappingsTargets } from "../WordleConfig";
import { Page } from "../App";
import { Button } from "../Button";
import { DEFAULT_ALPHABET, Keyboard } from "../Keyboard";
import LetterTile from "../LetterTile";
import { MessageNotification } from "../MessageNotification";
import { NumPad } from "../NumPad";
import ProgressBar, { GreenToRedColorTransition } from "../ProgressBar";
import { SettingsData } from "../SaveData";
import { useClickChime, useCorrectChime, useFailureChime, useLightPingChime } from "../Sounds";
import { Theme } from "../Themes";
import { arrayMove, OrderGroup } from "react-draggable-order";
import { DraggableItem } from "../NumbersArithmetic/DraggableItem";

interface Props {
  numWords: number;
  wordLength: number;
  numAdditionalLetters: number;
  numGuesses: number;
  timerConfig: { isTimed: false } | { isTimed: true; seconds: number };
  theme: Theme;
  settings: SettingsData;
  setPage: (page: Page) => void;
}

/** */
const WordCodesMatch: React.FC<Props> = (props) => {
  const [inProgress, setInProgress] = useState(true);
  const [remainingGuesses, setRemainingGuesses] = useState(props.numGuesses);
  const [wordCodes, setWordCodes] = useState<{ word: string; code: string }[]>([]);
  const [wordTiles, setWordTiles] = useState<
    { word: string; code: string; status: "incorrect" | "correct" | "not set" }[]
  >([]);
  const [codeTiles, setCodeTiles] = useState<{ code: string; status: "incorrect" | "correct" | "not set" }[]>([]);
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
    console.log(newWordCodes);
    setWordCodes(newWordCodes);
  }, [ResetGame]);

  // Create word tiles and code tiles (each time wordCodes changes)
  React.useEffect(() => {
    // Word Tiles
    let newWordTiles: { word: string; code: string; status: "not set" }[] = [];
    newWordTiles = wordCodes.map((wordCode) => ({ ...wordCode, status: "not set" }));
    newWordTiles = shuffleArray(newWordTiles);
    setWordTiles(newWordTiles);

    // Code tiles
    let newCodeTiles: { code: string; status: "not set" }[] = [];
    newCodeTiles = wordCodes.map((wordCode) => ({ code: wordCode.code, status: "not set" }));
    newCodeTiles = shuffleArray(newCodeTiles);
    setCodeTiles(newCodeTiles);
  }, [wordCodes]);

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

    // Get only the words that can be made from these valid letters
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

  function displayTiles() {
    var Grid = [];

    Grid.push(
      <div className="draggable_words">
        <OrderGroup mode={"between"}>
          {wordTiles.map((tile, index) => (
            <DraggableItem
              key={index}
              index={index}
              onMove={(toIndex) =>
                inProgress
                  ? setWordTiles(arrayMove(wordTiles, index, toIndex))
                  : /* TODO: Disable drag entirely if game is over */ console.log("Game over")
              }
            >
              <LetterTile letter={tile.word} status={tile.status} settings={props.settings} />
            </DraggableItem>
          ))}
        </OrderGroup>
      </div>
    );

    Grid.push(
      <div className="draggable_codes">
        <OrderGroup mode={"between"}>
          {codeTiles.map((tile, index) => (
            <DraggableItem
              key={index}
              index={index}
              onMove={(toIndex) =>
                inProgress
                  ? setCodeTiles(arrayMove(codeTiles, index, toIndex))
                  : /* TODO: Disable drag entirely if game is over */ console.log("Game over")
              }
            >
              <LetterTile letter={tile.code} status={tile.status} settings={props.settings} />
            </DraggableItem>
          ))}
        </OrderGroup>
      </div>
    );

    return Grid;
  }

  function checkTiles() {
    let newWordTiles = wordTiles.slice();
    let newCodeTiles = codeTiles.slice();

    newWordTiles = wordTiles.map((x, index) => {
      // Word matches with code
      if (wordTiles[index].code === codeTiles[index].code) {
        // Change status to correct
        x.status = "correct";
      } else {
        x.status = "incorrect";
      }
      return x;
    });
    // Also update status of result tiles
    newCodeTiles = codeTiles.map((x, index) => {
      if (wordTiles[index].code === codeTiles[index].code) {
        x.status = "correct";
      } else {
        x.status = "incorrect";
      }
      return x;
    });

    // Set so that the change in statuses are rendered
    setWordTiles(newWordTiles);
    setCodeTiles(newCodeTiles);

    // Are all the tiles in the correct position?
    const allCorrect = newWordTiles.filter((x) => x.status === "correct").length === wordTiles.length;

    // Or on last remaining guess
    if (allCorrect || remainingGuesses <= 1) {
      // Game over
      setInProgress(false);
    } else {
      // Otherwise, decrease number of guesses left
      setRemainingGuesses(remainingGuesses - 1);
    }
  }

  function displayOutcome(): React.ReactNode {
    // Game still in progress, don't display anything
    if (inProgress) {
      return;
    }

    const numCorrectTiles = wordTiles.filter((x) => x.status === "correct").length;
    const successCondition = numCorrectTiles === wordTiles.length;

    return (
      <>
        <MessageNotification type={successCondition ? "success" : "error"}>
          <strong>{successCondition ? "All tiles in the correct order!" : `${numCorrectTiles} tiles correct`}</strong>
        </MessageNotification>

        <br></br>

        <Button mode="accept" settings={props.settings} onClick={() => ResetGame()}>
          Restart
        </Button>
      </>
    );
  }

  // Restart with new set of questions
  function ResetGame() {
    setInProgress(true);
    setWordTiles([]);
    setCodeTiles([]);
    setWordCodes([]);
    setRemainingGuesses(props.numGuesses);

    if (props.timerConfig.isTimed) {
      // Reset the timer if it is enabled in the game options
      setSeconds(props.timerConfig.seconds);
    }
  }

  return (
    <div
      className="App word_codes_match"
      style={{ backgroundImage: `url(${props.theme.backgroundImageSrc})`, backgroundSize: "100%" }}
    >
      <div className="outcome">{displayOutcome()}</div>
      {inProgress && <MessageNotification type="default">{`Guesses left: ${remainingGuesses}`}</MessageNotification>}
      <div className="tile_row">{displayTiles()}</div>
      {inProgress && (
        <Button
          mode={remainingGuesses <= 1 ? "accept" : "default"}
          settings={props.settings}
          onClick={() => checkTiles()}
        >
          Submit guess
        </Button>
      )}
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

export default WordCodesMatch;
