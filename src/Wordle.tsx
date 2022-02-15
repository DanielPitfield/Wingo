import React, { useState } from 'react';
import './App.css';
import { Keyboard } from './Keyboard';
import { Page } from './App';
import { WordRow } from './WordRow';

interface Props {
  wordLength: number;
  numGuesses: number;
  words: string[];
  targetWord: string;
  setPage: (page: Page) => void
}

const Wordle: React.FC<Props> = (props) => {
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [inProgress, setinProgress] = useState(true);

  /* Create grid of rows (for guessing words) */
  function populateGrid(rowNumber: number, wordLength: number) {
    var Grid = [];
    for (let i = 0; i < rowNumber; i++) {
      /* 
      If the wordIndex and the row number are the same
      (i.e the row is currently being used)
      Show the currentWord
      */

      /*
      If the wordIndex is behind the currently iterated row
      (i.e the row has not been used yet)
      Show an empty string 
      */

      /* 
      If the wordIndex is ahead of the currently iterated row
      (i.e the row has already been used)
      Show the respective guessed word
      */
      Grid.push(<WordRow key={i} word={wordIndex === i ? currentWord : wordIndex <= i ? "" : guesses[i]} length={wordLength} targetWord={props.targetWord} hasSubmit={wordIndex > i || !inProgress}></WordRow>);
    }

    return Grid;
  }

  function displayOutcome() {
    if (inProgress) {
      return;
    }

    if (wordIndex === 0) {
      return <>You guessed the word in one guess</>
    }

    else if (wordIndex < props.numGuesses && currentWord.toUpperCase() === props.targetWord.toUpperCase()) {
      return <>You guessed the word in {wordIndex + 1} guesses</>
    }

    else {
      return <>The word was: {props.targetWord}</>
    }
  }

  return (
    <div className="App">
      <div className="title">
        Wingo
      </div>
      <div>
        {displayOutcome()}
      </div>

      <div className="word_grid">
        {populateGrid(props.numGuesses, props.wordLength)}
      </div>

      <div className="keyboard">
        <Keyboard
          onEnter={() => {
            if (!inProgress) {
              return;
            }

            if (currentWord.length !== props.wordLength) { /* Incomplete word */
              return;
            }

            if (wordIndex >= props.numGuesses) { /* Used all the available rows (out of guesses) */
              return;
            }

            if (props.words.includes(currentWord.toLowerCase())) { /* Completed and accepeted word */
              setGuesses(guesses.concat(currentWord)); /* Add word to guesses */


              if (currentWord.toUpperCase() === props.targetWord.toUpperCase()) { /* Exact match */
                setinProgress(false);
              }
              else if ((wordIndex + 1) === props.numGuesses) {
                setinProgress(false);
              }
              else {
                setCurrentWord(""); /* Start new word as empty string */
                setWordIndex(wordIndex + 1); /* Increment index to indicate new word has been started */
              }
            }
          }}
          onSubmitLetter={(letter) => {
            if (currentWord.length < props.wordLength && inProgress) {
              setCurrentWord(currentWord + letter); /* Append chosen letter to currentWord */
            }
          }}
          onBackspace={() => {
            if (currentWord.length > 0 && inProgress) { /* If there is a letter to remove */
              setCurrentWord(currentWord.substring(0, currentWord.length - 1));
            }
          }}>
        </Keyboard>
      </div>
    </div>
  );
}

export default Wordle;