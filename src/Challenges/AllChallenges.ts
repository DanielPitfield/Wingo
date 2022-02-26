import { DailyWingo } from './DailyWingo'
import { FiveNormalWingos } from './FiveNormalWingos'
import { SevenLetterLimitlessWingo } from './SevenLetterLimitlessWingo'
import { Under3GuessesNormalWingo } from './Under3GuessesNormalWingo'

export const AllChallenges = [
  new DailyWingo(),
  new FiveNormalWingos(),
  new SevenLetterLimitlessWingo(),
  new Under3GuessesNormalWingo(),
]
