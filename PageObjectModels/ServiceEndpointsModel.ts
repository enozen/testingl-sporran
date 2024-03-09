import { expect, Locator, Page, ElementHandle } from '@playwright/test';
import { MainSporranPage } from '../PageObjectModels/MainSporranPageModel';


export class ServiceEndpointsModel {
    readonly page: Page;
    readonly gear: Locator;
    readonly addButton: Locator;
    readonly menuGear: Locator;
    readonly menuAdd: Locator;
    readonly arrowBack: Locator;
    readonly DID: Locator;
    readonly Copy: Locator;
    readonly AddEndpoint:Locator;
    readonly URLField:Locator;
    readonly TypeField: Locator;


    readonly kiltCoin: Locator;
    readonly totalBalanceBottom: Locator;
    readonly amountField: Locator;
    readonly sendAllButton: Locator;
    readonly costsText: Locator;
    readonly costGroup: Locator; 
    readonly minusTip: Locator;
    readonly plusTip: Locator;
    readonly tipText: Locator;
    readonly recipentsAddressField: Locator;
    readonly reviewSingButton: Locator;



    
    
  
    constructor(page: Page) {
        this.page = page;
        this.gear = page.locator('nav').locator('button[role="button"][title="Settings"]');
        this.addButton = page.locator('nav').locator('button[role="button"][title="Add"]');
        this.menuGear = page.locator('nav').locator('div[role="menu"]'); //they are literally the same. both only visible after clicking on it. 
        this.menuAdd = page.locator('nav').locator('div[role="menu"]'); //maybe improve later
        this.arrowBack = page.locator('button[title="Back"]');
        this.Copy=page.locator('button[title="Copy to clipboard"]');
        this.DID = page.locator('input[aria-label="DID"]');
        this.AddEndpoint=page.locator('ul').locator('li').locator('a',{hasText: "+ Add service endpoint" });
        this.URLField=page.locator('input[type="url"][name="url"]');
        this.TypeField= page.locator('input[name="type"]');




        this.kiltCoin = page.locator('span[aria-label="KILT Coin"]');
        this.totalBalanceBottom = page.locator('main > p ').locator('span', {hasText:"Total Balance"});
        this.amountField = page.locator('form > p').locator('input[name="amount"][aria-label="Amount to send"]');
        this.sendAllButton = page.locator('p', {has: page.locator('input[name="amount"][aria-label="Amount to send"]')}).locator('button[type="button"]', {hasText: "Send All"});
        this.costsText = page.locator('small', {hasText: "Costs:"});
        this.costGroup = page.locator('p',{has: this.costsText})
        this.minusTip = this.costGroup.locator('button[title="Decrease the tip by 1%"]');
        this.plusTip = this.costGroup.locator('button[title="Increase the tip by 1%"]');
        this.tipText = page.locator('small', {hasText: "Tip of "});
        this.recipentsAddressField= page.locator('input[id="recipient"][placeholder="Paste the recipient’s address here"]');
        this.reviewSingButton = page.locator('button[type="submit"]', {hasText: "Review & Sign Transaction" });



    }
    async clickAndSelectOption(page: Page) {
        const inputSelector = '#popup > div > section > ul > li > form > div:nth-child(2) > label > input';
        const optionValue = 'KiltPublishedCredentialCollectionV1';
      
        await page.waitForSelector(inputSelector);
        await page.click(inputSelector);
      
        // Type the value into the input element to trigger the datalist
        await page.type(inputSelector, optionValue);
      
        // Wait for the datalist option to have the desired value
        const dataListOptionSelector = 'datalist#types option[value="KiltPublishedCredentialCollectionV1"]';
        const optionElement = await page.waitForSelector(dataListOptionSelector, { state: 'attached' }) as unknown as HTMLInputElement;
      
        // Get the value of the option using the "value" property
        const option = optionElement.value;
      
        // Check if the retrieved option value is equal to the expected value
        if (option === optionValue) {
          // Click the option in the datalist to select it
          await page.click(dataListOptionSelector);
          console.log('Option selected successfully:', optionValue);
        } else {
          console.log('The option value does not match:', option);
        }
      }
    async waitForLoadedCosts() {
        var amuntToSend = await this.amountField.getAttribute("placeholder");
        //console.log(amuntToSend);
        //waits until the placeholder for the amount Field is loaded
        while(!amuntToSend){
          amuntToSend = await this.amountField.getAttribute("placeholder");
        }
        //console.log(amuntToSend);
        
    }
}