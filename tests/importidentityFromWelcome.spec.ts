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



testPersistedSetup.describe('Checks that Importing an Identity from the Welcome page works as expected. SK-TC-25', () => {


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
        const title = page.locator('h1');

        await wp.clickImportIdentity();

        //checks that the title matches:
        await expect(title, "The title is not as expected.").toHaveText("Import an Identity");

        // checks the parragraph:
        await expect(page.locator('p').first())
        .toHaveText("To import a KILT Identity, you will need your backup phrase consisting of 12 words.");

        await expect(wp.backButton).toBeVisible();
        await expect(wp.backButton).toBeEnabled();
        await expect(wp.nextStepButton).toBeVisible();
        await expect(wp.nextStepButton).toBeDisabled();

        // Checks if there is an empty field for all 12 words:
        for (let i = 0; i < 12; i++) {
            await expect(wp.findMnemonicInputField(i), 'it seems like not all fields are showing').toBeVisible();
            await expect(wp.findMnemonicInputField(i), 'it seems to be some default input in one of the fields. Thats bad.').toBeEmpty();
        }

       
    });

    testPersistedSetup('Checks if I can import an identity.', async ({ page }) => {
        const wp = new WelcomePage(page);
        const title = page.locator('h1');

        // this checks that input fields and next step button works

        await wp.importIdentity('select	frown	sample	sudden	sting	purse	weasel	describe	chaos	pizza	joy	razor', 'When_is_37_enough?');

    });

    testPersistedSetup('Checks that back button works', async ({ page }) => {
        const wp = new WelcomePage(page);
        const title = page.locator('h1');

        await wp.clickImportIdentity();

        //checks that the title matches:
        await expect(title, "The title is not as expected.").toHaveText("Import an Identity");

        await expect(wp.backButton).toBeVisible();
        await expect(wp.backButton).toBeEnabled();
        
        await wp.backButton.click();


        await expect(title, "The title is not as expected.").toHaveText("Welcome to your Sporran");


    });

    testPersistedSetup('Checks that words get deleted after pressing the back button.', async ({ page }) => {
        const wp = new WelcomePage(page);
        const title = page.locator('h1');

        await wp.clickImportIdentity();

        //checks that the title matches:
        await expect(title, "The title is not as expected.").toHaveText("Import an Identity");

        // types 11 words (without typos)
        await wp.typeMnemonic("select	frown	sample	sudden	sting	purse	weasel	describe	chaos	pizza	joy");

        await expect(wp.backButton).toBeVisible();
        await expect(wp.backButton).toBeEnabled();
        
        await wp.backButton.click();

        await expect(title, "The title is not as expected.").toHaveText("Welcome to your Sporran");

        await wp.clickImportIdentity();

        // Checks if there is an empty field for all 12 words:
        for (let i = 0; i < 12; i++) {
            await expect(wp.findMnemonicInputField(i), 'it seems like not all fields are showing').toBeVisible();
            await expect(wp.findMnemonicInputField(i), 'it seems to be some default input in one of the fields. Thats bad.').toBeEmpty();
        }


    });


    testPersistedSetup('Checks that error messages appear when expected', async ({ page }) => {
        const wp = new WelcomePage(page);
        const title = page.locator('h1');
        const errorMessage = page.locator('p > output'); // this is the one unter the "next step" button

        await wp.clickImportIdentity();

        //I enter only 11 words
        await wp.typeMnemonic("select	frown	sample	sudden	sting	purse	weasel	describe	chaos	pizza	joy");
        await expect(errorMessage).toHaveText("Please insert all 12 words of the backup phrase in the correct order");

        await wp.backButton.click();
        await wp.clickImportIdentity();

        // The entered backup phrase doesn’t exist
        // I repeated some words in order to be very unlikely for this phrase to ever exist
        await wp.typeMnemonic('select	frown	sample	sudden	joy	purse	joy	joy	chaos	pizza	joy	select')
        await expect(errorMessage).toHaveText("The entered backup phrase doesn’t exist");

        await wp.backButton.click();
        await wp.clickImportIdentity();

        // I enter a word with a typo: (zudden instead of sudden)
        await wp.typeMnemonic("select	frown	sample	zudden	sting	purse	weasel	describe	chaos	pizza	joy	razor")
        await expect(errorMessage).toHaveText("The entered backup phrase doesn’t exist");

        const typoMessageWord4 = page.locator('output[for="3"]'); // the output start with index=0
        await expect(typoMessageWord4).toBeVisible();
        await expect(typoMessageWord4).toHaveText("It looks like there’s a typo in this word");

        await wp.backButton.click();
        await wp.clickImportIdentity();

        //wanna check if error appears under every field
        const typoMessageWordGeneral = page.locator('ol > li > output:not([hidden])'); // it only count visibles and from the list
        //I enter a phrase without a letter in every word
        await wp.typeMnemonic("selec	frow	sampl	sudde	stin	purs	wease	describ	chao	pizz	jo	razo")
        await expect(errorMessage).toHaveText("The entered backup phrase doesn’t exist");
        expect.soft(await typoMessageWordGeneral.count(), "at least one of the error messages is not showing; and it should.").toBe(12); //soft so the next expect can be more specific

        await wp.backButton.click();
        await wp.clickImportIdentity();

        // I enter, once at a time, a word with a tyo for every field:
        const arrayWords: string[] = ("select	frown	sample	sudden	sting	purse	weasel	describe	chaos	pizza	joy	razor").split(/\t/g);
        
        for (let i = 0; i < 12; i++) {
            var newWrongArray = [...arrayWords]; //clone the array

            //console.log(arrayWords[i]);
            newWrongArray[i] = (arrayWords[i]) + 'wrong';
            //console.log(newWrongArray)
            
            var newPhrase: string = newWrongArray.toString();
            newPhrase = newPhrase.replace(/\,/g," ");

            await wp.typeMnemonic(newPhrase);
            //await page.pause();
            await expect(errorMessage).toHaveText("The entered backup phrase doesn’t exist");

            expect.soft(await typoMessageWordGeneral.count(), "Only one Typo error message should be showing.").toBe(1);
            const errorAtWord = await typoMessageWordGeneral.getAttribute("for"); 
            expect.soft(errorAtWord, "the typo error message is not showing at the expected word").toBe(i.toFixed());

            //restart initial conditions: 
            await wp.backButton.click();
            await wp.clickImportIdentity();
        }

    });



});