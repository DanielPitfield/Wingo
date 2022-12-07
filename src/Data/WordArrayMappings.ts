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

import { categoryWordsAnimals } from "./WordArrays/Categories/Animals";
import { categoryWordsCapitalCities } from "./WordArrays/Categories/CapitalCities";
import { categoryWordsChemicalElements } from "./WordArrays/Categories/ChemicalElements";
import { categoryWordsColours } from "./WordArrays/Categories/Colours";
import { categoryWordsCountries } from "./WordArrays/Categories/Countries";
import { categoryWordsDogs } from "./WordArrays/Categories/Dogs";
import { categoryWordsFruits } from "./WordArrays/Categories/Fruits";
import { categoryWordsGemstones } from "./WordArrays/Categories/Gemstones";
import { categoryWordsHerbsAndSpices } from "./WordArrays/Categories/HerbsAndSpices";
import { categoryWordsMeatsAndFish } from "./WordArrays/Categories/MeatsAndFish";
import { categoryWordsSports } from "./WordArrays/Categories/Sports";
import { categoryWordsVegetables } from "./WordArrays/Categories/Vegetables";

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
  { name: "Animals", array: categoryWordsAnimals },
  { name: "Capital Cities", array: categoryWordsCapitalCities },
  { name: "Chemical Elements", array: categoryWordsChemicalElements },
  { name: "Colours", array: categoryWordsColours },
  { name: "Countries", array: categoryWordsCountries },
  { name: "Dog Breeds", array: categoryWordsDogs },
  { name: "Fruits", array: categoryWordsFruits },
  { name: "Gemstones", array: categoryWordsGemstones },
  { name: "Herbs and Spices", array: categoryWordsHerbsAndSpices },
  { name: "Meats and Fish", array: categoryWordsMeatsAndFish },
  { name: "Sports", array: categoryWordsSports },
  { name: "Vegetables", array: categoryWordsVegetables },
];
