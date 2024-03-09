import { expect, test, Page, Locator, chromium} from '@playwright/test';
import { WelcomePage } from '../PageObjectModels/WelcomePageModel';
import { testIsolated, testPersistedSetup, } from '../utils/extensionContext';
import { SporranContext,SporranContextChromium} from '../utils/SporranContext';
import { MainSporranPage } from '../PageObjectModels/MainSporranPageModel';
import fs from 'fs';
import dotenv from 'dotenv';



testPersistedSetup.use({
  setupInitialState: ({}, use) => {
    use(async (sporranContext) => {
      const PHRASE =
        'motor sick roast excite pluck fossil deny speak neither else refuse hybrid';
      const PASSWORD = 'Password#1234';
      const page = sporranContext.context.pages()[0];
      await page.bringToFront();
      await page.goto(sporranContext.baseURL);
      const wp = new WelcomePage(page);
      await wp.importIdentity(PHRASE, PASSWORD);
    });
  },
});
testPersistedSetup.describe('"Settings" dropdown gear menu (SK-TC-15)', () => {
  testPersistedSetup.beforeEach(async ({ page }) => {
    await page.goto('/popup.html');
  });

  testPersistedSetup('Checks that the options are listed when an Identity added.', async ({ page }) => {
    await page.waitForLoadState();
        await expect(page.locator('h1:has-text("Your Identities")')).toBeVisible();// Check that im on the Welcome Page/Identities Screen

        const gear = page.locator('nav').locator('button[role="button"][title="Settings"]');
        const menuGear = page.locator('nav').locator('div[role="menu"]');
        
        await gear.click();
    

        await expect(menuGear.locator('a[role="menuitem"]',{hasText:("Remove Current Identity")}), 'The Remove Identity option is not there; it should.').toBeVisible();
        await expect(menuGear.locator('a[role="menuitem"]',{hasText:("Reset password for current Identity")}), 'The Reset Password option is not there; it should.').toBeVisible();        
        await expect(menuGear.locator('button[type="button"]',{hasText:("Require Password for Future Transactions")}),'Require Password for Future Transactions is not there; it should.').toBeVisible();
        await expect(menuGear.locator('button[type="button"]',{hasText:("Require Password for Future Transactions")}),`\"Require Password for Future Transactions\" is not disabled; it should.`).toBeDisabled();
        await expect(menuGear.locator('a[role="menuitem"]',{hasText:("Terms & Conditions")}), 'Terms & Conditions is not there; it should.').toBeVisible(); 
        await expect(menuGear.locator('a[role="menuitem"]',{hasText:("Tech Support")}), 'Tech Support is not there; it should.').toBeVisible(); 
        await expect(menuGear.locator('a[role="menuitem"]',{hasText:("Toggle Website Access")}), 'Toggle Website Access is not there; it should.').toBeVisible();
        await expect(menuGear.locator('a[role="menuitem"]',{hasText:("Custom endpoint")}), 'Custom endpoint is not there; it should.').toBeVisible();
        await expect(menuGear.locator('a[role="menuitem"]',{hasText:('Version')}), 'The Version is not being displayed; it should.').toHaveText(/Version\s\d{4}\.\d{1,2}\.\d{1,2}/);
  });



  //The functionality of the "Remove current Identity" and "Resest Password" buttons are tested on the file "RemoveOnGear.spec.ts"

  testPersistedSetup('Checks that the "Terms & Conditions" option leads to the right link.', async ({ page, context }) => {
    const msp = new MainSporranPage(page);
        
        await msp.gear.click();
        await expect(msp.menuGear.locator('a[role="menuitem"]',{hasText:("Terms & Conditions")}), 'The Terms and Conditions option is not there; it should.').toBeVisible();
    
        //Saves the new page that opens under the constant "newTab".
        //await page.pause();
        const [newTab] = await Promise.all([
          context.waitForEvent('page'), 
          msp.menuGear.locator('a[role="menuitem"]',{hasText:("Terms & Conditions")}).click(),
        ])
        await expect(newTab).toHaveURL('https://www.sporran.org/terms');
        //await newTab.pause();

  });

  testPersistedSetup('Checks that the "Tech Support" option leads to the right link.', async ({ page, context }) => { 
    const msp = new MainSporranPage(page);
        
        await msp.gear.click();
        await expect(msp.menuGear.locator('a[role="menuitem"]',{hasText:("Tech Support")}), 'The Tech Support option is not there; it should.').toBeVisible(); 

        //await page.pause();
        const [newTab] = await Promise.all([
          context.waitForEvent('page'), 
          msp.menuGear.locator('a[role="menuitem"]',{hasText:("Tech Support")}).click(),
        ]); 
        
        
        await expect(newTab).toHaveURL('https://support.kilt.io/support/home');

  });

  testPersistedSetup('Checks that the "Toggle Website Access" option leads to the right page.', async ({ page }) => {
    const msp = new MainSporranPage(page);
        const title = page.locator('h1');
        await msp.gear.click();
        await expect(msp.menuGear.locator('a[role="menuitem"]',{hasText:("Toggle Website Access")}), 'The TToggle Website Access option is not there; it should.').toBeVisible();
        await msp.menuGear.locator('a[role="menuitem"]',{hasText:("Toggle Website Access")}).click(),
        await expect(title).toHaveText("Website Access");
        //await page.pause();


  });
  testPersistedSetup('Checks that the "Custom Endpoint" option leads to the right page.', async ({ page }) => {
    const msp = new MainSporranPage(page);
        const title = page.locator('h1');
        await msp.gear.click();
        await expect(msp.menuGear.locator('a[role="menuitem"]',{hasText:("Custom Endpoint")}), 'The Custom Endpoint option is not there; it should.').toBeVisible();
        await msp.menuGear.locator('a[role="menuitem"]',{hasText:("Custom Endpoint")}).click(),
        await expect(title).toHaveText("Set Custom Endpoint");
        //await page.pause();

  });




});














