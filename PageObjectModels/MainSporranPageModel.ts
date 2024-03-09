import { errors, expect, Locator, Page } from '@playwright/test';
import { abort } from 'process';



export class MainSporranPage {
    readonly page: Page;
    readonly gear: Locator;
    readonly addButton: Locator;
    readonly menuGear: Locator;
    readonly menuAdd: Locator;
    readonly arrowBack: Locator;
    readonly pointsMenu: Locator;
    readonly pointAddIdentity: Locator;
    readonly balanceBreakdownChevron: Locator;
    decimalSeparatorMain: string;

    readonly identityName: Locator;
    readonly chevron: Locator;
    readonly menuChevron: Locator;
    readonly sendBubble: Locator;
    readonly receiveBubble: Locator;
    readonly totalBalanceTitle: Locator;
    readonly kiltCoin: Locator;
    readonly totalBalanceBottom: Locator;
    readonly avatarCircle: Locator;
    readonly arrowLeft: Locator;
    readonly arrowRight: Locator;

    readonly acceptTermsLabel: Locator;
    readonly checkbox: Locator;
    readonly createIdentityButton: Locator;
    readonly hyperlinkToImport: Locator;
    
    //experimental:
    //maybe I can use this to set the right format of the numbers:
    localLanguage: string | null = null;

  
    constructor(page: Page) {
        this.page = page;
        this.gear = page.locator('nav').locator('button[role="button"][title="Settings"]');
        this.addButton = page.locator('nav').locator('button[role="button"][title="Add"]');
        this.menuGear = page.locator('nav').locator('div[role="menu"]'); //they are literally the same. both only visible after clicking on it. 
        this.menuAdd = page.locator('nav').locator('div[role="menu"]'); //maybe improve later
        this.arrowBack = page.locator('button[title="Back"]');
        this.pointAddIdentity = page.locator('a[aria-label="Add Identity"][title="Add Identity"]');
        this.pointsMenu = page.locator('main > div').locator('ul',{has: this.pointAddIdentity});
        this.balanceBreakdownChevron = page.locator('button[title="Show balance breakdown"]');
        this.decimalSeparatorMain = "unassigned"; // run $await msp.readNumberFormat();$ to assign
       

        /** Chevron next to the Identity Name. */
        this.chevron = page.locator('button[title="Identity options"]');
        this.menuChevron = page.locator('div', {has: this.chevron}).locator('div[role="menu"]');

        this.sendBubble = page.locator('a:has-text("Send")');
        this.receiveBubble = page.locator('a:has-text("Receive")'); 
        this.totalBalanceTitle = page.locator('main').locator('p', {hasText:"Total Balance"});
        this.kiltCoin = page.locator('span[aria-label="KILT Coin"]');
        this.totalBalanceBottom = page.locator('p').locator('span', {hasText:"Total Balance"});

        this.avatarCircle = page.locator('svg[height="64"][width="64"]');
        this.identityName = page.locator('section', {has: this.avatarCircle}).locator('div').nth(1).locator('span');

        // to make a locator for the navigation arrows is a bit difficult, because the titles change accordenly to the name of the identities
        // and of course there is no ID number
        const navigationSection = page.locator('section', {has: this.avatarCircle});
        const navigationDivition = page.locator('div', {has: navigationSection});
        this.arrowLeft = navigationDivition.locator('a').nth(0);
        this.arrowRight = navigationDivition.locator('a').nth(1);


        //on the "Add Indentity Screen"
        this.acceptTermsLabel = page.locator('label', { hasText: "I have read and agree"});
        this.checkbox = this.acceptTermsLabel.locator('input');
        this.createIdentityButton = page.locator('a', {hasText: "Create Identity"});
        this.hyperlinkToImport = this.page.locator('a', {hasText: "Import an Identity from pre-existing phrase"});



    }

    async acceptTerms() {
        if (!(await this.checkbox.isChecked())) {
          await this.acceptTermsLabel.click();
        }
        await expect(this.checkbox).toBeChecked();
        await expect(this.createIdentityButton).toBeEnabled();
        await expect(this.hyperlinkToImport).toBeEnabled();
      }



    findMnemonicInputField(wordIdx: number) {
        return this.page.locator(`form >> input[id="${wordIdx}"]`);
    }
    
    async typeMnemonic(phrase: string) {
        await expect(
            this.page.locator('h1', { hasText: 'Import an Identity' })
        ).toBeVisible();
        phrase = phrase.replace(/\t/g, ' '); //replace tabs with spaces
        const words = phrase.split(' ');
        for (let i = 0; i < words.length; i++) {
            await this.findMnemonicInputField(i).fill(words[i]);
        }
    }

    async importIdentity(phrase: string, password: string) {
        await this.addButton.click();
        await this.menuAdd.locator('a', {hasText:"Add Identity"}).click();
        await expect(this.page.locator('h1', {hasText:"Add Identity"})).toBeVisible();

        //await this.page.locator('input[type="checkbox"]').check();
        //const hyperlinkToImport = this.page.locator('a', {hasText: "Import an Identity from pre-existing phrase"});
        await this.acceptTerms();
        await expect(this.hyperlinkToImport, "Sporran doesn't like you!").toBeEnabled();
        await this.hyperlinkToImport.click();
        await this.typeMnemonic(phrase);
        const nextStep = this.page.locator('button[type="submit"]',{hasText:"Next Step"});
        await expect(nextStep,"Can not click the \"Next Step\" button. There is probably a typo on the phrase.").toBeEnabled();
        await nextStep.click();
        const passwordField = this.page.locator('input[name="password"]');
        await passwordField.fill(password);
        await expect(nextStep,"Can not click the \"Next Step\" button. There is probably a typo on the password.").toBeEnabled();
        await nextStep.click();

        const dialog = this.page.locator('dialog',  { hasText: 'Congratulations' });
        await expect(dialog, 'did not see confirmation dialog').toBeVisible({
        // may take a while
        timeout: 30*1000,
        });
        await dialog.locator('button', { hasText: 'OK' }).click();
        await expect(dialog, 'confirmation dialog did not close').not.toBeVisible();
    }

    /**
     * This Function waits for the small Kilt Coin icon next to the Total Balance. It only appears after loading.
     */
   async waitForLoadedBalance() {
    await this.kiltCoin.first().waitFor({state:"visible"});
    if (await this.numberOfIdentities()> 1){
        //If there is more than one Identiy on Sporran, there would be an extra balance on the bottom. That also has a Kilt Coin Icon.
        await this.kiltCoin.nth(0).waitFor({state:"visible"});
        await this.kiltCoin.nth(1).waitFor({state:"visible"});
    }
   }

   /**
    * This Funcions return the number of Identities added to the Sporran Extension being tested.
    * It works by counting the points in the Points Menu. If there are more than 5 identies included, it wont work.
    */
   async numberOfIdentities() {
    const numberOfIdentities: number = await this.pointsMenu.locator('li').count() - 1;

    if (numberOfIdentities>1) {
    //Compare to the number of Identities on the text at the botton:
    //this would only work having between 2 and 5 Identities
    const numberOfIDsdisplayed = await this.displayedNumberOfIdentities();
    expect(numberOfIDsdisplayed, "the number of IDs displayed at the botton does not match the number of points.").toBe(numberOfIdentities)

    }

    return numberOfIdentities;
   }

  async readIdentityName() {
    const currentName: string = await this.identityName.innerText();

    return currentName;
    
  }

    async  readTransferableBalance() {
        await this.balanceBreakdownChevron.click();
        const transferableBalanceLocator= this.page.locator('li', {hasText: "Transferable Balance:"}).locator('span').first();
        const transferableBalance = await this.balanceToFloat(transferableBalanceLocator);
        //console.log("the transferable Balance displayed for this account is " + transferableBalance);
        return transferableBalance;
    }

   async balanceToFloat(stringLocator: Locator) {
    var balanceString = await stringLocator.innerText(); // the string could be in metric or imperial notation (, or .)
    //console.log("the balance of this Identity as string is: " + balanceString +"_");
    const decimalSeparator = balanceString.charAt(balanceString.length -6); //there are 4 decimal places and a place for the Kilt Coin Icon. So the coma is the 6th element from the back. 
    //console.log('The decimal Separator is \"' + decimalSeparator+ '\"');

    if(decimalSeparator== ","){
        // checks if there are group separator for thousands
        const helperPoints = balanceString.indexOf('.'); //if there is no match it returns -1 
        //console.log(helperPoints);
        if(helperPoints !== -1){balanceString = balanceString.replace(/./g, '') }; //gets rid of points for thousands 

        balanceString = balanceString.replace(' ', ''); //gets rid of empty spaces. Not really necessary
        balanceString = balanceString.replace(/,/g, '.'); // turns the decimal separator to a point. Needed to convert to Float
    }else if(decimalSeparator == "."){
        // checks if there are group separator for thousands
        const helperComma = balanceString.indexOf(','); //if there is no match it returns -1 
        //console.log(helperComma);
        if(helperComma !== -1){balanceString = balanceString.replace(/,/g, '') }; //gets rid of comas for thousands 

        balanceString = balanceString.replace(' ', ''); //gets rid of empty spaces. Not really necessary
    }else {console.error("Total Balance's Format not readable.");
    }
 
    const balanceFloat = parseFloat(balanceString);
    //console.log('the balance read is: ' + balanceFloat);
    return balanceFloat; 
    
   }
   
   async totalBalanceOneIdentity() {
    await expect(this.page.locator('h1'), 'This method only works on the Main ("Your Identities") page').toHaveText("Your Identities");
    await this.waitForLoadedBalance();
    const balanceOneAccount = await this.balanceToFloat(this.totalBalanceTitle.locator('span').first());
    return balanceOneAccount;

   }

   async stringBalanceToFloat(balanceString: string) {
    const decimalSeparator = balanceString.charAt(balanceString.length -5); //there are 4 decimal places and no place for the Kilt Coin Icon. So the coma is the 5th element from the back. 
    //console.log('The decimal Separator is \"' + decimalSeparator+ '\"');

    if(decimalSeparator== ","){
        // checks if there are group separator for thousands
        const helperPoints = balanceString.indexOf('.'); //if there is no match it returns -1 
        //console.log(helperPoints);
        if(helperPoints !== -1){balanceString = balanceString.replace(/./g, '') }; //gets rid of points for thousands 

        balanceString = balanceString.replace(' ', ''); //gets rid of empty spaces. Not really necessary
        balanceString = balanceString.replace(/,/g, '.'); // turns the decimal separator to a point. Needed to convert to Float
    }else if(decimalSeparator == "."){
        // checks if there are group separator for thousands
        const helperComma = balanceString.indexOf(','); //if there is no match it returns -1 
        //console.log(helperComma);
        if(helperComma !== -1){balanceString = balanceString.replace(/,/g, '') }; //gets rid of comas for thousands 

        balanceString = balanceString.replace(' ', ''); //gets rid of empty spaces. Not really necessary
    }else {console.error("Given Balance's Format not readable. It can only have four decimal places.");
    }
 
    const balanceFloat = parseFloat(balanceString);
    //console.log('the balance read is: ' + balanceOneAccount);
    return balanceFloat; 

   }

   /**
    * This method rounds UP the input number after the 4th decimal place. 
    * If any decimal places after the 4th decimal is bigger than 0, it will round up the 4th decimal place.
    * 
    * @example roundUP( 2,00040001) => 2,0005
    * 
    * @param originalFloat: number
    * @returns shouldDisplay: number    This is a float with only 4 decimals diferent than 0. 
    */
    roundUp(originalFloat:number): number {
    var significantDigits: number = parseFloat(originalFloat.toFixed(4));// if the 5th decimal is bigger than 5 .toFixed(4) already rounds the number up
    //console.log(significantDigits);
    let insignificantDigits: number = originalFloat - significantDigits;
    //console.log(insignificantDigits);
    
    const helperString = originalFloat.toFixed(5);
    //console.log(helperString);
    let fithDecimalDigit: number = parseFloat(helperString.charAt(helperString.length-1));
    //console.log(fithDecimalDigit)

    if(insignificantDigits >= 0 && fithDecimalDigit<6){
      significantDigits = significantDigits*(10**4);
      significantDigits++;
      significantDigits= significantDigits/(10**4);
    }

    var shouldDisplay: number = significantDigits;
    //console.log(shouldDisplay);

    return shouldDisplay;
   }
   /**
    * This methods rounds down the input number by the 4th decimal place. 
    * The 4th decimal place remains the same regardless of what digits follows it. 
    * 
    * @example roundDown( 2,0004999079) => 2,0004
    * 
    * @param originalFloat number that you want to round down.
    * @returns shouldDisplay: number  This is a float with only 4 decimals diferent than 0. 
    */
    roundDown(originalFloat:number): number {
    const helperString = originalFloat.toString(10);
    // console.log(helperString);
    const whereToCut = helperString.indexOf(".") + 5; // .slice() excludes the character at the index=end
    const shouldDisplay: number = parseFloat(helperString.slice(0, whereToCut));
    //console.log(shouldDisplay);

    return shouldDisplay;
   }

   async renameIdentity(newname:string) {

    await expect(this.page.locator('h1:has-text("Your Identities")'), "This method only works when you are on the Main page.").toBeVisible();// Check that im on the Main Page/Identities Screen
    await this.chevron.click();

    await expect(this.menuChevron.locator('button[role="menuitem"]').nth(0), 'First menu point not as usual').toHaveText('Edit Identity Name');

    await this.menuChevron.locator('button[role="menuitem"]').nth(0).click();

    const nameInputBar = this.page.locator('input[placeholder="Identity name:"]');
    const checkMark = this.page.locator('form', {has: nameInputBar}).locator('button[type="submit"][title="Save"]');
    const xMark = this.page.locator('form', {has: nameInputBar}).locator('button[type="button"][title="Cancel"]');

    await nameInputBar.fill(''); //erase the default name
    await nameInputBar.type(newname);
    await checkMark.click();

    //It goes back to the main page after clicking on the check mark

    await expect(this.menuChevron, "The menu next to the identity is still showing; it should not.").toBeHidden();

    
   }

   /**
    * This method reads if the sporran app uses a "," or a "." as decimal separator.
    * It also assings the readed value to the MainSporranPage.decimalSeparatorMain: string
    *
    * You can also save the readed value in another variable, because it returns it.
    * 
    * @returns decimalSeparator: string
    */
   async readNumberFormat() {
    this.localLanguage = await this.page.locator('html').getAttribute('lang');
    await expect(this.page.locator('h1:has-text("Your Identities")'), "This method only works on the Main Page (a.k.a. \"Your Identities\" Screen)").toBeVisible();// Check that im on the Identities Screen
    await this.waitForLoadedBalance();
    var balanceString = await this.totalBalanceTitle.locator('span').first().innerText(); // the string could be in metric or imperial notation (, or .)
    //console.log("the balance of this Identity as string is: " + balanceString +"_");
    const decimalSeparator = balanceString.charAt(balanceString.length -6); //there are 4 decimal places and a place for the Kilt Coin Icon. So the coma is the 6th element from the back. 
    //console.log('The decimal Separator is \"' + decimalSeparator+ '\"');

    this.decimalSeparatorMain = decimalSeparator;
    return decimalSeparator;

   }

   /**
    * This method takes care of using the right decimal separator when tiping down a number. It does not round up/down. 
    * It has a maximum of 16 decimal places. 
    * 
    * @param amountFloat 
    * @returns amountString
    */
    floatToString(amountFloat: number): string{

    expect(this.decimalSeparatorMain, " You need to run \"readNumberFormat\" first.").not.toBe("unassigned");

    var amountString: string = "virgen";

    if(this.decimalSeparatorMain == ","){
        amountString = amountFloat.toLocaleString('de', {maximumFractionDigits:16}); // alot of decimal places to test Sporran taking care of them
    }else if(this.decimalSeparatorMain == "."){
        amountString = amountFloat.toLocaleString('us', {maximumFractionDigits:16});
    }else{
        console.error("the decimal separator could not be properly read. Currently it is: " + this.decimalSeparatorMain);
    }

    return amountString;
    
   }

   /**
    * This method takes care of using the right decimal separator when tiping down a number.  
    * It has a maximum of 4 decimal places. 
    * Not sure whats the internal rounding of the numbers. 
    * 
    * @param amountFloat 
    * @returns amountString 
    */
   floatToAmountString(amountFloat: number): string {

    expect(this.decimalSeparatorMain, " You need to run \"readNumberFormat\" first.").not.toBe("unassigned");

    var amountString: string = "virgen";

    if(this.decimalSeparatorMain == ","){
        amountString = amountFloat.toLocaleString('de', {maximumFractionDigits:4}); // only 4 decimal places
    }else if(this.decimalSeparatorMain == "."){
        amountString = amountFloat.toLocaleString('us', {maximumFractionDigits:4});
    }else{
        console.error("the decimal separator could not be properly read. Currently it is: " + this.decimalSeparatorMain);
    }

    return amountString;
    
   }

   async displayedNumberOfIdentities(): Promise<number>{
    await expect(this.totalBalanceBottom, "the total Balance of all identities could not be found. You either have only one identity added or there is a bug. ").toBeVisible();

    const completeTextLocator = this.page.locator('p', {hasText: "Identities with a"});
    const completeText = await completeTextLocator.innerText();
    // console.log(completeText); 
    await expect(completeTextLocator, "The text at the bottom with the sum of the balances of all identities is not as usual.").toHaveText(/^You have \d+ Identities with a Total Balance:\s\d+[,\.]\d{4}\s/);
    const displayedNumberString = completeText.slice(9,  completeText.indexOf("I") -1);
    // console.log(displayedNumberString);

    const displayedNumberOfIdentities: number = parseInt(displayedNumberString);

    return displayedNumberOfIdentities;
   }

   async readAddressOfCurrentidentity() {

    await expect(this.page.locator('h1:has-text("Your Identities")'), "This method only works on the Main Page (a.k.a. \"Your Identities\" Screen)").toBeVisible({timeout:30*1000});// Check that im on the Identities Screen
   
    //read the address of this identity:
    await this.receiveBubble.click();
    const barAddress = this.page.locator('input[aria-labelledby="addressLabel"]');
    const readedAddress = await barAddress.getAttribute('value') || "could not read anything";
    await this.arrowBack.click();

    return readedAddress;
    
   }
   
   /**
    * This method only works with 5 identies or less added to the sporran extension.
    * 
    * @param index 
    */
   async goToPageOfIdentityNumber(index: number) {

    await this.pointsMenu.locator('li').nth(index -1).click();
    
   }

   /** This method creates a new Identiy with the given password and returns the phrase.
    * 
    * @param password: string
    * @returns the new Phrase as a string with words separated by tabs.
    */
   async createIdentity(password:string): Promise<string> {
    

    await this.addButton.click();
    await this.menuAdd.locator('a', {hasText:"Add Identity"}).click();
    await expect(this.page.locator('h1', {hasText:"Add Identity"})).toBeVisible();

    await this.acceptTerms();
    await expect(this.createIdentityButton,"Unable to click on the create identity button").toBeEnabled();
    await expect(this.hyperlinkToImport, "Sporran doesn't like you!").toBeEnabled();

    await this.createIdentityButton.click();
    await expect(this.page.locator('h1:has-text("Attention!")'), "An Attention! screen should appear; but it does not.").toBeVisible();
    await this.page.locator('a', {hasText: "I understand this – go to the phrase"}).click();

    const listOfWords: Locator = this.page.locator('ol');
    var newPhrase: string;
    var arrayWords: string[] =['initializer'];


    for (let i = 0; i < 12; i++) {
        const word = await listOfWords.locator('span').nth(i).innerText();
        arrayWords[i] = word; 
        //arrayWords.push(word);
    }
    
    newPhrase = arrayWords.toString();
    newPhrase = newPhrase.replace(/\,/g," ");

    //click on the next step button:
    await this.page.locator('a',{hasText: "Next Step"}).click(); //this button is different than the next one

    
    // click on the words on the right order
    const nextStepButton = this.page.locator('button',{hasText: "Next Step"});
    
    for (let i = 0; i < 12; i++) {
        await expect(nextStepButton, "the next step button should not be enable yet; but it is.").toBeDisabled();
        const word = arrayWords[i];
        await this.page.locator('button[type="button"]', {hasText: word}).click();
    }

    await expect(nextStepButton, "the next step button should be enable now; but it is not.").toBeEnabled();
    await nextStepButton.click();

    const passwordField = this.page.locator('input[name="password"]');
    await passwordField.type(password);
    await expect(nextStepButton,"Can not click the \"Next Step\" button. There is probably a typo on the password.").toBeEnabled();
    await nextStepButton.click();

    const dialog = this.page.locator('dialog',  { hasText: 'Congratulations' });
    await expect(dialog).toContainText("You have successfully created a KILT Identity");
    await expect(dialog, 'did not see confirmation dialog').toBeVisible({
    // may take a while
    timeout: 30*1000,
    });
    await dialog.locator('button', { hasText: 'OK' }).click();

    await expect(dialog, 'confirmation dialog did not close').not.toBeVisible();

    //await this.page.pause();

    // // Print out on the console:
    // console.log("The Phrase of the new identity, with the words separated by tabs is:");
    // console.log(newPhrase);
    // console.log("the password to this Identity is: ");
    // console.log(password);

    return newPhrase; 
    //return arrayWords;
   }



}  