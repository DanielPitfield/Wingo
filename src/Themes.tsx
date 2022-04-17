import RacingBackgroundSrc from "./images/themes/Racing/background.png";
import RacingIcon1Src from "./images/themes/Racing/icon-1.png";
import RacingIcon2Src from "./images/themes/Racing/icon-2.png";
import RacingIcon3Src from "./images/themes/Racing/icon-3.png";
import RacingIcon4Src from "./images/themes/Racing/icon-4.png";
import RacingIcon5Src from "./images/themes/Racing/icon-5.png";

import SpaceBackgroundSrc from "./images/themes/Space/background.png";
import SpaceIcon1Src from "./images/themes/Space/icon-1.png";
import SpaceIcon2Src from "./images/themes/Space/icon-2.png";
import SpaceIcon3Src from "./images/themes/Space/icon-3.png";
import SpaceIcon4Src from "./images/themes/Space/icon-4.png";
import SpaceIcon5Src from "./images/themes/Space/icon-5.png";

import TravelBackgroundSrc from "./images/themes/Travel/background.png";
import TravelIcon1Src from "./images/themes/Travel/icon-1.png";
import TravelIcon2Src from "./images/themes/Travel/icon-2.png";
import TravelIcon3Src from "./images/themes/Travel/icon-3.png";
import TravelIcon4Src from "./images/themes/Travel/icon-4.png";
import TravelIcon5Src from "./images/themes/Travel/icon-5.png";

import NatureBackgroundSrc from "./images/themes/Nature/background.png";
import NatureIcon1Src from "./images/themes/Nature/icon-1.png";
import NatureIcon2Src from "./images/themes/Nature/icon-2.png";
import NatureIcon3Src from "./images/themes/Nature/icon-3.png";
import NatureIcon4Src from "./images/themes/Nature/icon-4.png";
import NatureIcon5Src from "./images/themes/Nature/icon-5.png";

import FantasyBackgroundSrc from "./images/themes/Fantasy/background.png";
import FantasyIcon1Src from "./images/themes/Fantasy/icon-1.png";
import FantasyIcon2Src from "./images/themes/Fantasy/icon-2.png";
import FantasyIcon3Src from "./images/themes/Fantasy/icon-3.png";
import FantasyIcon4Src from "./images/themes/Fantasy/icon-4.png";
import FantasyIcon5Src from "./images/themes/Fantasy/icon-5.png";

import GeologyBackgroundSrc from "./images/themes/Geology/background.png";
import GeologyIcon1Src from "./images/themes/Geology/icon-1.png";
import GeologyIcon2Src from "./images/themes/Geology/icon-2.png";
import GeologyIcon3Src from "./images/themes/Geology/icon-3.png";
import GeologyIcon4Src from "./images/themes/Geology/icon-4.png";
import GeologyIcon5Src from "./images/themes/Geology/icon-5.png";

import GenericWingoBackgroundSrc from "./images/themes/GenericWingo/background.png";
import GenericWingoIcon1Src from "./images/themes/GenericWingo/icon-1.png";
import GenericWingoIcon2Src from "./images/themes/GenericWingo/icon-2.png";
import GenericWingoIcon3Src from "./images/themes/GenericWingo/icon-3.png";
import GenericWingoIcon4Src from "./images/themes/GenericWingo/icon-4.png";
import GenericWingoIcon5Src from "./images/themes/GenericWingo/icon-5.png";

import GenericCountdownBackgroundSrc from "./images/themes/GenericCountdown/background.png";
import GenericCountdownIcon1Src from "./images/themes/GenericCountdown/icon-1.png";
import GenericCountdownIcon2Src from "./images/themes/GenericCountdown/icon-2.png";
import GenericCountdownIcon3Src from "./images/themes/GenericCountdown/icon-3.png";
import GenericCountdownIcon4Src from "./images/themes/GenericCountdown/icon-4.png";
import GenericCountdownIcon5Src from "./images/themes/GenericCountdown/icon-5.png";

/* General theme */
export type Theme = {
  backgroundImageSrc: string;
} & ThemeIcons;

/* Theme for the individual icons */
export type ThemeIcons = {
  icon1Src: string;
  icon2Src: string;
  icon3Src: string;
  icon4Src: string;
  icon5Src: string;
};

/** All themes for the background and icons of a game */
export const Themes = {
  // Space
  Space: {
    backgroundImageSrc: SpaceBackgroundSrc,
    icon1Src: SpaceIcon1Src,
    icon2Src: SpaceIcon2Src,
    icon3Src: SpaceIcon3Src,
    icon4Src: SpaceIcon4Src,
    icon5Src: SpaceIcon5Src,
  },

  // Cars/racing
  Cars: {
    backgroundImageSrc: RacingBackgroundSrc,
    icon1Src: RacingIcon1Src,
    icon2Src: RacingIcon2Src,
    icon3Src: RacingIcon3Src,
    icon4Src: RacingIcon4Src,
    icon5Src: RacingIcon5Src,
  },

  // Travel
  Travel: {
    backgroundImageSrc: TravelBackgroundSrc,
    icon1Src: TravelIcon1Src,
    icon2Src: TravelIcon2Src,
    icon3Src: TravelIcon3Src,
    icon4Src: TravelIcon4Src,
    icon5Src: TravelIcon5Src,
  },

  // Travel
  Nature: {
    backgroundImageSrc: NatureBackgroundSrc,
    icon1Src: NatureIcon1Src,
    icon2Src: NatureIcon2Src,
    icon3Src: NatureIcon3Src,
    icon4Src: NatureIcon4Src,
    icon5Src: NatureIcon5Src,
  },

  // Geology
  Geology: {
    backgroundImageSrc: GeologyBackgroundSrc,
    icon1Src: GeologyIcon1Src,
    icon2Src: GeologyIcon2Src,
    icon3Src: GeologyIcon3Src,
    icon4Src: GeologyIcon4Src,
    icon5Src: GeologyIcon5Src,
  },

  // Fantasy
  Fantasy: {
    backgroundImageSrc: FantasyBackgroundSrc,
    icon1Src: FantasyIcon1Src,
    icon2Src: FantasyIcon2Src,
    icon3Src: FantasyIcon3Src,
    icon4Src: FantasyIcon4Src,
    icon5Src: FantasyIcon5Src,
  },

  // Generic wingo
  GenericWingo: {
    backgroundImageSrc: GenericWingoBackgroundSrc,
    icon1Src: GenericWingoIcon1Src,
    icon2Src: GenericWingoIcon2Src,
    icon3Src: GenericWingoIcon3Src,
    icon4Src: GenericWingoIcon4Src,
    icon5Src: GenericWingoIcon5Src,
  },

  // Countdown studio
  GenericCountdown: {
    backgroundImageSrc: GenericCountdownBackgroundSrc,
    icon1Src: GenericCountdownIcon1Src,
    icon2Src: GenericCountdownIcon2Src,
    icon3Src: GenericCountdownIcon3Src,
    icon4Src: GenericCountdownIcon4Src,
    icon5Src: GenericCountdownIcon5Src,
  },
};
