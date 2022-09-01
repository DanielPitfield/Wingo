// TODO: This is not maintainable, should each mode have its own GamemodeSettingsInputLimits.ts file (within a folder)?

// Search for const MAX, const MIN, const DEFAULT

import { categoryMappings, wordLengthMappingsTargets } from "./WordArrayMappings";

// The wordLengths of target word arrays that have at least one word
const targetWordLengths = wordLengthMappingsTargets
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

export const MIN_PUZZLE_REVEAL_INTERVAL_SECONDS = 1;
export const MAX_PUZZLE_REVEAL_INTERVAL_SECONDS = 10;

// Must be atleast 1 letter blank (otherwise entire word is revealed)
export const MIN_PUZZLE_LEAVE_NUM_BLANKS = 1;

export const MAX_CODE_LENGTH = 9;

// Max number of characters permitted in a guess when using the numpad for any mode involving maths/arithemtic
export const MAX_NUMPAD_GUESS_LENGTH = 6;

export const MIN_NUM_SAME_LETTER_TOTAL_WORDS = 4;
export const MAX_NUM_SAME_LETTER_TOTAL_WORDS = 20;

export const MIN_NUM_SAME_LETTER_GUESSES = 1;
export const MAX_NUM_SAME_LETTER_GUESSES = 100;

export const MIN_NUM_SAME_LETTER_MATCHING_WORDS = 2;
export const MAX_NUM_SAME_LETTER_MATCHING_WORDS = 10;

export const MAX_NUMBLE_NUM_TEAMS = 4;

// TODO: All constants defined within generateSettingsOptions() functions, tha don't rely on state of components should be moved here
