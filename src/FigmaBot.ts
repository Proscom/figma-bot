import puppeteer from 'puppeteer';
import { Browser } from 'puppeteer/lib/esm/puppeteer/common/Browser';
import { Page } from 'puppeteer/lib/esm/puppeteer/common/Page';

import { ICookiesProvider } from './common/cookiesProvider';
import {
  ProjectCreationError,
  FileCreationError,
  AuthorizationError,
  FileRenameError,
  ProjectRenameError,
  DuplicateExternalFileError,
  RenameFileInProjectError
} from './common/errors';
import { wait } from './common/functions';
import { IAuthData, IFigmaBotOptions } from './figmaBot.interfaces';
import { FigmaBotCommonActions } from './figmaBot.common.actions';

export class FigmaBot {
  browser: Browser;
  authData: IAuthData;
  delayDuration: number;
  cookiesProvider: ICookiesProvider | undefined;

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
    await FigmaBotCommonActions.waitAndNavigate(
      page,
      page.goto('https://www.figma.com/login')
    );

    if (page.url().includes('https://www.figma.com/files/recent')) {
      return;
    }

    try {
      await FigmaBotCommonActions.waitAndNavigate(
        page,
        FigmaBotCommonActions.submitSingInForm(page, authData)
      );
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
      const error = await FigmaBotCommonActions.parseLoginPageError(page);
      throw new AuthorizationError(error || 'unknown error');
    } else {
      throw new AuthorizationError(`Unexpectedly redirected to "${url}"`);
    }
  }

  async _confirmAuth(
    page: Page,
    authData: IAuthData = this.authData
  ): Promise<void> {
    if (!(await FigmaBotCommonActions.checkAuth(page))) {
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
        if (!(await FigmaBotCommonActions.checkAuth(page))) {
          await this._signIn(page, authData);
        }
      }
    }
  }

  async start(): Promise<void> {
    this.browser = await puppeteer.launch({
      defaultViewport: {
        width: 1920,
        height: 1080
      }
    });
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
      await FigmaBotCommonActions.goToTeamPage(page, teamId);

      const newProjectButtonHandle = await FigmaBotCommonActions.findElement(
        page,
        {
          selector: '[data-onboarding-key*="new-project"]'
        }
      );
      await wait(this.delayDuration);
      await FigmaBotCommonActions.click(page, newProjectButtonHandle);

      await page.waitForSelector('[class*="new_folder_modal"]');

      await wait(this.delayDuration);
      await page.click('[class*="new_folder_modal"] > input');

      await wait(this.delayDuration);
      await page.keyboard.type(projectName, { delay: 200 });

      const createProjectButtonHandle = await FigmaBotCommonActions.findElement(
        page,
        {
          selector: '[class*="basic_form--primaryBtn"]',
          innerHTML: 'Create project'
        }
      );
      await wait(this.delayDuration);
      await FigmaBotCommonActions.waitAndNavigate(
        page,
        FigmaBotCommonActions.click(page, createProjectButtonHandle)
      );
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
      await FigmaBotCommonActions.goToProjectPage(page, projectId);

      const newFileButtonHandle = await FigmaBotCommonActions.findElement(
        page,
        {
          selector: '[class*="newDesignFileButton"]'
        }
      );
      await wait(this.delayDuration);
      await FigmaBotCommonActions.click(page, newFileButtonHandle);
    } catch (e) {
      await page.close();
      throw new FileCreationError(e, projectId, fileName);
    }

    await FigmaBotCommonActions.waitForRedirects({ page });
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
      await FigmaBotCommonActions.goToFilePage(page, fileId);
      await FigmaBotCommonActions.waitForRedirects({ page });
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

  // TO-DO - check capability
  async renameProject(projectId: string, newName: string) {
    const page: Page = await this.browser.newPage();
    try {
      await this._confirmAuth(page);
      await FigmaBotCommonActions.goToProjectPage(page, projectId);
      await wait(this.delayDuration);
      const projectOptionsHandle = await FigmaBotCommonActions.findElement(
        page,
        {
          selector:
            '[class*="page_header"] [class*="basic_form--btn"]:last-child'
        }
      );
      await wait(this.delayDuration);
      await FigmaBotCommonActions.click(page, projectOptionsHandle);
      const renameButtonHandle = await FigmaBotCommonActions.findElement(page, {
        selector: '[class*="dropdown--_optionBase"]',
        innerHTML: 'Rename'
      });
      await wait(this.delayDuration);
      await FigmaBotCommonActions.click(page, renameButtonHandle);
      const input = await FigmaBotCommonActions.findElement(page, {
        selector: 'input[class*="resource_rename_modal"]'
      });
      await wait(this.delayDuration);
      await FigmaBotCommonActions.clearInput(page, input);
      await wait(this.delayDuration);
      await input.type(newName, { delay: 200 });
      await wait(this.delayDuration);
      await page.keyboard.press('Enter', { delay: 70 });
      await wait(this.delayDuration);
    } catch (e) {
      throw new ProjectRenameError(e, projectId, newName);
    } finally {
      await page.close();
    }
  }

  // TO-DO - check capability
  /**
   * Copying [sourceFileName] from project [sourceProjectId] to [destinationProjectName]
   */
  async duplicateFileFromExternalProject(
    sourceProjectId: string,
    sourceFileName: string,
    destinationProjectName: string
  ): Promise<void> {
    const page: Page = await this.browser.newPage();
    try {
      await this._confirmAuth(page);
      // open project page [sourceProjectId]
      await FigmaBotCommonActions.goToProjectPage(page, sourceProjectId);
      await wait(this.delayDuration);

      // find figma-file [sourceFileName] and press mouse right-button
      const sourceFileButtonHandle = await FigmaBotCommonActions.findElement(
        page,
        {
          selector: '[class*="generic_tile--title"]',
          innerHTML: sourceFileName
        }
      );
      await wait(this.delayDuration);
      await FigmaBotCommonActions.click(page, sourceFileButtonHandle, 'right');
      await wait(this.delayDuration);

      // in dropdown-list find "Duplicate" and press mouse right-button
      const duplicateFileButtonHandle = await FigmaBotCommonActions.findElement(
        page,
        {
          selector: '*',
          innerHTML: 'Duplicate'
        }
      );
      await wait(this.delayDuration);
      await wait(this.delayDuration);
      await FigmaBotCommonActions.click(page, duplicateFileButtonHandle);
      await wait(this.delayDuration);
      await wait(this.delayDuration);
      await wait(this.delayDuration);

      // find created copy of [sourceFileName] and press mouse right-button
      const copyFileButtonHandle = await FigmaBotCommonActions.findElement(
        page,
        {
          selector: '[class*="generic_tile--title"]',
          innerHTML: sourceFileName + ' (Copy)'
        }
      );
      await wait(this.delayDuration);
      await FigmaBotCommonActions.click(page, copyFileButtonHandle, 'right');
      await wait(this.delayDuration);

      // in dropdown-list find "Move" and press mouse left-button
      const moveCopyFileButtonHandle = await FigmaBotCommonActions.findElement(
        page,
        {
          selector: '*',
          innerHTML: 'Move file...'
        }
      );
      await wait(this.delayDuration);
      await wait(this.delayDuration);
      await FigmaBotCommonActions.click(page, moveCopyFileButtonHandle);
      await wait(this.delayDuration);

      // in modal - input [destinationProjectName]
      await wait(this.delayDuration);
      const input = await FigmaBotCommonActions.findElement(page, {
        selector: 'input[class*="file_move"]'
      });
      await input.type(destinationProjectName, { delay: 200 });
      await wait(this.delayDuration);

      // navigate to [destinationProjectName] in projects list and press mouse left-button - confirm destination project
      await wait(this.delayDuration);
      const destinationProjectInModal = await FigmaBotCommonActions.findElement(
        page,
        {
          selector: '[class*="file_move--folderName"]',
          innerHTML: destinationProjectName
        }
      );
      await wait(this.delayDuration);
      await FigmaBotCommonActions.click(page, destinationProjectInModal);
      await wait(this.delayDuration);

      // find "Move" button in modal and press mouse left-button
      const moveCopyFileInModalButtonHandle = await FigmaBotCommonActions.findElement(
        page,
        {
          selector: '[class*="basic_form--primaryBtn"]',
          innerHTML: 'Move'
        }
      );
      await wait(this.delayDuration);
      await wait(this.delayDuration);
      await FigmaBotCommonActions.click(page, moveCopyFileInModalButtonHandle);
      await wait(this.delayDuration);
      await wait(this.delayDuration);
    } catch (e) {
      throw new DuplicateExternalFileError(e, sourceProjectId, sourceFileName);
    } finally {
      await page.close();
    }
    return;
  }

  // TO-DO - check capability
  /**
   * Rename file [sourceFileName] to [newFileName] in project [sourceProjectId]
   */
  async renameFileInProject(
    sourceProjectId: string,
    sourceFileName: string,
    newFileName: string
  ): Promise<void> {
    const page: Page = await this.browser.newPage();
    try {
      await this._confirmAuth(page);
      // open project page [sourceProjectId]
      await FigmaBotCommonActions.goToProjectPage(page, sourceProjectId);
      await wait(this.delayDuration);

      // find figma-file [sourceFileName] and press mouse right-button
      const sourceFileButtonHandle = await FigmaBotCommonActions.findElement(
        page,
        {
          selector: '[class*="generic_tile--title"]',
          innerHTML: sourceFileName
        }
      );
      await wait(this.delayDuration);
      await FigmaBotCommonActions.click(page, sourceFileButtonHandle, 'right');
      await wait(this.delayDuration);

      // in dropdown-list find "Rename" and press mouse left-button
      const renameFileButtonHandle = await FigmaBotCommonActions.findElement(
        page,
        {
          selector: '*',
          innerHTML: 'Rename'
        }
      );
      await wait(this.delayDuration);
      await wait(this.delayDuration);
      await FigmaBotCommonActions.click(page, renameFileButtonHandle);
      await wait(this.delayDuration);

      // from keyboard - type [newFileName] and press "Enter"
      await wait(this.delayDuration);
      await page.keyboard.type(newFileName, { delay: 200 });
      await wait(this.delayDuration);
      await page.keyboard.press('Enter', { delay: 70 });
      await wait(this.delayDuration);
    } catch (e) {
      throw new RenameFileInProjectError(e, sourceProjectId, sourceFileName);
    } finally {
      await page.close();
    }
    return;
  }
}
