import { Themes } from "../Themes";
import { AreaConfig } from "../../Pages/Area";
import { commonWingoSettings } from "../DefaultGamemodeSettings";

export const area: AreaConfig = {
  name: "Tutorial",
  theme: Themes.GenericWingo,
  unlock_level: {
    type: "unlock-level",
    hint: (
      <>
        Every area must first be unlocked by guessing the name of the area
        <br />
        Since this is the tutorial, we'll tell you that the answer is: <strong>START</strong>
        <br />
        Try entering the word <strong>START</strong>
      </>
    ),
    level: {
      gameCategory: "Wingo",
      page: "/Wingo/Repeat",
      levelProps: {
        mode: "repeat",
        targetWord: "start",
        gamemodeSettings: {
          ...commonWingoSettings,
        },
      },
    },
  },
  levels: [
    {
      type: "level",
      hint: <>To acquire new knowledge</>,
      levelButtonCoords: {
        x: 10,
        y: 10,
      },
      level: {
        gameCategory: "Wingo",
        page: "/Wingo/Repeat",
        levelProps: {
          mode: "repeat",
          targetWord: "learn",
          gamemodeSettings: {
            ...commonWingoSettings,
          },
        },
      },
    },
  ],
};
