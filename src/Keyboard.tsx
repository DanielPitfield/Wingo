import React from "react";
import "./index.scss";
import { Button } from "./Button";
import { getWordSummary } from "./WordleConfig";
import { SettingsData } from "./SaveData";
import { useClickChime } from "./Sounds";
import { Page } from "./App";
import { FiChevronLeft, FiCornerDownLeft } from "react-icons/fi";

interface Props {
  settings: SettingsData;
  onSubmitLetter: (letter: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
  mode: Page;
  guesses: string[];
  targetWord: string;
  inDictionary: boolean;
  showKeyboard: boolean;
  letterStatuses: {
    letter: string;
    status: "" | "contains" | "correct" | "not set" | "not in word";
  }[];
  allowSpaces?: boolean;
  customAlphabet?: string[];
  showBackspace?: boolean;
  disabled?: boolean;
}

export const DEFAULT_ALPHABET_STRING = "abcdefghijklmnopqrstuvwxyz";
export const DEFAULT_ALPHABET = DEFAULT_ALPHABET_STRING.split("");

export const Keyboard: React.FC<Props> = (props) => {
  const [playClickSoundEffect] = useClickChime(props.settings);
  const alphabet = props.customAlphabet || DEFAULT_ALPHABET;

  const modesWithSpaces: Page[] = ["wingo/category", "letters_categories", "wingo/interlinked"];
  const modesWithoutKeyboardStatuses: Page[] = ["letters_categories", "countdown/letters", "wingo/interlinked"];

  React.useEffect(() => {
    if (props.disabled) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const input_key = event.key.toString().toLowerCase();

      if (["f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "f10", "f11", "f12"].includes(input_key)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      if (input_key === "enter") {
        props.onEnter();
      } else if (input_key === "backspace") {
        props.onBackspace();
        playClickSoundEffect();
      } else if (alphabet.map((x) => x.toLowerCase()).includes(input_key)) {
        // Any letter on the keyboard
        props.onSubmitLetter(input_key);
        playClickSoundEffect();
      } else if (modesWithSpaces.includes(props.mode) || props.allowSpaces) {
        // Space or dash pressed, submit dash
        if (input_key === " " || input_key === "-") {
          props.onSubmitLetter("-");
          playClickSoundEffect();
        }
        if (input_key === "'") {
          props.onSubmitLetter(input_key);
          playClickSoundEffect();
        }
      }
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

    if (modesWithSpaces.includes(props.mode) || props.allowSpaces) {
      // There may be multiples spaces in a word, best not to create a status (always be shown as "not set")

      // Unlikely a word has multiple apostrophes, so showing a keyboard status is useful
      keyboardStatuses.push({ letter: "'", status: "not set" });
    }

    // Don't need updated keyboard statuses for some modes
    if (modesWithoutKeyboardStatuses.includes(props.mode)) {
      // Just use standard statuses (where all are "not set")
      return keyboardStatuses;
    }

    // For each guess
    for (const guess of props.guesses) {
      // Returns summary of each letter's status in the guess
      const guessSummary = getWordSummary(props.mode, guess, props.targetWord, props.inDictionary);

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
    // Adds a button for every letter within the provided string
    var KeyboardButtons = [];
    const RowLetters = RowString.split("");
    // Assign array to variable for quicker access
    const keyboardStatuses = getKeyboardStatuses();

    for (let i = 0; i < RowLetters.length; i++) {
      // Individual letter from RowString
      const letter = RowLetters[i];
      // Find status using keyboardStatuses (correct, not in word, wrong position)
      const letterStatus = keyboardStatuses.find((x) => x.letter.toUpperCase() === letter.toUpperCase())?.status;

      KeyboardButtons.push(
        <Button
          key={i}
          className={letter === "-" ? "keyboard_space" : `keyboard_${letter}`}
          mode="default"
          // Data attribute used to colour button
          status={letterStatus ? letterStatus : "not set"}
          settings={props.settings}
          onClick={(e) => {
            // Letter of button is used within a callback function
            props.onSubmitLetter(letter);
          }}
          disabled={props.disabled}
        >
          {letter}
        </Button>
      );
    }

    return KeyboardButtons;
  }

  if (!props.showKeyboard) {
    return <></>;
  }

  return (
    <div className="keyboard_wrapper">
      <div className="keyboard_row_top">
        <>
          {props.customAlphabet
            ? populateKeyboard(props.customAlphabet.slice(0, Math.round(props.customAlphabet.length / 2)).join(""))
            : populateKeyboard("QWERTYUIOP")}
        </>
      </div>
      <div className="keyboard_row_middle">
        <>
          {props.customAlphabet
            ? populateKeyboard(props.customAlphabet.slice(Math.round(props.customAlphabet.length / 2)).join(""))
            : populateKeyboard(
                !modesWithSpaces.includes(props.mode) && !props.allowSpaces ? "ASDFGHJKL" : "ASDFGHJKL'"
              )}
        </>
      </div>
      <div className="keyboard_row_bottom">
        <>{props.customAlphabet ? null : populateKeyboard("ZXCVBNM")}</>
        {props.showBackspace !== false && (
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
      <div className="keyboard_space">
        {(modesWithSpaces.includes(props.mode) || props.allowSpaces) && <>{populateKeyboard("-")}</>}
      </div>
      <div className="keyboard_enter">
        <Button mode="accept" settings={props.settings} onClick={props.onEnter} disabled={props.disabled}>
          <FiCornerDownLeft /> Enter
        </Button>
      </div>
    </div>
  );
};
