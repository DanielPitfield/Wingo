import React from 'react';
import "./index.css";
import { Button } from "./Button";

interface Props {
  onSubmitLetter: (letter: string) => void
  onEnter: () => void
  onBackspace: () => void
}

export const Keyboard: React.FC<Props> = (props) => {
  React.useEffect(() => {

    const handleKeyDown = (event: KeyboardEvent) => {
      var input_key = event.key.toString().toLowerCase();

      var string = "abcdefghijklmnopqrstuvwxyz";
      var Alphabet = string.split("");

      if (input_key === "enter") {
        props.onEnter();
      }
      else if (input_key === "backspace") {
        props.onBackspace();
      }
      else if (Alphabet.includes(input_key)) {
        props.onSubmitLetter(input_key);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {window.removeEventListener('keydown', handleKeyDown)}
  }, [props.onEnter, props.onBackspace, props.onSubmitLetter]);

  function populateKeyboard(RowString: string) {
    var KeyboardButtons = [];
    const RowLetters = RowString.split('');

    for (let i = 0; i < RowLetters.length; i++) {
      /* Adds a button for every letter within the provided string, this letter is then used within a callback function (when clicked) */
      KeyboardButtons.push(<Button key={i} mode="default" label={RowLetters[i]} onClick={e => props.onSubmitLetter((e.target as HTMLButtonElement).innerText)} />);
    }

    return KeyboardButtons;
  }

  return (
    <div className="keyboard_wrapper">
      <div className="keyboard_row_top"><>{populateKeyboard("QWERTYUIOP")}</></div>
      <div className="keyboard_row_middle"><>{populateKeyboard("ASDFGHJKL")}</></div>
      <div className="keyboard_row_bottom">
        <>{populateKeyboard("ZXCVBNM")}</>
        <Button mode="destructive" label="<" onClick={props.onBackspace} />
      </div>
      <div className="keyboard_enter"><>{<Button mode="accept" label="Enter" onClick={props.onEnter} />}</></div>
    </div>
  );
}