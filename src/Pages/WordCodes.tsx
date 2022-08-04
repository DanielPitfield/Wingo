import React, { useState } from "react";
import { shuffleArray } from "./ArithmeticDrag";
import { pickRandomElementFrom } from "./WingoConfig";
import { PageName } from "../PageNames";
import { Button } from "../Components/Button";
import { DEFAULT_ALPHABET, Keyboard } from "../Components/Keyboard";
import LetterTile from "../Components/LetterTile";
import { MessageNotification } from "../Components/MessageNotification";
import { NumPad } from "../Components/NumPad";
import ProgressBar, { GreenToRedColorTransition } from "../Components/ProgressBar";
import { SaveData, SettingsData } from "../Data/SaveData";
import { useClickChime, useCorrectChime, useFailureChime, useLightPingChime } from "../Data/Sounds";
import { Theme } from "../Data/Themes";
import { arrayMove, OrderGroup } from "react-draggable-order";
import { DraggableItem } from "../Components/DraggableItem";
import { getQuestionSetOutcome } from "./Algebra";
import GamemodeSettingsMenu from "../Components/GamemodeSettingsMenu";
import { wordLengthMappingsTargets } from "../Data/DefaultGamemodeSettings";
import { LEVEL_FINISHING_TEXT } from "../Components/Level";

const wordCodesModes = ["match", "question"] as const;
export type wordCodesMode = typeof wordCodesModes[number];

export interface WordCodesProps {
  /* 
  Question mode - there can be more words provided than codes, answer questions converting between words and codes
  Match mode - same number of words as codes, match them together
  */
  mode: wordCodesMode;

  gamemodeSettings?: {
    // Question mode only settings
    numDisplayWords?: number;
    numDisplayCodes?: number;
    numWordToCodeQuestions?: number;
    numCodeToWordQuestions?: number;

    // Match mode only setting
    numCodesToMatch?: number;

    // Both modes
    codeLength?: number;
    numAdditionalLetters?: number;
    numGuesses?: number;
    timerConfig?: { isTimed: true; seconds: number } | { isTimed: false };
  };
}

interface Props extends WordCodesProps {
  isCampaignLevel: boolean;
  page: PageName;
  theme: Theme;
  settings: SettingsData;
  setPage: (page: PageName) => void;
  setTheme: (theme: Theme) => void;
  addGold: (gold: number) => void;
  onComplete?: (wasCorrect: boolean) => void;
}

/** */
const WordCodes: React.FC<Props> = (props) => {
  // Question mode only
  const DEFAULT_NUM_DISPLAY_WORDS = 4;
  const DEFAULT_NUM_DISPLAY_CODES = 3;
  const DEFAULT_NUM_WORD_TO_CODE_QUESTIONS = 2;
  const DEFAULT_NUM_CODE_TO_WORD_QUESTIONS = 1;

  // Both modes
  const DEFAULT_CODE_LENGTH = 4;
  const DEFAULT_NUM_CODES_TO_MATCH = 4;
  const DEFAULT_NUM_ADDITIONAL_LETTERS = 2;
  const DEFAULT_NUM_GUESSES = 3;

  const [inProgress, setInProgress] = useState(true);
  const [guess, setGuess] = useState("");

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

  const STARTING_NUM_DISPLAY_CODES = props.gamemodeSettings?.numDisplayCodes ?? DEFAULT_NUM_DISPLAY_CODES;

  // Atleast the number of display codes
  const STARTING_NUM_DISPLAY_WORDS = Math.max(
    props.gamemodeSettings?.numDisplayWords ?? DEFAULT_NUM_DISPLAY_WORDS,
    STARTING_NUM_DISPLAY_CODES
  );

  const defaultGamemodeSettings = {
    numDisplayWords: STARTING_NUM_DISPLAY_WORDS,
    numDisplayCodes: STARTING_NUM_DISPLAY_CODES,
    numWordToCodeQuestions: props.gamemodeSettings?.numWordToCodeQuestions ?? DEFAULT_NUM_WORD_TO_CODE_QUESTIONS,
    numCodeToWordQuestions: props.gamemodeSettings?.numCodeToWordQuestions ?? DEFAULT_NUM_CODE_TO_WORD_QUESTIONS,

    codeLength: props.gamemodeSettings?.codeLength ?? DEFAULT_CODE_LENGTH,
    numCodesToMatch: props.gamemodeSettings?.numCodesToMatch ?? DEFAULT_NUM_CODES_TO_MATCH,
    numAdditionalLetters: props.gamemodeSettings?.numAdditionalLetters ?? DEFAULT_NUM_ADDITIONAL_LETTERS,
    numGuesses: props.gamemodeSettings?.numGuesses ?? DEFAULT_NUM_GUESSES,
    timerConfig: props.gamemodeSettings?.timerConfig ?? { isTimed: false },
  };

  const [gamemodeSettings, setGamemodeSettings] = useState<{
    numDisplayWords: number;
    numDisplayCodes: number;
    numWordToCodeQuestions: number;
    numCodeToWordQuestions: number;

    codeLength: number;
    numCodesToMatch: number;
    numAdditionalLetters: number;
    numGuesses: number;
    timerConfig: { isTimed: true; seconds: number } | { isTimed: false };
  }>(defaultGamemodeSettings);

  // Max number of characters permitted in a guess
  const MAX_LENGTH = gamemodeSettings.codeLength;

  const [remainingGuesses, setRemainingGuesses] = useState(gamemodeSettings.numGuesses);

  const DEFAULT_TIMER_VALUE = 100;
  const [remainingSeconds, setRemainingSeconds] = useState(
    props.gamemodeSettings?.timerConfig?.isTimed === true
      ? props.gamemodeSettings?.timerConfig.seconds
      : DEFAULT_TIMER_VALUE
  );

  const [mostRecentTotalSeconds, setMostRecentTotalSeconds] = useState(
    props.gamemodeSettings?.timerConfig?.isTimed === true
      ? props.gamemodeSettings?.timerConfig.seconds
      : DEFAULT_TIMER_VALUE
  );

  // Sounds
  const [playCorrectChimeSoundEffect] = useCorrectChime(props.settings);
  const [playFailureChimeSoundEffect] = useFailureChime(props.settings);
  const [playLightPingSoundEffect] = useLightPingChime(props.settings);
  const [playClickSoundEffect] = useClickChime(props.settings);

  // Reset game after change of settings (stops cheating by changing settings partway through a game)
  React.useEffect(() => {
    if (props.isCampaignLevel) {
      return;
    }

    ResetGame();

    // Save the latest gamemode settings for this mode
    SaveData.setWordCodesGamemodeSettings(props.mode, gamemodeSettings);
  }, [gamemodeSettings]);

  // (Guess) Timer Setup
  React.useEffect(() => {
    if (!gamemodeSettings.timerConfig.isTimed || !inProgress) {
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
  }, [setRemainingSeconds, remainingSeconds, gamemodeSettings.timerConfig.isTimed]);

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
    //const expectedWordCodesLength = props.mode === "match" ? gamemodeSettings.numCodesToMatch : gamemodeSettings.numDisplayWords;

    if (!wordCodes || wordCodes.length === 0 /*|| wordCodes.length !== expectedWordCodesLength*/) {
      return;
    }

    if (props.mode === "match") {
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
      let newDisplayWords = wordCodes.map((wordCode) => {
        return wordCode.word.toUpperCase();
      });
      newDisplayWords = shuffleArray(newDisplayWords);

      setDisplayWords(newDisplayWords);

      let newDisplayCodes = wordCodes.map((wordCode) => {
        return wordCode.code;
      });
      newDisplayCodes = shuffleArray(newDisplayCodes);

      // If there are more display words than display codes
      if (gamemodeSettings.numDisplayWords > gamemodeSettings.numDisplayCodes) {
        // Calculate how many codes should not be shown
        const numMissingCodes = Math.max(0, gamemodeSettings.numDisplayWords - gamemodeSettings.numDisplayCodes);
        if (newDisplayCodes.length > numMissingCodes) {
          // Remove some codes (so they are not shown)
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
    let targetWordArray = wordLengthMappingsTargets.find((x) => x.value === gamemodeSettings.codeLength)?.array!;

    // Single digit codes are given to each letter (so wordLength must be max of 9)
    if (!targetWordArray || gamemodeSettings.codeLength >= 10) {
      targetWordArray = wordLengthMappingsTargets.find((x) => x.value === DEFAULT_CODE_LENGTH)?.array!;
    }

    // Choose a random word from this array
    const originalWord = pickRandomElementFrom(targetWordArray);
    // The letters of this original word
    let validLetters = originalWord.split("");
    // How many valid letters at this point?
    const originalWordLength = validLetters.length;

    // Add some additional letters the  other words will be able to be made from (more letters should make the game harder)
    while (validLetters.length < originalWordLength + gamemodeSettings.numAdditionalLetters) {
      const randomLetter = pickRandomElementFrom(DEFAULT_ALPHABET);

      if (!validLetters.includes(randomLetter)) {
        validLetters.push(randomLetter);
      }
    }

    // Add a number code to each of the valid letters
    let letterCodes = validLetters.map((letter: string, index: number) => {
      return { letter: letter, code: index };
    });

    // Get only the words that can be made from these valid letters
    const originalMatches = targetWordArray.filter((word) => isWordValid(validLetters, word));

    const subsetSize = props.mode === "match" ? gamemodeSettings.numCodesToMatch : gamemodeSettings.numDisplayWords;
    // Choose/determine a subset of these words
    let wordSubset: string[] = [];
    let failCount = 0;

    while (wordSubset.length < subsetSize && failCount < 100) {
      const randomWord = pickRandomElementFrom(originalMatches);

      if (!wordSubset.includes(randomWord)) {
        wordSubset.push(randomWord);
      } else {
        failCount += 1;
      }
    }

    // Finds the code for a given word
    function getCode(word: string): string {
      const wordLetters = word.split("");
      let codeString = "";

      for (let i = 0; i < wordLetters.length; i++) {
        // Current letter of word
        const letter = wordLetters[i];
        // Find code from lookup table
        const letterCode = letterCodes
          .find((letterCodeCombination: { letter: string; code: number }) => letterCodeCombination.letter === letter)
          ?.code.toString();
        // Append to code string for entire word
        codeString += letterCode;
      }

      return codeString;
    }

    // Determine the code for each of the chosen words
    const newWordCodes = wordSubset.map((word) => {
      return { word: word, code: getCode(word) };
    });

    setWordCodes(newWordCodes);

    if (props.mode === "question") {
      // Choose/determine a subset of valid words
      let questionWordSubset: string[] = [];

      // Add one of the displayed words as a question (convert some of the provided information instead of new information)
      if (gamemodeSettings.numWordToCodeQuestions > 0) {
        const randomWord = pickRandomElementFrom(wordSubset);
        questionWordSubset.push(randomWord);
      }

      // Number of word codes that need to be generated (for questions)
      const numQuestions = gamemodeSettings.numCodeToWordQuestions + gamemodeSettings.numWordToCodeQuestions;

      let failCount = 0;

      while (questionWordSubset.length < numQuestions && failCount < 100) {
        const randomWord = pickRandomElementFrom(originalMatches);

        // Not a word used already (either for the information provided or already used for questions)
        if (!questionWordSubset.includes(randomWord) && !wordSubset.includes(randomWord)) {
          questionWordSubset.push(randomWord);
        } else {
          failCount += 1;
        }
      }

      // Determine the code for each of the chosen words
      const newQuestionWordCodes = questionWordSubset.map((word, index) => {
        const isWordToCode = index < gamemodeSettings.numWordToCodeQuestions;
        return { word: word, code: getCode(word), isWordToCode: isWordToCode };
      });

      console.log(newQuestionWordCodes);

      setQuestionWordCodes(newQuestionWordCodes);
    }
  }

  // Textual information for questions gamemode
  function displayInformation() {
    if (props.mode !== "question") {
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

    const targetCodePlaceholder = Array.from({ length: gamemodeSettings.codeLength })
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
    if (props.mode !== "question") {
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

    if (props.mode !== "question") {
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
    if (props.mode !== "match") {
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
    if (props.mode !== "match") {
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

    if (props.mode === "question" && !questionWordCodes) {
      return;
    }

    let message_notification;

    if (props.mode === "match") {
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
            {props.isCampaignLevel ? LEVEL_FINISHING_TEXT : "Restart"}
          </Button>
        </>
      );
    } else if (props.mode === "question") {
      const successCondition = isGuessCorrect();

      // The number of questions in this set of questions
      const numQuestions = gamemodeSettings.numWordToCodeQuestions + gamemodeSettings.numCodeToWordQuestions;
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
                {props.isCampaignLevel ? LEVEL_FINISHING_TEXT : "Restart"}
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
    // TODO: wasCorrect
    props.onComplete?.(true);
    setGuess("");
    setInProgress(true);
    setWordTiles([]);
    setCodeTiles([]);
    setWordCodes([]);
    setRemainingGuesses(gamemodeSettings.numGuesses);
    setDisplayCodes([]);
    setDisplayWords([]);
    setNumCorrectAnswers(0);
    setQuestionNumber(0);
    setQuestionWordCodes([]);

    if (gamemodeSettings.timerConfig.isTimed) {
      // Reset the timer if it is enabled in the game options
      setRemainingSeconds(gamemodeSettings.timerConfig.seconds);
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

  function generateSettingsOptions(): React.ReactNode {
    const MIN_NUM_DISPLAY_WORDS = Math.max(2, gamemodeSettings.numDisplayCodes + 1);
    const MAX_NUM_DISPLAY_WORDS = 10;
    const MIN_NUMBER_DISPLAY_CODES = 2;
    const MAX_NUM_DISPLAY_CODES = gamemodeSettings.numDisplayWords - 1;

    return (
      <>
        {props.mode !== "match" && (
          <label>
            <input
              type="number"
              value={gamemodeSettings.numDisplayWords}
              min={MIN_NUM_DISPLAY_WORDS}
              max={MAX_NUM_DISPLAY_WORDS}
              onChange={(e) => {
                setRemainingGuesses(e.target.valueAsNumber);
                const newGamemodeSettings = {
                  ...gamemodeSettings,
                  numDisplayWords: e.target.valueAsNumber,
                };
                setGamemodeSettings(newGamemodeSettings);
              }}
            ></input>
            Number of display words
          </label>
        )}

        {props.mode !== "match" && (
          <label>
            <input
              type="number"
              value={gamemodeSettings.numDisplayCodes}
              min={MIN_NUMBER_DISPLAY_CODES}
              max={MAX_NUM_DISPLAY_CODES}
              onChange={(e) => {
                setRemainingGuesses(e.target.valueAsNumber);
                const newGamemodeSettings = {
                  ...gamemodeSettings,
                  numDisplayCodes: e.target.valueAsNumber,
                };
                setGamemodeSettings(newGamemodeSettings);
              }}
            ></input>
            Number of display codes
          </label>
        )}

        {props.mode !== "match" && (
          <label>
            <input
              type="number"
              value={gamemodeSettings.numWordToCodeQuestions}
              min={1}
              max={10}
              onChange={(e) => {
                setRemainingGuesses(e.target.valueAsNumber);
                const newGamemodeSettings = {
                  ...gamemodeSettings,
                  numWordToCodeQuestions: e.target.valueAsNumber,
                };
                setGamemodeSettings(newGamemodeSettings);
              }}
            ></input>
            Number of word to code questions
          </label>
        )}

        {props.mode !== "match" && (
          <label>
            <input
              type="number"
              value={gamemodeSettings.numCodeToWordQuestions}
              min={1}
              max={10}
              onChange={(e) => {
                setRemainingGuesses(e.target.valueAsNumber);
                const newGamemodeSettings = {
                  ...gamemodeSettings,
                  numCodeToWordQuestions: e.target.valueAsNumber,
                };
                setGamemodeSettings(newGamemodeSettings);
              }}
            ></input>
            Number of code to word questions
          </label>
        )}

        <label>
          <input
            type="number"
            value={gamemodeSettings.codeLength}
            min={2}
            max={10}
            onChange={(e) => {
              setRemainingGuesses(e.target.valueAsNumber);
              const newGamemodeSettings = {
                ...gamemodeSettings,
                codeLength: e.target.valueAsNumber,
              };
              setGamemodeSettings(newGamemodeSettings);
            }}
          ></input>
          Code Length
        </label>
        <label>
          <input
            type="number"
            value={gamemodeSettings.numCodesToMatch}
            min={1}
            max={10}
            onChange={(e) => {
              setRemainingGuesses(e.target.valueAsNumber);
              const newGamemodeSettings = {
                ...gamemodeSettings,
                numCodes: e.target.valueAsNumber,
              };
              setGamemodeSettings(newGamemodeSettings);
            }}
          ></input>
          Number of codes
        </label>
        <label>
          <input
            type="number"
            value={gamemodeSettings.numAdditionalLetters}
            min={1}
            max={10}
            onChange={(e) => {
              setRemainingGuesses(e.target.valueAsNumber);
              const newGamemodeSettings = {
                ...gamemodeSettings,
                numAdditionalLetters: e.target.valueAsNumber,
              };
              setGamemodeSettings(newGamemodeSettings);
            }}
          ></input>
          Number of additional letters
        </label>
        <label>
          <input
            type="number"
            value={gamemodeSettings.numGuesses}
            min={1}
            max={10}
            onChange={(e) => {
              setRemainingGuesses(e.target.valueAsNumber);
              const newGamemodeSettings = {
                ...gamemodeSettings,
                numGuesses: e.target.valueAsNumber,
              };
              setGamemodeSettings(newGamemodeSettings);
            }}
          ></input>
          Number of guesses
        </label>
        <label>
          <input
            checked={gamemodeSettings.timerConfig.isTimed}
            type="checkbox"
            onChange={() => {
              // If currently timed, on change, make the game not timed and vice versa
              const newTimer: { isTimed: true; seconds: number } | { isTimed: false } = gamemodeSettings.timerConfig
                .isTimed
                ? { isTimed: false }
                : { isTimed: true, seconds: mostRecentTotalSeconds };
              const newGamemodeSettings = { ...gamemodeSettings, timerConfig: newTimer };
              setGamemodeSettings(newGamemodeSettings);
            }}
          ></input>
          Timer
        </label>
        {gamemodeSettings.timerConfig.isTimed && (
          <label>
            <input
              type="number"
              value={gamemodeSettings.timerConfig.seconds}
              min={10}
              max={120}
              step={5}
              onChange={(e) => {
                setRemainingSeconds(e.target.valueAsNumber);
                setMostRecentTotalSeconds(e.target.valueAsNumber);
                const newGamemodeSettings = {
                  ...gamemodeSettings,
                  timerConfig: { isTimed: true, seconds: e.target.valueAsNumber },
                };
                setGamemodeSettings(newGamemodeSettings);
              }}
            ></input>
            Seconds
          </label>
        )}
      </>
    );
  }

  return (
    <div
      className="App word_codes"
      style={{ backgroundImage: `url(${props.theme.backgroundImageSrc})`, backgroundSize: "100% 100%" }}
    >
      {!props.isCampaignLevel && (
        <div className="gamemodeSettings">
          <GamemodeSettingsMenu>{generateSettingsOptions()}</GamemodeSettingsMenu>
        </div>
      )}

      <div className="outcome">{displayOutcome()}</div>

      {Boolean(props.mode === "match" && inProgress) && (
        <MessageNotification type="default">{`Guesses left: ${remainingGuesses}`}</MessageNotification>
      )}

      {props.mode === "match" && <div className="tile_row">{displayTiles()}</div>}
      {Boolean(props.mode === "match" && inProgress) && (
        <Button
          mode={remainingGuesses <= 1 ? "accept" : "default"}
          settings={props.settings}
          onClick={() => checkTiles()}
        >
          Submit guess
        </Button>
      )}

      {props.mode !== "match" && <div className="word_codes_information">{displayInformation()}</div>}
      {props.mode !== "match" && displayQuestion()}
      {props.mode !== "match" && (
        <div className="guess">
          <LetterTile
            letter={guess}
            status={inProgress ? "not set" : isGuessCorrect() ? "correct" : "incorrect"}
            settings={props.settings}
          ></LetterTile>
        </div>
      )}
      {Boolean(props.mode !== "match" && questionWordCodes[questionNumber]?.isWordToCode) && (
        <NumPad
          onEnter={() => setInProgress(false)}
          onBackspace={onBackspace}
          onSubmitNumber={onSubmitNumber}
          settings={props.settings}
          disabled={!inProgress}
          showKeyboard={props.settings.gameplay.keyboard}
        />
      )}
      {Boolean(props.mode !== "match" && !questionWordCodes[questionNumber]?.isWordToCode) && (
        <Keyboard
          onEnter={() => setInProgress(false)}
          onBackspace={onBackspace}
          settings={props.settings}
          onSubmitLetter={onSubmitLetter}
          targetWord=""
          mode={"WordCodes/Match"}
          guesses={[]}
          letterStatuses={[]}
          inDictionary
          disabled={!inProgress}
          showKeyboard={props.settings.gameplay.keyboard}
        />
      )}
      <div>
        {gamemodeSettings.timerConfig.isTimed && (
          <ProgressBar
            progress={remainingSeconds}
            total={gamemodeSettings.timerConfig.seconds}
            display={{ type: "transition", colorTransition: GreenToRedColorTransition }}
          ></ProgressBar>
        )}
      </div>
    </div>
  );
};

export default WordCodes;
