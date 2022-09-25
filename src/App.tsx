import React, { useState } from "react";
import { SplashScreen } from "./Pages/SplashScreen";
import { LobbyMenu } from "./Pages/LobbyMenu";
import WingoConfig, { WingoConfigProps } from "./Pages/WingoConfig";
import { Button } from "./Components/Button";
import NumbleConfig, { NumbleConfigProps } from "./Pages/NumbleConfig";
import GoldCoin from "./Data/Images/gold.png";
import { SaveData, SettingsData } from "./Data/SaveData";
import LettersGameConfig, { LettersGameConfigProps } from "./Pages/LettersGameConfig";
import NumbersGameConfig, { NumbersGameConfigProps } from "./Pages/NumbersGameConfig";
import { Campaign } from "./Pages/Campaign";
import { Area, AreaConfig } from "./Pages/Area";
import { getId, Level, LevelConfig } from "./Components/Level";
import LetterCategoriesConfig, { LetterCategoriesConfigProps } from "./Pages/LetterCategoriesConfig";
import ArithmeticReveal, { ArithmeticRevealProps } from "./Pages/ArithmeticReveal";
import ArithmeticDrag, { ArithmeticDragProps } from "./Pages/ArithmeticDrag";
import { Theme, Themes } from "./Data/Themes";
import { AllCampaignAreas } from "./Data/CampaignAreas/AllCampaignAreas";
import { Settings } from "./Pages/Settings";
import OnlyConnect, { OnlyConnectProps } from "./Pages/OnlyConnect";
import { useBackgroundMusic } from "./Data/Sounds";
import { VERSION } from "./Data/Version";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "./Pages/ErrorFallback";
import SameLetterWords, { SameLetterWordsProps } from "./Pages/SameLetterWords";
import NumberSets, { NumberSetsProps } from "./Pages/NumberSets";
import Algebra, { AlgebraProps } from "./Pages/Algebra";
import { ChallengesInfo } from "./Components/ChallengesInfo";
import WordCodes, { WordCodesProps } from "./Pages/WordCodes";
import { LettersNumbersGameshow } from "./Pages/LettersNumbersGameshow";
import { WingoGameshow } from "./Pages/WingoGameshow";
import { FiArrowLeft, FiHelpCircle, FiSettings } from "react-icons/fi";
import HelpInformation from "./Components/HelpInformation";
import { TitlePage } from "./Pages/TitlePage";
import { defaultWingoGameshowRoundOrder } from "./Data/DefaultGamemodeSettings";
import { pageDescriptions } from "./Data/PageDescriptions";
import SequencePuzzle from "./Pages/SequencePuzzle";
import { CustomGameshow } from "./Pages/CustomGameshow";
import { PagePath } from "./Data/PageNames";
import { getGamemodeDefaultNumGuesses } from "./Helper Functions/getGamemodeDefaultNumGuesses";
import { getGamemodeDefaultWordLength } from "./Helper Functions/getGamemodeDefaultWordLength";
import { getPageGamemodeSettings } from "./Helper Functions/getPageGamemodeSettings";
import { getRandomElementFrom } from "./Helper Functions/getRandomElementFrom";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";

// TODO: With React ROuter, the state Page shouldn't be needed anymore

export const App = () => {
  // What is the current path?
  const location = useLocation().pathname as PagePath;
  // Use this to change the path
  const navigate = useNavigate();

  // App wide listener for right click event
  // TODO: Decide whether right click should be enabled
  //document.addEventListener("contextmenu", handleRightClick);

  /* 
  To re-enable it for a component, use:
  document.removeEventListener('contextmenu', handleRightClick);
  */

  // Prevent default right click context menu from appearing
  function handleRightClick(event: MouseEvent) {
    event.preventDefault();
  }

  const saveData = window.localStorage;
  const [settings, setSettings] = useState<SettingsData>(SaveData.getSettings());

  const [loadingState, setLoadingState] = useState<"loading" | "loaded">("loading");

  // Modal explaining current gamemode is shown?
  const [isHelpInfoShown, setIsHelpInfoShown] = useState(false);

  // Is a session of randomly selecting a gamemode after completion, currently in progress?
  const [isRandomSession, setIsRandomSession] = useState(false);

  const [selectedCampaignArea, setSelectedCampaignArea] = useState<AreaConfig | null>(null);
  const [selectedCampaignLevel, setSelectedCampaignLevel] = useState<LevelConfig | null>(null);

  const [theme, setTheme] = useState<Theme>(
    getHighestCampaignArea()?.theme ||
      (settings.graphics.preferredTheme ? Themes[settings.graphics.preferredTheme] : Themes.GenericWingo)
  );
  const [gold, setGold] = useState<number>(SaveData.readGold());
  const [playBackgroundMusic, stopBackgroundMusic] = useBackgroundMusic(settings, theme);

  function getNewEntryPage() {
    // Find the page that has the title of the option chosen in the settings menu (dropdown)
    const entryPageSelection = pageDescriptions.find((page) => page.title === settings.gameplay.entryPage)?.path;
    // TitlePage as default
    return entryPageSelection ?? "/TitlePage";
  }

  React.useEffect(() => {
    const LOADING_TIMEOUT_MS = 2000;
    const FADE_OUT_DURATION_MS = 500;

    // TODO: Mask actual loading, rather than hard-coding seconds
    window.setTimeout(() => setLoadingState("loaded"), LOADING_TIMEOUT_MS);

    const newEntryPage = getNewEntryPage();
    console.log(newEntryPage);

    if (settings.gameplay.skipSplashscreen) {
      // Change immediately
      navigate(newEntryPage);
    } else {
      // Delay setting of new page (until after splashscreen)
      // TOOD: Renable splashscreen?
      // window.setTimeout(() => navigate(newEntryPage), LOADING_TIMEOUT_MS + FADE_OUT_DURATION_MS);
    }
  }, [saveData]);

  React.useEffect(() => {
    // Set the page to any playable page
    if (location === "/random") {
      const playablePages = pageDescriptions.filter((page) => page.isRandomlyPlayable);
      const newPage = getRandomElementFrom(playablePages)?.path;
      navigate(newPage);
      setIsRandomSession(true);
    }
    // Pressing back (returning to home) should stop any sessions (which dictate the next gamemode)
    else if (location === "/home") {
      setIsRandomSession(false);
    }
  }, [location]);

  React.useEffect(() => {
    // Clicking 'Back' in the browser
    window.onpopstate = () => navigate(-1);
  }, []);

  React.useEffect(() => {
    if (loadingState === "loaded") {
      playBackgroundMusic();
    }

    return () => stopBackgroundMusic();
  }, [selectedCampaignArea, playBackgroundMusic, stopBackgroundMusic, loadingState]);

  React.useEffect(() => {
    SaveData.setSettings(settings);
    setThemeIfNoPreferredSet(getHighestCampaignArea()?.theme || Themes.GenericWingo);
  }, [settings]);

  React.useEffect(() => {
    SaveData.setGold(gold);
  }, [gold]);
  function setThemeIfNoPreferredSet(theme: Theme) {
    setTheme(settings.graphics.preferredTheme ? Themes[settings.graphics.preferredTheme] : theme);
  }

  // Default (free play)
  function onComplete() {
    if (!isRandomSession) {
      return;
    } else {
      // New random page
      navigate("/random");
    }
  }

  // Update campaign progress (when a campaign level is successfully completed)
  function onCompleteCampaignLevel(isUnlockLevel: boolean, levelConfig: LevelConfig) {
    if (selectedCampaignArea) {
      if (isUnlockLevel) {
        SaveData.addCompletedCampaignAreaUnlockLevel(selectedCampaignArea.name);
      } else {
        const levelId = getId(levelConfig.level);
        SaveData.addCompletedCampaignAreaLevel(selectedCampaignArea.name, levelId);
      }
    }
  }

  function addGold(additionalGold: number) {
    setGold(gold + additionalGold);
  }

  function getHighestCampaignArea(): AreaConfig {
    const reversedCopy = AllCampaignAreas.slice().reverse();
    const highestCampaignArea = reversedCopy.filter((campaignArea) => {
      const areaInfo = SaveData.getCampaignProgress().areas.find((area) => area.name === campaignArea.name);

      return areaInfo?.status === "unlocked";
    })[0];

    return highestCampaignArea;
  }

  function isCampaignLevel() {
    if (location === "/campaign/area/level") {
      return true;
    } else {
      return false;
    }
  }

  // TODO: The components in each route should be nested inside this div
  const pageWrapper = (
    <div className="app" data-automation-id="app" data-automation-page-name={location}>
      {location !== "/splash-screen" && location !== "/TitlePage" && (
        <>
          <div className="toolbar">
            {location !== "/home" && (
              <nav className="navigation">
                <Button
                  mode="default"
                  className="back-button"
                  settings={settings}
                  onClick={() => {
                    setIsHelpInfoShown(false);

                    if (location === "/campaign/area/level") {
                      navigate("/campaign/area");
                    } else if (location === "/campaign/area") {
                      navigate("/campaign");
                    } else {
                      navigate("/home");
                    }
                  }}
                >
                  <FiArrowLeft /> Back
                </Button>
              </nav>
            )}
            <h1 className="title">{pageDescriptions.find((x) => x.path === location)?.title}</h1>
            {Boolean(pageDescriptions.find((x) => x.path === location)?.helpInfo) && (
              <Button
                mode="default"
                className="help-info-button"
                settings={settings}
                onClick={() => setIsHelpInfoShown(true)}
                additionalProps={{ "aria-label": "help", title: "Get help with this game mode" }}
              >
                <FiHelpCircle /> Help
              </Button>
            )}
            <Button
              mode="default"
              className="settings-button"
              settings={settings}
              onClick={() => {
                navigate("/settings");
                setIsHelpInfoShown(false);
              }}
            >
              <FiSettings /> Settings
            </Button>
            <div className="gold_counter" onClick={() => navigate("/challenges")}>
              <img className="gold_coin_image" src={GoldCoin} alt="Gold" />
              {gold.toLocaleString("en-GB")}
            </div>
          </div>
        </>
      )}
      <ErrorBoundary
        fallbackRender={({ error, resetErrorBoundary }) => (
          <ErrorFallback
            error={error}
            resetErrorBoundary={resetErrorBoundary}
            settingsData={SaveData.getSettings()}
            version={VERSION}
          ></ErrorFallback>
        )}
        onReset={() => window.location.reload()}
      >
        {/*pageComponent*/}
      </ErrorBoundary>
      {Boolean(isHelpInfoShown && location !== "/home" && location !== "/TitlePage" && location !== "/settings") && (
        <HelpInformation onClose={() => setIsHelpInfoShown(false)}></HelpInformation>
      )}
      <div className="version">{VERSION}</div>
    </div>
  );

  const commonProps = {
    isCampaignLevel: isCampaignLevel(),
    campaignConfig: { isCampaignLevel: false as false },
    defaultNumGuesses: getGamemodeDefaultNumGuesses(location),
    theme: theme,
    setTheme: setThemeIfNoPreferredSet,
    addGold: addGold,
    settings: settings,
    onComplete: onComplete,
  };

  // Overwrite properties for specific modes where required
  const commonWingoProps = {
    defaultWordLength: getGamemodeDefaultWordLength(location),
    enforceFullLengthGuesses: true,
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to={getNewEntryPage()} />} />
      
      <Route path="/TitlePage" element={<TitlePage settings={settings} />} />
      <Route path="/splash-screen" element={<SplashScreen loadingState={loadingState} settings={settings} />} />
      <Route
        path="/home"
        element={
          <LobbyMenu
            setSelectedArea={setSelectedCampaignArea}
            setSelectedCampaignLevel={setSelectedCampaignLevel}
            setTheme={setThemeIfNoPreferredSet}
            theme={theme}
            addGold={addGold}
            settings={settings}
          />
        }
      />
      <Route
        path="/campaign"
        element={
          <Campaign
            theme={theme}
            setTheme={setThemeIfNoPreferredSet}
            setSelectedArea={setSelectedCampaignArea}
            setSelectedCampaignLevel={setSelectedCampaignLevel}
            settings={settings}
          />
        }
      />
      <Route
        path="/campaign/area"
        element={
          selectedCampaignArea && (
            <Area
              area={selectedCampaignArea}
              setTheme={setThemeIfNoPreferredSet}
              setSelectedCampaignLevel={setSelectedCampaignLevel}
              settings={settings}
            />
          )
        }
      />
      <Route
        path="/campaign/area/level"
        element={
          selectedCampaignLevel && (
            <Level
              area={selectedCampaignArea!}
              level={selectedCampaignLevel}
              theme={theme}
              setTheme={setThemeIfNoPreferredSet}
              addGold={addGold}
              onCompleteCampaignLevel={onCompleteCampaignLevel}
              settings={settings}
            />
          )
        }
      />
      <Route
        path="/wingo/daily"
        element={
          <WingoConfig
            {...commonProps}
            {...commonWingoProps}
            mode="daily"
            gamemodeSettings={getPageGamemodeSettings(location) as WingoConfigProps["gamemodeSettings"]}
          />
        }
      />
      <Route
        path="/wingo/repeat"
        element={
          <WingoConfig
            {...commonProps}
            {...commonWingoProps}
            mode="repeat"
            gamemodeSettings={getPageGamemodeSettings(location) as WingoConfigProps["gamemodeSettings"]}
          />
        }
      />
      <Route
        path="/wingo/category"
        element={
          <WingoConfig
            {...commonProps}
            {...commonWingoProps}
            mode="category"
            enforceFullLengthGuesses={false}
            gamemodeSettings={getPageGamemodeSettings(location) as WingoConfigProps["gamemodeSettings"]}
          />
        }
      />
      <Route
        path="/wingo/increasing"
        element={
          <WingoConfig
            {...commonProps}
            {...commonWingoProps}
            mode="increasing"
            gamemodeSettings={getPageGamemodeSettings(location) as WingoConfigProps["gamemodeSettings"]}
          />
        }
      />
      <Route
        path="/wingo/limitless"
        element={
          <WingoConfig
            {...commonProps}
            {...commonWingoProps}
            mode="limitless"
            gamemodeSettings={getPageGamemodeSettings(location) as WingoConfigProps["gamemodeSettings"]}
          />
        }
      />
      <Route
        path="/wingo/puzzle"
        element={
          <WingoConfig
            {...commonProps}
            {...commonWingoProps}
            mode="puzzle"
            gamemodeSettings={getPageGamemodeSettings(location) as WingoConfigProps["gamemodeSettings"]}
          />
        }
      />
      <Route
        path="/Conundrum"
        element={
          <WingoConfig
            {...commonProps}
            {...commonWingoProps}
            mode="conundrum"
            gamemodeSettings={getPageGamemodeSettings(location) as WingoConfigProps["gamemodeSettings"]}
          />
        }
      />
      <Route
        path="/wingo/interlinked"
        element={
          <WingoConfig
            {...commonProps}
            {...commonWingoProps}
            mode="interlinked"
            gamemodeSettings={getPageGamemodeSettings(location) as WingoConfigProps["gamemodeSettings"]}
          />
        }
      />
      <Route
        path="/wingo/crossword"
        element={
          <WingoConfig
            {...commonProps}
            {...commonWingoProps}
            mode="crossword"
            gamemodeSettings={getPageGamemodeSettings(location) as WingoConfigProps["gamemodeSettings"]}
          />
        }
      />
      <Route
        path="/wingo/crossword/fit"
        element={
          <WingoConfig
            {...commonProps}
            {...commonWingoProps}
            mode="crossword/fit"
            gamemodeSettings={getPageGamemodeSettings(location) as WingoConfigProps["gamemodeSettings"]}
          />
        }
      />
      <Route
        path="/wingo/crossword/daily"
        element={
          <WingoConfig
            {...commonProps}
            {...commonWingoProps}
            mode="crossword/daily"
            gamemodeSettings={getPageGamemodeSettings(location) as WingoConfigProps["gamemodeSettings"]}
          />
        }
      />
      <Route
        path="/wingo/crossword/weekly"
        element={
          <WingoConfig
            {...commonProps}
            {...commonWingoProps}
            mode="crossword/weekly"
            gamemodeSettings={getPageGamemodeSettings(location) as WingoConfigProps["gamemodeSettings"]}
          />
        }
      />
      <Route
        path="/LettersCategories"
        element={
          <LetterCategoriesConfig
            {...commonProps}
            enforceFullLengthGuesses={false}
            gamemodeSettings={getPageGamemodeSettings(location) as LetterCategoriesConfigProps["gamemodeSettings"]}
          />
        }
      />
      <Route
        path="/LettersGame"
        element={
          <LettersGameConfig
            {...commonProps}
            theme={Themes.GenericLettersGame}
            gamemodeSettings={getPageGamemodeSettings(location) as LettersGameConfigProps["gamemodeSettings"]}
          />
        }
      />
      <Route
        path="/NumbersGame"
        element={
          <NumbersGameConfig
            {...commonProps}
            theme={Themes.GenericNumbersGame}
            gamemodeSettings={getPageGamemodeSettings(location) as NumbersGameConfigProps["gamemodeSettings"]}
          />
        }
      />
      <Route
        path="/ArithmeticReveal"
        element={
          <ArithmeticReveal
            {...commonProps}
            gamemodeSettings={getPageGamemodeSettings(location) as ArithmeticRevealProps["gamemodeSettings"]}
          />
        }
      />
      <Route
        path="/ArithmeticDrag/Order"
        element={
          <ArithmeticDrag
            {...commonProps}
            mode="order"
            gamemodeSettings={getPageGamemodeSettings(location) as ArithmeticDragProps["gamemodeSettings"]}
          />
        }
      />
      <Route
        path="/ArithmeticDrag/Match"
        element={
          <ArithmeticDrag
            {...commonProps}
            mode="match"
            gamemodeSettings={getPageGamemodeSettings(location) as ArithmeticDragProps["gamemodeSettings"]}
          />
        }
      />
      <Route
        path="/Numble"
        element={
          <NumbleConfig
            {...commonProps}
            gamemodeSettings={getPageGamemodeSettings(location) as NumbleConfigProps["gamemodeSettings"]}
          />
        }
      />
      <Route
        path="/OnlyConnect"
        element={
          <OnlyConnect
            {...commonProps}
            gamemodeSettings={getPageGamemodeSettings(location) as OnlyConnectProps["gamemodeSettings"]}
          />
        }
      />
      <Route
        path="/SameLetters"
        element={
          <SameLetterWords
            {...commonProps}
            gamemodeSettings={getPageGamemodeSettings(location) as SameLetterWordsProps["gamemodeSettings"]}
          />
        }
      />
      <Route
        path="/NumberSets"
        element={
          <NumberSets
            {...commonProps}
            gamemodeSettings={getPageGamemodeSettings(location) as NumberSetsProps["gamemodeSettings"]}
          />
        }
      />
      <Route
        path="/Algebra"
        element={
          <Algebra
            {...commonProps}
            gamemodeSettings={getPageGamemodeSettings(location) as AlgebraProps["gamemodeSettings"]}
          />
        }
      />
      <Route
        path="/WordCodes/Question"
        element={
          <WordCodes
            {...commonProps}
            mode={"question"}
            gamemodeSettings={getPageGamemodeSettings(location) as WordCodesProps["gamemodeSettings"]}
          />
        }
      />
      <Route
        path="/WordCodes/Match"
        element={
          <WordCodes
            {...commonProps}
            mode={"match"}
            gamemodeSettings={getPageGamemodeSettings(location) as WordCodesProps["gamemodeSettings"]}
          />
        }
      />
      <Route path="/PuzzleSequence" element={<SequencePuzzle {...commonProps} />} />
      <Route path="/challenges" element={<ChallengesInfo settings={settings} addGold={addGold} />} />
      <Route path="/settings" element={<Settings settings={settings} onSettingsChange={setSettings} />} />
      <Route path="/random" element={null} />
      <Route
        path="/LettersNumbersGameshow"
        element={
          <LettersNumbersGameshow
            {...commonProps}
            {...commonWingoProps}
            themes={[Themes.GenericLettersGame, Themes.GenericNumbersGame]}
            // TODO: Should LettersNumbersGameshow have gamemodeSettings like other gamemodes or an initial configuration page?
            numSets={5}
            numLetterRoundsPerSet={2}
            numNumberRoundsPerSet={1}
            numConundrumRoundsPerSet={0}
            hasFinishingConundrum={true}
          />
        }
      />
      <Route
        path="/Wingo/Gameshow"
        element={
          <WingoGameshow
            {...commonProps}
            {...commonWingoProps}
            // TODO: Should WingoGameshow have gamemodeSettings like other gamemodes or an initial configuration page?
            roundOrderConfig={defaultWingoGameshowRoundOrder}
          />
        }
      />
      <Route path="/Custom/Gameshow" element={<CustomGameshow {...commonProps} />} />
    </Routes>
  );
};
