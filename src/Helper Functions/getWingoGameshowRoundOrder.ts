const firstRoundWingo = { isPuzzle: false, wordLength: 4, basePoints: 200, pointsLostPerGuess: 0 };
const firstRoundPuzzle = { isPuzzle: true, wordLength: 9, basePoints: 300, pointsLostPerGuess: 40 };

const secondRoundWingo = { isPuzzle: false, wordLength: 5, basePoints: 300, pointsLostPerGuess: 0 };
const secondRoundPuzzle = { isPuzzle: true, wordLength: 10, basePoints: 400, pointsLostPerGuess: 60 };

const thirdRoundWingo4 = { isPuzzle: false, wordLength: 4, basePoints: 500, pointsLostPerGuess: 50 };
const thirdRoundWingo5 = { isPuzzle: false, wordLength: 5, basePoints: 500, pointsLostPerGuess: 50 };
const thirdRoundPuzzle = { isPuzzle: true, wordLength: 11, basePoints: 750, pointsLostPerGuess: 130 };

// TODO: Final round scoring (half, all, or double current gameshowScore)
const finalRound = [
  { isPuzzle: false, wordLength: 4, basePoints: 0, pointsLostPerGuess: 0 },
  { isPuzzle: false, wordLength: 5, basePoints: 0, pointsLostPerGuess: 0 },
  { isPuzzle: false, wordLength: 6, basePoints: 0, pointsLostPerGuess: 0 },
];

export function getWingoGameshowRoundOrder(roundOrderConfig: {
  firstRoundConfig: { numWingos: number; numPuzzles: number };
  secondRoundConfig: { numWingos: number; numPuzzles: number };
  thirdRoundConfig: {
    numFourLengthWingos: number;
    numPuzzles: number;
    numFiveLengthWingos: number;
    numberPuzzles: number;
  };
  hasFinalRound: boolean;
}) {
  const roundOrder =
    // First round
    Array.from({ length: roundOrderConfig.firstRoundConfig.numWingos })
      .map((_) => firstRoundWingo)
      .concat(Array.from({ length: roundOrderConfig.firstRoundConfig.numPuzzles }).map((_) => firstRoundPuzzle))
      // Second round
      .concat(Array.from({ length: roundOrderConfig.secondRoundConfig.numWingos }).map((_) => secondRoundWingo))
      .concat(Array.from({ length: roundOrderConfig.secondRoundConfig.numPuzzles }).map((_) => secondRoundPuzzle))
      // Third round
      .concat(
        Array.from({ length: roundOrderConfig.thirdRoundConfig.numFourLengthWingos }).map((_) => thirdRoundWingo4)
      )
      .concat(Array.from({ length: roundOrderConfig.thirdRoundConfig.numPuzzles }).map((_) => thirdRoundPuzzle))
      .concat(
        Array.from({ length: roundOrderConfig.thirdRoundConfig.numFiveLengthWingos }).map((_) => thirdRoundWingo5)
      )
      .concat(Array.from({ length: roundOrderConfig.thirdRoundConfig.numberPuzzles }).map((_) => thirdRoundPuzzle))
      // Final
      .concat(roundOrderConfig.hasFinalRound ? finalRound : []);

  return roundOrder;
}
