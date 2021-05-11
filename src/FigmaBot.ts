import puppeteer from 'puppeteer';
import { Browser } from 'puppeteer/lib/esm/puppeteer/common/Browser';
import { Page } from 'puppeteer/lib/esm/puppeteer/common/Page';
import {
  ProjectCreationError,
  FileCreationError,
  AuthorizationError,
  FileRenameError,
  ProjectRenameError
} from './errors';
import {
  wait,
  findElement,
  click,
  waitAndNavigate,
  waitForRedirects,
  goToTeamPage,
  goToProjectPage,
  goToFilePage,
  submitSingInForm,
  parseLoginPageError,
  checkAuth,
  getNextSiblingHandle
} from './utils';

export interface IAuthData {
  email: string;
  password: string;
}

export interface CookiesProvider {
  getCookies: () => Promise<any>;
  setCookies: (cookies: any) => Promise<void>;
}

export interface IFigmaBotOptions {
  authData: IAuthData;
  delayDuration?: number;
  cookiesProvider?: CookiesProvider;
}

export class FigmaBot {
  browser: Browser;
  authData: IAuthData;
  delayDuration: number;
  cookiesProvider: CookiesProvider | undefined;

  constructor({
    authData,
    delayDuration = 2000,
    cookiesProvider
  }: IFigmaBotOptions) {
    this.authData = authData;
    this.delayDuration = delayDuration;
    this.cookiesProvider = cookiesProvider;
  }

  async _signIn(page: Page, authData = this.authData): Promise<void> {
    await waitAndNavigate(page, page.goto('https://www.figma.com/login'));

    if (page.url().includes('https://www.figma.com/files/recent')) {
      return;
    }

    try {
      await waitAndNavigate(page, submitSingInForm(page, authData));
    } catch (e) {
      throw new AuthorizationError(e);
    }

    const url = page.url();
    if (url.includes('https://www.figma.com/files/recent')) {
      if (this.cookiesProvider) {
        const cookies = await page.cookies();
        await this.cookiesProvider.setCookies(cookies);
      }
    } else if (url === 'https://www.figma.com/login') {
      const error = await parseLoginPageError(page);
      throw new AuthorizationError(error || 'unknown error');
    } else {
      throw new AuthorizationError(`Unexpectedly redirected to "${url}"`);
    }
  }

  async _confirmAuth(
    page: Page,
    authData: IAuthData = this.authData
  ): Promise<void> {
    if (!(await checkAuth(page))) {
      if (!this.cookiesProvider) {
        await this._signIn(page, authData);
        return;
      }
      try {
        const cookies = await this.cookiesProvider.getCookies();
        await page.setCookie(...cookies);
      } catch (e) {
        throw new AuthorizationError(e);
      } finally {
        if (!(await checkAuth(page))) {
          await this._signIn(page, authData);
        }
      }
    }
  }

  async start(): Promise<void> {
    this.browser = await puppeteer.launch();
  }

  async stop(): Promise<void> {
    await this.browser.close();
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
      await this._confirmAuth(page);
      await goToTeamPage(page, teamId);

      const newProjectButtonHandle = await findElement(page, {
        selector: '[class*="tool_bar--toolBarButton"]',
        innerHTML: 'New project'
      });
      await wait(this.delayDuration);
      await click(page, newProjectButtonHandle);

      await page.waitForSelector('[class*="new_folder_modal"]');

      await wait(this.delayDuration);
      await page.click('[class*="new_folder_modal"] > input');

      await wait(this.delayDuration);
      await page.keyboard.type(projectName, { delay: 200 });

      const createProjectButtonHandle = await findElement(page, {
        selector: '[class*="basic_form--btn"]',
        innerHTML: 'Create project'
      });
      await wait(this.delayDuration);
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

    const newFilePageURLRegExp = /^https:\/\/www.figma.com\/file\/[\d\w]{22}[\/$].*/;

    const page: Page = await this.browser.newPage();
    try {
      await this._confirmAuth(page);
      await goToProjectPage(page, projectId);

      await page.waitForSelector('[class*="new_file_dropdown--toolBarButton"]');
      await wait(this.delayDuration);
      await page.click('[class*="new_file_dropdown--toolBarButton"]');
      await page.waitForSelector(
        '[class*="new_file_dropdown--newFileDropdown"]'
      );
      await wait(this.delayDuration);
      const newDesignFileOptionHandle = await findElement(page, {
        selector:
          '[class*="new_file_dropdown--newFileDropdown"] [class*="dropdown--option"]',
        innerHTML: new RegExp('Design file')
      });
      await click(page, newDesignFileOptionHandle);
    } catch (e) {
      await page.close();
      throw new FileCreationError(e, projectId, fileName);
    }

    /**
     * After click on 'Design file' dropdown option could be straight redirected
     * to file page or open [class*="file_template_modal"]
     */

    await waitForRedirects(page);
    if (!newFilePageURLRegExp.test(page.url())) {
      try {
        await page.waitForSelector('[class*="file_template_modal"]');

        const blankTemplateDivHandle = await findElement(page, {
          selector: '[class*="template_tiles"]',
          innerHTML: 'Blank canvas'
        });
        await wait(this.delayDuration);
        await click(page, blankTemplateDivHandle);

        const createFileButtonHandle = await findElement(page, {
          selector: '[class*="basic_form--btn"]',
          innerHTML: 'Create file'
        });
        await wait(this.delayDuration);
        await click(page, createFileButtonHandle);
      } catch (e) {
        await page.close();
        throw new FileCreationError(e, projectId, fileName);
      }
    }

    await waitForRedirects(page);
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
      await this._confirmAuth(page);
      await goToFilePage(page, fileId);
      await waitForRedirects(page);
      await page.waitForSelector('[class*="filename_view--title"]');
      await wait(this.delayDuration);
      await page.click('[class*="filename_view--title"]');
      await wait(this.delayDuration);
      await page.keyboard.type(newName, { delay: 200 });
      await wait(this.delayDuration);
      await page.keyboard.press('Enter', { delay: 70 });
      await wait(this.delayDuration);
    } catch (e) {
      throw new FileRenameError(e, fileId, newName);
    } finally {
      await page.close();
    }
  }

  async renameProject(projectId: string, newName: string) {
    const page: Page = await this.browser.newPage();
    try {
      await this._confirmAuth(page);
      await goToProjectPage(page, projectId);
      await wait(this.delayDuration);
      const pageTitle = await page.title();
      const projectName = pageTitle.split(' – Figma')[0];
      const projectNameHandle = await findElement(page, {
        selector: '[class*="tool_bar--toolBarTabContent"]',
        innerHTML: projectName
      });
      const projectEditMenuOpenButtonHandle = await getNextSiblingHandle(
        page,
        projectNameHandle
      );
      await wait(this.delayDuration);
      await click(page, projectEditMenuOpenButtonHandle);
      const renameButtonHandle = await findElement(page, {
        selector: '[class*="dropdown--_optionBase"]',
        innerHTML: 'Rename'
      });
      await wait(this.delayDuration);
      await click(page, renameButtonHandle);
      await wait(this.delayDuration);
      await page.keyboard.type(newName, { delay: 200 });
      await wait(this.delayDuration);
      await page.keyboard.press('Enter', { delay: 70 });
      await wait(this.delayDuration);
    } catch (e) {
      throw new ProjectRenameError(e, projectId, newName);
    } finally {
      await page.close();
    }
  }
}
