import { DailyWingo } from "./DailyWingo";
import { XNormalWingos } from "./XNormalWingos";
import { XLetterLimitlessWingo } from "./XLetterLimitlessWingo";
import { UnderXGuessesNormalWingo } from "./UnderXGuessesNormalWingo";

export const AllChallenges = [
  new DailyWingo(),
  new XNormalWingos({ numberOfGames: 3, reward: { goldCoins: 500, xp: 0 } }),
  new XNormalWingos({ numberOfGames: 5, reward: { goldCoins: 1_200, xp: 0 } }),
  new XNormalWingos({ numberOfGames: 8, reward: { goldCoins: 2_000, xp: 0 } }),
  new XNormalWingos({ numberOfGames: 15, reward: { goldCoins: 3_250, xp: 0 } }),
  new XNormalWingos({ numberOfGames: 25, reward: { goldCoins: 5_000, xp: 0 } }),
  new XNormalWingos({ numberOfGames: 50, reward: { goldCoins: 10_000, xp: 0 } }),
  new XNormalWingos({ numberOfGames: 75, reward: { goldCoins: 25_000, xp: 0 } }),
  new XNormalWingos({ numberOfGames: 100, reward: { goldCoins: 50_000, xp: 0 } }),
  new XLetterLimitlessWingo({ numberOfLetters: 5, reward: { goldCoins: 500, xp: 0 } }),
  new XLetterLimitlessWingo({ numberOfLetters: 6, reward: { goldCoins: 1_000, xp: 0 } }),
  new XLetterLimitlessWingo({ numberOfLetters: 7, reward: { goldCoins: 2_000, xp: 0 } }),
  new XLetterLimitlessWingo({ numberOfLetters: 8, reward: { goldCoins: 3_000, xp: 0 } }),
  new XLetterLimitlessWingo({ numberOfLetters: 9, reward: { goldCoins: 3_000, xp: 0 } }),
  new XLetterLimitlessWingo({ numberOfLetters: 10, reward: { goldCoins: 5_000, xp: 0 } }),
  new XLetterLimitlessWingo({ numberOfLetters: 11, reward: { goldCoins: 10_000, xp: 0 } }),
  new XLetterLimitlessWingo({ numberOfLetters: 12, reward: { goldCoins: 20_000, xp: 0 } }),
  new UnderXGuessesNormalWingo({ numberOfGuesses: 5, reward: { goldCoins: 1_000, xp: 0 } }),
  new UnderXGuessesNormalWingo({ numberOfGuesses: 4, reward: { goldCoins: 1_500, xp: 0 } }),
  new UnderXGuessesNormalWingo({ numberOfGuesses: 3, reward: { goldCoins: 2_000, xp: 0 } }),
  new UnderXGuessesNormalWingo({ numberOfGuesses: 2, reward: { goldCoins: 3_000, xp: 0 } }),
  new UnderXGuessesNormalWingo({ numberOfGuesses: 1, reward: { goldCoins: 5_000, xp: 0 } }),
];
