import React from "react";
import "./index.css";
import { Button } from "./Button";

interface Props {
  onSubmitLetter: (letter: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
  letterStatuses: {
    letter: string;
    status: "" | "contains" | "correct" | "not set" | "not in word";
  }[];
}

export const Keyboard: React.FC<Props> = (props) => {
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      var input_key = event.key.toString().toLowerCase();

      var string = "abcdefghijklmnopqrstuvwxyz";
      var Alphabet = string.split("");

      if (input_key === "enter") {
        props.onEnter();
      } else if (input_key === "backspace") {
        props.onBackspace();
      } else if (Alphabet.includes(input_key)) {
        // Any letter on the keyboard
        props.onSubmitLetter(input_key);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [props.onEnter, props.onBackspace, props.onSubmitLetter]);

  function populateKeyboard(RowString: string) {
    // Adds a button for every letter within the provided string
    var KeyboardButtons = [];
    const RowLetters = RowString.split("");

    for (let i = 0; i < RowLetters.length; i++) {
      // Find status (correct, not in word, wrong position)
      const letterStatus = props.letterStatuses.find(
        (x) => x.letter.toUpperCase() === RowLetters[i].toUpperCase()
      )?.status;

      KeyboardButtons.push(
        <Button
          key={i}
          mode="default"
          // Data attribute used to colour button
          status={letterStatus}
          onClick={(e) =>
            // Letter of button is used within a callback function
            props.onSubmitLetter((e.target as HTMLButtonElement).innerText)
          }
        >
          {RowLetters[i]}
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
        <>{populateKeyboard("ASDFGHJKL")}</>
      </div>
      <div className="keyboard_row_bottom">
        <>{populateKeyboard("ZXCVBNM")}</>
        <Button mode="destructive" onClick={props.onBackspace}>
          &lt;
        </Button>
      </div>
      <div className="keyboard_enter">
        <Button mode="accept" onClick={props.onEnter}>
          Enter
        </Button>
      </div>
    </div>
  );
};
