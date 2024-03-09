import { expect, test, Page, Locator, chromium} from '@playwright/test';
import { WelcomePage } from '../PageObjectModels/WelcomePageModel';
import { MainSporranPage } from '../PageObjectModels/MainSporranPageModel';
import { testPersistedSetup } from '../utils/extensionContext';

testPersistedSetup.use({
        setupInitialState: ({}, use) => {
            use(async (sporranContext) => {
            const PHRASE = 'grace world memory render hub effort wisdom thumb panther cause trophy fuel';
            const PASSWORD = 'Password12345+';
            const page = sporranContext.context.pages()[0];
            await page.bringToFront();
            await page.goto(sporranContext.baseURL);
            const wp = new WelcomePage(page);
            await wp.importIdentity(PHRASE, PASSWORD);
            });
        },
});
testPersistedSetup.describe('when I have an identity', () => {
    testPersistedSetup.beforeEach(async ({ page }) => {
        await page.goto('/popup.html');
    });


  /////////////////////// I can access the add Identity screen from Identity screen or send cion screen or receive coin screen ///////////////////////

 
  testPersistedSetup('Access the add Identity screen', async ({ page, context }) => {
   
    await expect(page.locator('h1:has-text("Your Identities ")')).toBeVisible(); // Check that im on the Welcome Page/Identities Screen
    // Switch to the "Add Identity" screen
    const msp = new MainSporranPage(page);
    await msp.pointsMenu.locator("li").locator('[aria-label="Add Identity"]').click();

    // Check that im on the Add Identity Screen
    await expect(page.locator('a:has-text("Add Identity")')).toBeVisible();
    await expect(page.locator('[aria-label="Add Identity"]').first()).toBeVisible();

    //switch to the first Identity
    const FirstIdButton = page.locator("li").locator('[aria-label="KILT Identity 1"]');
    await FirstIdButton.click();

    // Click on the "Send" button
    const sendButton = page.locator('a:has-text("Send")');
    await sendButton.click();
    
    

    // Check that Im on the Send KILT Coins Screen
    await expect(page.locator('h1:has-text("Send KILT Coins")')).toBeVisible(); 
   
    // Switch to the "Add Identity" screen
    await page.locator("li").locator('[aria-label="Add Identity"]').click();
    
    // Check that im on the Add Identity Screen
    await expect(page.locator('a:has-text("Add Identity")')).toBeVisible();
    await expect(page.locator('[aria-label="Add Identity"]').first()).toBeVisible();

    //switch to the first Identity Send KILT Coins Screen
    const leftButton = page.locator('[aria-label="KILT Identity 1"]').first();
    await leftButton.click();

    const back = page.locator('[aria-label="Back"]');
    await back.click();
    await back.click();
    // Check that im on the Welcome Page/Identities Screen
    await expect(page.locator('h1:has-text("Your Identities ")')).toBeVisible(); 


    // Click on the "Receive" button
    const ReceiveButton = page.locator('a:has-text("Receive")');
    await ReceiveButton.click();
    
   

    // Check that Im on the Receive KILT Coins Screen
    await expect(page.locator('h1:has-text("Receive")')).toBeVisible(); 
   
    // Switch to the "Add Identity" screen
    await page.locator("li").locator('[aria-label="Add Identity"]').click();
    
    // Check that im on the Add Identity Screen 
    const add= page.locator('a:has-text("Add Identity")')
    const createIdentityButton = page.locator('text=Create Identity');
    const importIdentityButton = page.locator('a:has-text("Import an Identity from pre-existing phrase")');
    await expect(page.locator('a:has-text("Add Identity")')).toBeVisible();
    await expect(page.locator('[aria-label="Add Identity"]').first()).toBeVisible(); 
    await add.click(); 
    const acceptTermsLabel = page.locator('label', {
        hasText: 'I have read and agree to the ',
      });
    const checkbox = acceptTermsLabel.locator('input'); 

    async function acceptTerms() {
        if (!(await checkbox.isChecked())) {
          await acceptTermsLabel.click();
        }
        await expect(checkbox).toBeChecked();
        await expect(createIdentityButton).toBeEnabled();
        await expect(importIdentityButton).toBeEnabled();
      }
    await acceptTerms();
    const termsandco = await page.waitForSelector('a.zkiAnOliSLvgj6MwMpph');
    const linkText = await termsandco.innerText();
    await termsandco.hover();
    

  // Check if the link is underlined (you can adjust the CSS property as needed)
  const isUnderlined = await termsandco.evaluate((el) => {
    const styles = getComputedStyle(el);
    return styles.getPropertyValue('text-decoration') === 'underline';
  }); 

  const [newTab] = await Promise.all([
    context.waitForEvent('page'), 
    termsandco.click(),
  ])
  await expect(newTab).toHaveURL('https://www.sporran.org/terms');

await importIdentityButton.click();
await expect(page.locator('h1:has-text("Import an Identity ")')).toBeVisible(); 
await back.click();
const wpm = new WelcomePage(page);
await wpm.importIdentity('zone mirror neither more exist radio apart castle thunder domain region script', 'IWilltest42!');






    
    });




});
