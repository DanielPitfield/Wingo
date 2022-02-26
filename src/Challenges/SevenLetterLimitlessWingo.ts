import { HistorySaveData } from '../SaveData'
import { BaseChallenge } from './BaseChallenge'

/** Completion a seven letter limitless wingo */
export class SevenLetterLimitlessWingo extends BaseChallenge {
  /** @inheritdoc */
  public title = '7-letter Limitless'

  /** @inheritdoc */
  public description = 'Complete a 7-letter word in Limitless Wingo'

  /** @inheritdoc */
  public currentProgress(history: HistorySaveData): number {
    // Return the count of 'wordle_repeat' games completed successfully
    return history.games.filter(
      (game) =>
        game.page === 'wordle_limitless' &&
        game.completedRounds.some(
          (round) =>
            round.currentWord.length >= 7 && round.outcome === 'success',
        ),
    ).length
  }

  /** @inheritdoc */
  public target = 1
}
