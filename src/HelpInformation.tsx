import React from "react";
import { Page, pages } from "./App";
import { Modal } from "./Modal";

interface Props {
  page: Page;
  onClose: () => void;
}

export const HelpInformation: React.FC<Props> = (props) => {
  const pageInfo = pages.find((x) => x.page === props.page);

  // TODO: Include a button which opens a modal body for the base game mode type (playing Wordle Daily, include a button to modal which explains Wordle)
  // TODO: Every gamemode has this HelpInformation component, use state with callback to determine whether it is currently displayed or not

  // Body elements for specific gamemodes
  function getModalBody(): React.ReactNode {
    switch (props.page) {
      // "home"

      case "wingo/daily":
        return (
          <>
            <p>Only one attempt (a set of up to 6 guesses) allowed</p>
            <p>The target word changes every day (the countdown timer shows when a new word is available)</p>
            <p>Your attempt will be saved and can be viewed at any time</p>
          </>
        );

      case "wingo/repeat":
        return (
          <>
            <p>Press the 'Restart' button after an attempt for a new target word</p>
          </>
        );

      case "wingo/category":
        return (
          <>
            <p>The target word is a word from the currently selected category</p>
            <p>
              The guesses you make must also be words from this category (but they do not have to be the length of the
              target word)
            </p>
            <p>The category can be changed from the dropdown list (this will delete any guesses made)</p>
          </>
        );

      case "wingo/increasing":
        return (
          <>
            <p>The target word will increase in length (one letter longer) after each successful guess</p>
          </>
        );

      case "wingo/limitless":
        return (
          <>
            <p>Gain extra guesses (up to a maximum of 5) by guessing a word with guesses to spare</p>
            <p>A guess will be lost each time the target word is not guessed</p>
            <p>The target word will increase in length (one letter longer) after each successful guess</p>
          </>
        );

      case "wingo/puzzle":
        return (
          <>
            <p>Guess the target word from the hint provided</p>
            <p>A random letter of the target word will become revealed every few seconds</p>
            <p>Press 'Enter' once you know the answer and make your guess (this will stop the letters revealing!)</p>
          </>
        );
      /*
        case "wingo/interlinked"
        case "wingo/crossword"
        case "wingo/crossword/fit"
        case "wingo/crossword/weekly"
        case "wingo/crossword/daily"
        case "letters_categories"
        case "countdown/letters"
        case "countdown/numbers"
        case "numbers/arithmetic_reveal"
        case "numbers/arithmetic_drag/order"
        case "numbers/arithmetic_drag/match"
        case "nubble"
        case "only_connect/wall"
        case "verbal_reasoning/match"
        case "verbal_reasoning/number_sets"
        case "verbal_reasoning/algebra"
        case "verbal_reasoning/word_codes/match"
        case "puzzle/sequence"
        case "campaign"
        case "campaign/area"
        case "campaign/area/level"
        case "random"
        case "countdown/gameshow"
        case "lingo/gameshow"
        */

      default:
        return null;
    }
    // ...
  }

  return (
    <Modal
      mode="default"
      title={
        <>
          <strong>{pageInfo?.title || props.page}</strong>
        </>
      }
      onClose={props.onClose}
    >
      {getModalBody()}
    </Modal>
  );
};

export default HelpInformation;
