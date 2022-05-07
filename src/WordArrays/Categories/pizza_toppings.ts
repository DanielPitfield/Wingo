import { words_herbs_and_spices } from "./herbs_and_spices";
import { words_meats_and_fish } from "./meats_and_fish";
import { words_vegetables } from "./vegetables";

export const words_pizza_toppings = words_meats_and_fish.concat(words_vegetables).concat(words_herbs_and_spices);
