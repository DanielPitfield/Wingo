import { Themes } from "../Themes";
import { AreaConfig } from "../../Pages/Area";
import { commonWingoSettings } from "../DefaultGamemodeSettings";

export const area: AreaConfig = {
  name: "Nature",
  theme: Themes.Nature,
  unlock_level: {
    type: "unlock-level",
    hint: <>Unlock this area</>,
    level: {
      gameCategory: "Wingo",
      page: "/Wingo/Repeat",
      levelProps: {
        mode: "repeat",
        targetWord: "nature",
        gamemodeSettings: {
          ...commonWingoSettings,
          wordLength: 6,
        },
      },
    },
  },

  levels: [],
};
