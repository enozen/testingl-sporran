import { expect, Locator, Page } from '@playwright/test';

export class WelcomePage {
  readonly page: Page;
  readonly acceptTermsLabel: Locator;
  readonly createIdentityButton: Locator;
  readonly importIdentityButton: Locator;
  readonly checkbox: Locator;
  readonly nextStepButton: Locator;
  readonly backButton: Locator;
  readonly passwordField: Locator;
  readonly passwordRequirements: Locator;

  constructor(page: Page) {
    this.page = page;
    this.acceptTermsLabel = page.locator('label', {
      hasText: 'I have read and agree to the',
    });
    this.checkbox = this.acceptTermsLabel.locator('input');
    this.createIdentityButton = page.locator('text=Create Identity');
    this.importIdentityButton = page.locator('a:has-text("Import an Identity from pre-existing phrase")');
    this.nextStepButton = page.locator('text=Next Step');
    this.backButton = page.locator('button[title="Back"]');
    this.passwordField = page.locator('input[type="password"]');
    this.passwordRequirements = page
      .locator('main', {
        has: page.locator('h2', { hasText: 'You need to use' }),
      })
      .locator('ul')
      .locator('li');
  }

  async acceptTerms() {
    if (!(await this.checkbox.isChecked())) {
      await this.acceptTermsLabel.click();
    }
    await expect(this.checkbox).toBeChecked();
    await expect(this.createIdentityButton).toBeEnabled();
    await expect(this.importIdentityButton).toBeEnabled();
  }

  async clickCreateIdentity() {
    await this.acceptTerms();
    await this.createIdentityButton.click();
    await expect(this.acceptTermsLabel).not.toBeVisible();
    await expect(
      this.page.locator('h1', { hasText: 'Attention' })
    ).toBeVisible();
  }

  async clickImportIdentity() {
    await this.acceptTerms();
    await this.importIdentityButton.click();
    await expect(this.acceptTermsLabel).not.toBeVisible();
    await expect(
      this.page.locator('h1', { hasText: 'Import an Identity' })
    ).toBeVisible();
  }

  findMnemonicInputField(wordIdx: number) {
    return this.page.locator(`form >> input[id="${wordIdx}"]`);
  }

  async typeMnemonic(phrase: string) {
    await expect(
      this.page.locator('h1', { hasText: 'Import an Identity' })
    ).toBeVisible();
    phrase = phrase.replace(/\t/g, ' '); //replaces all tabs with spaces. the g stands for global, without it it only replaces the first occurrence. 

    const words = phrase.split(' ');
    for (let i = 0; i < words.length; i++) {
      await this.findMnemonicInputField(i).type(words[i]);
    }
  }

  async nextStep() {
    await expect(this.nextStepButton).toBeVisible();
    await expect(this.nextStepButton).toBeEnabled();
    await this.nextStepButton.click();
  }

  async goBack() {
    await expect(this.backButton).toBeVisible();
    await expect(this.backButton).toBeEnabled();
    await this.backButton.click();
  }

  async passwordRequirementsMet(): Promise<Record<string, boolean>> {
    return this.passwordRequirements.evaluateAll((els) =>
      els.reduce<Record<string, boolean>>((obj, el) => {
        const hasBackgroundImage =
          window.getComputedStyle(el).getPropertyValue('background-image') !==
          'none';
        const text = el.textContent || '';
        obj[text] = hasBackgroundImage;
        return obj;
      }, {})
    );
  }

  async importIdentity(mnemonic: string, newPassword: string) {
    this.clickImportIdentity();
    this.typeMnemonic(mnemonic);
    this.nextStep();
    await expect(this.passwordField).toBeVisible();
    Object.entries(await this.passwordRequirementsMet()).forEach(
      ([req, met]) => {
        expect(met, `password requirement ${req} should not be met`).toBe(
          false
        );
      }
    );
    await this.passwordField.type(newPassword);
    Object.entries(await this.passwordRequirementsMet()).forEach(
      ([req, met]) => {
        expect(
          met,
          `password requirement ${req} is not met, can't continue`
        ).toBe(true);
      }
    );
    await this.nextStep();
    // const dialog = this.page.locator('dialog', {
    //   has: this.page.locator('h1', { hasText: 'Congratulations' }),
    // });
    const dialog = this.page.locator('dialog',  { hasText: 'Congratulations' });
    await expect(dialog, 'did not see confirmation dialog').toBeVisible({
      // may take a while
      timeout: 30*1000,
    });
    await dialog.locator('button', { hasText: 'OK' }).click();
    await expect(dialog, 'confirmation dialog did not close').not.toBeVisible();
  }


   /** This method creates a new Identiy with the given password and returns the phrase.
    *  It does the whole process; if you only want to land on the Attention Screen, use clickCreateIdentity() instead. 
    * @param password: string
    * @returns the new Phrase as a string with words separated by tabs.
    */
    async createIdentity(password:string): Promise<string> {
    
      await this.clickCreateIdentity();
  
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
