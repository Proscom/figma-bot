import puppeteer from 'puppeteer';
import { Browser } from 'puppeteer/lib/esm/puppeteer/common/Browser';
import { Page } from 'puppeteer/lib/esm/puppeteer/common/Page';
import { ElementHandle } from 'puppeteer/lib/esm/puppeteer/common/JSHandle';
import { promises as fs, existsSync as pathExists } from 'fs';
import { ProjectCreationError, FileCreationError } from './errors';
import { random, wait } from './utils';

export interface IAuthData {
  email: string;
  password: string;
}

export interface IFigmaBotParams {
  authData: IAuthData;
  delayDuration?: number;
  screenshotsDirPath?: string;
  cookiesPath?: string;
}

export interface IElementSearchOptions {
  selector?: string;
  innerHTML?: string | RegExp;
}

export class FigmaBot {
  browser: Browser;
  page: Page;
  authData: IAuthData;
  delayDuration: number;
  screenshotsDirPath: string;
  cookiesPath: string;

  constructor({
    authData,
    delayDuration = 2000,
    screenshotsDirPath = './screenshots',
    cookiesPath = './cookies.json'
  }: IFigmaBotParams) {
    this.authData = authData;
    this.delayDuration = delayDuration;
    this.screenshotsDirPath = screenshotsDirPath;
    this.cookiesPath = cookiesPath;
  }

  async delayRandom() {
    await wait(random(this.delayDuration, this.delayDuration + 1000));
  }

  async start(): Promise<void> {
    if (!pathExists(this.screenshotsDirPath)) {
      await fs.mkdir(this.screenshotsDirPath);
    }
    this.browser = await puppeteer.launch();
    this.page = await this.browser.newPage();
  }

  async stop(): Promise<void> {
    await this.browser.close();
  }

  async screenshot(): Promise<void> {
    await this.page.screenshot({
      path: `${this.screenshotsDirPath}/${Date.now()}.png`
    });
  }

  async findElement({
    selector,
    innerHTML
  }: IElementSearchOptions): Promise<ElementHandle> {
    if (selector) {
      try {
        await this.page.waitForSelector(selector);
      } catch {
        throw new Error(
          `Element that matches selector "${selector}" not found.`
        );
      }
    }

    let targetElementHandle: ElementHandle | null = null;

    if (innerHTML) {
      const handles = await this.page.$$(selector || '*');
      for (let i = 0; i < handles.length; i++) {
        const currentElementInnerHTML = await this.page.evaluate(
          (element: HTMLElement) => element.innerHTML,
          handles[i]
        );
        if (typeof innerHTML === 'string') {
          if (currentElementInnerHTML === innerHTML) {
            targetElementHandle = handles[i];
          }
        } else if ((innerHTML as RegExp).test(currentElementInnerHTML)) {
          targetElementHandle = handles[i];
        }
      }
    } else {
      targetElementHandle = await this.page.$(selector || '*');
    }

    if (targetElementHandle) {
      return targetElementHandle;
    }

    throw new Error(
      `Element${
        selector && `that matches selector "${selector}"`
      } with innerHTML "${innerHTML}" not found.`
    );
  }

  async click(elementHandleOrSelector: ElementHandle | string): Promise<void> {
    let targetHandle: ElementHandle;
    if (typeof elementHandleOrSelector === 'string') {
      targetHandle = await this.findElement({
        selector: elementHandleOrSelector
      });
    } else {
      targetHandle = elementHandleOrSelector;
    }

    const clientRect = await this.page.evaluate((target: HTMLElement) => {
      const { x, y, width, height } = target.getBoundingClientRect();
      return { x, y, width, height };
    }, targetHandle);
    await this.page.mouse.click(
      clientRect.x + random(0, clientRect.width),
      clientRect.y + random(0, clientRect.height)
    );
  }

  async submitSingInForm(authData = this.authData) {
    await this.delayRandom();
    await this.click('form#auth-view-page > input[name="email"]');
    await this.delayRandom();
    await this.page.keyboard.type(authData.email, { delay: 200 });
    await this.delayRandom();
    await this.click('form#auth-view-page > input[name="password"]');
    await this.delayRandom();
    await this.page.keyboard.type(authData.password, { delay: 200 });
    await this.delayRandom();
    await this.click('form#auth-view-page > button[type="submit"]');
  }

  async parseAuthPageError(): Promise<null | string> {
    const emailInputHandle = await this.findElement({
      selector: 'form#auth-view-page > input[name="email"]'
    });
    const passwordInputHandle = await this.findElement({
      selector: 'form#auth-view-page > input[name="password"]'
    });

    return await this.page.evaluate(
      (emailInput: HTMLElement, passwordInput: HTMLElement) => {
        if (emailInput.classList.toString().includes('invalidInput')) {
          return 'Invalid email';
        }
        if (passwordInput.classList.toString().includes('invalidInput')) {
          return 'Invalid password';
        }
        return null;
      },
      emailInputHandle,
      passwordInputHandle
    );
  }

  async signIn(authData = this.authData): Promise<void> {
    await Promise.all([
      this.page.goto('https://www.figma.com/login'),
      this.page.waitForNavigation()
    ]);

    if (this.page.url() === 'https://www.figma.com/files/recent') {
      return;
    }

    try {
      await Promise.all([
        this.submitSingInForm(authData),
        this.page.waitForNavigation()
      ]);
    } catch (e) {
      throw new Error(`Authorization failed with error: ${e.message}`);
    }

    const url = this.page.url();
    if (url === 'https://www.figma.com/files/recent') {
      const cookies = await this.page.cookies();
      await fs.writeFile(this.cookiesPath, JSON.stringify(cookies));
    } else if (url === 'https://www.figma.com/login') {
      const error = await this.parseAuthPageError();
      throw new Error(
        error
          ? `Authorization failed with error: ${error}`
          : 'Authorization failed due to unknown reason.'
      );
    } else {
      throw new Error(
        `Authorization failed with error: Unexpectedly redirected to "${url}".`
      );
    }
  }

  async checkAuth(): Promise<boolean> {
    if (this.page.url() === 'https://www.figma.com/files/recent') {
      return true;
    }
    await Promise.all([
      this.page.goto('https://www.figma.com/files/recent'),
      this.page.waitForNavigation()
    ]);
    return this.page.url() === 'https://www.figma.com/files/recent';
  }

  async confirmAuth(authData: IAuthData = this.authData): Promise<void> {
    if (!(await this.checkAuth())) {
      if (pathExists(this.cookiesPath)) {
        const cookiesBuffer = await fs.readFile(this.cookiesPath);
        try {
          const cookies = JSON.parse(cookiesBuffer.toString());
          await this.page.setCookie(...cookies);
          if (!(await this.checkAuth())) {
            await this.signIn(authData);
          }
        } catch {
          await this.signIn(authData);
        }
      } else {
        await this.signIn(authData);
      }
    }
  }

  async gotToTeamPage(teamId: string): Promise<void> {
    const teamPageURL = `https://www.figma.com/files/team/${teamId}`;
    if (this.page.url().includes(teamPageURL)) {
      return;
    }
    await Promise.all([
      this.page.goto(teamPageURL),
      this.page.waitForNavigation()
    ]);
    if (!this.page.url().includes(teamPageURL)) {
      throw new Error(`Team with id ${teamId} page loading failed.`);
    }
  }

  async gotToProjectPage(projectId: string): Promise<void> {
    const projectPageURL = `https://www.figma.com/files/project/${projectId}`;
    if (this.page.url().includes(projectPageURL)) {
      return;
    }
    await Promise.all([
      this.page.goto(projectPageURL),
      this.page.waitForNavigation()
    ]);
    if (!this.page.url().includes(projectPageURL)) {
      throw new Error(`Project with id "${projectId}" page loading failed.`);
    }
  }

  async gotToFilePage(fileId: string): Promise<void> {
    const filePageURL = `https://www.figma.com/file/${fileId}`;
    if (this.page.url().includes(filePageURL)) {
      return;
    }
    await Promise.all([
      this.page.goto(filePageURL),
      this.page.waitForNavigation()
    ]);
    if (!this.page.url().includes(filePageURL)) {
      throw new Error(`File with id "${fileId}" page loading failed.`);
    }
  }

  async createProject(projectName: string, teamId: string): Promise<string> {
    if (!projectName) {
      throw new ProjectCreationError(
        'Parameter "projectName" must be a non-empty string.',
        teamId
      );
    }

    try {
      await this.confirmAuth();
      await this.gotToTeamPage(teamId);

      const newProjectButtonHandle = await this.findElement({
        selector: '[class*="tool_bar--toolBarButton"]',
        innerHTML: 'New project'
      });
      await this.delayRandom();
      await this.click(newProjectButtonHandle);

      await this.page.waitForSelector('[class*="new_folder_modal"]');

      await this.delayRandom();
      await this.click('[class*="new_folder_modal"] > input');

      await this.delayRandom();
      await this.page.keyboard.type(projectName, { delay: 200 });

      const createProjectButtonHandle = await this.findElement({
        selector: '[class*="basic_form--btn"]',
        innerHTML: 'Create project'
      });
      await this.delayRandom();
      await this.click(createProjectButtonHandle);
    } catch (e) {
      throw new ProjectCreationError(e.message, teamId, projectName);
    }

    await this.page.waitForNavigation();

    const newProjectPageURLRegExp = /^https:\/\/www.figma.com\/files\/project\/[\d]{8}[\/$].*/;
    const url = this.page.url();
    if (!newProjectPageURLRegExp.test(url)) {
      throw new ProjectCreationError(
        `Unexpectedly redirected to "${url}".\nNote that project still could be created.`,
        teamId,
        projectName
      );
    }

    const projectId = url.split('/')[5];
    return projectId;
  }

  async createFile(fileName: string, projectId: string): Promise<string> {
    if (!fileName) {
      throw new FileCreationError(
        'Parameter "fileName" must be a non-empty string.',
        projectId
      );
    }

    try {
      await this.confirmAuth();
      await this.gotToProjectPage(projectId);

      await this.delayRandom();
      await this.click('[class*="tool_bar"] > [aria-label="New file"]');

      await this.page.waitForSelector('[class*="file_template_modal"]');

      const blankTemplateDivHandle = await this.findElement({
        selector: '[class*="template_tiles"]',
        innerHTML: 'Blank canvas'
      });
      await this.delayRandom();
      await this.click(blankTemplateDivHandle);

      const createFileButtonHandle = await this.findElement({
        selector: '[class*="basic_form--btn"]',
        innerHTML: 'Create file'
      });
      await this.delayRandom();
      await this.click(createFileButtonHandle);
    } catch (e) {
      throw new FileCreationError(e.message, projectId, fileName);
    }

    const newFilePageURLRegExp = /^https:\/\/www.figma.com\/file\/[\d\w]{22}[\/$].*/;

    // Redirects several times before final file page loaded
    try {
      for (let i = 0; i < 10; i++) {
        if (newFilePageURLRegExp.test(this.page.url())) {
          break;
        }
        await this.page.waitForNavigation();
      }
    } catch (e) {
      throw new FileCreationError(
        `${e.message}\nNote that file still could be created, but named "Untitled".`,
        projectId,
        fileName
      );
    }

    const url = this.page.url();
    if (!newFilePageURLRegExp.test(url)) {
      throw new FileCreationError(
        `Unexpectedly redirected to "${url}".\nNote that file still could be created, but named "Untitled".`,
        projectId,
        fileName
      );
    }
    const fileId = url.split('/')[4];
    try {
      await this.renameFile(fileId, fileName);
    } catch (e) {
      throw e;
    }
    return fileId;
  }

  async renameFile(fileId: string, newName: string) {
    try {
      await this.gotToFilePage(fileId);
      await this.delayRandom();
      await this.click('[class*="filename_view--title"]');
      await this.delayRandom();
      await this.page.keyboard.type(newName, { delay: 200 });
      await this.delayRandom();
      await this.page.keyboard.press('Enter', { delay: 70 });
      await this.delayRandom();
    } catch (e) {
      throw new Error(
        `File with id "${fileId}" rename to "${newName}" failed with error: ${e.message}`
      );
    }
  }
}
