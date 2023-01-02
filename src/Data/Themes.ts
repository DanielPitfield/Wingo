import RacingBackgroundImageSrc from "../Data/Images/themes/Racing/background.png";
import RacingBackgroundAudioSrc from "../Data/Images/themes/Racing/background.mp3";
import RacingIcon1Src from "../Data/Images/themes/Racing/icon-1.png";
import RacingIcon2Src from "../Data/Images/themes/Racing/icon-2.png";
import RacingIcon3Src from "../Data/Images/themes/Racing/icon-3.png";
import RacingIcon4Src from "../Data/Images/themes/Racing/icon-4.png";
import RacingIcon5Src from "../Data/Images/themes/Racing/icon-5.png";

import SpaceBackgroundImageSrc from "../Data/Images/themes/Space/background.png";
import SpaceBackgroundAudioSrc from "../Data/Images/themes/Space/background.mp3";
import SpaceIcon1Src from "../Data/Images/themes/Space/icon-1.png";
import SpaceIcon2Src from "../Data/Images/themes/Space/icon-2.png";
import SpaceIcon3Src from "../Data/Images/themes/Space/icon-3.png";
import SpaceIcon4Src from "../Data/Images/themes/Space/icon-4.png";
import SpaceIcon5Src from "../Data/Images/themes/Space/icon-5.png";

import TravelBackgroundImageSrc from "../Data/Images/themes/Travel/background.jpg";
import TravelBackgroundAudioSrc from "../Data/Images/themes/Travel/background.mp3";
import TravelIcon1Src from "../Data/Images/themes/Travel/icon-1.png";
import TravelIcon2Src from "../Data/Images/themes/Travel/icon-2.png";
import TravelIcon3Src from "../Data/Images/themes/Travel/icon-3.png";
import TravelIcon4Src from "../Data/Images/themes/Travel/icon-4.png";
import TravelIcon5Src from "../Data/Images/themes/Travel/icon-5.png";

import NatureBackgroundImageSrc from "../Data/Images/themes/Nature/background.png";
import NatureBackgroundAudioSrc from "../Data/Images/themes/Nature/background.mp3";
import NatureIcon1Src from "../Data/Images/themes/Nature/icon-1.png";
import NatureIcon2Src from "../Data/Images/themes/Nature/icon-2.png";
import NatureIcon3Src from "../Data/Images/themes/Nature/icon-3.png";
import NatureIcon4Src from "../Data/Images/themes/Nature/icon-4.png";
import NatureIcon5Src from "../Data/Images/themes/Nature/icon-5.png";

import FantasyBackgroundImageSrc from "../Data/Images/themes/Fantasy/background.png";
import FantasyBackgroundAudioSrc from "../Data/Images/themes/Fantasy/background.mp3";
import FantasyIcon1Src from "../Data/Images/themes/Fantasy/icon-1.png";
import FantasyIcon2Src from "../Data/Images/themes/Fantasy/icon-2.png";
import FantasyIcon3Src from "../Data/Images/themes/Fantasy/icon-3.png";
import FantasyIcon4Src from "../Data/Images/themes/Fantasy/icon-4.png";
import FantasyIcon5Src from "../Data/Images/themes/Fantasy/icon-5.png";

import GeologyBackgroundImageSrc from "../Data/Images/themes/Geology/background.png";
import GeologyBackgroundAudioSrc from "../Data/Images/themes/Geology/background.mp3";
import GeologyIcon1Src from "../Data/Images/themes/Geology/icon-1.png";
import GeologyIcon2Src from "../Data/Images/themes/Geology/icon-2.png";
import GeologyIcon3Src from "../Data/Images/themes/Geology/icon-3.png";
import GeologyIcon4Src from "../Data/Images/themes/Geology/icon-4.png";
import GeologyIcon5Src from "../Data/Images/themes/Geology/icon-5.png";

import GenericWingoBackgroundImageSrc from "../Data/Images/themes/GenericWingo/background.png";
import GenericWingoBackgroundAudioSrc from "../Data/Images/themes/GenericWingo/background.mp3";
import GenericWingoIcon1Src from "../Data/Images/themes/GenericWingo/icon-1.png";
import GenericWingoIcon2Src from "../Data/Images/themes/GenericWingo/icon-2.png";
import GenericWingoIcon3Src from "../Data/Images/themes/GenericWingo/icon-3.png";
import GenericWingoIcon4Src from "../Data/Images/themes/GenericWingo/icon-4.png";
import GenericWingoIcon5Src from "../Data/Images/themes/GenericWingo/icon-5.png";

import GenericLettersGameBackgroundImageSrc from "../Data/Images/themes/GenericLettersGame/background.png";
import GenericLettersGameBackgroundAudioSrc from "../Data/Images/themes/GenericLettersGame/background.mp3";
import GenericLettersGameIcon1Src from "../Data/Images/themes/GenericLettersGame/icon-1.png";
import GenericLettersGameIcon2Src from "../Data/Images/themes/GenericLettersGame/icon-2.png";
import GenericLettersGameIcon3Src from "../Data/Images/themes/GenericLettersGame/icon-3.png";
import GenericLettersGameIcon4Src from "../Data/Images/themes/GenericLettersGame/icon-4.png";
import GenericLettersGameIcon5Src from "../Data/Images/themes/GenericLettersGame/icon-5.png";

import GenericNumbersGameBackgroundImageSrc from "../Data/Images/themes/GenericNumbersGame/background.png";
import GenericNumbersGameBackgroundAudioSrc from "../Data/Images/themes/GenericNumbersGame/background.mp3";
import GenericNumbersGameIcon1Src from "../Data/Images/themes/GenericNumbersGame/icon-1.png";
import GenericNumbersGameIcon2Src from "../Data/Images/themes/GenericNumbersGame/icon-2.png";
import GenericNumbersGameIcon3Src from "../Data/Images/themes/GenericNumbersGame/icon-3.png";
import GenericNumbersGameIcon4Src from "../Data/Images/themes/GenericNumbersGame/icon-4.png";
import GenericNumbersGameIcon5Src from "../Data/Images/themes/GenericNumbersGame/icon-5.png";

/* General theme */
export type Theme = {
  isSelectable: boolean;
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
    isSelectable: true,
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
    isSelectable: true,
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
    isSelectable: true,
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
    isSelectable: true,
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
    isSelectable: true,
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
    isSelectable: true,
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
    isSelectable: false,
    backgroundImageSrc: GenericWingoBackgroundImageSrc,
    backgroundAudio: { src: GenericWingoBackgroundAudioSrc, volume: 0.18 },
    icon1Src: GenericWingoIcon1Src,
    icon2Src: GenericWingoIcon2Src,
    icon3Src: GenericWingoIcon3Src,
    icon4Src: GenericWingoIcon4Src,
    icon5Src: GenericWingoIcon5Src,
  },

  // Letters Game studio
  GenericLettersGame: {
    isSelectable: false,
    backgroundImageSrc: GenericLettersGameBackgroundImageSrc,
    backgroundAudio: { src: GenericLettersGameBackgroundAudioSrc, volume: 1.0 },
    icon1Src: GenericLettersGameIcon1Src,
    icon2Src: GenericLettersGameIcon2Src,
    icon3Src: GenericLettersGameIcon3Src,
    icon4Src: GenericLettersGameIcon4Src,
    icon5Src: GenericLettersGameIcon5Src,
  },

  // Numbers Game studio
  GenericNumbersGame: {
    isSelectable: false,
    backgroundImageSrc: GenericNumbersGameBackgroundImageSrc,
    backgroundAudio: { src: GenericNumbersGameBackgroundAudioSrc, volume: 1.0 },
    icon1Src: GenericNumbersGameIcon1Src,
    icon2Src: GenericNumbersGameIcon2Src,
    icon3Src: GenericNumbersGameIcon3Src,
    icon4Src: GenericNumbersGameIcon4Src,
    icon5Src: GenericNumbersGameIcon5Src,
  },
};
