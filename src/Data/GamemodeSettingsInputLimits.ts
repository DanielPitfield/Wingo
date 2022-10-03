import { categoryMappings, targetWordLengthMappings } from "./WordArrayMappings";

// The wordLengths of target word arrays that have at least one word
const targetWordLengths = targetWordLengthMappings
  .filter((mapping) => mapping.array.length > 0)
  .map((mapping) => mapping.value);

// What length is the shortest possible target word?
export const MIN_TARGET_WORD_LENGTH = Math.min(...targetWordLengths);
// What length is the longest possible target word?
export const MAX_TARGET_WORD_LENGTH = Math.max(...targetWordLengths);

// The number of categories with at least one word
export const MAX_NUM_CATEGORIES = categoryMappings.filter((mapping) => mapping.array.length > 0).length;

// TODO: PuzzleWordMappings? There are currently only 10 length puzzle words
export const MIN_PUZZLE_WORD_LENGTH = 9;
export const MAX_PUZZLE_WORD_LENGTH = 11;

// Max number of characters permitted in a guess when using the numpad for guessing wordCodes
export const MAX_CODE_LENGTH = 9;

// Max number of characters permitted in a guess when using the numpad for maths/aritmetic
export const MAX_NUMPAD_GUESS_LENGTH = 6;
