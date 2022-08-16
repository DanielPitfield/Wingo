// TODO: PuzzleWordMappings? There are currently only 10 length puzzle words
export const MIN_PUZZLE_WORD_LENGTH = 9;
export const MAX_PUZZLE_WORD_LENGTH = 11;

export const MIN_PUZZLE_REVEAL_INTERVAL_SECONDS = 1;
export const MAX_PUZZLE_REVEAL_INTERVAL_SECONDS = 10;

// Must be atleast 1 letter blank (otherwise entire word is revealed)
export const MIN_PUZZLE_LEAVE_NUM_BLANKS = 1;

// TODO: All constants defined within generateSettingsOptions() functions, tha don't rely on state of components should be moved here