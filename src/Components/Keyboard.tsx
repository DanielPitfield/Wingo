import React from "react";
import { Button } from "./Button";
import { SettingsData } from "../Data/SaveData";
import { useClickChime } from "../Data/Sounds";
import { PageName } from "../Data/PageNames";
import { FiChevronLeft, FiCornerDownLeft } from "react-icons/fi";
import { getWordRowStatusSummary, WordRowStatusChecks } from "../Data/getWordRowStatusSummary";
import { LetterStatus } from "./LetterTile";
import { DEFAULT_ALPHABET } from "../Pages/WingoConfig";

interface Props {
  settings: SettingsData;
  onSubmitLetter: (letter: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
  page: PageName;
  guesses: string[];
  targetWord: string;
  inDictionary: boolean;
  letterStatuses: {
    letter: string;
    status: LetterStatus;
  }[];
  customAlphabet?: string[];
  disabled: boolean;
  hasBackspace: boolean;
  hasEnter: boolean;
}

const DEFAULT_KEYBOARD_FIRST_ROW = "QWERTYUIOP";
const DEFAULT_KEYBOARD_SECOND_ROW = "ASDFGHJKL";
const DEFAULT_KEYBOARD_THIRD_ROW = "ZXCVBNM";

const isModeWithoutKeyboardStatuses = (page: PageName) => {
  // Don't need updated keyboard statuses for some modes
  const modesWithoutKeyboardStatuses: PageName[] = ["LettersCategories", "LettersGame", "wingo/interlinked"];
  return modesWithoutKeyboardStatuses.includes(page);
};

export const Keyboard = (props: Props) => {
  const alphabet = props.customAlphabet ?? DEFAULT_ALPHABET;

  const hasApostrophe = props.targetWord.includes("'");
  const hasSpaces = props.targetWord.includes(" ");

  const [playClickSoundEffect] = useClickChime(props.settings);

  React.useEffect(() => {
    if (props.disabled) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();

      const inputKey = event.key.toString().toLowerCase();

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
    let keyboardStatuses = alphabet.map((x) => ({
      letter: x,
      status: "not set",
    }));

    if (isModeWithoutKeyboardStatuses(props.page)) {
      // Just use standard statuses (where all are "not set")
      return keyboardStatuses;
    }

    // Add apostrophe (if there is one within the target word)
    if (hasApostrophe) {
      keyboardStatuses.push({ letter: "'", status: "not set" });
    }

    // For each guess
    for (const guess of props.guesses) {
      const statusChecks: WordRowStatusChecks = {
        isReadOnly: false,
        page: props.page,
        word: guess,
        targetWord: props.targetWord,
        inDictionary: props.inDictionary,
        wordArray: [],
      };

      // Returns summary of each letter's status in the guess
      const guessSummary = getWordRowStatusSummary(statusChecks);

      for (const letterSummary of guessSummary) {
        // Find element in keyboardStatuses for the letter in question
        const letter = keyboardStatuses.find((x) => x.letter === letterSummary.character);

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

  function populateKeyboard(RowString: string) {
    const keyboardStatuses = getKeyboardStatuses();

    if (!keyboardStatuses || keyboardStatuses.length <= 0) {
      return;
    }

    return RowString.split("").map((letter) => {
      const letterStatus = keyboardStatuses.find((x) => x.letter.toUpperCase() === letter.toUpperCase())?.status;
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
