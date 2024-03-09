import { expect, Locator, Page } from '@playwright/test';
import { MainSporranPage } from '../PageObjectModels/MainSporranPageModel';


export class SendPageModel {
    readonly page: Page;
    readonly gear: Locator;
    readonly addButton: Locator;
    readonly menuGear: Locator;
    readonly menuAdd: Locator;
    readonly arrowBack: Locator;
    

   
    readonly totalBalanceTitle: Locator;
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
       
        
        this.totalBalanceTitle = page.locator('main').locator('p', {hasText:"Total Balance"});
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

    async waitForLoadedCosts() {
        var amuntToSend = await this.amountField.getAttribute("placeholder");
        //console.log(amuntToSend);
        //waits until the placeholder for the amount Field is loaded
        while(!amuntToSend){
          amuntToSend = await this.amountField.getAttribute("placeholder");
        }
        //console.log(amuntToSend);
        
    }


    async holdCosts() {
        const msp = new MainSporranPage(this.page);
        await msp.waitForLoadedBalance();
        await this.waitForLoadedCosts();
        const [costsLongString] = await this.costsText.allInnerTexts();
        //console.log("Text: \"" + costsLongString, "\" and have the length of : "+ costsLongString.length);
        const costString = costsLongString.slice(6, costsLongString.length -2);
        //console.log("shortet String: " + costString);
  
        const costFloat = await msp.stringBalanceToFloat(costString);
        return costFloat;
    }

    async holdTipPorcentange() {
        const msp = new MainSporranPage(this.page);
        await this.waitForLoadedCosts();
        const tipLongString = await this.tipText.innerText();
        await expect(this.tipText).toHaveText(/^Tip of \d+% included in costs$/);
        //console.log(tipLongString);
        //console.log("the index of \% is: " + tipLongString.indexOf("%"))
        
        const tip: number = parseFloat(tipLongString.slice(7, tipLongString.indexOf("%")));
        return tip;

    }   



    async setTipto(porcentange:number) {
        const tipBefore = await this.holdTipPorcentange();
        const tipDiference: number = porcentange - tipBefore; 

        if(tipDiference>0){
            await this.plusTip.click({clickCount:tipDiference});
        }else if(tipDiference<0){
            await this.minusTip.click({clickCount:-tipDiference});
        }

        const tip: number = await this.holdTipPorcentange();
        expect(tip, "The wished Tip could not be setted.").toBe(porcentange);
    }

    /**
     * Caution! this will temporarily change the Tip porcentage to 0.
     *
     * This function reads the displayed value from the sporran interface. 
     * There may be diferences with the more exact value available throught the polka Dot API.
     * 
     * The real minimum Fee has more decimal places (is more precise).
     * The one displayed on sporran is already rounded up to 4 decimal places.
     * 
     */
    async readMinimumFee() {
        const tipBefore = await this.holdTipPorcentange();
        await this.setTipto(0);
        const minimumFee = await this.holdCosts();
        await this.setTipto(tipBefore);
        return minimumFee;
        
    }


    async calculateCosts() { //Not working

        const amountString = await this.amountField.inputValue();
        const amountFloat = parseFloat(amountString); 
        const minimumFee = await this.readMinimumFee();

        var costsDisplayed: number = await this.holdCosts();
        var tip: number = await this.holdTipPorcentange();
        var costsShould: number = minimumFee + parseFloat((tip*0.01*amountFloat).toFixed(4));

        expect(costsDisplayed, "the displayed Costs does not add up correctly.").toBe(costsShould);

        return costsShould;
    }

    /**
     * @returns maximumAmountFloat: number 
     *
     * This function reads the displayed value from the sporran interface. 
     * There may be diferences with the more exact value available throught the Polka Dot API.
     */
    async holdMaximumAmount() {
        const msp = new MainSporranPage(this.page);
        await this.waitForLoadedCosts();
        const [maximumText] = await this.page.locator('small', {hasText: "Maximum transferable amount"}).allInnerTexts();
        //console.log("Text: \"" + maximumText, "\" and the length of : "+ maximumText.length);
        const maximumAmountString = maximumText.slice( 29 , maximumText.length-2)
        //console.log("shortet String: " + maximumAmountString);

        const maximumAmountFloat: number = await msp.stringBalanceToFloat(maximumAmountString);
        //console.log(maximumAmountFloat);

        return maximumAmountFloat;
        
    }

}