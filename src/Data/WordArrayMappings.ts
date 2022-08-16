import { words_animals } from "./WordArrays/Categories/Animals";
import { words_capital_cities } from "./WordArrays/Categories/CapitalCities";
import { words_chemical_elements } from "./WordArrays/Categories/ChemicalElements";
import { words_colours } from "./WordArrays/Categories/Colours";
import { words_countries } from "./WordArrays/Categories/Countries";
import { words_dogs } from "./WordArrays/Categories/Dogs";
import { words_fruits } from "./WordArrays/Categories/Fruits";
import { words_gemstones } from "./WordArrays/Categories/Gemstones";
import { words_herbs_and_spices } from "./WordArrays/Categories/HerbsAndSpices";
import { words_meats_and_fish } from "./WordArrays/Categories/MeatsAndFish";
import { words_pizza_toppings } from "./WordArrays/Categories/PizzaToppings";
import { words_sports } from "./WordArrays/Categories/Sports";
import { words_vegetables } from "./WordArrays/Categories/Vegetables";
import { words_ten_targets, words_ten_guessable } from "./WordArrays/Lengths/Words10";
import { words_eleven_targets, words_eleven_guessable } from "./WordArrays/Lengths/Words11";
import { words_three_targets, words_three_guessable } from "./WordArrays/Lengths/Words3";
import { words_four_targets, words_four_guessable } from "./WordArrays/Lengths/Words4";
import { words_five_targets, words_five_guessable } from "./WordArrays/Lengths/Words5";
import { words_six_targets, words_six_guessable } from "./WordArrays/Lengths/Words6";
import { words_seven_targets, words_seven_guessable } from "./WordArrays/Lengths/Words7";
import { words_eight_targets, words_eight_guessable } from "./WordArrays/Lengths/Words8";
import { words_nine_targets, words_nine_guessable } from "./WordArrays/Lengths/Words9";
import { words_puzzles } from "./WordArrays/WordsPuzzles";

// --- Default values/variables --- //
export const wordLengthMappingsTargets = [
  { value: 3, array: words_three_targets },
  { value: 4, array: words_four_targets },
  { value: 5, array: words_five_targets },
  { value: 6, array: words_six_targets },
  { value: 7, array: words_seven_targets },
  { value: 8, array: words_eight_targets },
  { value: 9, array: words_nine_targets },
  { value: 10, array: words_ten_targets },
  { value: 11, array: words_eleven_targets },
];

export const wordLengthMappingsGuessable = [
  { value: 3, array: words_three_guessable },
  { value: 4, array: words_four_guessable },
  { value: 5, array: words_five_guessable },
  { value: 6, array: words_six_guessable },
  { value: 7, array: words_seven_guessable },
  { value: 8, array: words_eight_guessable },
  { value: 9, array: words_nine_guessable },
  { value: 10, array: words_ten_guessable },
  { value: 11, array: words_eleven_guessable },
];

export const categoryMappings = [
  { name: "Animals", array: words_animals },
  { name: "Capital Cities", array: words_capital_cities },
  { name: "Chemical Elements", array: words_chemical_elements },
  { name: "Colours", array: words_colours },
  { name: "Countries", array: words_countries },
  { name: "Dog Breeds", array: words_dogs },
  { name: "Fruits", array: words_fruits },
  { name: "Gemstones", array: words_gemstones },
  { name: "Herbs and Spices", array: words_herbs_and_spices },
  { name: "Meats and Fish", array: words_meats_and_fish },
  { name: "Pizza Toppings", array: words_pizza_toppings },
  // TODO: Should puzzles be here? The puzzles are mostly unrelated to each other and aren't really a category
  { name: "Puzzles", array: words_puzzles },
  { name: "Sports", array: words_sports },
  { name: "Vegetables", array: words_vegetables },
];