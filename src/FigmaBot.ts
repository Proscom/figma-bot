import puppeteer from 'puppeteer';
import { Browser } from 'puppeteer/lib/esm/puppeteer/common/Browser';
import { Page } from 'puppeteer/lib/esm/puppeteer/common/Page';
import { promises as fs, existsSync as pathExists } from 'fs';
import {
  ProjectCreationError,
  FileCreationError,
  AuthorizationError,
  FileRenameError
} from './errors';
import { random, wait, findElement, click, waitAndNavigate } from './utils';

export interface IAuthData {
  email: string;
  password: string;
}

export interface IFigmaBotOptions {
  authData: IAuthData;
  delayDuration?: number;
  cookiesPath?: string;
}

export class FigmaBot {
  browser: Browser;
  authData: IAuthData;
  delayDuration: number;
  cookiesPath: string;

  constructor({
    authData,
    delayDuration = 2000,
    cookiesPath = './cookies.json'
  }: IFigmaBotOptions) {
    this.authData = authData;
    this.delayDuration = delayDuration;
    this.cookiesPath = cookiesPath;
  }

  async delayRandom() {
    await wait(random(this.delayDuration, this.delayDuration + 1000));
  }

  async start(): Promise<void> {
    this.browser = await puppeteer.launch();
  }

  async stop(): Promise<void> {
    await this.browser.close();
  }

  async submitSingInForm(page: Page, authData = this.authData) {
    await this.delayRandom();
    await page.click('form#auth-view-page > input[name="email"]');
    await this.delayRandom();
    await page.keyboard.type(authData.email, { delay: 200 });
    await this.delayRandom();
    await page.click('form#auth-view-page > input[name="password"]');
    await this.delayRandom();
    await page.keyboard.type(authData.password, { delay: 200 });
    await this.delayRandom();
    await page.click('form#auth-view-page > button[type="submit"]');
  }

  async parseAuthPageError(page: Page): Promise<null | string> {
    const emailInputHandle = await findElement(page, {
      selector: 'form#auth-view-page > input[name="email"]'
    });
    const passwordInputHandle = await findElement(page, {
      selector: 'form#auth-view-page > input[name="password"]'
    });

    return await page.evaluate(
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

  async signIn(page: Page, authData = this.authData): Promise<void> {
    await waitAndNavigate(page, page.goto('https://www.figma.com/login'));

    if (page.url() === 'https://www.figma.com/files/recent') {
      return;
    }

    try {
      await waitAndNavigate(page, this.submitSingInForm(page, authData));
    } catch (e) {
      throw new AuthorizationError(e);
    }

    const url = page.url();
    if (url === 'https://www.figma.com/files/recent') {
      const cookies = await page.cookies();
      await fs.writeFile(this.cookiesPath, JSON.stringify(cookies));
    } else if (url === 'https://www.figma.com/login') {
      const error = await this.parseAuthPageError(page);
      throw new AuthorizationError(error || 'unknown error');
    } else {
      throw new AuthorizationError(`Unexpectedly redirected to "${url}"`);
    }
  }

  async checkAuth(page: Page): Promise<boolean> {
    if (page.url() === 'https://www.figma.com/files/recent') {
      return true;
    }
    await waitAndNavigate(
      page,
      page.goto('https://www.figma.com/files/recent')
    );
    return page.url() === 'https://www.figma.com/files/recent';
  }

  async confirmAuth(
    page: Page,
    authData: IAuthData = this.authData
  ): Promise<void> {
    if (!(await this.checkAuth(page))) {
      if (pathExists(this.cookiesPath)) {
        const cookiesBuffer = await fs.readFile(this.cookiesPath);
        try {
          const cookies = JSON.parse(cookiesBuffer.toString());
          await page.setCookie(...cookies);
          if (!(await this.checkAuth(page))) {
            await this.signIn(page, authData);
          }
        } catch {
          await this.signIn(page, authData);
        }
      } else {
        await this.signIn(page, authData);
      }
    }
  }

  async gotToTeamPage(page: Page, teamId: string): Promise<void> {
    const teamPageURL = `https://www.figma.com/files/team/${teamId}`;
    if (page.url().includes(teamPageURL)) {
      return;
    }
    await waitAndNavigate(page, page.goto(teamPageURL));
    if (!page.url().includes(teamPageURL)) {
      throw new Error(`Team with id ${teamId} page loading failed.`);
    }
  }

  async gotToProjectPage(page: Page, projectId: string): Promise<void> {
    const projectPageURL = `https://www.figma.com/files/project/${projectId}`;
    if (page.url().includes(projectPageURL)) {
      return;
    }
    await waitAndNavigate(page, page.goto(projectPageURL));
    if (!page.url().includes(projectPageURL)) {
      throw new Error(`Project with id "${projectId}" page loading failed.`);
    }
  }

  async gotToFilePage(page: Page, fileId: string): Promise<void> {
    const filePageURL = `https://www.figma.com/file/${fileId}`;
    if (page.url().includes(filePageURL)) {
      return;
    }
    await waitAndNavigate(page, page.goto(filePageURL));
    if (!page.url().includes(filePageURL)) {
      throw new Error(`File with id "${fileId}" page loading failed.`);
    }
  }

  async createProject(projectName: string, teamId: string): Promise<string> {
    if (!projectName) {
      throw new ProjectCreationError(
        'Parameter "projectName" must be a non-empty string',
        teamId
      );
    }

    const page: Page = await this.browser.newPage();
    try {
      await this.confirmAuth(page);
      await this.gotToTeamPage(page, teamId);

      const newProjectButtonHandle = await findElement(page, {
        selector: '[class*="tool_bar--toolBarButton"]',
        innerHTML: 'New project'
      });
      await this.delayRandom();
      await click(page, newProjectButtonHandle);

      await page.waitForSelector('[class*="new_folder_modal"]');

      await this.delayRandom();
      await page.click('[class*="new_folder_modal"] > input');

      await this.delayRandom();
      await page.keyboard.type(projectName, { delay: 200 });

      const createProjectButtonHandle = await findElement(page, {
        selector: '[class*="basic_form--btn"]',
        innerHTML: 'Create project'
      });
      await this.delayRandom();
      await waitAndNavigate(page, click(page, createProjectButtonHandle));
    } catch (e) {
      await page.close();
      throw new ProjectCreationError(e, teamId, projectName);
    }

    const newProjectPageURLRegExp = /^https:\/\/www.figma.com\/files\/project\/[\d]{8}[\/$].*/;
    const url = page.url();
    if (!newProjectPageURLRegExp.test(url)) {
      await page.close();
      throw new ProjectCreationError(
        `Unexpectedly redirected to "${url}". Note that project still could be created.`,
        teamId,
        projectName
      );
    }

    const projectId = url.split('/')[5];
    await page.close();
    return projectId;
  }

  async createFile(fileName: string, projectId: string): Promise<string> {
    if (!fileName) {
      throw new FileCreationError(
        'Parameter "fileName" must be a non-empty string',
        projectId
      );
    }

    const page: Page = await this.browser.newPage();
    try {
      await this.confirmAuth(page);
      await this.gotToProjectPage(page, projectId);

      await this.delayRandom();
      await page.click('[class*="new_file_dropdown"]');

      await page.waitForSelector('[class*="file_template_modal"]');

      const blankTemplateDivHandle = await findElement(page, {
        selector: '[class*="template_tiles"]',
        innerHTML: 'Blank canvas'
      });
      await this.delayRandom();
      await click(page, blankTemplateDivHandle);

      const createFileButtonHandle = await findElement(page, {
        selector: '[class*="basic_form--btn"]',
        innerHTML: 'Create file'
      });
      await this.delayRandom();
      await click(page, createFileButtonHandle);
    } catch (e) {
      await page.close();
      throw new FileCreationError(e, projectId, fileName);
    }

    const newFilePageURLRegExp = /^https:\/\/www.figma.com\/file\/[\d\w]{22}[\/$].*/;

    // Redirects several times before final file page loaded
    try {
      for (let i = 0; i < 10; i++) {
        if (newFilePageURLRegExp.test(page.url())) {
          break;
        }
        await page.waitForNavigation();
      }
    } catch (e) {
      await page.close();
      throw new FileCreationError(e, projectId, fileName);
    }

    const url = page.url();
    if (!newFilePageURLRegExp.test(url)) {
      await page.close();
      throw new FileCreationError(
        `Unexpectedly redirected to "${url}". Note that file still could be created, but named "Untitled"`,
        projectId,
        fileName
      );
    }
    const fileId = url.split('/')[4];
    try {
      await this.renameFile(fileId, fileName);
    } catch (e) {
      throw e;
    } finally {
      await page.close();
    }
    return fileId;
  }

  async renameFile(fileId: string, newName: string) {
    const page: Page = await this.browser.newPage();
    try {
      await this.confirmAuth(page);
      await this.gotToFilePage(page, fileId);
      await this.delayRandom();
      await page.click('[class*="filename_view--title"]');
      await this.delayRandom();
      await page.keyboard.type(newName, { delay: 200 });
      await this.delayRandom();
      await page.keyboard.press('Enter', { delay: 70 });
      await this.delayRandom();
    } catch (e) {
      throw new FileRenameError(e, fileId, newName);
    } finally {
      await page.close();
    }
  }
}
