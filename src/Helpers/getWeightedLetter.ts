import { getRandomElementFrom } from "./getRandomElementFrom";

export function getWeightedLetter(letterWeightings: { letter: string; weighting: number }[]) {
  let weightedArray: string[] = [];

  // For each object in input array
  for (let i = 0; i < letterWeightings.length; i++) {
    // For the 'weighting' value number of times
    for (let j = 0; j < letterWeightings[i].weighting; j++) {
      // Push the related letter to the array
      weightedArray.push(letterWeightings[i].letter);
    }
  }

  // Select a random value from this array
  return getRandomElementFrom(weightedArray);
}
