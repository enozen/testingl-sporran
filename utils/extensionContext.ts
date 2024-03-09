/**
 * This file exposes three different extensions of the playwright `test` function for testing Sporran, each with their own purpose and use case:
 *   - `testIsolated` takes care of loading Sporran to the browser before your tests, but does not persist its state between tests.
 *   - `testGlobalSetup` loads a Sporran instance whose state is a copy of a state that has been set up before all tests begin, via a script defined to be run as `globalSetup` in the playwright.config.ts.
 *   - `testPersistedSetup` sets up Sporran state at the beginning of a test file, and provides each test with a Sporran instance whose state is a copy of the initial state.
 */

import { test as base, ViewportSize } from '@playwright/test';
import os from 'os';
import path from 'path';
import { SporranContext, SporranContextChromium } from './SporranContext';
import { WelcomePage } from '../PageObjectModels/WelcomePageModel';
import { MainSporranPage } from '../PageObjectModels/MainSporranPageModel';

const sporranContextForBrowser: Record<string, typeof SporranContext> = {
  chromium: SporranContextChromium,
};

export type ConfigOptions = {
  /**
   * The directory from which we load the sporran extension source files. If not overwritten via the `.use` method, this is defined via the playwright.config.ts
   */
  extensionSourceDir: string;
  /**
   * The viewport with which the Sporran context is initialized. Can be overwritten with the `.use` method or via the playwright.config.ts.
   */
  extensionViewport: ViewportSize | undefined;
  /**
   * The base directory in which we create directories for each Sporran instance, where it saves its user data and state. Defaults to the directory returned by node's `os.tmpdir()`.
   */
  extensionDataDir: string;
  /**
   * The directory in which we store the Sporran user data and state that is created as part of the `globalSetup`. Defaults to `'./sporran-chromium-global'`.
   */
  globalSetupDataDir: string;

  /**
   * This is to specify wich blockchain to use. Use "peregrine" for the internal version  or "spiritnet" for the public version of Sporran. Default is "perigrine". 
   */

  kiltBlockchain: string;

  PhraseSpiritnet: string;
  PasswordSpiritnet: string; 
};

/**
 * This extension of the playwright `test` function takes care of loading Sporran to the browser before your tests, but does not persist its state between tests.
 *
 * The most important addition is the `sporranContext` fixture, which provides each test with a fresh instance of a SporranContext.
 * Additionally, the `context` and `page` fixtures have been modified to make use of the `sporranContext`; essentially, they are shorthands for `sporranContext.context` and `sporranContext.context.newPage()`, respectively.
 * Finally, the `baseURL` fixture is set to point to the URL under which the Sporran extension page can be reached.
 * @example
 * testIsolated('go to sporran main page', async ({ page, baseURL })=> {
 *   await page.goto(new URL('/popup.html', baseURL).toString())
 * })
 */
export const testIsolated = base.extend<
  {
    /**
     * Provides a fresh instance of a SporranContext for each test; this is what you should use in your test closures. Note that the `context` and `page` fixtures inherit from this, so you can use these as well!
     */
    sporranContext: SporranContext;
  },
  ConfigOptions & {
    /**
     * Returns the browser-specific sporran context class inheriting from `SporranContext`, e.g. `SporranContextChromium` if testing on Chromium.
     */
    sporranContextClass: typeof SporranContext;
  }
>({
  extensionSourceDir: ['', { scope: 'worker', option: true }],
  extensionViewport: [undefined, { scope: 'worker', option: true }],
  extensionDataDir: [os.tmpdir(), { scope: 'worker', option: true }],
  globalSetupDataDir: [
    './sporran-chromium-global',
    { scope: 'worker', option: true },
  ],
  kiltBlockchain: ["peregrine", {scope: 'worker', option: true}], // "spiritnet"; // 
  PhraseSpiritnet: ['Defined only in the playwright.config.ts', { scope: 'worker', option: true }],
  PasswordSpiritnet: ['Defined only in the playwright.config.ts', { scope: 'worker', option: true }],
  sporranContextClass: [
    ({ browserName }, use) => {
      const contextClass = sporranContextForBrowser[browserName];
      base.fixme(
        !contextClass,
        'No sporran context class available for this browser'
      );
      use(contextClass);
    },
    { scope: 'worker' },
  ],
  sporranContext: async (
    {
      sporranContextClass,
      contextOptions,
      extensionSourceDir,
      extensionViewport,
      extensionDataDir,
      kiltBlockchain,

      PhraseSpiritnet,
      PasswordSpiritnet, 
    },
    use
  ) => {
    base.fixme(
      !extensionSourceDir,
      'No extension source directory configured for this browser'
    );
    const sporranContext = await sporranContextClass.newContext({
      sourceDir: extensionSourceDir,
      dataDir: sporranContextClass.getTempDir(extensionDataDir),
      contextOptions: {
        ...contextOptions,
        viewport: extensionViewport,
      },
    });
    use(sporranContext);
  },
  context: async ({ sporranContext }, use) => {
    await use(sporranContext.context);
    await sporranContext.teardown();
  },
  baseURL: ({ sporranContext }, use) => {
    use(sporranContext.baseURL);
  },

});

/**
 * This extension of the playwright `test` function takes care of loading Sporran to the browser before your tests.
 * It is similar to `testIsolated` in that each test has access to a fresh instance of Sporran.
 * Using the `page`, `context` or `sporranContext` fixtures will make sure that you are interacting with a browser instance where Sporran is loaded.
 *
 * Here, however, their state is initialised by producing a copy of an extension state set up once before all tests.
 * To take advantage of this, uncomment the `globalSetup` option in the playwright.config.ts and edit the script defined there to your needs.
 */
export const testGlobalSetup = testIsolated.extend<
  {},
  {
    /**
     * This holds the persistent Sporran context from which clones are created upon each test.
     */
    persistedSporranContext: SporranContext;
  }
>({
  persistedSporranContext: [
    async (
      {
        sporranContextClass,
        extensionSourceDir,
        extensionViewport,
        extensionDataDir,
        globalSetupDataDir,
        kiltBlockchain,

        PhraseSpiritnet,
        PasswordSpiritnet,
      },
      use
    ) => {
      base.fixme(
        !extensionSourceDir,
        'No extension source directory configured for this browser'
      );
      const dataDir = path.isAbsolute(globalSetupDataDir)
        ? globalSetupDataDir
        : path.join(extensionDataDir, globalSetupDataDir);
      const context = await sporranContextClass.newContext({
        sourceDir: extensionSourceDir,
        dataDir,
        contextOptions: {
          viewport: extensionViewport,
        },
      });
      // close context to free lock on source / user data files
      await context.context.close();
      use(context);
    },
    { scope: 'worker' },
  ],
  sporranContext: async (
    {
      contextOptions,
      persistedSporranContext,
      extensionSourceDir,
      extensionViewport,
      extensionDataDir,
      kiltBlockchain,

      PhraseSpiritnet,
      PasswordSpiritnet,
    },
    use
  ) => {
    base.fixme(
      !extensionSourceDir,
      'No extension source directory configured for this browser'
    );
    const dataDir = SporranContext.getTempDir(extensionDataDir);
    const sporranContext = await persistedSporranContext.clone(dataDir, {
      inheritState: true,
      contextOptions: {
        ...contextOptions,
        viewport: extensionViewport,
      },
    });
    use(sporranContext);
  },
});

/**
 * This extension of the playwright `test` function takes care of loading Sporran to the browser before your tests.
 * It is similar to `testIsolated` in that each test has access to a fresh instance of Sporran.
 * Using the `page`, `context` or `sporranContext` fixtures will make sure that you are interacting with a browser instance where Sporran is loaded.
 *
 * Here, however, their state is initialised by producing a copy of an extension state set up once when a test worker is initialized (usually when the test file loads).
 * To take advantage of this, you will need to overwrite the `setupInitialState` fixture to perform setup steps according to your needs.
 * @example
 * ```ts
 * // here we define which steps to run on setup, once before all tests in this file
 * testPersistedSetup.use({
 *   setupInitialState: ({}, use) => {
 *     use(async (sporranContext) => {
 *       const page = sporranContext.context.newPage();
 *       await page.goto(
 *         new URL('/popup.html', sporranContext.baseURL).toString()
 *       );
 *       // perform steps to create an identity
 *     });
 *   },
 * });
 * // and here we test
 * testPersistedSetup('go to sporran main page', async ({page, baseURL})=> {
 *   await page.goto(new URL('/popup.html', baseURL).toString())
 *   // sporran opens with an identity already set up
 * })
 * ```
 */
export const testPersistedSetup = testGlobalSetup.extend<
  {},
  {
    /**
     * This fixture is executed when a test file loads; it sets up the extension state which is then cloned on each test.
     * In order to define which steps should be performed to produce this initial state, this fixture must be overwritten with `testPersistedSetup.use()`.
     * @example
     * ```ts
     * testPersistedSetup.use({
     *   setupInitialState: ({}, use) => {
     *     use(async (sporranContext) => {
     *       const page = sporranContext.context.newPage();
     *       await page.goto(
     *         new URL('/popup.html', sporranContext.baseURL).toString()
     *       );
     *       // do stuff on sporran UI
     *     });
     *   },
     * });
     * ```
     */
    setupInitialState: (context: SporranContext) => Promise<void>;
    initialStateOnSpiritnet: (context: SporranContext, PhraseSpiritnet: string, PasswordSpiritnet: string) => Promise<void>;
  }
>({
  setupInitialState: [
    ({}, use) => {
      use(async () => {});
    },
    { scope: 'worker', option: true } as any,
  ],

  /*The same Identity is going to be use for all test, so you need to write --workers=1 */
  initialStateOnSpiritnet: [
    ({}, use) => {
        use(async (sporranContext, PhraseSpiritnet,  PasswordSpiritnet  ) => {
          //This is the Sarah Connor Identity on the Spiritnet (aka Real money)
          
          // const PHRASE =
          // 'crack slam certain affair castle clutch neck family put quiz security rival' ;
          // const PASSWORD = 'I_will_be_back_35_times!'; 
          const page = sporranContext.context.pages()[0];
          await page.bringToFront();
          await page.goto(new URL('/popup.html', sporranContext.baseURL).toString());
          const wp = new WelcomePage(page);
          await wp.importIdentity(PhraseSpiritnet, PasswordSpiritnet);

          const msp = new MainSporranPage(page);
          //await msp.renameIdentity("Sarah Connor");
        });
      },
    { scope: 'worker' },
  ],
  persistedSporranContext: [
    async (
      {
        sporranContextClass,
        extensionSourceDir,
        setupInitialState,
        initialStateOnSpiritnet,
        extensionViewport,
        extensionDataDir,
        kiltBlockchain,

        PhraseSpiritnet,
        PasswordSpiritnet,
      },
      use
    ) => {
      base.fixme(
        !extensionSourceDir,
        'No extension source directory configured for this browser'
      );
      const context = await sporranContextClass.newContext({
        sourceDir: extensionSourceDir,
        dataDir: SporranContext.getTempDir(extensionDataDir),
        contextOptions: {
          viewport: extensionViewport,
        },
      });

      if(kiltBlockchain == 'peregrine'){
        //Use the initial Statates declared in each testfile:
        await setupInitialState(context);

      }else if(kiltBlockchain == 'spiritnet'){
        //Uses a single State and Identity for all test. Important not to run the parrallel! => --workers=1
        await initialStateOnSpiritnet(context, PhraseSpiritnet,  PasswordSpiritnet);

      }else(
        console.error("You have to assign a valid value for the constant \"kiltBlockchain\". \n Please write either \"peregrine\" or \"spiritnet\" next to the parameter on the file: playwright.config.ts")
      )

      
      // close context to free lock on source / user data files
      await context.context.close();
      use(context);
    },
    { scope: 'worker' },
  ],
});
