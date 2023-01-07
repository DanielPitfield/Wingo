import { SettingsData } from "../Data/SaveData/Settings";
import { useLightPingChime } from "../Data/Sounds";
import { Theme, Themes } from "../Data/Themes";
import { WingoConfigProps, WingoMode } from "../Pages/WingoConfig";
import Button from "./Button";
import WingoGamemodeSettings from "./GamemodeSettingsOptions/WingoGamemodeSettings";
import Keyboard from "./Keyboard";
import { LetterTileStatus } from "./LetterTile";
import { LEVEL_FINISHING_TEXT } from "./Level";
import MessageNotification from "./MessageNotification";
import ProgressBar, { GreenToRedColorTransition } from "./ProgressBar";
import WingoGrid from "./WIngoGrid";
import WingoOutcome from "./WingoOutcome";

interface WingoConundrumProps {
  isCampaignLevel: boolean;
  mode: WingoMode;

  gamemodeSettings: WingoConfigProps["gamemodeSettings"];

  remainingSeconds: number;
  totalSeconds: number;
  numCorrectGuesses: number;
  numIncorrectGuesses: number;
  remainingGuesses: number;
  guesses: string[];
  currentWord: string;
  wordIndex: number;
  inProgress: boolean;
  inDictionary: boolean;
  errorMessage: { isShown: true; message: string } | { isShown: false };
  isIncompleteWord: boolean;
  conundrum?: string;
  targetWord: string;
  targetHint?: string;
  targetCategory?: string;
  letterStatuses: LetterTileStatus[];
  revealedLetterIndexes: number[];

  theme?: Theme;
  settings: SettingsData;
  onEnter: () => void;
  onSubmitLetter: (letter: string) => void;
  onBackspace: () => void;

  updateGamemodeSettings: (newGamemodeSettings: WingoConfigProps["gamemodeSettings"]) => void;
  resetCountdown: () => void;
  setTotalSeconds: (numSeconds: number) => void;

  ResetGame: () => void;
  ContinueGame: () => void;
  setTheme: (theme: Theme) => void;

  handleSimpleGamemodeSettingsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleTimerToggle: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleMaxLivesToggle: (e: React.ChangeEvent<HTMLInputElement>) => void;
  keyboardDisabled: boolean;
  isOutcomeContinue: boolean;
  isCurrentGuessCorrect: boolean;
  setKeyboardDisabled: (disabled: boolean) => void;
  setMostRecentMaxLives: (mostRecentMaxLives: number) => void;
}

const WingoConundrum = (props: WingoConundrumProps) => {
  const [playLightPingSoundEffect] = useLightPingChime(props.settings);

  return (
    <div
      className="App conundrum"
      style={{ backgroundImage: `url(${Themes.GenericLettersGame.backgroundImageSrc})`, backgroundSize: "100% 100%" }}
    >
      <div className="conundrum-grid">
        <WingoGrid {...props} />

        <Keyboard
          onEnter={props.onEnter}
          onSubmitLetter={(letter) => {
            props.onSubmitLetter(letter);
            playLightPingSoundEffect();
          }}
          onBackspace={props.onBackspace}
          guesses={props.guesses}
          targetWord={props.targetWord}
          inDictionary={props.inDictionary}
          letterStatuses={props.letterStatuses}
          settings={props.settings}
          disabled={props.keyboardDisabled || !props.inProgress}
          hasBackspace={true}
          hasEnter={true}
        />
      </div>

      {props.inProgress && props.gamemodeSettings.timerConfig.isTimed && props.remainingSeconds > 0 && (
        <div className="game-panel">
          <div className="timer-section">
            <ProgressBar
              progress={props.remainingSeconds}
              total={props.gamemodeSettings.timerConfig.seconds}
              display={{ type: "transition", colorTransition: GreenToRedColorTransition }}
            />
          </div>
        </div>
      )}

      <div className="info-panel">
        {!props.isCampaignLevel && (
          <div className="gamemodeSettings">
            <WingoGamemodeSettings
              mode={props.mode}
              gamemodeSettings={props.gamemodeSettings}
              handleMaxLivesToggle={props.handleMaxLivesToggle}
              handleTimerToggle={props.handleTimerToggle}
              handleSimpleGamemodeSettingsChange={props.handleSimpleGamemodeSettingsChange}
              setMostRecentMaxLives={props.setMostRecentMaxLives}
              resetCountdown={props.resetCountdown}
              setTotalSeconds={props.setTotalSeconds}
              onLoadPresetGamemodeSettings={props.updateGamemodeSettings}
              onShowOfAddPresetModal={() => props.setKeyboardDisabled(true)}
              onHideOfAddPresetModal={() => props.setKeyboardDisabled(false)}
            />
          </div>
        )}

        <WingoOutcome {...props} />

        {props.errorMessage.isShown && (
          <MessageNotification type="error">{props.errorMessage.message}</MessageNotification>
        )}

        <div>
          {!props.inProgress && (
            <Button
              mode={"accept"}
              settings={props.settings}
              onClick={() => (props.isOutcomeContinue ? props.ContinueGame() : props.ResetGame())}
              additionalProps={{ autoFocus: true }}
            >
              {props.isCampaignLevel ? LEVEL_FINISHING_TEXT : props.isOutcomeContinue ? "Continue" : "Restart"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WingoConundrum;
