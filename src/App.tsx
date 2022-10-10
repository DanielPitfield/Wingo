import React, { useState } from "react";
import { SplashScreen } from "./Pages/SplashScreen";
import { LobbyMenu } from "./Pages/LobbyMenu";
import WingoConfig, { WingoConfigProps } from "./Pages/WingoConfig";
import NumbleConfig, { NumbleConfigProps } from "./Pages/NumbleConfig";
import { SaveData, SettingsData } from "./Data/SaveData/SaveData";
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
import { getGamemodeDefaultNumGuesses } from "./Helpers/getGamemodeDefaultNumGuesses";
import { getPageGamemodeSettings } from "./Helpers/getPageGamemodeSettings";
import { getRandomElementFrom } from "./Helpers/getRandomElementFrom";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { PageWrapper } from "./Components/PageWrapper";

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

  const getNewEntryPage = () => {
    // Find the page that has the title of the option chosen in the settings menu (dropdown)
    const entryPageSelection = pageDescriptions.find((page) => page.title === settings.gameplay.entryPage)?.path;
    // TitlePage as default
    return entryPageSelection ?? "/TitlePage";
  };

  const getRandomPlayablePage = () => {
    // The page must be suitable for the random session and there must be a tile displayed for the page on the LobbyMenu
    const playablePages = pageDescriptions.filter((page) => page.isRandomlyPlayable && page.isDisplayed);
    return getRandomElementFrom(playablePages)?.path;
  };

  React.useEffect(() => {
    const LOADING_TIMEOUT_MS = 2000;
    const FADE_OUT_DURATION_MS = 500;

    // TODO: Mask actual loading, rather than hard-coding seconds
    window.setTimeout(() => setLoadingState("loaded"), LOADING_TIMEOUT_MS);

    const newEntryPage = getNewEntryPage();

    if (settings.gameplay.skipSplashscreen) {
      // Don't show splashscreen, navigate to entry page immediately
      navigate(newEntryPage);
      return;
    }

    // First, show splashscreen
    navigate("/Splashscreen");
    // After delay, navigate to entry page
    window.setTimeout(() => navigate(newEntryPage), LOADING_TIMEOUT_MS + FADE_OUT_DURATION_MS);
  }, [saveData]);

  React.useEffect(() => {
    // Navigate to a randomly selected playable page
    if (location === "/Random") {
      navigate(getRandomPlayablePage());
      setIsRandomSession(true);
      return;
    }

    /*
    Pressing the back button element (to return to home)
    OR somehow navigating to any of the unplayable pages below (endSessionPages), 
    should stop any sessions (which dictate the next gamemode)
    */

    // Viewing/redeeming challenges or changing settings shouldn't end a session
    const endSessionExclusions = ["Challenges", "Settings"];

    // Pages which aren't suitable for a random session (but not the exclusions above)
    const endSessionPages = pageDescriptions
      .filter((page) => !page.isRandomlyPlayable && !endSessionExclusions.includes(page.title))
      .map((page) => page.path);

    if (endSessionPages.includes(location)) {
      setIsRandomSession(false);
      return;
    }
  }, [location]);

  React.useEffect(() => {
    // Clicking 'Back' in the browser
    window.onpopstate = () => {
      // Navigate back using the history
      navigate(-1);
      // Always stop/cancel random session
      setIsRandomSession(false);
    };
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
    if (isRandomSession) {
      // New random page
      navigate("/Random");
      return;
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

  const commonProps = {
    isCampaignLevel: false,
    campaignConfig: { isCampaignLevel: false as false },
    theme: theme,
    setTheme: setThemeIfNoPreferredSet,
    addGold: addGold,
    settings: settings,
    onComplete: onComplete,
  };

  // Overwrite properties for specific modes where required
  const commonWingoProps = {
    enforceFullLengthGuesses: true,
  };

  return (
    <div id="global-wrapper" data-dark-mode={settings.graphics.darkMode}>
      <Routes>
        <Route path="/" element={<Navigate to={getNewEntryPage()} />} />
        <Route path="/TitlePage" element={<TitlePage settings={settings} />} />
        <Route path="/Splashscreen" element={<SplashScreen loadingState={loadingState} settings={settings} />} />
        <Route
          path="/Home"
          element={
            <PageWrapper gold={gold} settings={settings}>
              <LobbyMenu setTheme={setThemeIfNoPreferredSet} theme={theme} addGold={addGold} settings={settings} />
            </PageWrapper>
          }
        />
        <Route
          path="/Campaign"
          element={
            <PageWrapper gold={gold} settings={settings}>
              <Campaign theme={theme} setTheme={setThemeIfNoPreferredSet} settings={settings} />
            </PageWrapper>
          }
        />
        <Route
          path="/Campaign/Areas/:areaName"
          element={
            <PageWrapper gold={gold} settings={settings}>
              <Area setTheme={setThemeIfNoPreferredSet} settings={settings} />
            </PageWrapper>
          }
        />
        <Route
          path="/Campaign/Areas/:areaName/Levels/:levelNumber"
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
          path="/Wingo/Daily"
          element={
            <PageWrapper gold={gold} settings={settings}>
              <WingoConfig
                {...commonProps}
                {...commonWingoProps}
                mode="daily"
                gamemodeSettings={getPageGamemodeSettings("/Wingo/Daily") as WingoConfigProps["gamemodeSettings"]}
                defaultNumGuesses={getGamemodeDefaultNumGuesses("/Wingo/Daily")}
              />
            </PageWrapper>
          }
        />
        <Route
          path="/Wingo/Repeat"
          element={
            <PageWrapper gold={gold} settings={settings}>
              <WingoConfig
                {...commonProps}
                {...commonWingoProps}
                mode="repeat"
                gamemodeSettings={getPageGamemodeSettings("/Wingo/Repeat") as WingoConfigProps["gamemodeSettings"]}
                defaultNumGuesses={getGamemodeDefaultNumGuesses("/Wingo/Repeat")}
              />
            </PageWrapper>
          }
        />
        <Route
          path="/Wingo/Category"
          element={
            <PageWrapper gold={gold} settings={settings}>
              <WingoConfig
                {...commonProps}
                {...commonWingoProps}
                mode="category"
                enforceFullLengthGuesses={false}
                gamemodeSettings={getPageGamemodeSettings("/Wingo/Category") as WingoConfigProps["gamemodeSettings"]}
                defaultNumGuesses={getGamemodeDefaultNumGuesses("/Wingo/Category")}
              />
            </PageWrapper>
          }
        />
        <Route
          path="/Wingo/Increasing"
          element={
            <PageWrapper gold={gold} settings={settings}>
              <WingoConfig
                {...commonProps}
                {...commonWingoProps}
                mode="increasing"
                gamemodeSettings={getPageGamemodeSettings("/Wingo/Increasing") as WingoConfigProps["gamemodeSettings"]}
                defaultNumGuesses={getGamemodeDefaultNumGuesses("/Wingo/Increasing")}
              />
            </PageWrapper>
          }
        />
        <Route
          path="/Wingo/Limitless"
          element={
            <PageWrapper gold={gold} settings={settings}>
              <WingoConfig
                {...commonProps}
                {...commonWingoProps}
                mode="limitless"
                gamemodeSettings={getPageGamemodeSettings("/Wingo/Limitless") as WingoConfigProps["gamemodeSettings"]}
                defaultNumGuesses={getGamemodeDefaultNumGuesses("/Wingo/Limitless")}
              />
            </PageWrapper>
          }
        />
        <Route
          path="/Wingo/Puzzle"
          element={
            <PageWrapper gold={gold} settings={settings}>
              <WingoConfig
                {...commonProps}
                {...commonWingoProps}
                mode="puzzle"
                gamemodeSettings={getPageGamemodeSettings("/Wingo/Puzzle") as WingoConfigProps["gamemodeSettings"]}
                defaultNumGuesses={getGamemodeDefaultNumGuesses("/Wingo/Puzzle")}
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
                gamemodeSettings={getPageGamemodeSettings("/Conundrum") as WingoConfigProps["gamemodeSettings"]}
                defaultNumGuesses={getGamemodeDefaultNumGuesses("/Conundrum")}
              />
            </PageWrapper>
          }
        />
        <Route
          path="/Wingo/Interlinked"
          element={
            <PageWrapper gold={gold} settings={settings}>
              <WingoConfig
                {...commonProps}
                {...commonWingoProps}
                mode="interlinked"
                gamemodeSettings={getPageGamemodeSettings("/Wingo/Interlinked") as WingoConfigProps["gamemodeSettings"]}
                defaultNumGuesses={getGamemodeDefaultNumGuesses("/Wingo/Interlinked")}
              />
            </PageWrapper>
          }
        />
        <Route
          path="/Wingo/Crossword"
          element={
            <PageWrapper gold={gold} settings={settings}>
              <WingoConfig
                {...commonProps}
                {...commonWingoProps}
                mode="crossword"
                gamemodeSettings={getPageGamemodeSettings("/Wingo/Crossword") as WingoConfigProps["gamemodeSettings"]}
                defaultNumGuesses={getGamemodeDefaultNumGuesses("/Wingo/Crossword")}
              />
            </PageWrapper>
          }
        />
        <Route
          path="/Wingo/Crossword/Fit"
          element={
            <PageWrapper gold={gold} settings={settings}>
              <WingoConfig
                {...commonProps}
                {...commonWingoProps}
                mode="crossword/fit"
                gamemodeSettings={
                  getPageGamemodeSettings("/Wingo/Crossword/Fit") as WingoConfigProps["gamemodeSettings"]
                }
                defaultNumGuesses={getGamemodeDefaultNumGuesses("/Wingo/Crossword/Fit")}
              />
            </PageWrapper>
          }
        />
        <Route
          path="/Wingo/Crossword/Daily"
          element={
            <PageWrapper gold={gold} settings={settings}>
              <WingoConfig
                {...commonProps}
                {...commonWingoProps}
                mode="crossword/daily"
                gamemodeSettings={
                  getPageGamemodeSettings("/Wingo/Crossword/Daily") as WingoConfigProps["gamemodeSettings"]
                }
                defaultNumGuesses={getGamemodeDefaultNumGuesses("/Wingo/Crossword/Daily")}
              />
            </PageWrapper>
          }
        />
        <Route
          path="/Wingo/Crossword/Weekly"
          element={
            <PageWrapper gold={gold} settings={settings}>
              <WingoConfig
                {...commonProps}
                {...commonWingoProps}
                mode="crossword/weekly"
                gamemodeSettings={
                  getPageGamemodeSettings("/Wingo/Crossword/Weekly") as WingoConfigProps["gamemodeSettings"]
                }
                defaultNumGuesses={getGamemodeDefaultNumGuesses("/Wingo/Crossword/Weekly")}
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
                gamemodeSettings={
                  getPageGamemodeSettings("/LettersCategories") as LetterCategoriesConfigProps["gamemodeSettings"]
                }
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
                gamemodeSettings={getPageGamemodeSettings("/LettersGame") as LettersGameConfigProps["gamemodeSettings"]}
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
                gamemodeSettings={getPageGamemodeSettings("/NumbersGame") as NumbersGameConfigProps["gamemodeSettings"]}
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
                gamemodeSettings={
                  getPageGamemodeSettings("/ArithmeticReveal") as ArithmeticRevealProps["gamemodeSettings"]
                }
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
                gamemodeSettings={
                  getPageGamemodeSettings("/ArithmeticDrag/Order") as ArithmeticDragProps["gamemodeSettings"]
                }
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
                gamemodeSettings={
                  getPageGamemodeSettings("/ArithmeticDrag/Match") as ArithmeticDragProps["gamemodeSettings"]
                }
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
                gamemodeSettings={getPageGamemodeSettings("/Numble") as NumbleConfigProps["gamemodeSettings"]}
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
                gamemodeSettings={getPageGamemodeSettings("/OnlyConnect") as OnlyConnectProps["gamemodeSettings"]}
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
                gamemodeSettings={getPageGamemodeSettings("/SameLetters") as SameLetterWordsProps["gamemodeSettings"]}
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
                gamemodeSettings={getPageGamemodeSettings("/NumberSets") as NumberSetsProps["gamemodeSettings"]}
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
                gamemodeSettings={getPageGamemodeSettings("/Algebra") as AlgebraProps["gamemodeSettings"]}
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
                gamemodeSettings={getPageGamemodeSettings("/WordCodes/Question") as WordCodesProps["gamemodeSettings"]}
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
                gamemodeSettings={getPageGamemodeSettings("/WordCodes/Match") as WordCodesProps["gamemodeSettings"]}
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
          path="/Settings"
          element={
            <PageWrapper gold={gold} settings={settings}>
              <Settings settings={settings} onSettingsChange={setSettings} />
            </PageWrapper>
          }
        />
        <Route
          path="/Challenges"
          element={
            <PageWrapper gold={gold} settings={settings}>
              <ChallengesInfo settings={settings} addGold={addGold} />
            </PageWrapper>
          }
        />

        <Route path="/Random" element={null} />
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
          path="/WingoGameshow"
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
        <Route
          path="/CustomGameshow"
          element={
            <PageWrapper gold={gold} settings={settings}>
              <CustomGameshow {...commonProps} />
            </PageWrapper>
          }
        />
        <Route
          path="*"
          element={
            <ErrorFallback
              error={new Error("Page not found")}
              resetErrorBoundary={() => navigate("/Home")}
              settingsData={SaveData.getSettings()}
              version={VERSION}
            />
          }
        />
      </Routes>
    </div>
  );
};
