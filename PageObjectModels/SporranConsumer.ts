import { BrowserContext, expect, Locator, Page } from '@playwright/test';
export type HexString = `0x${string}`;
export type SignRawPayload = {
  address: string;
  data: HexString;
  type: 'bytes' | 'payload';
};
export type Signature = { signature: string };

export type DidSignHandle = {
  signWithDid: (
    plaintext: string
  ) => Promise<{ signature: string; didKeyUri: string }>;
  signExtrinsicWithDid: (
    extrinsic: HexString,
    signer: string
  ) => Promise<{ signed: HexString; didKeyUri: string }>;
};

export class SporranConsumerPage {
  readonly page: Page;
  readonly context: BrowserContext;

  constructor(page: Page) {
    this.page = page;
    this.context = this.page.context();
  }

  async allowAccess(popup: Page) {
    expect(popup).toHaveURL(/action=access/);
    popup.locator('text=Yes, allow this application access').click();
    await popup.waitForEvent('close');
  }

  async authorizeSignature(popup: Page, password: string): Promise<void> {
    // allow access if necessary
    if (popup.url().includes('action=access')) {
      await this.allowAccess(popup);
      return this.authorizeSignature(
        await this.waitForSporranPopup(),
        password
      );
    }

    expect(popup).toHaveURL(/action=sign(Raw|Did|Payload)/);
    // Fill input[name="password"]
    await popup.locator('input[name="password"]').type(password);

    // Click button:has-text("Sign the Message")
    await popup.locator('button:has-text("Sign")').click();
    await popup.waitForEvent('close');
  }

  async getParitySignerHandle(): Promise<{
    signRaw: (signArgs: SignRawPayload) => Promise<Signature>;
  }> {
    this.context.on('page', this.allowAccess);
    const injectedWeb3handle = await this.page
      .waitForFunction(
        () => (window as any).injectedWeb3?.Sporran.enable('playwright'),
        undefined,
        { timeout: 15_000 }
      )
      .finally(() => this.context.off('page', this.allowAccess));
    return {
      signRaw: (signArgs) =>
        injectedWeb3handle.evaluate(
          (web3, arg) => web3.signer.signRaw(arg),
          signArgs
        ),
    };
  }

  async getDidSignHandle(): Promise<DidSignHandle> {
    const injectedSporranHandle = await this.page.waitForFunction(
      () => (window as any).kilt?.sporran,
      undefined,
      { timeout: 15_000 }
    );
    return {
      signWithDid: (signString) =>
        injectedSporranHandle.evaluate(async (sporranApi, args) => {
          return sporranApi.signWithDid(args);
        }, signString),
      signExtrinsicWithDid: (signString, address) =>
        injectedSporranHandle.evaluate(
          async (sporranApi, args) => {
            return sporranApi.signWithDid(...args);
          },
          [signString, address]
        ),
    };
  }

  async waitForSporranPopup(): Promise<Page> {
    return this.context.waitForEvent('page');
  }

  async signRaw(
    signData: SignRawPayload,
    password: string
  ): Promise<Signature> {
    const signer = await this.getParitySignerHandle();
    const result = signer.signRaw(signData);
    const popup = await this.waitForSporranPopup();
    await this.authorizeSignature(popup, password);
    return result;
  }

  async signWithDid(signData: string, password: string) {
    const { signWithDid } = await this.getDidSignHandle();
    const result = signWithDid(signData);
    let popup = await this.waitForSporranPopup();
    await this.authorizeSignature(popup, password);
    return result;
  }
}
