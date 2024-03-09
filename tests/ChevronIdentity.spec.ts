import { expect, test, Page, Locator, chromium } from '@playwright/test';
import { WelcomePage } from '../PageObjectModels/WelcomePageModel';
import { testIsolated, testPersistedSetup } from '../utils/extensionContext';
import { SporranContext,SporranContextChromium} from '../utils/SporranContext';

testPersistedSetup.use({
    setupInitialState: ({}, use) => {
      use(async (sporranContext) => {
        const PHRASE =
          'punch march educate bitter frog grant shallow decrease act force broccoli object';
        const PASSWORD = 'When_is_37_enough?';
        const page = sporranContext.context.pages()[0];
        await page.bringToFront();
        await page.goto(sporranContext.baseURL);
        const wp = new WelcomePage(page);
        await wp.importIdentity(PHRASE, PASSWORD);
      });
    },
  });


  testPersistedSetup.describe('Checks that the chevron-menu next to identitiy name appers on the right screens. SK-TC-153 (and SK-TC-72)', () => {
    testPersistedSetup.beforeEach(async ({ page }) => {
      await page.goto('/popup.html'); // no hay problema porque URL() se encarga de redundancias
    });

    //const chevron = await page.locator('button[title="Identity options"]');


    testPersistedSetup('On the identity overview screen.', async ({ page }) => {
      await expect(page.locator('text=Your Identities')).toBeVisible();
      const chevron = page.locator('button[title="Identity options"]');
      await expect(chevron, "The chevron is not showing; and it should.").toBeVisible();
      await chevron.click();

      //Checks if the Menu opens after clicking and all options are listed.
      const menuChevron = page.locator('div', {has: chevron}).locator('div[role="menu"]');

      const lengthMenu = await menuChevron.locator('ul').locator('li').count(); //not used. :)
      //await console.log(lengthMenu);
      await expect(menuChevron, "The menu is not oppening after clicking it.").toBeVisible();
      await expect(menuChevron.locator('button[role="menuitem"]').nth(0), 'First menu point not as usual').toHaveText('Edit Identity Name');
      await expect(menuChevron.locator('a[role="menuitem"]').nth(0), 'Second menu point not as usual').toHaveText('Remove Identity'); //first item is a button and then the items are hyperlinks ("a")
      await expect(menuChevron.locator('a[role="menuitem"]').nth(1), 'Third menu point not as usual').toHaveText('Reset Password');

      //Alternative:
      // await expect(menuChevron.locator('a[role="menuitem"]',{hasText:("Remove Identity")}), 'Second menu point not as usual').toBeVisible();
      // await expect(menuChevron.locator('a[role="menuitem"]', {hasText:("Reset Password")}), 'Third menu point not as usual').toBeVisible();
    });

    testPersistedSetup('On the screen to Send Kilts.', async ({ page }) => {
      await expect(page.locator('h1:has-text("Your Identities")')).toBeVisible(); //I'm on the welcome page
      await page.locator('a:has-text("Send")').click();
      await expect(page.locator('h1:has-text("Send KILT Coins")')).toBeVisible();// I'm on the Send Screen.

      const chevron = page.locator('button[title="Identity options"]');
      await expect(chevron, "The chevron is showing; and it should not.").toBeHidden();
    });

    testPersistedSetup('On the screen to Receive Kilts.', async ({ page }) => {
      await expect(page.locator('h1:has-text("Your Identities")')).toBeVisible(); //I'm on the welcome page
      await page.locator('a:has-text("Receive")').click();
      await expect(page.locator('h1:has-text("Receive")')).toBeVisible();// I'm on the Receive Screen. "h1" is for title.

      const chevron = page.locator('button[title="Identity options"]');
      await expect(chevron, "The chevron is showing; and it should not.").toBeHidden();
    });

    testPersistedSetup('When I click on the bars from the botton', async ({ page }) => {
      await expect(page.locator('h1:has-text("Your Identities")')).toBeVisible(); //I'm on the welcome page
      const chevron = page.locator('button[title="Identity options"]');
      const arrowBack = page.locator('[title="Back"]'); // sometimes 'a' sometimes 'button'

      await page.locator('a:has-text("Show Credentials")').click();
      await expect(chevron, "The chevron is showing; and it should not.").toBeHidden();
      await arrowBack.click();

      await page.locator('a:has-text("Manage DID")').click();
      await expect(chevron, "The chevron is showing; and it should not.").toBeHidden();
      await arrowBack.click();

      await page.locator('a', {hasText: "web3name"}).click();
      await expect(chevron, "The chevron is showing; and it should not.").toBeHidden();
      await arrowBack.click();

      //console.log('Alles Fresh.');


    });

  });
