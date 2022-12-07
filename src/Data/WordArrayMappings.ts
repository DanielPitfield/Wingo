import { targetWords3, guessableWords3 } from "./WordArrays/Lengths/Words3";
import { targetWords4, guessableWords4 } from "./WordArrays/Lengths/Words4";
import { targetWords5, guessableWords5 } from "./WordArrays/Lengths/Words5";
import { targetWords6, guessableWords6 } from "./WordArrays/Lengths/Words6";
import { targetWords7, guessableWords7 } from "./WordArrays/Lengths/Words7";
import { targetWords8, guessableWords8 } from "./WordArrays/Lengths/Words8";
import { targetWords9, guessableWords9 } from "./WordArrays/Lengths/Words9";
import { targetWords10, guessableWords10 } from "./WordArrays/Lengths/Words10";
import { targetWords11, guessableWords11 } from "./WordArrays/Lengths/Words11";

import { Puzzles10 } from "./WordArrays/Puzzles/Puzzles10";

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

export const targetWordLengthMappings = [
  { value: 3, array: targetWords3 },
  { value: 4, array: targetWords4 },
  { value: 5, array: targetWords5 },
  { value: 6, array: targetWords6 },
  { value: 7, array: targetWords7 },
  { value: 8, array: targetWords8 },
  { value: 9, array: targetWords9 },
  { value: 10, array: targetWords10 },
  { value: 11, array: targetWords11 },
];

export const guessableWordLengthMappings = [
  { value: 3, array: guessableWords3 },
  { value: 4, array: guessableWords4 },
  { value: 5, array: guessableWords5 },
  { value: 6, array: guessableWords6 },
  { value: 7, array: guessableWords7 },
  { value: 8, array: guessableWords8 },
  { value: 9, array: guessableWords9 },
  { value: 10, array: guessableWords10 },
  { value: 11, array: guessableWords11 },
];

export const puzzleWordLengthMappings = [{ value: 10, array: Puzzles10 }];

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
  { name: "Sports", array: words_sports },
  { name: "Vegetables", array: words_vegetables },
];
