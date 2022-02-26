import { Page } from './App'

export type DailyWordSaveData = {
  dailyWord: string
  guesses: string[]
  wordIndex: number
  inProgress: boolean
  currentWord: string
}

export type HistorySaveData = {
  games: {
    /** Unique identifer of the game */
    id: string

    /** Page/mode of the game */
    page: Page

    /** Configuration at the start of the game */
    configAtStartOfGame: {
      timestamp: string
      wordLength: number
      numGuesses: number
      firstLetterProvided: boolean
      puzzleRevealMs: number
      puzzleLeaveNumBlanks: number
    }

    /** Configuration of the rounds in the game (including the last) */
    completedRounds: {
      /** Unique identifer of the game */
      id: string

      timestamp: string
      wordLength: number
      numGuesses: number
      firstLetterProvided: boolean
      puzzleRevealMs: number
      puzzleLeaveNumBlanks: number
      currentWord: string
      guesses: string[]
      outcome: 'success' | 'failure'
    }[]
  }[]
}

/** Generates a new identifier. */
export function newGuid(): string {
  const guidTemplate = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'

  return guidTemplate
    .split('')
    .map((char) => {
      if (char === 'x') {
        return Math.round(Math.random() * 16).toString(16)
      }
      return char
    })
    .join('')
}

/** */
export class SaveData {
  /**
   * Adds a game to the save history.
   * @param game Game to save to history.
   * @returns Identifier of the game.
   */
  public static addGameToHistory(
    page: Page,
    configAtStartOfGame: HistorySaveData['games'][0]['configAtStartOfGame'],
  ): string {
    const history = SaveData.getHistory()
    const id = newGuid()

    history.games.push({
      id,
      page,
      configAtStartOfGame,
      completedRounds: [],
    })

    localStorage.setItem('history', JSON.stringify(history))

    return id
  }

  /**
   * Adds a game to the save history.
   * @param gameId Identifier of the game to which to add a round.
   * @param round Round to add.
   * @returns Identifier of the round.
   */
  public static addCompletedRoundToGameHistory(
    gameId: string,
    round: Omit<HistorySaveData['games'][0]['completedRounds'][0], 'id'>,
  ) {
    const history = SaveData.getHistory()

    const newHistory: HistorySaveData = {
      ...history,
      games: history.games.map((game) => {
        // Find the game
        if (game.id === gameId) {
          // Add the round
          game.completedRounds.push({ id: newGuid(), ...round })
        }

        return game
      }),
    }

    localStorage.setItem('history', JSON.stringify(newHistory))
  }

  /**
   * Reads the save history.
   * @returns Save history.
   */
  public static getHistory(): HistorySaveData {
    const history = localStorage.getItem('history')

    if (history) {
      return JSON.parse(history) as HistorySaveData
    }

    return {
      games: [],
    }
  }

  /**
   * Sets the last daily word guesses played.
   * @param dailyWord The word being played.
   * @param guesses The guesses made.
   */
  public static setDailyWordGuesses(
    dailyWord: string,
    guesses: string[],
    wordIndex: number,
    inProgress: boolean,
    currentWord: string,
  ) {
    localStorage.setItem(
      'dailyWordGuesses',
      JSON.stringify({
        dailyWord,
        guesses,
        wordIndex,
        inProgress,
        currentWord,
      }),
    )
  }

  /**
   * Gets the last daily word guesses played, or null if not yet played.
   */
  public static getDailyWordGuesses(): DailyWordSaveData | null {
    const dailyWordGuesses = localStorage.getItem('dailyWordGuesses')

    if (dailyWordGuesses) {
      return JSON.parse(dailyWordGuesses) as DailyWordSaveData
    }

    return null
  }

  /**
   * Adds the specified amount of gold, and saves it in storage.
   * @param gold Gold to add.
   */
  public static addGold(gold: number) {
    const existingGold = SaveData.readGold()

    const newGold = existingGold + gold

    // Update the data item in local storage
    localStorage.setItem('gold', newGold.toString())
  }

  /**
   * Reads the stored amount of gold from storage.
   */
  public static readGold(): number {
    const gold = localStorage.getItem('gold')

    if (gold) {
      return parseInt(gold)
    }

    return 0
  }
}
