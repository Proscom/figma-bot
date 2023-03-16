import { Page } from 'puppeteer/lib/esm/puppeteer/common/Page';
import { ElementHandle } from 'puppeteer/lib/esm/puppeteer/common/JSHandle';

import { random, wait } from './common/functions';
import {
  IElementSearchOptions,
  IWaitForRedirectsParams
} from './figmaBot.interfaces';

export class FigmaBotCommonActions {
  static async waitAndNavigate(
    page: Page,
    promise: Promise<any>
  ): Promise<void> {
    await Promise.all([page.waitForNavigation(), promise]);
    return;
  }

  static async waitForRedirects({
    page,
    redirectsLimit = 10,
    timeout = 7000
  }: IWaitForRedirectsParams): Promise<void> {
    try {
      for (let i = 0; i < redirectsLimit; i++) {
        await page.waitForNavigation({ timeout });
      }
    } catch {
      return;
    }
  }

  static async findElement(
    page: Page,
    { selector, innerHTML }: IElementSearchOptions
  ): Promise<ElementHandle> {
    if (selector) {
      try {
        await page.waitForSelector(selector);
      } catch {
        throw new Error(
          `Element that matches selector "${selector}" not found.`
        );
      }
    }

    let targetElementHandle: ElementHandle | null = null;

    if (innerHTML) {
      const handles = await page.$$(selector || '*');
      for (let i = 0; i < handles.length; i++) {
        const currentElementInnerHTML = await page.evaluate(
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
      targetElementHandle = await page.$(selector || '*');
    }

    if (targetElementHandle) {
      return targetElementHandle;
    }

    throw new Error(
      `Element${
        selector && ` that matches selector "${selector}"`
      } with innerHTML "${innerHTML}" not found.`
    );
  }

  static async clearInput(page, input: ElementHandle): Promise<void> {
    await input.click({ clickCount: 3 });
    await page.keyboard.press('Backspace');
  }

  static async click(
    page: Page,
    elementHandle: ElementHandle,
    mouseButton?: 'left' | 'right'
  ): Promise<void> {
    const clientRect = await page.evaluate((target: HTMLElement) => {
      const { x, y, width, height } = target.getBoundingClientRect();
      return { x, y, width, height };
    }, elementHandle);
    await page.mouse.click(
      clientRect.x + random(0, clientRect.width),
      clientRect.y + random(0, clientRect.height),
      {
        button: mouseButton ? mouseButton : 'left'
      }
    );
  }

  static async moveCursor(page: Page, x: number, y: number): Promise<void> {
    await page.mouse.move(x, y);
  }

  static async clickByCursor(page: Page, x: number, y: number): Promise<void> {
    await page.mouse.click(x, y);
  }

  static async getNextSiblingHandle(
    page: Page,
    elementHandle: ElementHandle
  ): Promise<ElementHandle> {
    const nextSiblingHandle = (
      await page.evaluateHandle(
        (projectName: HTMLElement) => projectName.nextElementSibling,
        elementHandle
      )
    ).asElement();
    if (!nextSiblingHandle) {
      throw new Error('Next sibling not found');
    }
    return nextSiblingHandle;
  }

  static async goTo(page: Page, targetURL: string): Promise<void> {
    if (page.url().includes(targetURL)) {
      return;
    }
    await page.goto(targetURL);
    await FigmaBotCommonActions.waitForRedirects({
      page,
      timeout: 5000
    });
    if (!page.url().includes(targetURL)) {
      throw new Error(`Page loading failed.`);
    }
  }

  static async goToTeamPage(page: Page, teamId: string): Promise<void> {
    try {
      await FigmaBotCommonActions.goTo(
        page,
        `https://www.figma.com/files/team/${teamId}`
      );
    } catch {
      throw new Error(`Team with id "${teamId}" page loading failed.`);
    }
  }

  static async goToProjectPage(page: Page, projectId: string): Promise<void> {
    try {
      await FigmaBotCommonActions.goTo(
        page,
        `https://www.figma.com/files/project/${projectId}`
      );
    } catch {
      throw new Error(`Project with id "${projectId}" page loading failed.`);
    }
  }

  static async goToFilePage(page: Page, fileId: string): Promise<void> {
    try {
      await FigmaBotCommonActions.goTo(
        page,
        `https://www.figma.com/file/${fileId}`
      );
    } catch {
      throw new Error(`File with id "${fileId}" page loading failed.`);
    }
  }

  static async submitSingInForm(
    page: Page,
    authData,
    delayDuration: number = 2000
  ): Promise<void> {
    await wait(delayDuration);
    await page.click('form#auth-view-page > input[name="email"]');
    await wait(delayDuration);
    await page.keyboard.type(authData.email, { delay: 200 });
    await wait(delayDuration);
    await page.click('form#auth-view-page > input[name="password"]');
    await wait(delayDuration);
    await page.keyboard.type(authData.password, { delay: 200 });
    await wait(delayDuration);
    await page.click('form#auth-view-page > button[type="submit"]');
  }

  static async parseLoginPageError(page: Page): Promise<null | string> {
    const emailInputHandle = await FigmaBotCommonActions.findElement(page, {
      selector: 'form#auth-view-page > input[name="email"]'
    });
    const passwordInputHandle = await FigmaBotCommonActions.findElement(page, {
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

  static async checkAuth(page: Page): Promise<boolean> {
    if (page.url().includes('https://www.figma.com/files/recent')) {
      return true;
    }
    await FigmaBotCommonActions.waitAndNavigate(
      page,
      page.goto('https://www.figma.com/files/recent')
    );
    return page.url().includes('https://www.figma.com/files/recent');
  }
}
