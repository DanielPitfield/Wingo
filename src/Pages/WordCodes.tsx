import React, { useState } from "react";
import { DEFAULT_ALPHABET } from "./WingoConfig";
import { PagePath } from "../Data/PageNames";
import Button from "../Components/Button";
import Keyboard from "../Components/Keyboard";
import LetterTile from "../Components/LetterTile";
import MessageNotification from "../Components/MessageNotification";
import NumPad from "../Components/NumPad";
import ProgressBar, { GreenToRedColorTransition } from "../Components/ProgressBar";
import { useClickChime, useCorrectChime, useFailureChime, useLightPingChime } from "../Data/Sounds";
import { Theme } from "../Data/Themes";
import DraggableItem from "../Components/DraggableItem";
import { LEVEL_FINISHING_TEXT } from "../Components/Level";
import { MAX_CODE_LENGTH } from "../Data/GamemodeSettingsInputLimits";
import { shuffleArray } from "../Helpers/shuffleArray";
import { getAllWordsOfLength } from "../Helpers/getWordsOfLength";
import { getGamemodeDefaultTimerValue } from "../Helpers/getGamemodeDefaultTimerValue";
import { getGamemodeDefaultWordLength } from "../Helpers/getGamemodeDefaultWordLength";
import { getQuestionSetOutcome } from "../Helpers/getQuestionSetOutcome";
import { getRandomElementFrom } from "../Helpers/getRandomElementFrom";
import { getNewGamemodeSettingValue } from "../Helpers/getGamemodeSettingsNewValue";
import WordCodesGamemodeSettings from "../Components/GamemodeSettingsOptions/WordCodesGamemodeSettings";
import { useLocation } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { SettingsData } from "../Data/SaveData/Settings";
import { setMostRecentWordCodesGamemodeSettings } from "../Data/SaveData/MostRecentGamemodeSettings";
import { useCountdown } from "usehooks-ts";

const wordCodesModes = ["match", "question"] as const;
export type wordCodesMode = typeof wordCodesModes[number];

type WordTile = { id: number; word: string; code: string; status: "incorrect" | "correct" | "not set" };
type CodeTile = { id: number; code: string; status: "incorrect" | "correct" | "not set" };

export interface WordCodesProps {
  campaignConfig:
    | {
        isCampaignLevel: true;
        // How many expressions must be ordered/matched correctly to pass the campaign level?
        targetScore: number;
      }
    | { isCampaignLevel: false };

  /* 
  Question mode - there can be more words provided than codes, answer questions converting between words and codes
  Match mode - same number of words as codes, match them together
  */
  mode: wordCodesMode;

  gamemodeSettings: {
    // Both modes
    codeLength: number;
    numAdditionalLetters: number;
    startingNumGuesses: number;
    timerConfig: { isTimed: true; seconds: number } | { isTimed: false };

    // Question mode only settings
    numDisplayWords: number;
    numDisplayCodes: number;
    numWordToCodeQuestions: number;
    numCodeToWordQuestions: number;

    // Match mode only setting
    numCodesToMatch: number;
  };
}

interface Props extends WordCodesProps {
  theme: Theme;
  settings: SettingsData;
  setTheme: (theme: Theme) => void;
  addGold: (gold: number) => void;
  onComplete: (wasCorrect: boolean) => void;
}

const WordCodes = (props: Props) => {
  const location = useLocation().pathname as PagePath;

  const [keyboardDisabled, setKeyboardDisabled] = useState(false);

  // dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [inProgress, setInProgress] = useState(true);
  const [guess, setGuess] = useState("");

  // Generated words along with their respective codes
  const [wordCodes, setWordCodes] = useState<{ word: string; code: string }[]>([]);

  const [parent] = useAutoAnimate<HTMLDivElement>();

  // Tiles for match gamemode
  const [wordTiles, setWordTiles] = useState<WordTile[]>([]);
  const [codeTiles, setCodeTiles] = useState<CodeTile[]>([]);

  // Display information for questions gamemode
  const [displayWords, setDisplayWords] = useState<string[]>([]);
  const [displayCodes, setDisplayCodes] = useState<string[]>([]);

  // Questions
  const [questionWordCodes, setQuestionWordCodes] = useState<{ word: string; code: string; isWordToCode: boolean }[]>(
    []
  );
  const [questionIndex, setQuestionIndex] = useState(0);
  const [numCorrectAnswers, setNumCorrectAnswers] = useState(0);

  const [gamemodeSettings, setGamemodeSettings] = useState<WordCodesProps["gamemodeSettings"]>(props.gamemodeSettings);

  const [remainingGuesses, setRemainingGuesses] = useState(gamemodeSettings.startingNumGuesses);

  // The starting/total time of the timer
  const [totalSeconds, setTotalSeconds] = useState(
    props.gamemodeSettings?.timerConfig?.isTimed === true
      ? props.gamemodeSettings?.timerConfig?.seconds
      : getGamemodeDefaultTimerValue(location)
  );

  // How many seconds left on the timer?
  const [remainingSeconds, { startCountdown, stopCountdown, resetCountdown }] = useCountdown({
    countStart: totalSeconds,
    intervalMs: 1000,
  });

  // Sounds
  const [playCorrectChimeSoundEffect] = useCorrectChime(props.settings);
  const [playFailureChimeSoundEffect] = useFailureChime(props.settings);
  const [playLightPingSoundEffect] = useLightPingChime(props.settings);
  const [playClickSoundEffect] = useClickChime(props.settings);

  // Reset game after change of settings (stops cheating by changing settings partway through a game)
  React.useEffect(() => {
    if (props.campaignConfig.isCampaignLevel) {
      return;
    }

    ResetGame();

    // Save the latest gamemode settings for this mode
    setMostRecentWordCodesGamemodeSettings(location, gamemodeSettings);
  }, [gamemodeSettings]);

  // Validate the value of props.gamemodeSettings.numDisplayWords
  React.useEffect(() => {
    // Atleast the number of display codes
    const newNumDisplayWords = Math.max(props.gamemodeSettings.numDisplayWords, props.gamemodeSettings.numDisplayCodes);

    const newGamemodeSettings = {
      ...gamemodeSettings,
      newDisplayWords: newNumDisplayWords,
    };

    setGamemodeSettings(newGamemodeSettings);
  }, [props.gamemodeSettings.numDisplayWords, props.gamemodeSettings.numDisplayCodes]);

  // Validate the value of props.gamemodeSettings.codeLength
  React.useEffect(() => {
    const newCodeLength = Math.min(props.gamemodeSettings.codeLength, MAX_CODE_LENGTH);

    const newGamemodeSettings = {
      ...gamemodeSettings,
      codeLength: newCodeLength,
    };

    setGamemodeSettings(newGamemodeSettings);
  }, [props.gamemodeSettings.codeLength]);

  // Start timer (any time the toggle is enabled or the totalSeconds is changed)
  React.useEffect(() => {
    if (!inProgress) {
      return;
    }

    if (!gamemodeSettings.timerConfig.isTimed) {
      return;
    }

    startCountdown();
  }, [inProgress, gamemodeSettings.timerConfig.isTimed, totalSeconds]);

  // Check remaining seconds on timer
  React.useEffect(() => {
    if (!inProgress) {
      return;
    }

    if (!gamemodeSettings.timerConfig.isTimed) {
      return;
    }

    if (remainingSeconds <= 0) {
      stopCountdown();
      playFailureChimeSoundEffect();
      setInProgress(false);
    }
  }, [inProgress, gamemodeSettings.timerConfig.isTimed, remainingSeconds]);

  // Each time a guess is submitted
  React.useEffect(() => {
    if (inProgress) {
      return;
    }

    if (isCurrentGuessCorrect()) {
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

    // Single digit codes can only be given to a maximum of 9 letters
    if (gamemodeSettings.codeLength > MAX_CODE_LENGTH) {
      // Set code length to default gamemode settings value
      const newGamemodeSettings = {
        ...gamemodeSettings,
        codeLength: getGamemodeDefaultWordLength(location),
      };
      setGamemodeSettings(newGamemodeSettings);
    }

    // Sets display/information word codes (and question word codes if that gamemode)
    determineWordCodes();
  }, [ResetGame]);

  // Update tiles or display information (each time wordCodes changes)
  React.useEffect(() => {
    if (!wordCodes) {
      return;
    }

    if (props.mode === "match") {
      // Word Tiles
      const newWordTiles: WordTile[] = wordCodes.map((wordCode, index) => ({
        id: index + 1,
        ...wordCode,
        status: "not set",
      }));

      setWordTiles(shuffleArray(newWordTiles));

      // Code tiles
      const newCodeTiles: CodeTile[] = wordCodes.map((wordCode, index) => ({
        id: index + 1,
        code: wordCode.code,
        status: "not set",
      }));

      setCodeTiles(shuffleArray(newCodeTiles));
    }

    if (props.mode === "question") {
      const newDisplayWords = wordCodes.map((wordCode) => {
        return wordCode.word.toUpperCase();
      });

      setDisplayWords(shuffleArray(newDisplayWords));

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

  // Determines whether a word only contains the specified valid letters
  function isWordValid(validLetters: string[], word: string) {
    // Letters of the word being checked
    const wordLetters = word.split("");

    return wordLetters.every((letter) => validLetters.includes(letter));
  }

  function getValidLetters(wordArray: string[]) {
    // Get the letters of a random word from the array
    const validLetters = getRandomElementFrom(wordArray).split("");

    if (validLetters.length < MAX_CODE_LENGTH) {
      // How many more letters can be added beofre reaching the max limit?
      const MAX_NUM_ADDITIONAL_LETTERS = Math.abs(MAX_CODE_LENGTH - validLetters.length);
      const numAdditionalLetters = Math.min(gamemodeSettings.numAdditionalLetters, MAX_NUM_ADDITIONAL_LETTERS);
      // The determined amount of new letters
      const additionalLetters = shuffleArray(DEFAULT_ALPHABET.filter((letter) => !validLetters.includes(letter))).slice(
        0,
        numAdditionalLetters
      );
      validLetters.concat(additionalLetters);
    }

    return validLetters;
  }

  function getLetterCodes(validLetters: string[]): { letter: string; code: number }[] {
    // Add a number code to each of the valid letters
    return validLetters.map((letter: string, index: number) => {
      return { letter: letter, code: index };
    });
  }

  // Finds the code for a given word
  function getCode(word: string, letterCodes: { letter: string; code: number }[]): string {
    const wordLetters = word.split("");
    const wordLetterCodes = wordLetters.map((letter) =>
      letterCodes
        .find((letterCodeCombination: { letter: string; code: number }) => letterCodeCombination.letter === letter)
        ?.code.toString()
    );
    return wordLetterCodes.join("");
  }

  function determineWordCodes() {
    const targetWordArray = getAllWordsOfLength(gamemodeSettings.codeLength);

    const validLetters = getValidLetters(targetWordArray);
    const letterCodes = getLetterCodes(validLetters);

    // Get only the words that can be made from the valid letters
    const originalMatches = targetWordArray.filter((word) => isWordValid(validLetters, word));

    const subsetSize = props.mode === "match" ? gamemodeSettings.numCodesToMatch : gamemodeSettings.numDisplayWords;
    const wordSubset = shuffleArray(originalMatches).slice(0, subsetSize);

    // Determine the code for each of the chosen words
    const newWordCodes = wordSubset.map((word) => {
      return { word: word, code: getCode(word, letterCodes) };
    });

    setWordCodes(newWordCodes);

    if (props.mode === "question") {
      const questionWordSubset = gamemodeSettings.numWordToCodeQuestions > 0 ? [getRandomElementFrom(wordSubset)] : [];

      // How many more words for questions are needed?
      const numQuestions =
        gamemodeSettings.numCodeToWordQuestions + gamemodeSettings.numWordToCodeQuestions - questionWordSubset.length;

      // Determined the additional words
      const originalMatchesSubset = shuffleArray(originalMatches).slice(0, numQuestions);
      // Add them to subset
      questionWordSubset.concat(originalMatchesSubset);

      // Determine the code for each of the chosen words
      const newQuestionWordCodes = questionWordSubset.map((word, index) => {
        const isWordToCode = index < gamemodeSettings.numWordToCodeQuestions;
        return { word: word, code: getCode(word, letterCodes), isWordToCode: isWordToCode };
      });

      console.log(newQuestionWordCodes);

      setQuestionWordCodes(newQuestionWordCodes);
    }
  }

  // Textual information for questions gamemode
  const QuestionProvidedInformation = () => {
    if (props.mode !== "question") {
      return null;
    }

    if (!displayWords) {
      return null;
    }

    if (!displayCodes) {
      return null;
    }

    // Word code for the current question
    const currentQuestion = getCurrentQuestion();

    if (!currentQuestion) {
      return null;
    }

    const targetCodePlaceholder = Array.from({ length: gamemodeSettings.codeLength })
      .map((x) => "?")
      .join("");

    const displayCodesWithPlaceholder = displayCodes.slice();

    if (!displayCodesWithPlaceholder.includes(targetCodePlaceholder) && displayCodes.length > 0) {
      displayCodes.splice(displayWords.indexOf(currentQuestion.word.toUpperCase()), 0, targetCodePlaceholder);
    }

    return (
      <div className="word_codes_information">
        <div className="word_codes_words">{displayWords.join("  ")}</div>
        <div className="word_codes_codes">{displayCodesWithPlaceholder.join("  ")}</div>
      </div>
    );
  };

  const Question = () => {
    if (props.mode !== "question") {
      return null;
    }

    // Word code for the current question
    const currentQuestion = getCurrentQuestion();

    if (!currentQuestion) {
      return null;
    }

    // Word to Code questions first
    if (currentQuestion.isWordToCode) {
      return (
        <div className="word_codes_question">
          Find the code for the word <strong>{currentQuestion.word.toUpperCase()}</strong>
        </div>
      );
    }

    // Code to Word
    if (!currentQuestion.isWordToCode) {
      return (
        <div className="word_codes_question">
          Find the word that has the number code <strong>{currentQuestion.code}</strong>
        </div>
      );
    }

    return null;
  };

  const getCurrentQuestion = () => {
    return questionWordCodes[questionIndex];
  };

  const isCurrentGuessCorrect = () => {
    if (props.mode === "match") {
      const numCorrectTiles = wordTiles.filter((x) => x.status === "correct").length;
      return numCorrectTiles === getTotalNumQuestions();
    }

    const currentQuestion = getCurrentQuestion();

    if (props.mode === "question" && currentQuestion.isWordToCode) {
      return guess.toUpperCase() === currentQuestion.code.toUpperCase();
    }

    if (props.mode === "question" && !currentQuestion.isWordToCode) {
      return guess.toUpperCase() === currentQuestion.word.toUpperCase();
    }
  };

  function handleDragEnd<
    T extends { id: number },
    TOpposite extends { id: number; status: "incorrect" | "correct" | "not set" }
  >(
    event: DragEndEvent,
    // tiles uses generic type (which extends id as a general constraint)
    tiles: T[],
    // oppositeTiles uses another generic type (with id and status as general constraints)
    oppositeTiles: TOpposite[],
    setTiles: (tiles: T[]) => void,
    setOppositeTiles: (oppositeTiles: TOpposite[]) => void
  ) {
    const { active, over } = event;

    // Drag was started but the order of the tiles wasn't changed
    if (active.id === over?.id) {
      return;
    }

    // The tile which is being dragged
    const oldTile: T | undefined = tiles.find((tile) => tile.id === active.id);
    // The tile below where the tile being dragged has been dragged to
    const newTile: T | undefined = tiles.find((tile) => tile.id === over?.id);

    // Either of the required tiles for the switch to be made are missing
    if (!oldTile || !newTile) {
      return;
    }

    // Find the indexes of the tiles within the wordTiles array
    const oldIndex: number = tiles.indexOf(oldTile);
    const newIndex: number = tiles.indexOf(newTile);

    // Switch the positions of the tiles (using the indexes)
    const newTiles: T[] = arrayMove(tiles, oldIndex, newIndex);

    // Reset status of tiles when moved
    setTiles(newTiles.map((tile) => ({ ...tile, status: "not set" })));
    setOppositeTiles(oppositeTiles.map((tile) => ({ ...tile, status: "not set" })));
  }

  const MatchTiles = () => {
    if (props.mode !== "match") {
      return null;
    }

    const draggableWordTiles = (
      <div className="draggable_words" ref={parent}>
        {wordTiles.map((tile) => (
          <DraggableItem key={tile.id} id={tile.id}>
            <LetterTile letter={tile.word} status={tile.status} settings={props.settings} />
          </DraggableItem>
        ))}
      </div>
    );

    const draggableCodeTiles = (
      <div className="draggable_codes" ref={parent}>
        {codeTiles.map((tile) => (
          <DraggableItem key={tile.id} id={tile.id}>
            <LetterTile letter={tile.code} status={tile.status} settings={props.settings} />
          </DraggableItem>
        ))}
      </div>
    );

    return (
      <div className="tile_row">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(event) => handleDragEnd(event, wordTiles, codeTiles, setWordTiles, setCodeTiles)}
        >
          <SortableContext items={wordTiles} strategy={verticalListSortingStrategy}>
            {draggableWordTiles}
          </SortableContext>
        </DndContext>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(event) => handleDragEnd(event, codeTiles, wordTiles, setCodeTiles, setWordTiles)}
        >
          <SortableContext items={codeTiles} strategy={verticalListSortingStrategy}>
            {draggableCodeTiles}
          </SortableContext>
        </DndContext>
      </div>
    );
  };

  function checkTiles() {
    if (props.mode !== "match") {
      return;
    }

    const newWordTiles: WordTile[] = wordTiles.map((tile, index) => {
      // Word matches with code
      const isTileCorrect = wordTiles[index].code === codeTiles[index].code;
      tile.status = isTileCorrect ? "correct" : "incorrect";
      return tile;
    });

    const newCodeTiles: CodeTile[] = codeTiles.map((tile, index) => {
      // Word matches with code
      const isTileCorrect = wordTiles[index].code === codeTiles[index].code;
      tile.status = isTileCorrect ? "correct" : "incorrect";
      return tile;
    });

    // Set so that the change in statuses are rendered
    setWordTiles(newWordTiles);
    setCodeTiles(newCodeTiles);

    // Are all the tiles in the correct position?
    const allCorrect = newWordTiles.filter((x) => x.status === "correct").length === getTotalNumQuestions();

    // Or on last remaining guess
    if (allCorrect || remainingGuesses <= 1) {
      // Game over
      setInProgress(false);
    } else {
      // Otherwise, decrease number of guesses left
      setRemainingGuesses(remainingGuesses - 1);
    }
  }

  const getTotalNumQuestions = () => {
    if (props.mode === "match") {
      return wordTiles.length ?? 0;
    }

    if (props.mode === "question") {
      return gamemodeSettings.numWordToCodeQuestions + gamemodeSettings.numCodeToWordQuestions;
    }

    return 0;
  };

  // Has the last wordCode been guessed/attempted?
  const isGameOver = () => {
    // Is the current question the last question?
    const isLastQuestion = questionIndex === getTotalNumQuestions() - 1;

    return !inProgress && isLastQuestion;
  };

  const Outcome = () => {
    if (inProgress) {
      return null;
    }

    const restartButton = (
      <Button mode="accept" settings={props.settings} onClick={() => ResetGame()} additionalProps={{ autoFocus: true }}>
        {props.campaignConfig.isCampaignLevel ? LEVEL_FINISHING_TEXT : "Restart"}
      </Button>
    );

    if (props.mode === "match") {
      const numCorrectTiles = wordTiles.filter((x) => x.status === "correct").length;

      // Show how many tiles are in correct position
      return (
        <>
          <MessageNotification type={isCurrentGuessCorrect() ? "success" : "error"}>
            <strong>
              {isCurrentGuessCorrect() ? "All tiles in the correct order!" : `${numCorrectTiles} tiles correct`}
            </strong>
            <br />

            {!isCurrentGuessCorrect() && (
              <span>
                The answers were:
                <strong>
                  {wordTiles.map((tile) => {
                    return (
                      <>
                        <br />
                        {`${tile.word} ${tile.code}`}
                      </>
                    );
                  })}
                </strong>
              </span>
            )}
          </MessageNotification>
          <br />
          {restartButton}
        </>
      );
    }

    const currentQuestionOutcome = (
      <MessageNotification type={isCurrentGuessCorrect() ? "success" : "error"}>
        <strong>{isCurrentGuessCorrect() ? "Correct!" : "Incorrect!"}</strong>
        <br />

        {!isCurrentGuessCorrect() && (
          <span>
            The answer was
            <strong>{getCurrentQuestion().isWordToCode ? getCurrentQuestion().code : getCurrentQuestion().word}</strong>
          </span>
        )}
        <br />

        <span>{`${questionIndex + 1} / ${getTotalNumQuestions()} questions completed`}</span>
      </MessageNotification>
    );

    // The number of correct answers needed for a successful outcome
    const targetScore = props.campaignConfig.isCampaignLevel
      ? Math.min(props.campaignConfig.targetScore, getTotalNumQuestions())
      : getTotalNumQuestions();

    // When the game has finished, show the number of correct answers
    const overallOutcome = (
      <MessageNotification
        type={getQuestionSetOutcome(numCorrectAnswers, targetScore, props.campaignConfig.isCampaignLevel)}
      >
        <strong>{`${numCorrectAnswers} / ${getTotalNumQuestions()} correct`}</strong>
      </MessageNotification>
    );

    const continueButton = (
      <Button
        mode="accept"
        onClick={() => ContinueGame()}
        settings={props.settings}
        additionalProps={{ autoFocus: true }}
      >
        Next
      </Button>
    );

    // If no more questions, show restart button, otherwise show continue button
    const nextButton = isGameOver() ? restartButton : continueButton;

    if (props.mode === "question") {
      return (
        <>
          {isGameOver() && overallOutcome}
          {currentQuestionOutcome}
          {nextButton}
        </>
      );
    }

    return null;
  };

  // Restart with new word codes and set of questions
  function ResetGame() {
    if (!inProgress) {
      const score = props.mode === "match" ? wordTiles.filter((x) => x.status === "correct").length : numCorrectAnswers;

      // Achieved target score if a campaign level, otherwise just all answers were correct
      const wasCorrect = props.campaignConfig.isCampaignLevel
        ? score >= Math.min(props.campaignConfig.targetScore, getTotalNumQuestions())
        : score === getTotalNumQuestions();

      props.onComplete(wasCorrect);
    }

    setGuess("");
    setInProgress(true);

    setWordTiles([]);
    setCodeTiles([]);

    setWordCodes([]);
    setQuestionWordCodes([]);

    setDisplayCodes([]);
    setDisplayWords([]);

    setNumCorrectAnswers(0);
    setRemainingGuesses(gamemodeSettings.startingNumGuesses);
    setQuestionIndex(0);

    if (gamemodeSettings.timerConfig.isTimed) {
      // Reset the timer if it is enabled in the game options
      resetCountdown();
    }
  }

  // Next question
  function ContinueGame() {
    setInProgress(true);
    setGuess("");
    setQuestionIndex(questionIndex + 1);
  }

  const InputMethod = () => {
    // No input method, the tiles are just dragged and dropped
    if (props.mode === "match") {
      return null;
    }

    if (!getCurrentQuestion()) {
      return null;
    }

    // Guess will be a code, need a NumPad
    if (getCurrentQuestion().isWordToCode) {
      return (
        <NumPad
          onEnter={() => setInProgress(false)}
          onBackspace={onBackspace}
          onSubmitNumber={onSubmitNumber}
          settings={props.settings}
          disabled={keyboardDisabled || !inProgress}
          hasBackspace={true}
          hasEnter={true}
        />
      );
    }

    // Guess will be a word, need a keyboard
    if (!getCurrentQuestion().isWordToCode) {
      return (
        <Keyboard
          onEnter={() => setInProgress(false)}
          onBackspace={onBackspace}
          settings={props.settings}
          onSubmitLetter={onSubmitLetter}
          targetWord={""}
          guesses={[]}
          letterStatuses={[]}
          inDictionary
          disabled={keyboardDisabled || !inProgress}
          hasBackspace={true}
          hasEnter={true}
        />
      );
    }

    return null;
  };

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

    // Max number of characters permitted in a guess (answer can't be any longer than the code length)
    if (guess.length >= gamemodeSettings.codeLength) {
      return;
    }

    setGuess(guess + letter);
  }

  function onSubmitNumber(number: number) {
    if (!inProgress) {
      return;
    }

    // Max number of characters permitted in a guess (answer can't be any longer than the code length)
    if (guess.length >= gamemodeSettings.codeLength) {
      return;
    }

    setGuess(`${guess}${number}`);
  }

  const handleTimerToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGamemodeSettings: WordCodesProps["gamemodeSettings"] = {
      ...gamemodeSettings,
      timerConfig: e.target.checked ? { isTimed: true, seconds: totalSeconds } : { isTimed: false },
    };

    setGamemodeSettings(newGamemodeSettings);
  };

  const handleSimpleGamemodeSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGamemodeSettings: WordCodesProps["gamemodeSettings"] = {
      ...gamemodeSettings,
      [e.target.name]: getNewGamemodeSettingValue(e),
    };

    setGamemodeSettings(newGamemodeSettings);
  };

  return (
    <div
      className="App word_codes"
      style={{ backgroundImage: `url(${props.theme.backgroundImageSrc})`, backgroundSize: "100% 100%" }}
    >
      {!props.campaignConfig.isCampaignLevel && (
        <div className="gamemodeSettings">
          <WordCodesGamemodeSettings
            mode={props.mode}
            gamemodeSettings={gamemodeSettings}
            handleSimpleGamemodeSettingsChange={handleSimpleGamemodeSettingsChange}
            handleTimerToggle={handleTimerToggle}
            setRemainingGuesses={setRemainingGuesses}
            resetCountdown={resetCountdown}
            setTotalSeconds={setTotalSeconds}
            onLoadPresetGamemodeSettings={setGamemodeSettings}
            onShowOfAddPresetModal={() => setKeyboardDisabled(true)}
            onHideOfAddPresetModal={() => setKeyboardDisabled(false)}
          />
        </div>
      )}

      <Outcome />

      {Boolean(props.mode === "match" && inProgress) && (
        <MessageNotification type="default">{`Guesses left: ${remainingGuesses}`}</MessageNotification>
      )}

      <MatchTiles />

      {Boolean(props.mode === "match" && inProgress) && (
        <Button
          mode={remainingGuesses <= 1 ? "accept" : "default"}
          settings={props.settings}
          onClick={() => checkTiles()}
        >
          Submit guess
        </Button>
      )}

      <QuestionProvidedInformation />
      <Question />

      {props.mode === "question" && (
        <div className="guess">
          <LetterTile
            letter={guess}
            status={inProgress ? "not set" : isCurrentGuessCorrect() ? "correct" : "incorrect"}
            settings={props.settings}
          />
        </div>
      )}

      <InputMethod />

      <div>
        {gamemodeSettings.timerConfig.isTimed && (
          <ProgressBar
            progress={remainingSeconds}
            total={gamemodeSettings.timerConfig.seconds}
            display={{ type: "transition", colorTransition: GreenToRedColorTransition }}
          />
        )}
      </div>
    </div>
  );
};

export default WordCodes;
