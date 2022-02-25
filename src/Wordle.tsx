import React from 'react'
import './App.css'
import { Keyboard } from './Keyboard'
import { Page } from './App'
import { WordRow } from './WordRow'
import { Logo } from './Logo'
import { Button } from './Button'
import { MessageNotification } from './MessageNotification'
import Timer from './Timer'

interface Props {
  mode: 'daily' | 'repeat' | 'limitless' | 'puzzle' | 'interlinked'
  gold: string
  timerConfig: {isTimed:false}|{isTimed:true, totalSeconds:number, elapsedSeconds: number}
  wordLength: number
  numGuesses: number
  guesses: string[]
  currentWord: string
  wordIndex: number
  inProgress: boolean
  inDictionary: boolean
  hasSubmitLetter: boolean
  targetWord: string
  interlinkedWord: string
  targetHint: string
  puzzleRevealMs: number
  puzzleLeaveNumBlanks: number
  letterStatuses: {
    letter: string
    status: '' | 'contains' | 'correct' | 'not set' | 'not in word'
  }[]
  revealedLetterIndexes: number[]
  setPage: (page: Page) => void
  updateGoldCoins: (value: number) => void
  onEnter: () => void
  onSubmitLetter: (letter: string) => void
  onBackspace: () => void
  ResetGame: () => void
  ContinueGame: () => void
  getLetterStatus: (
    letter: string,
    index: number,
  ) => 'incorrect' | 'contains' | 'correct' | 'not set' | 'not in word'
}

const Wordle: React.FC<Props> = (props) => {
  /* Create grid of rows (for guessing words) */
  function populateGrid(rowNumber: number, wordLength: number) {
    var Grid = []

    if (props.mode === 'puzzle') {
      /* Create read only WordRow that slowly reveals puzzle word */
      let displayWord = ''

      for (let i = 0; i < props.targetWord.length; i++) {
        if (props.revealedLetterIndexes.includes(i)) {
          displayWord += props.targetWord[i]
        } else {
          displayWord += ' '
        }
      }

      Grid.push(
        <WordRow
          key={'read-only'}
          word={displayWord}
          isVertical={false}
          length={wordLength}
          targetWord={props.targetWord}
          hasSubmit={true}
          getLetterStatus={props.getLetterStatus}
          inDictionary={props.inDictionary}
        ></WordRow>,
      )
    }

    for (let i = 0; i < rowNumber; i++) {
      let word

      if (props.wordIndex === i) {
        /* 
        If the wordIndex and the row number are the same
        (i.e the row is currently being used)
        Show the currentWord
        */
        word = props.currentWord
      } else if (props.wordIndex <= i) {
        /*
        If the wordIndex is behind the currently iterated row
        (i.e the row has not been used yet)
        Show an empty string 
        */
        word = ''
      } else {
        /* 
        If the wordIndex is ahead of the currently iterated row
        (i.e the row has already been used)
        Show the respective guessed word
        */
        word = props.guesses[i]
      }

      Grid.push(
        <WordRow
          key={i}
          isVertical={false}
          word={word}
          length={wordLength}
          targetWord={props.targetWord}
          hasSubmit={props.wordIndex > i || !props.inProgress}
          getLetterStatus={props.getLetterStatus}
          inDictionary={props.inDictionary}
        ></WordRow>,
      )

      /* Push another WordRow for interlinked gamemode */
      if (props.mode === 'interlinked') {
        Grid.push(
          <WordRow
            key={i}
            isVertical={true}
            word={word}
            length={
              wordLength - 1
            } /* Length is 1 smaller than horizontal counterpart */
            targetWord={props.targetWord}
            hasSubmit={props.wordIndex > i || !props.inProgress}
            getLetterStatus={props.getLetterStatus}
            inDictionary={props.inDictionary}
          ></WordRow>,
        )
      }
    }

    return Grid
  }

  function displayOutcome() {
    if (props.inProgress) {
      return
    }

    if (!props.inDictionary) {
      return (
        <MessageNotification type="error">
          <strong>{props.currentWord}</strong> is not a valid word
          <br />
          The word was: <strong>{props.targetWord}</strong>
        </MessageNotification>
      )
    }

    if (props.wordIndex === 0 && props.currentWord.toUpperCase() === props.targetWord.toUpperCase()) {
      return (
        <MessageNotification type="success">
          You guessed the word in one guess
        </MessageNotification>
      )
    } else if (
      props.wordIndex < props.numGuesses &&
      props.currentWord.toUpperCase() === props.targetWord.toUpperCase()
    ) {
      return (
        <MessageNotification type="success">
          You guessed the word in <strong>{props.wordIndex + 1}</strong> guesses
        </MessageNotification>
      )
    } else {
      return (
        <MessageNotification type="default">
          The word was: <strong>{props.targetWord}</strong>
        </MessageNotification>
      )
    }
  }

  return (
    <div className="App">
      <div>{displayOutcome()}</div>
      <div>
        {!props.inProgress && props.mode !== 'daily' && (
          <Button
            mode={'accept'}
            onClick={() =>
              props.mode === 'limitless' &&
              props.targetWord.toUpperCase() === props.currentWord.toUpperCase()
                ? props.ContinueGame()
                : props.ResetGame()
            }
          >
            {props.mode === 'limitless' &&
            props.targetWord.toUpperCase() === props.currentWord.toUpperCase()
              ? 'Continue'
              : 'Restart'}
          </Button>
        )}
      </div>

      <div className="puzzle_hint">
        {props.inProgress && props.mode === 'puzzle' && (
          <MessageNotification type="default">
            {props.targetHint}
          </MessageNotification>
        )}
      </div>

      <div className="word_grid">
        {populateGrid(props.numGuesses, props.wordLength)}
      </div>

      <div className="keyboard">
        <Keyboard
          onEnter={props.onEnter}
          onSubmitLetter={props.onSubmitLetter}
          onBackspace={props.onBackspace}
          letterStatuses={props.letterStatuses}
        ></Keyboard>
      </div>

      <div>
        {props.timerConfig.isTimed && <Timer elapsedSeconds={props.timerConfig.elapsedSeconds} totalSeconds={props.timerConfig.totalSeconds}></Timer>}
      </div>
    </div>
  )
}

export default Wordle
