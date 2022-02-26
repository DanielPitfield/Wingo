import { HistorySaveData } from '../SaveData'
import { BaseChallenge } from './BaseChallenge'

/** Completion of a round of Standard/Normal in 3 guesses */
export class Under3GuessesNormalWingo extends BaseChallenge {
  /** @inheritdoc */
  public title = 'Wingo Standard/Normal'

  /** @inheritdoc */
  public description =
    "Complete a 'Standard/Normal' Wingo round within 3 guesses"

  /** @inheritdoc */
  public currentProgress(history: HistorySaveData): number {
    // Return the count of 'wordle_repeat' games completed successfully
    return history.games.filter(
      (game) =>
        game.page === 'wordle_repeat' &&
        game.completedRounds.some(
          (x) => x.guesses.length <= 3 && x.outcome === 'success',
        ),
    ).length
  }

  /** @inheritdoc */
  public target = 1
}
