## Description

Useful information to create and run tests.

Repository: **testing-sporran** : Playwright tests for the Sporran extension.

# Setup

### Requierements:

- You need to have a GitHub account and have full access granted to the BTE-Trusted-Entity folder. The *testing-sporran* folder is only visible then. 
(ask Timo/Tom for the access).

- You need to have the programm (code editor) **Visual Studio Code** on your computer. You can downloaded here: `https://code.visualstudio.com/download`. You can probably use another editor, but then don't ask for our help.

- You need to have **yarn** on your computer. Check out this website to find an method to dowload it that suits you: `https://classic.yarnpkg.com/en/docs/install`

- You need to donwload the Sporran Extensions you want to test. And know where they are saved. Check out `https://github.com/BTE-Trusted-Entity/sporran-extension#testing-in-browser` for this.

### Steps:

1. On a browser, go to: `https://github.com/BTE-Trusted-Entity/testing-sporran/tree/main`
2. Copy the URL to clone the repository. For that click: (green) *Code* > *HTTPS* > *Copy* (two squares)
3. Decide where you want to save the workspace. Make sure there is no umlaut, accent mark or any other special character on the whole path to this folder.
4. Open Visual Studio Code
5. Click on *Clone Git Repository...*
6. Paste the URL you copied from GitHub
7. Choose the workspace folder, click on *Select Repository Location* and wait for the download to be over.
8. Open the **testing-sporran** folder on **Visual Studio Code**. (short: **VSC**)
9. Open the *terminal* inside of **VSC**; click: *Terminal* on the menu bar > *New Terminal*
10. run `yarn install`.
11. run `yarn add playwright`.
12. run `yarn add -D @playwright/test`.
13. run `yarn add dotenv`.
14. run `yarn add polkadot`.
15. run `yarn add @polkadot/api`.
16. run `npm install playwright-qase-reporter` // Qase reporter configuration
17. There is a file on the main folder (*testing-sporran*) named: "**.env**". You need to complete/personalize this file before being able to test. 
18. Inside of it write the full paths to the folders of the sporran extensions for chrome next to `EXTENSION_SOURCE_CHROMIUM_INTERN` and `EXTENSION_SOURCE_CHROMIUM_PUBLIC`.
19. Now you are all set up!


# Test
On the terminal inside of **Visual Studio Code**, with the folder *testing-sporran* open, type:
- To run just one file: 
`yarn playwright test tests/`{name of the test-file}`.spec.ts`

- To run all test files: 
`yarn playwright test tests`

## Test using projects

Playwright Test supports multiple "projects" that can run your tests in multiple browsers and configurations. 
If you don't specify the project, the tests will be run using all projects simultaneously.

Currently, the following projects are set up an availble to use: 
- `chromium_intern`
- `chromium_public` (* read secction: **Test on serial mode**)

Firefox should come in the future. You can also check the `playwright.config.ts` file to see the projects.

The projects labeled as **_intern** run on KILT Peregrine and can be run parallel because we have a lot of PILTs available and a new Identity was created for almost every test file. 

The projects labeled as **_public** run on KILT Spiritnet and **should not be run parallel** to avoid unexpected problems. When using this projects, the same Identity (currently Sarah Connor) is used for all tests, because KILTs are a precious good. 

## Test on serial mode

By default, Playwright Test runs tests files in parallel. In order to achieve that, it runs several worker processes that run at the same time. 
Tests in a single file are run in order, in the same worker process.

You can control the maximum number of parallel worker processes via command line. To disable parallelism or activate serial mode limit the number of workers to one. This mean, pass `--workers=1` to the command line.

So, to properly run a test on a public project , follow this example:
  - `yarn playwright test tests/`{name of the test-file}`.spec.ts` `--project=chromium_public` `--workers=1`



# How to write a test file

Before writing a test file, please create a new branch cloning the main branch. Merge it only when you are completely done and already test it on the separed branch. If you make big changes to any Page-Object-Models or to the Utilities, consider proof reading the changes by your colleges first. 

For starters, it is highly recommended to check out the Playwright documantation on the their offitial site: `https://playwright.dev/docs/writing-tests`.

In this repository we work with TypeScript, please do the same. Here is some good documentation about TypeScript: `https://www.tutorialspoint.com/typescript/typescript_overview` or `https://www.tutorialsteacher.com/typescript/typescript-overview`. 

Please create/add all tests files on the folder "tests" (`~/testing-sporran/tests`).

For compatibility with Playwright, all tests file need to end with: `.spec.ts`. (.ts indicates is TypeScript; .spec is an extra requierement for playwright)

There are a couple example tests files you can use as reference to start wrighting your code. They are in the same folder as all the tests. 


## How to open the Sporran Extension as a tab on your browser:

**For Chrome or its descendets:**

1. go to : `chrome://extensions/`
2. activate the developer mode (switch on the top right corner)
3. copy the ID of the Sporran extension under consideration
4. open a new tab and type: `chrome-extension://`{extension ID of the installed Sporran}`/popup.html`


**For Firefox or its descendets:**

1. go to : `about:debugging#/runtime/this-firefox`
2. copy the ID of the Sporran extension under consideration. You need the *Internal UUID*.
3. open a new tab and type: `moz-extension://`{extension ID of the installed Sporran}`/popup.html`



## Trouble Solving:
What to do when you get "`Error: listen EADDRINUSE: address already in use`"?

On the VSC-Terminal run: 

1. $ `killall -9 node` 
2. $ `npx playwright show-report` 

## How to run Qase reporter
Qase Reporter allows you to get all tests results automaticly in Qase (TMS). For Sporran the Qase reporter is already seted up, all you need to do is to run this command in terminal 
`QASE_REPORT=1 npx playwright test tests --project=chromium_intern`
- `QASE_REPORT=1`: This is a placeholder. Replace 1 with your Qase project test run number. 
- `tests` : This is the directory where your Playwright tests are located. Adjust the path if you want to test specific test file. 
- `--project=chromium_intern`: This specifies which Playwright project configuration to use. Modify this according to your configuration. 
After running the command, Playwright will execute the tests and report the results to Qase. Currently it reports to project "Sporran Automated".