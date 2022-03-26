import { DailyWingo } from "./DailyWingo";
import { XNormalWingos } from "./XNormalWingos";
import { XLetterLimitlessWingo } from "./XLetterLimitlessWingo";
import { UnderXGuessesNormalWingo } from "./UnderXGuessesNormalWingo";

export const AllChallenges = [
  new DailyWingo(),
  new XNormalWingos({ numberOfGames: 3, reward: { goldCoins: 500, xp: 0 } }),
  new XNormalWingos({ numberOfGames: 5, reward: { goldCoins: 1200, xp: 0 } }),
  new XNormalWingos({ numberOfGames: 8, reward: { goldCoins: 2000, xp: 0 } }),
  new XNormalWingos({ numberOfGames: 15, reward: { goldCoins: 3250, xp: 0 } }),
  new XNormalWingos({ numberOfGames: 25, reward: { goldCoins: 5000, xp: 0 } }),
  new XNormalWingos({ numberOfGames: 50, reward: { goldCoins: 1000, xp: 0 } }),
  new XLetterLimitlessWingo({ numberOfLetters: 5, reward: { goldCoins: 500, xp: 0 } }),
  new XLetterLimitlessWingo({ numberOfLetters: 6, reward: { goldCoins: 1000, xp: 0 } }),
  new XLetterLimitlessWingo({ numberOfLetters: 7, reward: { goldCoins: 2000, xp: 0 } }),
  new XLetterLimitlessWingo({ numberOfLetters: 8, reward: { goldCoins: 3000, xp: 0 } }),
  new UnderXGuessesNormalWingo({ numberOfGuesses: 5, reward: { goldCoins: 1000, xp: 0 } }),
  new UnderXGuessesNormalWingo({ numberOfGuesses: 4, reward: { goldCoins: 1500, xp: 0 } }),
  new UnderXGuessesNormalWingo({ numberOfGuesses: 3, reward: { goldCoins: 2000, xp: 0 } }),
  new UnderXGuessesNormalWingo({ numberOfGuesses: 2, reward: { goldCoins: 3000, xp: 0 } }),
  new UnderXGuessesNormalWingo({ numberOfGuesses: 1, reward: { goldCoins: 5000, xp: 0 } }),
];
