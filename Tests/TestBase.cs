using NUnit.Framework;
using NUnit.Framework.Interfaces;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Support.UI;
using SeleniumExtras.WaitHelpers;
using System;
using System.Diagnostics;
using System.IO;

namespace Wingo.Tests
{
    /// <summary>
    /// Base for all UI tests.
    /// </summary>
    public class TestBase
    {
        /// <summary>
        /// Command for interacting with the app.
        /// </summary>
        private static Process Command = new Process
        {
            StartInfo = new ProcessStartInfo
            {
                FileName = "cmd.exe",
                RedirectStandardInput = true,
                RedirectStandardOutput = true,
                CreateNoWindow = true,
                UseShellExecute = false,
            },
        };

        /// <summary>
        /// Driver.
        /// </summary>
        protected IWebDriver driver;

        /// <summary>
        /// Typical wait duration.
        /// </summary>
        protected WebDriverWait wait;

        /// <summary>
        /// Actions to perform once on test run start.
        /// </summary>
        [OneTimeSetUp]
        public void OneTimeSetup()
        {
            Command.Start();

            // Kill any existing app instances
            Command.StandardInput.WriteLine("taskkill /f /t /im node.exe");
            Command.StandardInput.Flush();

            // Disabled the default browser launch when starting
            Command.StandardInput.WriteLine("set BROWSER=none");
            Command.StandardInput.Flush();

            // Start the app
            Command.StandardInput.WriteLine("npm start");
            Command.StandardInput.Flush();
        }

        /// <summary>
        /// Actions to perform once on test run end.
        /// </summary>
        [OneTimeTearDown]
        public void OneTimeTearDown()
        {
            // Stop the app
            Command?.StandardInput.WriteLine("exit");
            Command?.StandardInput.Flush();
            Command?.StandardInput.Close();
        }

        /// <summary>
        /// Actions to perform once on test unit start.
        /// </summary>
        [SetUp]
        public void Setup()
        {
            // Start the selenium browser session
            const string URL = "http://localhost:3000"; 
            
            ChromeOptions options = new();
            options.AddArguments("--start-maximized");

            driver = new ChromeDriver(options)
            {
                Url = URL,                
            };
            driver.Manage().Window.Maximize();

            // Set the default wait
            const int LOAD_TIME_SECONDS = 5;
            wait = new WebDriverWait(driver, TimeSpan.FromSeconds(LOAD_TIME_SECONDS));

            // Refresh until the app has loaded
            const int MAX_WAIT_BEFORE_ERROR_SECONDS = 30;
            for (int i = 0; i < MAX_WAIT_BEFORE_ERROR_SECONDS / LOAD_TIME_SECONDS; i++)
            {
                driver.Navigate().Refresh();

                try
                {
                    wait.Until(ExpectedConditions.ElementExists(By.TagName("body")));
                    return;
                }
                catch (Exception)
                {
                }
            }

            throw new InvalidOperationException($"Failed to start within {MAX_WAIT_BEFORE_ERROR_SECONDS} seconds: {Command.StandardOutput.ReadToEnd()}");
        }

        /// <summary>
        /// Actions to perform once on test unit end.
        /// </summary>
        [TearDown]
        public void TearDown()
        {
            // If the result was not a Pass
            //if (TestContext.CurrentContext.Result.Outcome.Status != TestStatus.Passed)
            {
                // Create the path to a new screenshot file for this test
                string filePath = Path.Combine(Path.GetTempPath(), "screenshot.png");

                // Take a screenshot
                Screenshot screenshot = ((ITakesScreenshot)driver).GetScreenshot();

                // Save the screenshot
                screenshot.SaveAsFile(filePath);

                // Add the screenshot to the test result
                TestContext.AddTestAttachment(filePath, "Screenshot at the end of the test");
            }

            // Stop the selenium browser instance
            driver?.Quit();
        }
    }
}
