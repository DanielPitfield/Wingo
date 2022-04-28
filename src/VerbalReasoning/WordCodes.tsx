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
  modeConfig:
    | { isMatch: false; numCodes: number; numWordToCodeQuestions: number; numCodeToWordQuestions: number }
    | { isMatch: true };
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
const WordCodes: React.FC<Props> = (props) => {
  const [inProgress, setInProgress] = useState(true);
  const [remainingGuesses, setRemainingGuesses] = useState(props.numGuesses);

  // Generated words along with their respective codes
  const [wordCodes, setWordCodes] = useState<{ word: string; code: string }[]>([]);

  // Tiles for match gamemode
  const [wordTiles, setWordTiles] = useState<
    { word: string; code: string; status: "incorrect" | "correct" | "not set" }[]
  >([]);
  const [codeTiles, setCodeTiles] = useState<{ code: string; status: "incorrect" | "correct" | "not set" }[]>([]);

  // Display information for questions gamemode
  const [displayWords, setDisplayWords] = useState<string[]>([]);
  const [displayCodes, setDisplayCodes] = useState<string[]>([]);

  // Questions
  const [questionWordCodes, setQuestionWordCodes] = useState<{ word: string; code: string }[]>([]);
  const [questionProgress, setQuestionProgress] = useState<{
    numCompletedWordToCodeQuestions: number;
    numCompletedCodeToWordQuestions: number;
  }>({ numCompletedWordToCodeQuestions: 0, numCompletedCodeToWordQuestions: 0 });

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

    // Sets display/information word codes (and question word codes if that gamemode)
    determineWordCodes();
  }, [ResetGame]);

  // Update tiles or display information (each time wordCodes changes)
  React.useEffect(() => {
    // Match gamemode
    if (props.modeConfig.isMatch) {
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
    }
    // Question gamemode
    else {
      let newDisplayWords = wordCodes.map((wordCode, index) => {
        return wordCode.word.toUpperCase();
      });
      newDisplayWords = shuffleArray(newDisplayWords);

      setDisplayWords(newDisplayWords);

      let newDisplayCodes = wordCodes.map((wordCode, index) => {
        return wordCode.code;
      });
      newDisplayCodes = shuffleArray(newDisplayCodes);

      // The codes for some words are not to be shown
      if (props.modeConfig.numCodes < props.numWords) {
        const numMissingCodes = Math.max(0, props.numWords - props.modeConfig.numCodes);
        // Enough codes to be able to not show some
        if (newDisplayCodes.length > numMissingCodes) {
          // Remove some codes
          newDisplayCodes = newDisplayCodes.slice(0, newDisplayCodes.length - numMissingCodes);
        }
      }

      setDisplayCodes(newDisplayCodes);
    }
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

  function determineWordCodes() {
    // The word array containing all the words of the specified length
    let targetWordArray = wordLengthMappingsTargets.find((x) => x.value === props.wordLength)?.array!;

    // Single digit codes are given to each letter (so wordLength must be max of 9)
    if (!targetWordArray || props.wordLength >= 10) {
      targetWordArray = wordLengthMappingsTargets.find((x) => x.value === 4)?.array!;
    }

    // Choose a random word from this array
    const originalWord = targetWordArray[Math.round(Math.random() * (targetWordArray.length - 1))];
    // The letters of this original word
    let validLetters = originalWord.split("");
    // How many valid letters at this point?
    const originalWordLength = validLetters.length;

    // Add some additional letters the words can be made from (more letters should make the game harder)
    while (validLetters.length < originalWordLength + props.numAdditionalLetters) {
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
    let words_subset: string[] = [];

    let fail_count = 0;

    while (words_subset.length < props.numWords && fail_count < 100) {
      const randomWord = original_matches[Math.round(Math.random() * (original_matches.length - 1))];

      if (!words_subset.includes(randomWord)) {
        words_subset.push(randomWord);
      } else {
        fail_count += 1;
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

    // Determine the code for each of the chosen words
    const newWordCodes = words_subset.map((word, index) => {
      return { word: word, code: getCode(word) };
    });

    setWordCodes(newWordCodes);

    // Question gamemode
    if (!props.modeConfig.isMatch) {
      // Choose/determine a subset of valid words
      let questions_words_subset: string[] = [];
      // Number of word codes that need to be generated (for questions)
      const numQuestions = props.modeConfig.numCodeToWordQuestions + props.modeConfig.numWordToCodeQuestions;

      let fail_count = 0;

      while (questions_words_subset.length < numQuestions && fail_count < 100) {
        const randomWord = original_matches[Math.round(Math.random() * (original_matches.length - 1))];

        // Not a word used already (either for the information provided or already used for questions)
        if (!questions_words_subset.includes(randomWord) && !words_subset.includes(randomWord)) {
          questions_words_subset.push(randomWord);
        } else {
          fail_count += 1;
        }
      }

      // Determine the code for each of the chosen words
      const newQuestionWordCodes = questions_words_subset.map((word, index) => {
        return { word: word, code: getCode(word) };
      });

      setQuestionWordCodes(newQuestionWordCodes);
    }
  }

  // Textual information for questions gamemode
  function displayInformation() {
    if (props.modeConfig.isMatch) {
      return;
    }

    if (!displayWords) {
      return;
    }

    if (!displayCodes) {
      return;
    }

    return (
      <>
        <div className="wordCode_words">{displayWords.join("  ")}</div>
        <br></br>
        <div className="wordCode_codes">{displayCodes.join("  ")}</div>
      </>
    );
  }

  function displayQuestion() {
    // TODO: This function needs to set some state, perhaps setQuestion()
    // The question is changing because of the random nature of how it is created

    if (props.modeConfig.isMatch) {
      return;
    }

    if (!questionProgress) {
      return;
    }

    // Number of questions answered so far
    const nunmQuestionsCompleted =
      questionProgress.numCompletedWordToCodeQuestions + questionProgress.numCompletedCodeToWordQuestions;
    // All the specified amount of word to code questions completed?
    const completedWordToCode =
      questionProgress.numCompletedWordToCodeQuestions === props.modeConfig.numWordToCodeQuestions;
    // All the specified amount of code to word questions completed?
    const completedCodetoWord =
      questionProgress.numCompletedCodeToWordQuestions === props.modeConfig.numCodeToWordQuestions;
    // Either type of question can be next?
    const chooseRandomQuestionType = !completedWordToCode && !completedCodetoWord;

    let question;

    if (chooseRandomQuestionType) {
      // No word code for the next question
      if (!questionWordCodes[nunmQuestionsCompleted]) {
        return;
      }

      // 50: 50 chance
      let x = Math.floor(Math.random() * 2) === 0;

      // Word to Code
      if (x) {
        question = (
          <div className="wordCodes_question">
            Find the code for the word <strong>{questionWordCodes[nunmQuestionsCompleted].word}</strong>
          </div>
        );
      }
      // Code to Word
      else {
        question = (
          <div className="wordCodes_question">
            Find the word that has the number code <strong>{questionWordCodes[nunmQuestionsCompleted].code}</strong>
          </div>
        );
      }
    }

    return question;
  }

  // Draggable tiles for match gamemode
  function displayTiles() {
    if (!props.modeConfig.isMatch) {
      return;
    }

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
    if (!props.modeConfig.isMatch) {
      return;
    }

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
      className="App word_codes"
      style={{ backgroundImage: `url(${props.theme.backgroundImageSrc})`, backgroundSize: "100%" }}
    >
      <div className="outcome">{displayOutcome()}</div>
      {inProgress && <MessageNotification type="default">{`Guesses left: ${remainingGuesses}`}</MessageNotification>}
      {!props.modeConfig.isMatch && <div className="wordCode_information">{displayInformation()}</div>}
      {!props.modeConfig.isMatch && displayQuestion()}
      {props.modeConfig.isMatch && <div className="tile_row">{displayTiles()}</div>}
      {Boolean(props.modeConfig.isMatch && inProgress) && (
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

export default WordCodes;