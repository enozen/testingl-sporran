import { FullConfig } from '@playwright/test';
import { ConfigOptions } from './extensionContext';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { SporranContextChromium } from './SporranContext';
import { WelcomePage } from '../PageObjectModels/WelcomePageModel';

export default async function setup(config: FullConfig<ConfigOptions>) {
  const {
    extensionSourceDir,
    extensionViewport,
    extensionDataDir,
    globalSetupDataDir = './sporran-chromium-global',
  } = config.projects[0].use;

  const dataDir = path.isAbsolute(globalSetupDataDir)
    ? globalSetupDataDir
    : path.join(extensionDataDir || os.tmpdir(), globalSetupDataDir);
  fs.rmSync(dataDir, { recursive: true, force: true });

  const sporranContext = await SporranContextChromium.newContext({
    sourceDir: extensionSourceDir as string,
    dataDir,
    contextOptions: {
      viewport: extensionViewport,
    },
  });

  /* STEPS TO SET UP STATE GO HERE */

  /* example: set up identity */
  //This is the Sarah Connor Identity on the Spiritnet Blockchain
  const PHRASE =
  'crack slam certain affair castle clutch neck family put quiz security rival' ;
  const PASSWORD = 'I_will_be_back_35_times!'; 
  const page = sporranContext.context.pages()[0];
  await page.bringToFront();
  await page.goto(new URL('/popup.html', sporranContext.baseURL).toString());
  const wp = new WelcomePage(page);
  await wp.importIdentity(PHRASE, PASSWORD);

  /* SET UP STEPS DONE */

  await sporranContext.context.close();
}
