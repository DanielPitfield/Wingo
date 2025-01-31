import React from "react";
import Button from "./Button";
import { useClickChime } from "../Data/Sounds";
import { PagePath } from "../Data/PageNames";
import { FiChevronLeft, FiCornerDownLeft } from "react-icons/fi";
import { getWordRowStatusSummary, WordRowStatusChecks, WordRowStatusSummary } from "../Helpers/getWordRowStatusSummary";
import { LetterTileStatus } from "./LetterTile";
import { DEFAULT_ALPHABET } from "../Pages/WingoConfig";
import { useLocation } from "react-router";
import { SettingsData } from "../Data/SaveData/Settings";

interface KeyboardProps {
  settings: SettingsData;
  onSubmitLetter: (letter: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
  guesses: string[];
  targetWord: string;
  inDictionary: boolean;
  letterStatuses: LetterTileStatus[];
  customAlphabet?: string[];
  disabled: boolean;
  hasSpaces?: boolean;
  hasBackspace: boolean;
  hasEnter: boolean;
}

const DEFAULT_KEYBOARD_FIRST_ROW = "QWERTYUIOP";
const DEFAULT_KEYBOARD_SECOND_ROW = "ASDFGHJKL";
const DEFAULT_KEYBOARD_THIRD_ROW = "ZXCVBNM";
const IGNORE_KEYS = ["f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "f10", "f11", "f12"];

const isModeWithoutKeyboardStatuses = (page: PagePath) => {
  // Don't need updated keyboard statuses for some modes
  const modesWithoutKeyboardStatuses: PagePath[] = ["/LettersCategories", "/LettersGame", "/Wingo/Interlinked"];
  return modesWithoutKeyboardStatuses.includes(page);
};

const Keyboard = (props: KeyboardProps) => {
  const location = useLocation().pathname as PagePath;

  const alphabet = props.customAlphabet ?? DEFAULT_ALPHABET;

  const hasApostrophe = props.targetWord.includes("'");
  const hasSpaces = props.hasSpaces || props.targetWord.includes("-") || props.targetWord.includes(" ");

  const [playClickSoundEffect] = useClickChime(props.settings);

  React.useEffect(() => {
    if (props.disabled) {
      return;
    }

    if (!props.settings.gameplay.showKeyboardUi) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const inputKey = event.key.toString().toLowerCase();

      if (IGNORE_KEYS.includes(inputKey)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      // Enter
      if (inputKey === "enter") {
        props.onEnter();
        return;
      }

      // Backspace
      if (inputKey === "backspace") {
        props.onBackspace();
        playClickSoundEffect();
        return;
      }

      // Any letter on the keyboard
      if (alphabet.map((x) => x.toLowerCase()).includes(inputKey)) {
        props.onSubmitLetter(inputKey);
        playClickSoundEffect();
        return;
      }

      // Apostrophe
      if (hasApostrophe && inputKey === "'") {
        props.onSubmitLetter(inputKey);
        playClickSoundEffect();
        return;
      }

      // Space or dash
      const spacePressed = inputKey === " " || inputKey === "-";

      if (hasSpaces && spacePressed) {
        // Submit dash
        props.onSubmitLetter("-");
        playClickSoundEffect();
        return;
      }

      // Otherwise ignore
      return;
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [props.onEnter, props.onBackspace, props.onSubmitLetter]);

  function getKeyboardStatuses() {
    // Letter and status array
    const defaultKeyboardStatuses: WordRowStatusSummary = alphabet.map((x) => ({
      letter: x,
      status: "not set",
    }));

    // Add apostrophe (if there is one within the target word)
    if (hasApostrophe) {
      defaultKeyboardStatuses.push({ letter: "'", status: "not set" });
    }

    if (isModeWithoutKeyboardStatuses(location)) {
      // Just use standard statuses (where all are "not set")
      return defaultKeyboardStatuses;
    }

    const keyboardStatuses = defaultKeyboardStatuses.slice();

    // For each guess
    for (const guess of props.guesses) {
      const statusChecks: WordRowStatusChecks = {
        isReadOnly: false,
        page: location,
        word: guess,
        targetWord: props.targetWord,
        inDictionary: props.inDictionary,
        wordArray: [],
      };

      // Returns summary of each letter's status in the guess
      const guessSummary = getWordRowStatusSummary(statusChecks);

      for (const letterSummary of guessSummary) {
        // Find element in keyboardStatuses for the letter in question
        const letter = keyboardStatuses.find((x) => x.letter === letterSummary.letter);

        if (!letter) {
          continue;
        }

        if (letterSummary.status === "correct") {
          // Always update status for this letter in keyboardStatuses to correct (highest precedence)
          letter.status = "correct";
        }

        if (letterSummary.status === "contains") {
          // As long as it's not already correct, make it orange
          if (letter.status !== "correct") {
            letter.status = "contains";
          }
        }
      }
    }

    return keyboardStatuses;
  }

  function populateKeyboard(rowString: string) {
    return rowString.split("").map((letter) => {
      const letterStatus = getKeyboardStatuses().find((x) => x.letter.toUpperCase() === letter.toUpperCase())?.status;

      // The space key uses a different className (as it needs to be styled to be wider)
      const isSpaceKey = letter === "-";

      return (
        <Button
          key={letter}
          className={isSpaceKey ? "keyboard_space" : "keyboard_button"}
          mode="default"
          status={letterStatus ?? "not set"}
          settings={props.settings}
          onClick={() => {
            props.onSubmitLetter(letter);
          }}
          disabled={props.disabled}
        >
          {letter}
        </Button>
      );
    });
  }

  if (!props.settings.gameplay.showKeyboardUi) {
    return null;
  }

  return (
    <div className="keyboard_wrapper">
      <div className="keyboard_row">
        {props.customAlphabet
          ? // Half the custom alphabet
            populateKeyboard(props.customAlphabet.slice(0, Math.round(props.customAlphabet.length / 2)).join(""))
          : // The default top row of the keyboard
            populateKeyboard(DEFAULT_KEYBOARD_FIRST_ROW)}
      </div>

      <div className="keyboard_row">
        {props.customAlphabet
          ? populateKeyboard(props.customAlphabet.slice(Math.round(props.customAlphabet.length / 2)).join(""))
          : populateKeyboard(hasApostrophe ? DEFAULT_KEYBOARD_SECOND_ROW + "'" : DEFAULT_KEYBOARD_SECOND_ROW)}
      </div>

      <div className="keyboard_row">
        {!props.customAlphabet && <>{populateKeyboard(DEFAULT_KEYBOARD_THIRD_ROW)}</>}

        {props.hasBackspace && (
          <Button
            mode="destructive"
            settings={props.settings}
            onClick={props.onBackspace}
            disabled={props.disabled}
            additionalProps={{ title: "Backspace" }}
          >
            <FiChevronLeft />
          </Button>
        )}
      </div>

      {hasSpaces && <div className="keyboard_row">{populateKeyboard("-")}</div>}

      {props.hasEnter && (
        <Button mode="accept" settings={props.settings} onClick={props.onEnter} disabled={props.disabled}>
          <FiCornerDownLeft /> Enter
        </Button>
      )}
    </div>
  );
};

export default Keyboard;
