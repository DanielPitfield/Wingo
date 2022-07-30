import { words_herbs_and_spices } from "./HerbsAndSpices";
import { words_meats_and_fish } from "./MeatsAndFish";
import { words_vegetables } from "./Vegetables";

export const words_pizza_toppings = words_meats_and_fish.concat(words_vegetables).concat(words_herbs_and_spices);
