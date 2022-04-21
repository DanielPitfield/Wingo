import React from "react";
import "./index.scss";
import { Button } from "./Button";
import { getWordSummary } from "./WordleConfig";

interface Props {
  onSubmitLetter: (letter: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
  mode: string;
  guesses: string[];
  targetWord: string;
  inDictionary: boolean;
  letterStatuses: {
    letter: string;
    status: "" | "contains" | "correct" | "not set" | "not in word";
  }[];
}

export const alphabet_string = "abcdefghijklmnopqrstuvwxyz";
export const Alphabet = alphabet_string.split("");

export const Keyboard: React.FC<Props> = (props) => {
  const modesWithSpaces = ["category", "letters_categories"];
  const modesWithoutKeyboardStatuses = [
    "letters_categories",
    "countdown_letters_casual",
    "countdown_letters_realistic",
  ];

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      var input_key = event.key.toString().toLowerCase();

      if (input_key === "enter") {
        props.onEnter();
      } else if (input_key === "backspace") {
        props.onBackspace();
      } else if (Alphabet.includes(input_key)) {
        // Any letter on the keyboard
        props.onSubmitLetter(input_key);
      } else if (modesWithSpaces.includes(props.mode)) {
        // Space or dash pressed, submit dash
        if (input_key === " " || input_key === "-") {
          props.onSubmitLetter("-");
        }
        if (input_key === "'") {
          props.onSubmitLetter(input_key);
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
    let keyboardStatuses = Alphabet.map((x) => ({
      letter: x,
      status: "not set",
    }));

    if (modesWithSpaces.includes(props.mode)) {
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
          onClick={(e) => {
            // The display text of the clicked button
            const buttonText = (e.target as HTMLButtonElement).innerText;
            // Letter of button is used within a callback function
            props.onSubmitLetter(buttonText);
          }}
        >
          {letter}
        </Button>
      );
    }

    return KeyboardButtons;
  }

  return (
    <div className="keyboard_wrapper">
      <div className="keyboard_row_top">
        <>{populateKeyboard("QWERTYUIOP")}</>
      </div>
      <div className="keyboard_row_middle">
        <>{populateKeyboard(!modesWithSpaces.includes(props.mode) ? "ASDFGHJKL" : "ASDFGHJKL'")}</>
      </div>
      <div className="keyboard_row_bottom">
        <>{populateKeyboard("ZXCVBNM")}</>
        <Button mode="destructive" onClick={props.onBackspace}>
          &lt;
        </Button>
      </div>
      <div className="keyboard_space">{modesWithSpaces.includes(props.mode) && (<>{populateKeyboard("-")}</>)}</div>
      <div className="keyboard_enter">
        <Button mode="accept" onClick={props.onEnter}>
          Enter
        </Button>
      </div>
    </div>
  );
};
