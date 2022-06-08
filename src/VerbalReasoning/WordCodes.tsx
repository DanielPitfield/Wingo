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
import { getQuestionSetOutcome } from "./Algebra/Algebra";
import GamemodeSettingsMenu from "../GamemodeSettingsMenu";

interface Props {
  isCampaignLevel: boolean;
  modeConfig:
    | { isMatch: false; numCodes: number; numWordToCodeQuestions: number; numCodeToWordQuestions: number }
    | { isMatch: true };
  numWords: number;
  wordLength: number;
  numAdditionalLetters: number;
  numGuesses: number;
  theme: Theme;
  settings: SettingsData;
  setPage: (page: Page) => void;
  onComplete?: (wasCorrect: boolean) => void;
}

/** */
const WordCodes: React.FC<Props> = (props) => {
  // Max number of characters permitted in a guess
  const MAX_LENGTH = props.wordLength;

  const [inProgress, setInProgress] = useState(true);
  const [guess, setGuess] = useState("");
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
  const [questionWordCodes, setQuestionWordCodes] = useState<{ word: string; code: string; isWordToCode: boolean }[]>(
    []
  );
  const [questionNumber, setQuestionNumber] = useState(0);
  const [numCorrectAnswers, setNumCorrectAnswers] = useState(0);

  // Gamemode settings
  const [isTimerEnabled, setIsTimerEnabled] = useState(true);
  const DEFAULT_TIMER_VALUE = 100;
  const [remainingSeconds, setRemainingSeconds] = useState(DEFAULT_TIMER_VALUE);
  const [totalSeconds, setTotalSeconds] = useState(DEFAULT_TIMER_VALUE);

  // Generate the elements to configure the gamemode settings
  const gamemodeSettings = generateSettings();

  // Sounds
  const [playCorrectChimeSoundEffect] = useCorrectChime(props.settings);
  const [playFailureChimeSoundEffect] = useFailureChime(props.settings);
  const [playLightPingSoundEffect] = useLightPingChime(props.settings);
  const [playClickSoundEffect] = useClickChime(props.settings);

  // (Guess) Timer Setup
  React.useEffect(() => {
    if (!isTimerEnabled || !inProgress) {
      return;
    }

    const timerGuess = setInterval(() => {
      if (remainingSeconds > 0) {
        setRemainingSeconds(remainingSeconds - 1);
      } else {
        playFailureChimeSoundEffect();
        setInProgress(false);
        clearInterval(timerGuess);
      }
    }, 1000);
    return () => {
      clearInterval(timerGuess);
    };
  }, [setRemainingSeconds, remainingSeconds, isTimerEnabled]);

  // Each time a guess is submitted
  React.useEffect(() => {
    if (inProgress) {
      return;
    }

    const successCondition = isGuessCorrect();

    if (successCondition) {
      playCorrectChimeSoundEffect();
      setNumCorrectAnswers(numCorrectAnswers + 1);
    } else {
      playFailureChimeSoundEffect();
    }
  }, [inProgress, guess]);

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

      // Add one of the displayed words as a question
      const numWordToCodeQuestions = props.modeConfig.numWordToCodeQuestions;
      if (numWordToCodeQuestions > 0) {
        const randomWord = words_subset[Math.round(Math.random() * (words_subset.length - 1))];
        questions_words_subset.push(randomWord);
      }

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
        const isWordToCode = index < numWordToCodeQuestions;
        return { word: word, code: getCode(word), isWordToCode: isWordToCode };
      });

      console.log(newQuestionWordCodes);

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

    // Word code for the current question
    const currentQuestion = questionWordCodes[questionNumber];

    if (!currentQuestion) {
      return;
    }

    const targetCodePlaceholder = Array.from({ length: props.wordLength })
      .map((x) => "?")
      .join("");

    const displayCodesWithPlaceholder = displayCodes.slice();

    if (!displayCodesWithPlaceholder.includes(targetCodePlaceholder) && displayCodes.length > 0) {
      displayCodes.splice(displayWords.indexOf(currentQuestion.word.toUpperCase()), 0, targetCodePlaceholder);
    }

    return (
      <>
        <div className="word_codes_words">{displayWords.join("  ")}</div>
        <div className="word_codes_codes">{displayCodesWithPlaceholder.join("  ")}</div>
      </>
    );
  }

  function displayQuestion() {
    if (props.modeConfig.isMatch) {
      return;
    }

    // Word code for the current question
    const currentQuestion = questionWordCodes[questionNumber];

    if (!currentQuestion) {
      return;
    }

    let question;
    // Word to Code questions first
    if (currentQuestion.isWordToCode) {
      question = (
        <div className="word_codes_question">
          Find the code for the word <strong>{currentQuestion.word.toUpperCase()}</strong>
        </div>
      );
    }
    // Code to Word
    else if (!currentQuestion.isWordToCode) {
      question = (
        <div className="word_codes_question">
          Find the word that has the number code <strong>{currentQuestion.code}</strong>
        </div>
      );
    }

    return question;
  }

  function isGuessCorrect() {
    if (inProgress) {
      return false;
    }

    if (props.modeConfig.isMatch) {
      return false;
    }

    if (!guess || guess.length < 1) {
      return false;
    }

    // Questions (and answers) couldn't be found
    if (!questionWordCodes) {
      return false;
    }

    const currentQuestion = questionWordCodes[questionNumber];

    if (!currentQuestion) {
      return false;
    }
    // Word to Code (guess is correct code?)
    else if (currentQuestion.isWordToCode && guess.toUpperCase() === currentQuestion.code.toUpperCase()) {
      return true;
    }
    // Code to Word (guess is correct word?)
    else if (!currentQuestion.isWordToCode && guess.toUpperCase() === currentQuestion.word.toUpperCase()) {
      return true;
    }
    // Incorrect answer
    else {
      return false;
    }
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
              onMove={(toIndex) => (inProgress ? setWordTiles(arrayMove(wordTiles, index, toIndex)) : undefined)}
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
              onMove={(toIndex) => (inProgress ? setCodeTiles(arrayMove(codeTiles, index, toIndex)) : undefined)}
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

    let message_notification;

    // Match gamemode
    if (props.modeConfig.isMatch) {
      const numCorrectTiles = wordTiles.filter((x) => x.status === "correct").length;
      const successCondition = numCorrectTiles === wordTiles.length;

      // Show how many tiles are in correct position
      message_notification = (
        <>
          <MessageNotification type={successCondition ? "success" : "error"}>
            <strong>{successCondition ? "All tiles in the correct order!" : `${numCorrectTiles} tiles correct`}</strong>
          </MessageNotification>

          <br></br>

          <Button
            mode="accept"
            settings={props.settings}
            onClick={() => ResetGame()}
            additionalProps={{ autoFocus: true }}
          >
            Restart
          </Button>
        </>
      );
    }
    // Questions gamemode
    else {
      if (!questionWordCodes) {
        return;
      }

      const successCondition = isGuessCorrect();

      // The number of questions in this set of questions
      const numQuestions = props.modeConfig.numWordToCodeQuestions + props.modeConfig.numCodeToWordQuestions;
      // Question was the last in the set of questions
      const lastQuestion = questionNumber === numQuestions - 1;

      message_notification = (
        <>
          {/* Show number of correct answers and restart button after last question */}
          {lastQuestion && (
            <>
              <MessageNotification type={getQuestionSetOutcome(numCorrectAnswers, numQuestions)}>
                <strong>{`${numCorrectAnswers} / ${numQuestions} correct`}</strong>
              </MessageNotification>

              <br></br>

              <Button
                mode="accept"
                onClick={() => ResetGame()}
                settings={props.settings}
                additionalProps={{ autoFocus: true }}
              >
                Restart
              </Button>

              <br></br>
            </>
          )}

          {/* Show outcome of current question (and how many questions are left) */}
          <MessageNotification type={successCondition ? "success" : "error"}>
            <strong>{successCondition ? "Correct!" : "Incorrect!"}</strong>
            <br></br>
            <span>{`${questionNumber + 1} / ${numQuestions} questions completed`}</span>
          </MessageNotification>

          <br></br>

          {/* Show next button if there are more questions */}
          {!lastQuestion && (
            <Button
              mode="accept"
              onClick={() => ContinueGame()}
              settings={props.settings}
              additionalProps={{ autoFocus: true }}
            >
              Next
            </Button>
          )}
        </>
      );
    }

    return message_notification;
  }

  // Restart with new word codes and set of questions
  function ResetGame() {
    props.onComplete?.(true);
    setGuess("");
    setInProgress(true);
    setWordTiles([]);
    setCodeTiles([]);
    setWordCodes([]);
    setRemainingGuesses(props.numGuesses);
    setDisplayCodes([]);
    setDisplayWords([]);
    setNumCorrectAnswers(0);
    setQuestionNumber(0);
    setQuestionWordCodes([]);

    if (isTimerEnabled) {
      // Reset the timer if it is enabled in the game options
      setRemainingSeconds(totalSeconds);
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

    setGuess(guess + letter);
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

  function generateSettings(): React.ReactNode {
    let settings;

    settings = (
      <>
        <label>
          <input
            checked={isTimerEnabled}
            type="checkbox"
            onChange={(e) => {
              setIsTimerEnabled(!isTimerEnabled);
            }}
          ></input>
          Timer
        </label>
        {isTimerEnabled && (
          <label>
            <input
              type="number"
              value={totalSeconds}
              min={10}
              max={120}
              step={5}
              onChange={(e) => {
                setRemainingSeconds(e.target.valueAsNumber);
                setTotalSeconds(e.target.valueAsNumber);
              }}
            ></input>
            Seconds
          </label>
        )}
      </>
    );

    return settings;
  }

  return (
    <div
      className="App word_codes"
      style={{ backgroundImage: `url(${props.theme.backgroundImageSrc})`, backgroundSize: "100%" }}
    >
      {!props.isCampaignLevel && (
      <div className="gamemodeSettings">
        <GamemodeSettingsMenu>{gamemodeSettings}</GamemodeSettingsMenu>
      </div>)}

      <div className="outcome">{displayOutcome()}</div>

      {Boolean(props.modeConfig.isMatch && inProgress) && (
        <MessageNotification type="default">{`Guesses left: ${remainingGuesses}`}</MessageNotification>
      )}

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

      {!props.modeConfig.isMatch && <div className="word_codes_information">{displayInformation()}</div>}
      {!props.modeConfig.isMatch && displayQuestion()}
      {!props.modeConfig.isMatch && (
        <div className="guess">
          <LetterTile
            letter={guess}
            status={inProgress ? "not set" : isGuessCorrect() ? "correct" : "incorrect"}
            settings={props.settings}
          ></LetterTile>
        </div>
      )}
      {Boolean(!props.modeConfig.isMatch && questionWordCodes[questionNumber]?.isWordToCode) && (
        <NumPad
          onEnter={() => setInProgress(false)}
          onBackspace={onBackspace}
          onSubmitNumber={onSubmitNumber}
          settings={props.settings}
          disabled={!inProgress}
          showKeyboard={props.settings.gameplay.keyboard}
        />
      )}
      {Boolean(!props.modeConfig.isMatch && !questionWordCodes[questionNumber]?.isWordToCode) && (
        <Keyboard
          onEnter={() => setInProgress(false)}
          onBackspace={onBackspace}
          settings={props.settings}
          onSubmitLetter={onSubmitLetter}
          targetWord=""
          mode={"verbal_reasoning/word_codes/match"}
          guesses={[]}
          letterStatuses={[]}
          inDictionary
          disabled={!inProgress}
          showKeyboard={props.settings.gameplay.keyboard}
        />
      )}
      <div>
        {isTimerEnabled && (
          <ProgressBar
            progress={remainingSeconds}
            total={totalSeconds}
            display={{ type: "transition", colorTransition: GreenToRedColorTransition }}
          ></ProgressBar>
        )}
      </div>
    </div>
  );
};

export default WordCodes;
