import { expect} from '@playwright/test';
import { WelcomePage } from '../PageObjectModels/WelcomePageModel';
import { MainSporranPage } from '../PageObjectModels/MainSporranPageModel';
import { testPersistedSetup } from '../utils/extensionContext';

testPersistedSetup.use({
        setupInitialState: ({}, use) => {
            use(async (sporranContext) => {
            const PHRASE = 'goat analyst inmate humor lounge spring comfort axis spoon brave sound cushion';
            const PASSWORD = 'IWilltest42!';
            const page = sporranContext.context.pages()[0];
            await page.bringToFront();
            await page.goto(sporranContext.baseURL);
            const wp = new WelcomePage(page);
            await wp.importIdentity(PHRASE, PASSWORD);
            });
        },
        
});
testPersistedSetup.describe('5 Account Bubbles', () => {
    testPersistedSetup.beforeEach(async ({ page }) => {
        await page.goto('/popup.html');
    }); 
    testPersistedSetup('5 Account Bubbles', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Your Identities' })).toBeVisible();
        page.locator('div').filter({ hasText: 'KILT Identity 1' }).first();

        // 2nd id
        const id2 = new MainSporranPage(page);
        await id2.importIdentity('bike surround citizen lazy pitch letter canal garbage simple gain matter catalog', '@Password12345');
        const identity2 = page.getByText('KILT Identity 2');
        await expect(identity2).toHaveText("KILT Identity 2");

        //id 3
        const id3 = new MainSporranPage(page);
        await id3.importIdentity('hurry spray struggle recall crouch ketchup monkey embark moral say jeans exile', '@Password12345');
        const identity3 = page.getByText('KILT Identity 3');
        await expect(identity3).toHaveText("KILT Identity 3");

        //id 4
        await page.getByLabel('Add Identity').first().click();
        await page.getByText('Add Identity').click();
        const id4 = new MainSporranPage(page);
        await id4.importIdentity('entire ship exclude document random valve cupboard save gain hobby know oven', '@Password12345');
        const identity4 = page.getByText('KILT Identity 4');
        await expect(identity4).toHaveText("KILT Identity 4");

        //id 5
        const id5 = new MainSporranPage(page);
        await id5.importIdentity('wood lamp increase season insane grant depart cash wheel claim myself please', '@Password12345');
        const identity5 = page.getByText('KILT Identity 5');
        await expect(identity5).toHaveText("KILT Identity 5");

        // click on different bubbles
        await page.getByRole('list').getByLabel('KILT Identity 2').click();
        const id2ForVerification = page.getByText('KILT Identity 2');
        await expect(id2ForVerification).toHaveText("KILT Identity 2");

        await page.getByRole('list').getByLabel('KILT Identity 3').click();
        const id2ForVerification2 = page.getByText('KILT Identity 3');
        await expect(id2ForVerification2).toHaveText("KILT Identity 3");

        await page.getByRole('list').getByLabel('KILT Identity 4').click();
        const id2ForVerification3 = page.getByText('KILT Identity 4');
        await expect(id2ForVerification3).toHaveText("KILT Identity 4");

        const identities = page.getByText('You have 5 Identities', { exact: true })
        await expect(identities).toHaveText("You have 5 Identities");
       
        //active and inactive bubble
        const activeBubble = page.getByRole('list').getByLabel('KILT Identity 4');
        expect(await activeBubble.evaluate(
            ele => window.getComputedStyle(ele).getPropertyValue("opacity")
        )).toBe("1");

        const inactiveBubble = page.getByRole('list').getByLabel('KILT Identity 2');
        expect(await inactiveBubble.evaluate(
            ele => window.getComputedStyle(ele).getPropertyValue("opacity")
        )).toBe("0.5");

         // id 6
         const id6 = new MainSporranPage(page);
         await id6.importIdentity('rack lounge cart sauce scatter ordinary shuffle night stick material boil digital', '@Password12345');
         const identity6 = page.getByText('KILT Identity 6');
        await expect(identity6).toHaveText("KILT Identity 6");

        const bubbleList = page.getByRole('list');
        await expect(bubbleList).not.toBeVisible();

    });
        
});