import RacingBackgroundImageSrc from "./images/themes/Racing/background.png";
import RacingBackgroundAudioSrc from "./images/themes/Racing/background.mp3";
import RacingIcon1Src from "./images/themes/Racing/icon-1.png";
import RacingIcon2Src from "./images/themes/Racing/icon-2.png";
import RacingIcon3Src from "./images/themes/Racing/icon-3.png";
import RacingIcon4Src from "./images/themes/Racing/icon-4.png";
import RacingIcon5Src from "./images/themes/Racing/icon-5.png";

import SpaceBackgroundImageSrc from "./images/themes/Space/background.png";
import SpaceBackgroundAudioSrc from "./images/themes/Space/background.mp3";
import SpaceIcon1Src from "./images/themes/Space/icon-1.png";
import SpaceIcon2Src from "./images/themes/Space/icon-2.png";
import SpaceIcon3Src from "./images/themes/Space/icon-3.png";
import SpaceIcon4Src from "./images/themes/Space/icon-4.png";
import SpaceIcon5Src from "./images/themes/Space/icon-5.png";

import TravelBackgroundImageSrc from "./images/themes/Travel/background.png";
import TravelBackgroundAudioSrc from "./images/themes/Travel/background.mp3";
import TravelIcon1Src from "./images/themes/Travel/icon-1.png";
import TravelIcon2Src from "./images/themes/Travel/icon-2.png";
import TravelIcon3Src from "./images/themes/Travel/icon-3.png";
import TravelIcon4Src from "./images/themes/Travel/icon-4.png";
import TravelIcon5Src from "./images/themes/Travel/icon-5.png";

import NatureBackgroundImageSrc from "./images/themes/Nature/background.png";
import NatureBackgroundAudioSrc from "./images/themes/Nature/background.mp3";
import NatureIcon1Src from "./images/themes/Nature/icon-1.png";
import NatureIcon2Src from "./images/themes/Nature/icon-2.png";
import NatureIcon3Src from "./images/themes/Nature/icon-3.png";
import NatureIcon4Src from "./images/themes/Nature/icon-4.png";
import NatureIcon5Src from "./images/themes/Nature/icon-5.png";

import FantasyBackgroundImageSrc from "./images/themes/Fantasy/background.png";
import FantasyBackgroundAudioSrc from "./images/themes/Fantasy/background.mp3";
import FantasyIcon1Src from "./images/themes/Fantasy/icon-1.png";
import FantasyIcon2Src from "./images/themes/Fantasy/icon-2.png";
import FantasyIcon3Src from "./images/themes/Fantasy/icon-3.png";
import FantasyIcon4Src from "./images/themes/Fantasy/icon-4.png";
import FantasyIcon5Src from "./images/themes/Fantasy/icon-5.png";

import GeologyBackgroundImageSrc from "./images/themes/Geology/background.png";
import GeologyBackgroundAudioSrc from "./images/themes/Geology/background.mp3";
import GeologyIcon1Src from "./images/themes/Geology/icon-1.png";
import GeologyIcon2Src from "./images/themes/Geology/icon-2.png";
import GeologyIcon3Src from "./images/themes/Geology/icon-3.png";
import GeologyIcon4Src from "./images/themes/Geology/icon-4.png";
import GeologyIcon5Src from "./images/themes/Geology/icon-5.png";

import GenericWingoBackgroundImageSrc from "./images/themes/GenericWingo/background.png";
import GenericWingoBackgroundAudioSrc from "./images/themes/GenericWingo/background.mp3";
import GenericWingoIcon1Src from "./images/themes/GenericWingo/icon-1.png";
import GenericWingoIcon2Src from "./images/themes/GenericWingo/icon-2.png";
import GenericWingoIcon3Src from "./images/themes/GenericWingo/icon-3.png";
import GenericWingoIcon4Src from "./images/themes/GenericWingo/icon-4.png";
import GenericWingoIcon5Src from "./images/themes/GenericWingo/icon-5.png";

import GenericLetterCountdownBackgroundImageSrc from "./images/themes/GenericLetterCountdown/background.png";
import GenericLetterCountdownBackgroundAudioSrc from "./images/themes/GenericLetterCountdown/background.mp3";
import GenericLetterCountdownIcon1Src from "./images/themes/GenericLetterCountdown/icon-1.png";
import GenericLetterCountdownIcon2Src from "./images/themes/GenericLetterCountdown/icon-2.png";
import GenericLetterCountdownIcon3Src from "./images/themes/GenericLetterCountdown/icon-3.png";
import GenericLetterCountdownIcon4Src from "./images/themes/GenericLetterCountdown/icon-4.png";
import GenericLetterCountdownIcon5Src from "./images/themes/GenericLetterCountdown/icon-5.png";

import GenericNumberCountdownBackgroundImageSrc from "./images/themes/GenericNumberCountdown/background.png";
import GenericNumberCountdownBackgroundAudioSrc from "./images/themes/GenericNumberCountdown/background.mp3";
import GenericNumberCountdownIcon1Src from "./images/themes/GenericNumberCountdown/icon-1.png";
import GenericNumberCountdownIcon2Src from "./images/themes/GenericNumberCountdown/icon-2.png";
import GenericNumberCountdownIcon3Src from "./images/themes/GenericNumberCountdown/icon-3.png";
import GenericNumberCountdownIcon4Src from "./images/themes/GenericNumberCountdown/icon-4.png";
import GenericNumberCountdownIcon5Src from "./images/themes/GenericNumberCountdown/icon-5.png";

/* General theme */
export type Theme = {
  backgroundImageSrc: string;
  backgroundAudio: {
    src: string;
    volume: number;
  };
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
    backgroundImageSrc: SpaceBackgroundImageSrc,
    backgroundAudio: { src: SpaceBackgroundAudioSrc, volume: 1.0 },
    icon1Src: SpaceIcon1Src,
    icon2Src: SpaceIcon2Src,
    icon3Src: SpaceIcon3Src,
    icon4Src: SpaceIcon4Src,
    icon5Src: SpaceIcon5Src,
  },

  // Cars/racing
  Cars: {
    backgroundImageSrc: RacingBackgroundImageSrc,
    backgroundAudio: { src: RacingBackgroundAudioSrc, volume: 0.5 },
    icon1Src: RacingIcon1Src,
    icon2Src: RacingIcon2Src,
    icon3Src: RacingIcon3Src,
    icon4Src: RacingIcon4Src,
    icon5Src: RacingIcon5Src,
  },

  // Travel
  Travel: {
    backgroundImageSrc: TravelBackgroundImageSrc,
    backgroundAudio: { src: TravelBackgroundAudioSrc, volume: 0.45 },
    icon1Src: TravelIcon1Src,
    icon2Src: TravelIcon2Src,
    icon3Src: TravelIcon3Src,
    icon4Src: TravelIcon4Src,
    icon5Src: TravelIcon5Src,
  },

  // Travel
  Nature: {
    backgroundImageSrc: NatureBackgroundImageSrc,
    backgroundAudio: { src: NatureBackgroundAudioSrc, volume: 0.5 },
    icon1Src: NatureIcon1Src,
    icon2Src: NatureIcon2Src,
    icon3Src: NatureIcon3Src,
    icon4Src: NatureIcon4Src,
    icon5Src: NatureIcon5Src,
  },

  // Geology
  Geology: {
    backgroundImageSrc: GeologyBackgroundImageSrc,
    backgroundAudio: { src: GeologyBackgroundAudioSrc, volume: 0.4 },
    icon1Src: GeologyIcon1Src,
    icon2Src: GeologyIcon2Src,
    icon3Src: GeologyIcon3Src,
    icon4Src: GeologyIcon4Src,
    icon5Src: GeologyIcon5Src,
  },

  // Fantasy
  Fantasy: {
    backgroundImageSrc: FantasyBackgroundImageSrc,
    backgroundAudio: { src: FantasyBackgroundAudioSrc, volume: 0.8 },
    icon1Src: FantasyIcon1Src,
    icon2Src: FantasyIcon2Src,
    icon3Src: FantasyIcon3Src,
    icon4Src: FantasyIcon4Src,
    icon5Src: FantasyIcon5Src,
  },

  // Generic wingo
  GenericWingo: {
    backgroundImageSrc: GenericWingoBackgroundImageSrc,
    backgroundAudio: { src: GenericWingoBackgroundAudioSrc, volume: 0.18 },
    icon1Src: GenericWingoIcon1Src,
    icon2Src: GenericWingoIcon2Src,
    icon3Src: GenericWingoIcon3Src,
    icon4Src: GenericWingoIcon4Src,
    icon5Src: GenericWingoIcon5Src,
  },

  // Countdown studio
  GenericLetterCountdown: {
    backgroundImageSrc: GenericLetterCountdownBackgroundImageSrc,
    backgroundAudio: { src: GenericLetterCountdownBackgroundAudioSrc, volume: 1.0 },
    icon1Src: GenericLetterCountdownIcon1Src,
    icon2Src: GenericLetterCountdownIcon2Src,
    icon3Src: GenericLetterCountdownIcon3Src,
    icon4Src: GenericLetterCountdownIcon4Src,
    icon5Src: GenericLetterCountdownIcon5Src,
  },

  // Countdown studio
  GenericNumberCountdown: {
    backgroundImageSrc: GenericNumberCountdownBackgroundImageSrc,
    backgroundAudio: { src: GenericNumberCountdownBackgroundAudioSrc, volume: 1.0 },
    icon1Src: GenericNumberCountdownIcon1Src,
    icon2Src: GenericNumberCountdownIcon2Src,
    icon3Src: GenericNumberCountdownIcon3Src,
    icon4Src: GenericNumberCountdownIcon4Src,
    icon5Src: GenericNumberCountdownIcon5Src,
  },
};
