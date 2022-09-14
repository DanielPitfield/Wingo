// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
export function shuffleArray<T>(array: T[]): T[] {
  if (!array) {
    return [];
  }

  let currentIndex = array.length;
  let randomIndex;

  // Make a copy of array to differentiate from input parameter
  let newArray = array.slice();

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [newArray[currentIndex], newArray[randomIndex]] = [newArray[randomIndex], newArray[currentIndex]];
  }

  return newArray;
}