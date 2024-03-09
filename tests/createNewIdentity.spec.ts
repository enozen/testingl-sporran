import { expect, test, Page, Locator, chromium } from '@playwright/test';
import { WelcomePage } from '../PageObjectModels/WelcomePageModel';
import { testIsolated, testPersistedSetup } from '../utils/extensionContext';



//For this test is better NOT TO BE LOG IN, so I have to overwrite the initial state on Spiritnet as well to avoid that
testPersistedSetup.use({
    setupInitialState: ({}, use) => {
      use(async (sporranContext) => {
        const page = sporranContext.context.pages()[0];
        await page.bringToFront();
        await page.goto(sporranContext.baseURL);
    
      });
    },
    initialStateOnSpiritnet: ({}, use) => {
        use(async (sporranContext) => {
          const page = sporranContext.context.pages()[0];
          await page.bringToFront();
          await page.goto(sporranContext.baseURL);
      
        });
      },
  });



testPersistedSetup.describe('This is not an actual test case, this is just to facilitate the manual tests', () => {

    testPersistedSetup('create an Identity and print the seed.', async ({ page, kiltBlockchain }) => {
        await page.goto('');
        const wp = new WelcomePage(page);

        const password: string = '0EasyPassword!';

        //print out in wich blockchain you are creating this Identity
        console.log("This works for this KILT-Blockchain: " + kiltBlockchain)


        const seedPhrase: string = await wp.createIdentity(password);
        console.log("\n" +'Seed phrase with words separated by spaces:');
        console.log(seedPhrase + "\n");


        // on the terminal output, there is no diference between a tab and a space
        // so this is useless:
        // const rephrased = seedPhrase.replace(/\s/g, '\t');
        // console.log('Seed phrase separated by tabs:');
        // console.log(rephrased); 

        const rephrased2 = seedPhrase.replace(/\s/g, '\n');
        console.log('Seed phrase with words separated by new lines a.k.a.: \\n');
        console.log(rephrased2); 
        
        

    });

 });
