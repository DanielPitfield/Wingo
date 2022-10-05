import { categoryMappings } from "../Data/WordArrayMappings";
import { GridWord } from "../Pages/OnlyConnect";
import { shuffleArray } from "./shuffleArray";

// Is every word on the first row from the same category?
const isFirstRowSameCategory = (gridWords: GridWord[]) => {
  return gridWords.slice(0, 3).every((word) => word.categoryName === gridWords[0].categoryName);
};

/* 
The word 'Duck' can be from both the 'Meats and Fish' and 'Animals' categories,
Need to add leeway (extra amount of words from a category's array) to accomodate for these kinds of replacements
*/
const NUM_WORD_REPLACEMENTS = 2;

// (gamemodeSettings.groupSize) words from (gamemodeSettings.numGroups) categories, shuffled
export function getOnlyConnectGridWords(numGroups: number, groupSize: number): GridWord[] {
  // Use the specified number of categories (but never exceed the number of category word lists)
  const numCategories = Math.min(numGroups, categoryMappings.length);

  // Filter the categories which have enough enough words in their word list
  const suitableCategories = categoryMappings.filter(
    (category) => category.array.length >= groupSize + NUM_WORD_REPLACEMENTS
  );

  // Randomly select the required number of categories
  const chosenCategories = shuffleArray(suitableCategories).slice(0, numCategories);

  let gridWords: GridWord[] = [];

  for (const category of chosenCategories) {
    const categorySubset: GridWord[] = shuffleArray(category.array)
      // The words from the category's array
      .map((x) => x.word)
      // Filter the words which aren't already included in gridWords (came from other categories)
      .filter((word) => !gridWords.map((x) => x.word).includes(word))
      // The subset of words chosen
      .slice(0, groupSize)
      // Attach category name to every word (in an object)
      .map((word) => ({
        word: word,
        categoryName: category.name,
        inCompleteGroup: false,
        rowNumber: null,
      }));

    gridWords = gridWords.concat(categorySubset);
  }

  // Initial shuffle (because the gridWords are created in the correct order)
  let shuffledWords = shuffleArray(gridWords);

  // Keep shuffling until every word on the first row is not from the same category
  while (isFirstRowSameCategory(shuffledWords)) {
    shuffledWords = shuffleArray(gridWords);
  }

  return shuffledWords;
}