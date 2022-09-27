import React, { useState } from "react";
import { SplashScreen } from "./Pages/SplashScreen";
import { LobbyMenu } from "./Pages/LobbyMenu";
import WingoConfig, { WingoConfigProps } from "./Pages/WingoConfig";
import NumbleConfig, { NumbleConfigProps } from "./Pages/NumbleConfig";
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
import { ErrorFallback } from "./Pages/ErrorFallback";
import SameLetterWords, { SameLetterWordsProps } from "./Pages/SameLetterWords";
import NumberSets, { NumberSetsProps } from "./Pages/NumberSets";
import Algebra, { AlgebraProps } from "./Pages/Algebra";
import { ChallengesInfo } from "./Components/ChallengesInfo";
import WordCodes, { WordCodesProps } from "./Pages/WordCodes";
import { LettersNumbersGameshow } from "./Pages/LettersNumbersGameshow";
import { WingoGameshow } from "./Pages/WingoGameshow";
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
import { PageWrapper } from "./Components/PageWrapper";

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

  // Is a session of randomly selecting a gamemode after completion, currently in progress?
  const [isRandomSession, setIsRandomSession] = useState(false);

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
  }, [playBackgroundMusic, stopBackgroundMusic, loadingState]);

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
  function onCompleteCampaignLevel(areaConfig: AreaConfig, levelConfig: LevelConfig, isUnlockLevel: boolean) {
    if (!areaConfig) {
      return;
    }

    if (!levelConfig) {
      return;
    }

    if (isUnlockLevel) {
      SaveData.addCompletedCampaignAreaUnlockLevel(areaConfig.name);
    }

    const levelId = getId(levelConfig.level);
    SaveData.addCompletedCampaignAreaLevel(areaConfig.name, levelId);
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
    // TODO: Need to update this, the location will have unique values in the dynamic segments
    return location === "/campaign/areas/:areaName/levels/:levelNumber";
  }

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
          <PageWrapper gold={gold} settings={settings}>
            <LobbyMenu setTheme={setThemeIfNoPreferredSet} theme={theme} addGold={addGold} settings={settings} />
          </PageWrapper>
        }
      />
      <Route
        path="/campaign"
        element={
          <PageWrapper gold={gold} settings={settings}>
            <Campaign theme={theme} setTheme={setThemeIfNoPreferredSet} settings={settings} />
          </PageWrapper>
        }
      />
      <Route
        path="/campaign/areas/:areaName"
        element={
          <PageWrapper gold={gold} settings={settings}>
            <Area setTheme={setThemeIfNoPreferredSet} settings={settings} />
          </PageWrapper>
        }
      />
      <Route
        path="/campaign/areas/:areaName/levels/:levelNumber"
        element={
          <PageWrapper gold={gold} settings={settings}>
            <Level
              theme={theme}
              setTheme={setThemeIfNoPreferredSet}
              addGold={addGold}
              onCompleteCampaignLevel={onCompleteCampaignLevel}
              settings={settings}
            />
          </PageWrapper>
        }
      />
      <Route
        path="/wingo/daily"
        element={
          <PageWrapper gold={gold} settings={settings}>
            <WingoConfig
              {...commonProps}
              {...commonWingoProps}
              mode="daily"
              gamemodeSettings={getPageGamemodeSettings(location) as WingoConfigProps["gamemodeSettings"]}
            />
          </PageWrapper>
        }
      />
      <Route
        path="/wingo/repeat"
        element={
          <PageWrapper gold={gold} settings={settings}>
            <WingoConfig
              {...commonProps}
              {...commonWingoProps}
              mode="repeat"
              gamemodeSettings={getPageGamemodeSettings(location) as WingoConfigProps["gamemodeSettings"]}
            />
          </PageWrapper>
        }
      />
      <Route
        path="/wingo/category"
        element={
          <PageWrapper gold={gold} settings={settings}>
            <WingoConfig
              {...commonProps}
              {...commonWingoProps}
              mode="category"
              enforceFullLengthGuesses={false}
              gamemodeSettings={getPageGamemodeSettings(location) as WingoConfigProps["gamemodeSettings"]}
            />
          </PageWrapper>
        }
      />
      <Route
        path="/wingo/increasing"
        element={
          <PageWrapper gold={gold} settings={settings}>
            <WingoConfig
              {...commonProps}
              {...commonWingoProps}
              mode="increasing"
              gamemodeSettings={getPageGamemodeSettings(location) as WingoConfigProps["gamemodeSettings"]}
            />
          </PageWrapper>
        }
      />
      <Route
        path="/wingo/limitless"
        element={
          <PageWrapper gold={gold} settings={settings}>
            <WingoConfig
              {...commonProps}
              {...commonWingoProps}
              mode="limitless"
              gamemodeSettings={getPageGamemodeSettings(location) as WingoConfigProps["gamemodeSettings"]}
            />
          </PageWrapper>
        }
      />
      <Route
        path="/wingo/puzzle"
        element={
          <PageWrapper gold={gold} settings={settings}>
            <WingoConfig
              {...commonProps}
              {...commonWingoProps}
              mode="puzzle"
              gamemodeSettings={getPageGamemodeSettings(location) as WingoConfigProps["gamemodeSettings"]}
            />
          </PageWrapper>
        }
      />
      <Route
        path="/Conundrum"
        element={
          <PageWrapper gold={gold} settings={settings}>
            <WingoConfig
              {...commonProps}
              {...commonWingoProps}
              mode="conundrum"
              gamemodeSettings={getPageGamemodeSettings(location) as WingoConfigProps["gamemodeSettings"]}
            />
          </PageWrapper>
        }
      />
      <Route
        path="/wingo/interlinked"
        element={
          <PageWrapper gold={gold} settings={settings}>
            <WingoConfig
              {...commonProps}
              {...commonWingoProps}
              mode="interlinked"
              gamemodeSettings={getPageGamemodeSettings(location) as WingoConfigProps["gamemodeSettings"]}
            />
          </PageWrapper>
        }
      />
      <Route
        path="/wingo/crossword"
        element={
          <PageWrapper gold={gold} settings={settings}>
            <WingoConfig
              {...commonProps}
              {...commonWingoProps}
              mode="crossword"
              gamemodeSettings={getPageGamemodeSettings(location) as WingoConfigProps["gamemodeSettings"]}
            />
          </PageWrapper>
        }
      />
      <Route
        path="/wingo/crossword/fit"
        element={
          <PageWrapper gold={gold} settings={settings}>
            <WingoConfig
              {...commonProps}
              {...commonWingoProps}
              mode="crossword/fit"
              gamemodeSettings={getPageGamemodeSettings(location) as WingoConfigProps["gamemodeSettings"]}
            />
          </PageWrapper>
        }
      />
      <Route
        path="/wingo/crossword/daily"
        element={
          <PageWrapper gold={gold} settings={settings}>
            <WingoConfig
              {...commonProps}
              {...commonWingoProps}
              mode="crossword/daily"
              gamemodeSettings={getPageGamemodeSettings(location) as WingoConfigProps["gamemodeSettings"]}
            />
          </PageWrapper>
        }
      />
      <Route
        path="/wingo/crossword/weekly"
        element={
          <PageWrapper gold={gold} settings={settings}>
            <WingoConfig
              {...commonProps}
              {...commonWingoProps}
              mode="crossword/weekly"
              gamemodeSettings={getPageGamemodeSettings(location) as WingoConfigProps["gamemodeSettings"]}
            />
          </PageWrapper>
        }
      />
      <Route
        path="/LettersCategories"
        element={
          <PageWrapper gold={gold} settings={settings}>
            <LetterCategoriesConfig
              {...commonProps}
              enforceFullLengthGuesses={false}
              gamemodeSettings={getPageGamemodeSettings(location) as LetterCategoriesConfigProps["gamemodeSettings"]}
            />
          </PageWrapper>
        }
      />
      <Route
        path="/LettersGame"
        element={
          <PageWrapper gold={gold} settings={settings}>
            <LettersGameConfig
              {...commonProps}
              theme={Themes.GenericLettersGame}
              gamemodeSettings={getPageGamemodeSettings(location) as LettersGameConfigProps["gamemodeSettings"]}
            />
          </PageWrapper>
        }
      />
      <Route
        path="/NumbersGame"
        element={
          <PageWrapper gold={gold} settings={settings}>
            <NumbersGameConfig
              {...commonProps}
              theme={Themes.GenericNumbersGame}
              gamemodeSettings={getPageGamemodeSettings(location) as NumbersGameConfigProps["gamemodeSettings"]}
            />
          </PageWrapper>
        }
      />
      <Route
        path="/ArithmeticReveal"
        element={
          <PageWrapper gold={gold} settings={settings}>
            <ArithmeticReveal
              {...commonProps}
              gamemodeSettings={getPageGamemodeSettings(location) as ArithmeticRevealProps["gamemodeSettings"]}
            />
          </PageWrapper>
        }
      />
      <Route
        path="/ArithmeticDrag/Order"
        element={
          <PageWrapper gold={gold} settings={settings}>
            <ArithmeticDrag
              {...commonProps}
              mode="order"
              gamemodeSettings={getPageGamemodeSettings(location) as ArithmeticDragProps["gamemodeSettings"]}
            />
          </PageWrapper>
        }
      />
      <Route
        path="/ArithmeticDrag/Match"
        element={
          <PageWrapper gold={gold} settings={settings}>
            <ArithmeticDrag
              {...commonProps}
              mode="match"
              gamemodeSettings={getPageGamemodeSettings(location) as ArithmeticDragProps["gamemodeSettings"]}
            />
          </PageWrapper>
        }
      />
      <Route
        path="/Numble"
        element={
          <PageWrapper gold={gold} settings={settings}>
            <NumbleConfig
              {...commonProps}
              gamemodeSettings={getPageGamemodeSettings(location) as NumbleConfigProps["gamemodeSettings"]}
            />
          </PageWrapper>
        }
      />
      <Route
        path="/OnlyConnect"
        element={
          <PageWrapper gold={gold} settings={settings}>
            <OnlyConnect
              {...commonProps}
              gamemodeSettings={getPageGamemodeSettings(location) as OnlyConnectProps["gamemodeSettings"]}
            />
          </PageWrapper>
        }
      />
      <Route
        path="/SameLetters"
        element={
          <PageWrapper gold={gold} settings={settings}>
            <SameLetterWords
              {...commonProps}
              gamemodeSettings={getPageGamemodeSettings(location) as SameLetterWordsProps["gamemodeSettings"]}
            />
          </PageWrapper>
        }
      />
      <Route
        path="/NumberSets"
        element={
          <PageWrapper gold={gold} settings={settings}>
            <NumberSets
              {...commonProps}
              gamemodeSettings={getPageGamemodeSettings(location) as NumberSetsProps["gamemodeSettings"]}
            />
          </PageWrapper>
        }
      />
      <Route
        path="/Algebra"
        element={
          <PageWrapper gold={gold} settings={settings}>
            <Algebra
              {...commonProps}
              gamemodeSettings={getPageGamemodeSettings(location) as AlgebraProps["gamemodeSettings"]}
            />
          </PageWrapper>
        }
      />
      <Route
        path="/WordCodes/Question"
        element={
          <PageWrapper gold={gold} settings={settings}>
            <WordCodes
              {...commonProps}
              mode={"question"}
              gamemodeSettings={getPageGamemodeSettings(location) as WordCodesProps["gamemodeSettings"]}
            />
          </PageWrapper>
        }
      />
      <Route
        path="/WordCodes/Match"
        element={
          <PageWrapper gold={gold} settings={settings}>
            <WordCodes
              {...commonProps}
              mode={"match"}
              gamemodeSettings={getPageGamemodeSettings(location) as WordCodesProps["gamemodeSettings"]}
            />
          </PageWrapper>
        }
      />
      <Route
        path="/PuzzleSequence"
        element={
          <PageWrapper gold={gold} settings={settings}>
            <SequencePuzzle {...commonProps} />
          </PageWrapper>
        }
      />
      <Route
        path="/settings"
        element={
          <PageWrapper gold={gold} settings={settings}>
            <Settings settings={settings} onSettingsChange={setSettings} />
          </PageWrapper>
        }
      />
      <Route
        path="/challenges"
        element={
          <PageWrapper gold={gold} settings={settings}>
            <ChallengesInfo settings={settings} addGold={addGold} />
          </PageWrapper>
        }
      />

      <Route path="/random" element={null} />
      <Route
        path="/LettersNumbersGameshow"
        element={
          <PageWrapper gold={gold} settings={settings}>
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
          </PageWrapper>
        }
      />
      <Route
        path="/Wingo/Gameshow"
        element={
          <PageWrapper gold={gold} settings={settings}>
            <WingoGameshow
              {...commonProps}
              {...commonWingoProps}
              // TODO: Should WingoGameshow have gamemodeSettings like other gamemodes or an initial configuration page?
              roundOrderConfig={defaultWingoGameshowRoundOrder}
            />
          </PageWrapper>
        }
      />
      <Route path="/Custom/Gameshow" element={<CustomGameshow {...commonProps} />} />
      <Route
        path="*"
        element={
          <ErrorFallback
            error={new Error("Page not found")}
            resetErrorBoundary={() => navigate("/home")}
            settingsData={SaveData.getSettings()}
            version={VERSION}
          />
        }
      />
    </Routes>
  );
};
