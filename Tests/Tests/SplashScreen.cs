using NUnit.Framework;
using OpenQA.Selenium;
using SeleniumExtras.WaitHelpers;
using System;
using System.Linq;

namespace Wingo.Tests
{
    /// <summary>
    /// Test fixture for the Splash Screen.
    /// </summary>
    [TestFixture]
    public class SplashScreen : TestBase
    {
        /// <summary>
        /// Asserts that the logo is shown on initial load.
        /// </summary>
        [Test]
        public void SplashScreen_InitialLoad_ShowsLogo()
        {
            // Assert
            this.wait.Until(ExpectedConditions.ElementIsVisible(By.CssSelector("[data-automation-id=\"logo\"]")));
        }

        /// <summary>
        /// Asserts that the logo is shown on initial load.
        /// </summary>
        [Test]
        public void SplashScreen_InitialLoad_LoadsLobbyAfterLoading()
        {
            this.wait.Until(ExpectedConditions.ElementIsVisible(By.CssSelector("[data-automation-id=\"app\"][data-automation-page-name=\"home\"]")));

            Assert.AreEqual(expected: "/home", actual: new Uri(this.driver.Url).AbsolutePath);
        }
    }
}