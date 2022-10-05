import { categoryMappings } from "../Data/WordArrayMappings";
import { GridWord } from "../Pages/OnlyConnect";
import { shuffleArray } from "./shuffleArray";

const isFirstRowSameCategory = (gridWords: GridWord[]) => {
  return gridWords.slice(0, 3).every((word) => word.categoryName === gridWords[0].categoryName);
};

// (gamemodeSettings.groupSize) words from (gamemodeSettings.numGroups) categories, shuffled
export function getOnlyConnectGridWords(numGroups: number, groupSize: number): GridWord[] {
  // Array to hold all the words for the grid (along with their categories)
  let gridWords: GridWord[] = [];

  // Use the specified number of categories (but never exceed the number of category word lists)
  const numCategories = Math.min(numGroups, categoryMappings.length);
  // Filter the categories which have enough enough words in their word list
  const suitableCategories = categoryMappings.filter(
    (category) => category.array.length >= groupSize /* TODO: Leeway for word replacements? */
  );
  // Randomly select the required number of categories
  const chosenCategories = shuffleArray(suitableCategories).slice(0, numCategories);

  for (const category of chosenCategories) {
    /* 
      Words from this category (which aren't already included in gridWords from other categories)
      e.g The word 'Duck' can be from both the 'Meats and Fish' and 'Animals' categories
      May need to add leeway to the condition of suitableCategories to accomodate for these kinds of replacements
      */
    const wordList: string[] = shuffleArray(category.array)
      .map((x) => x.word)
      .filter((word) => !gridWords.map((x) => x.word).includes(word));
    // The subset of words chosen from this category
    const wordSubset = wordList.slice(0, groupSize);

    // Attach category name to every word (in an object)
    const categorySubset = wordSubset.map((word) => ({
      word: word,
      categoryName: category.name,
      inCompleteGroup: false,
      rowNumber: null,
    }));

    // Add group of words
    gridWords = gridWords.concat(categorySubset);
  }

  let shuffledWords = shuffleArray(gridWords);

  while (isFirstRowSameCategory(shuffledWords)) {
    shuffledWords = shuffleArray(gridWords);
  }

  return shuffledWords;
}
