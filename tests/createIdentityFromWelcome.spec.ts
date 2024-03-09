import { expect, test, Page, Locator, chromium } from '@playwright/test';
import { WelcomePage } from '../PageObjectModels/WelcomePageModel';
import { testIsolated, testPersistedSetup } from '../utils/extensionContext';



//For this test is necessary NOT TO BE LOG IN, so I have to overwrite the initial state on Spiritnet as well to avoid that
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



testPersistedSetup.describe('Checks Attention Scrren to create an Identity from the Welcome page works as expected. SK-TC-20', () => {


    testPersistedSetup.beforeEach(async ({ page }) => {
       await page.goto(''); //opens the extension as a new tab

       //Assertetion of the initial requierements:

        //Checks that the title is ok
        const title = page.locator('h1');
        await expect(title, "It seems like the wrong page opened.").toHaveText('Welcome to your Sporran');

        //checks that the explanatory text is as expected
        //this also validates that the requierement "Given I don't have any Identity added yet" is fullfilled
        const information = page.locator('h3');
        await expect(information).toHaveText('You currently don’t have any Identities. Add your first Identity to get started.');


    });

    testPersistedSetup('Check that all elements and text are displayed as expected.', async ({ page }) => {
        const wp = new WelcomePage(page);

        await wp.clickCreateIdentity();


        //checks that the title matches:
        await expect(page.locator('h1:has-text("Attention!")'), "Could not find the Attention title").toBeVisible();

        // Checks that the warning Sign is being displayed as expected
        await expect(page.locator('h1')).toHaveScreenshot("AttentionSign.png");

        // checks the headline:
        await expect(page.locator('h2').nth(0)).toHaveText("The next step is very important!");

        // checks the parragraph:
        await expect(page.locator('p'))
        .toHaveText("Please write down your wallet’s phrase and keep it in a safe place. We recommend that you write down your backup phrase with pen and paper. The phrase is required to restore your Identity.");

        // checks warning (2nd headline)
        await expect(page.locator('h2').nth(1)).toHaveText("Keep it safe, so you don’t lose your assets");
    });

    testPersistedSetup('Check that all buttons lead to the right page.', async ({ page }) => {
        const wp = new WelcomePage(page);
        const title = page.locator('h1');
        const understandGotoPhrase =  page.locator('a', {hasText: "I understand this – go to the phrase"});

        await wp.clickCreateIdentity();

        // click the "I understand this – go to the phrase" button
        await understandGotoPhrase.click();
        await expect(title, "It seems like you were not directed to the Phrase creation page").toHaveText("My Backup Phrase");

        await wp.backButton.click();


        // try the cancel button:
        await expect(title, "It seems like the wrong page opened.").toHaveText('Attention!');
        await page.locator('a', {hasText: "Cancel"}).click(); 
        await expect(title, "It seems like the wrong page opened.").toHaveText('Welcome to your Sporran');

        //try the other cancel button: (on the new phrase page)
        await wp.clickCreateIdentity();
        await understandGotoPhrase.click();
        await expect(title, "It seems like you were not directed to the Phrase creation page").toHaveText("My Backup Phrase");
        await page.locator('a', {hasText: "Cancel"}).click(); 
        await expect(title, "It seems like the wrong page opened.").toHaveText('Welcome to your Sporran');

        // Try the back button:
        await wp.clickCreateIdentity(); 
        await wp.backButton.click();
        await expect(title, "It seems like the wrong page opened.").toHaveText('Welcome to your Sporran');
    });

    testPersistedSetup('Check that the phrase is forgotten/reset when it should', async ({ page }) => {
        const wp = new WelcomePage(page);
        const title = page.locator('h1');
        const understandGotoPhrase =  page.locator('a', {hasText: "I understand this – go to the phrase"});
        const cancelButton = await page.locator('a', {hasText: "Cancel"}); 

        async function readPhrase(): Promise<string> {
            await expect(page.locator('h1'), "This function only works on the create Phrase screen.").toHaveText("My Backup Phrase");
            const listOfWords: Locator = page.locator('ol');
            var newPhrase: string;
            var arrayWords: string[] =['initializer'];
        
        
            for (let i = 0; i < 12; i++) {
                const word = await listOfWords.locator('span').nth(i).innerText();
                arrayWords[i] = word; 
                //arrayWords.push(word);
            }
            
            newPhrase = arrayWords.toString();
            newPhrase = newPhrase.replace(/\,/g," ");

            return newPhrase;
        }

        //read the first phrase
        await wp.clickCreateIdentity();
        await understandGotoPhrase.click();
        const readedPhrase1 = await readPhrase();

        //Pressing the back button once should not reset the phrase 

        await wp.backButton.click();
        await understandGotoPhrase.click();
        const readedPhrase2 = await readPhrase();

        expect(readedPhrase2, "The phrase is being forgotten when it should not.").toBe(readedPhrase1);

        //Pressing the back button twice should reset the phrase:

        await wp.backButton.click({clickCount:2});
        await wp.clickCreateIdentity();
        await understandGotoPhrase.click();
        const readedPhrase3 = await readPhrase();

        expect(readedPhrase3, "The phrase is not being forgotten when it should.").not.toBe(readedPhrase2);

        // Presing the cancel (on the Phrase screen) button should reset the phrase
        await cancelButton.click();
        await wp.clickCreateIdentity();
        await understandGotoPhrase.click();
        const readedPhrase4 = await readPhrase();

        expect(readedPhrase4, "The phrase is not being forgotten when it should.").not.toBe(readedPhrase3);

        // Presing the cancel (on the Attention screen) button should reset the phrase
        await wp.backButton.click();
        await cancelButton.click();
        await wp.clickCreateIdentity();
        await understandGotoPhrase.click();
        const readedPhrase5 = await readPhrase();

        expect(readedPhrase5, "The phrase is not being forgotten when it should.").not.toBe(readedPhrase4);

    });


    testPersistedSetup('create Identity.', async ({ page, kiltBlockchain }) => {
      const wp = new WelcomePage(page);
      
      console.log(`This is the seed phrase of a new Identity on the Kilt ${kiltBlockchain} blockchain` + kiltBlockchain);
      console.log(await wp.createIdentity('0EasyPassword!'));
  });
  


});