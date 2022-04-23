import useSound from "use-sound";
import { SettingsData } from "./SaveData";
import { Theme } from "./Themes";
import CorrectChimeSrc from "./images/effects/chimes/correct.mp3";
import SuccessChimeSrc from "./images/effects/chimes/success.mp3";
import FailureChimeSrc from "./images/effects/chimes/failure.mp3";
import NotificationChimeSrc from "./images/effects/chimes/notification.mp3";
import LightPingSrc from "./images/effects/light-ping.mp3";
import ClickSrc from "./images/effects/click.mp3";
import IntroSrc from "./images/effects/intro.mp3";

export const useBackgroundMusic = (settings: SettingsData, theme: Theme) => {
  const [play, { stop }] = useSound(theme.backgroundAudioSrc, {
    volume: settings.sound.backgroundVolume * settings.sound.masterVolume,
    soundEnabled: settings.sound.backgroundVolume * settings.sound.masterVolume > 0,
  });

  return [play, stop];
};

export const useLightPingChime = (settings: SettingsData) => {
  const [play, { stop }] = useSound(LightPingSrc, {
    volume: settings.sound.effectsVolume * settings.sound.masterVolume,
    soundEnabled: settings.sound.effectsVolume * settings.sound.masterVolume > 0,
  });

  return [play, stop];
};

export const useClickChime = (settings: SettingsData) => {
  const [play, { stop }] = useSound(ClickSrc, {
    volume: settings.sound.effectsVolume * settings.sound.masterVolume,
    soundEnabled: settings.sound.effectsVolume * settings.sound.masterVolume > 0,
  });

  return [play, stop];
};

export const useNotificationChime = (settings: SettingsData) => {
  const [play, { stop }] = useSound(NotificationChimeSrc, {
    volume: settings.sound.effectsVolume * settings.sound.masterVolume,
    soundEnabled: settings.sound.effectsVolume * settings.sound.masterVolume > 0,
  });

  return [play, stop];
};

export const useSuccessChime = (settings: SettingsData) => {
  const [play, { stop }] = useSound(SuccessChimeSrc, {
    volume: settings.sound.effectsVolume * settings.sound.masterVolume,
    soundEnabled: settings.sound.effectsVolume * settings.sound.masterVolume > 0,
  });

  return [play, stop];
};

export const useCorrectChime = (settings: SettingsData) => {
  const [play, { stop }] = useSound(CorrectChimeSrc, {
    volume: settings.sound.effectsVolume * settings.sound.masterVolume,
    soundEnabled: settings.sound.effectsVolume * settings.sound.masterVolume > 0,
  });

  return [play, stop];
};

export const useFailureChime = (settings: SettingsData) => {
  const [play, { stop }] = useSound(FailureChimeSrc, {
    volume: settings.sound.effectsVolume * settings.sound.masterVolume,
    soundEnabled: settings.sound.effectsVolume * settings.sound.masterVolume > 0,
  });

  return [play, stop];
};

export const useIntroMusic = (settings: SettingsData) => {
  const [play, { stop }] = useSound(IntroSrc, {
    volume: settings.sound.backgroundVolume * settings.sound.masterVolume,
    soundEnabled: settings.sound.backgroundVolume * settings.sound.masterVolume > 0,
  });

  return [play, stop];
};
