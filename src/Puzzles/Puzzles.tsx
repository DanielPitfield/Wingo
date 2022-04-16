import { PuzzleConfigProps } from "./PuzzleConfig";
import SpaceBackgroundSrc from "../images/space.webp";
import RaceTrackBacgroundSrc from "../images/race-track.jpg";
import Planet1Src from "../images/planet-1.png";
import Planet2Src from "../images/planet-2.png";
import Planet3Src from "../images/planet-3.png";
import Planet4Src from "../images/planet-4.png";
import Planet5Src from "../images/planet-5.png";
import Car1Src from "../images/car-1.png";

/** All themes for the background and icons of a puzzle */
const Themes: { [name: string]: PuzzleConfigProps["theme"] } = {
  // Space
  Space: {
    backgroundImageSrc: SpaceBackgroundSrc,
    icon1Src: Planet1Src,
    icon2Src: Planet2Src,
    icon3Src: Planet3Src,
    icon4Src: Planet4Src,
    icon5Src: Planet5Src,
  },

  // Cars/racing
  Cars: {
    backgroundImageSrc: RaceTrackBacgroundSrc,
    icon1Src: Car1Src,
    icon2Src: Car1Src,
    icon3Src: Car1Src,
    icon4Src: Car1Src,
    icon5Src: Car1Src,
  },
};

/** All puzzles */
export const Puzzles: PuzzleConfigProps[] = [
  // Single icon, moving vertically downwards
  {
    type: "sequence",
    theme: Themes.Space,
    sequence: {
      hint: [
        {
          icon1: { left: "10%", top: "10%" },
        },
        {
          icon1: { left: "30%", top: "10%" },
        },
        {
          icon1: { left: "50%", top: "10%" },
        },
      ],
      correctAnswer: {
        icon1: { left: "70%", top: "10%" },
      },
      incorrectAnswers: [
        { icon1: { left: "10%", top: "20%" } },
        { icon1: { left: "30%", top: "50%" } },
        { icon1: { left: "50%", top: "10%" } },
      ],
    },
  },

  // Single icon, moving horizontally across
  {
    type: "sequence",
    theme: Themes.Space,
    sequence: {
      hint: [
        {
          icon1: { left: "10%", top: "10%" },
        },
        {
          icon1: { left: "10%", top: "30%" },
        },
        {
          icon1: { left: "10%", top: "50%" },
        },
      ],
      correctAnswer: {
        icon1: { left: "10%", top: "70%" },
      },
      incorrectAnswers: [
        { icon1: { left: "10%", top: "50%" } },
        { icon1: { left: "30%", top: "70%" } },
        { icon1: { left: "50%", top: "70%" } },
      ],
    },
  },

  // Two icons, one moving vertically downwards, the other moving horizontally across
  {
    type: "sequence",
    theme: Themes.Space,
    sequence: {
      hint: [
        {
          icon1: { left: "10%", top: "10%" },
          icon2: { left: "10%", top: "10%" },
        },
        {
          icon1: { left: "10%", top: "30%" },
          icon2: { left: "30%", top: "10%" },
        },
        {
          icon1: { left: "10%", top: "50%" },
          icon2: { left: "50%", top: "10%" },
        },
      ],
      correctAnswer: {
        icon1: { left: "10%", top: "70%" },
        icon2: { left: "70%", top: "10%" },
      },
      incorrectAnswers: [
        { icon1: { left: "10%", top: "50%" }, icon2: { left: "50%", top: "10%" } },
        { icon1: { left: "30%", top: "70%" }, icon2: { left: "50%", top: "20%" } },
        { icon1: { left: "50%", top: "70%" }, icon2: { left: "30%", top: "10%" } },
      ],
    },
  },
  
];
