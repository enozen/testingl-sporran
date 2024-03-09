import path from 'path';
import fs from 'fs';
import os from 'os';
import {
  chromium,
  BrowserContext,
  BrowserContextOptions,
} from '@playwright/test';

export type ConstructorOpts = {
  context: SporranContext['context'];
  contextOptions?: SporranContext['contextOptions'];
  sourceDir: SporranContext['sourceDir'];
  dataDir: SporranContext['dataDir'];
  baseURL: SporranContext['baseURL'];
};

/**
 * Base class providing browser-agnostic functionality for creating an isolated browser context with an instance of the Sporran extension loaded.
 * Hoping to get Firefox support at some point, where we would have another class extending this.
 */
export abstract class SporranContext {
  public readonly context: BrowserContext;
  public readonly contextOptions: BrowserContextOptions;
  public readonly sourceDir: string;
  public readonly dataDir: string;
  public readonly baseURL: string;

  public readonly browserName: string = '';

  constructor({
    context,
    sourceDir,
    dataDir,
    baseURL,
    contextOptions = {},
  }: ConstructorOpts) {
    this.context = context;
    this.contextOptions = contextOptions;
    this.sourceDir = sourceDir;
    this.dataDir = dataDir;
    this.baseURL = baseURL;
  }

  public static getTempDir(
    baseDir: string = os.tmpdir(),
    prefix = 'sporran-test-data-'
  ): string {
    return fs.mkdtempSync(path.join(baseDir, prefix));
  }

  public static async newContext(
    opts: Pick<ConstructorOpts, 'sourceDir' | 'dataDir' | 'contextOptions'>
  ): Promise<SporranContext> {
    throw new Error('not implemented');
  }

  public abstract clone(
    dataDir: SporranContext['dataDir'],
    opts?: { inheritState?: boolean } & Pick<ConstructorOpts, 'contextOptions'>
  ): Promise<SporranContext>;

  public async teardown() {
    await this.context.close();
    fs.rmSync(this.dataDir, { recursive: true, force: true });
  }
}

// ### CHROMIUM

type PersistentContextOpts = Parameters<
  typeof chromium['launchPersistentContext']
>[1];
function makeChromeContext(
  extensionPath: string,
  userDataDir: string,
  options: PersistentContextOpts = {}
): ReturnType<typeof chromium['launchPersistentContext']> {
  const launchOptions: PersistentContextOpts = {
    ...options,
    headless: false,
    args: [
      ...(options?.args || []),
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
    // viewport: {width: 480, height: 600}
  };
  return chromium.launchPersistentContext(userDataDir, launchOptions);
}

/**
 * Class that creates and handles an isolated Chromium browser context with an instance of the Sporran extension loaded.
 * These contexts can be cloned such that a new isolated context with the same state in Sporran is created, which can altered without affecting the context from which it was cloned.
 * For example, any identities and credentials added to Sporran will be available in the cloned instance.
 *
 * The browser context known to playwright users can be accessed via the `.context` property.
 */
export class SporranContextChromium extends SporranContext {
  public readonly extensionId: string;
  public readonly browserName = 'chromium';

  /**
   * The use of the constructor is discouraged; please use the static method SporranContextChromium.newContext() to create a new context from scratch,
   * or use the static method SporranContextChromium.fromContext() to create a new context from an existing one.
   */
  constructor(opts: ConstructorOpts & { extensionId: string }) {
    super(opts);
    this.extensionId = opts.extensionId;
  }

  /**
   * Creates a new isolated Chromium browser context with an instance of the Sporran extension loaded.
   *
   * @param constructorOpts Options to the constructor.
   * @param constructorOpts.sourceDir The directory containing the Sporran source files, from which the extension will be loaded.
   * @param constructorOpts.dataDir The directory in which Sporran will save its user data and state.
   * @param constructorOpts.contextOptions Options used to initialize the playwright BrowserContext.
   * @returns A new SporranContextChromium instance.
   */
  public static async newContext({
    sourceDir,
    dataDir,
    contextOptions = {},
  }: Pick<
    ConstructorOpts,
    'sourceDir' | 'dataDir' | 'contextOptions'
  >): Promise<SporranContextChromium> {
    const context = await makeChromeContext(sourceDir, dataDir, contextOptions);
    const page = await context.newPage();
    await page.goto('chrome://inspect/#extensions');
    const url = await page
      .locator('#extensions-list div[class="url"]')
      .textContent();
    await page.close();
    if (!url) throw new Error('extension url not found');
    const [, , extensionId] = url.split('/');
    //contextOptions.baseURL = `chrome-extension://${extensionId}/`; // Könnte man hier nicht schon /popup.html packen?
    contextOptions.baseURL = `chrome-extension://${extensionId}/popup.html`; 
    return new SporranContextChromium({
      context,
      contextOptions,
      sourceDir,
      dataDir,
      extensionId,
      baseURL: contextOptions.baseURL,
    });
  }

  /**
   * Clones an existing Chromium browser context with Sporran loaded.
   * If the `inheritState` option is set to true, this copies the contents of the original `dataDir` to the new instance's `dataDir`.
   * This way it inherits the state of the original context at the moment of cloning, without affecting it through its changes.
   *
   * @param sporranContext SporranContextChromium instance from which all settings an options will be taken over.
   * @param dataDir The directory in which the new Sporran instance will save its user data and state.
   * @param opts Additional options
   * @param opts.inheritState If set to true, will initialise the new Sporran context with a copy of the original's state.
   * @param opts.contextOptions Options used to initialize the playwright BrowserContext.
   * @returns A new SporranContextChromium instance based on `sporranContext`.
   */
  public static async fromContext(
    sporranContext: SporranContextChromium,
    dataDir: SporranContext['dataDir'],
    opts: { inheritState?: boolean } & Pick<ConstructorOpts, 'contextOptions'>
  ): Promise<SporranContextChromium> {
    if (opts.inheritState && fs.existsSync(sporranContext.dataDir)) {
      fs.cpSync(sporranContext.dataDir, dataDir, { recursive: true });
    }
    const contextOptions = {
      ...sporranContext.contextOptions,
      ...opts.contextOptions,
    };
    const context = await makeChromeContext(
      sporranContext.sourceDir,
      dataDir,
      contextOptions
    );
    return new SporranContextChromium({
      ...sporranContext,
      context,
      contextOptions,
      dataDir,
    });
  }

  /**
   * Clones this Sporran context instance, internally calling SporranContextChromium.fromContext().
   *
   * @param dataDir The directory in which the new Sporran instance will save its user data and state.
   * @param opts Additional options
   * @param opts.inheritState If set to true, will initialise the new Sporran context with a copy of the original's state.
   * @param opts.contextOptions Options used to initialize the playwright BrowserContext.
   * @returns A new SporranContextChromium instance based on the current one.
   */
  public clone(
    dataDir: SporranContext['dataDir'],
    opts: { inheritState?: boolean } & Pick<
      ConstructorOpts,
      'contextOptions'
    > = {}
  ): Promise<SporranContextChromium> {
    return SporranContextChromium.fromContext(this, dataDir, opts);
  }
}
