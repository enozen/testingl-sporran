import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';
import dotenv from 'dotenv';
import { ConfigOptions } from './utils/extensionContext';


// Read from default ".env" file.
dotenv.config();
//require('dotenv').config();

// console.log("the internal version is on: " + process.env.EXTENSION_SOURCE_CHROMIUM_INTERN);
// console.log("the public version is on: " + process.env.EXTENSION_SOURCE_CHROMIUM_PUBLIC);

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig<ConfigOptions> = {
  
  testDir: './tests',
  /* Maximum time one test can run for. */
  timeout: 2* 60 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 5000, // set to 0 for slowMo
  },
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html']
],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://localhost:3000',
    //launchOptions: {slowMo:100},
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },  
  


  /* Uncomment to set up sporran state once before all tests run, which can be accessed with testGlobalSetup */
  
  //globalSetup: './utils/globalSetup.ts',

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium_intern',
      use: {
        ...devices['Desktop Chrome'],
        extensionSourceDir:
          process.env.EXTENSION_SOURCE_CHROMIUM_INTERN || './sporran/chromium/intern',
        extensionViewport: { width: 480, height: 600 },
        kiltBlockchain: 'peregrine',
        PhraseSpiritnet: 'zone mirror neither more exist radio apart castle thunder domain region script',
        PasswordSpiritnet: 'IWilltest42!',


      },
    },

    {
      name: 'chromium_public',
      fullyParallel: false,
      
      //need to write --workers=1 on the command line to run tests of this project serial and avoid problems

      use: {

        ...devices['Desktop Chrome'],
        extensionSourceDir:
          process.env.EXTENSION_SOURCE_CHROMIUM_PUBLIC|| './sporran/chromium/public',
        extensionViewport: { width: 480, height: 600 },
        kiltBlockchain: 'spiritnet',

        //Identity Sarah Connor: 
        PhraseSpiritnet: 'goat hand regret salmon face waste lady sea radio flag scan negative',
        PasswordSpiritnet: 'IWilltest42!',
      },
    },

    // {
    //   name: 'firefox',
    //   use: {
    //     ...devices['Desktop Firefox'],
    //     extensionSourceDir:
    //       process.env.EXTENSION_SOURCE_FIREFOX || './sporran/firefox/intern',
    //   },
    // },

    // {
    //   name: 'webkit',
    //   use: {
    //     ...devices['Desktop Safari'],
    //   },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: {
    //     ...devices['Pixel 5'],
    //   },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: {
    //     ...devices['iPhone 12'],
    //   },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: {
    //     channel: 'msedge',
    //   },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: {
    //     channel: 'chrome',
    //   },
    // },
  ],

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  // outputDir: 'test-results/',

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   port: 3000,
  // },
};

export default config;
