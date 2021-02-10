import { Page } from 'puppeteer/lib/esm/puppeteer/common/Page';
import { ElementHandle } from 'puppeteer/lib/esm/puppeteer/common/JSHandle';

export const random = (min: number, max: number) =>
  min + Math.round(Math.random() * (max - min));

export const wait = (timeout: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, timeout));

export const waitAndNavigate = async (page: Page, promise: Promise<any>) =>
  await Promise.all([page.waitForNavigation(), promise]);

export const waitForRedirects = async (
  page: Page,
  redirectsLimit: number = 10,
  timeout = 5000
) => {
  try {
    for (let i = 0; i < redirectsLimit; i++) {
      await page.waitForNavigation({ timeout });
    }
  } catch {
    return;
  }
};

export interface IElementSearchOptions {
  selector?: string;
  innerHTML?: string | RegExp;
}
export const findElement = async (
  page: Page,
  { selector, innerHTML }: IElementSearchOptions
): Promise<ElementHandle> => {
  if (selector) {
    try {
      await page.waitForSelector(selector);
    } catch {
      throw new Error(`Element that matches selector "${selector}" not found.`);
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
};

export const click = async (
  page: Page,
  elementHandle: ElementHandle
): Promise<void> => {
  const clientRect = await page.evaluate((target: HTMLElement) => {
    const { x, y, width, height } = target.getBoundingClientRect();
    return { x, y, width, height };
  }, elementHandle);
  await page.mouse.click(
    clientRect.x + random(0, clientRect.width),
    clientRect.y + random(0, clientRect.height)
  );
};

export const goTo = async (page: Page, targetURL: string) => {
  if (page.url().includes(targetURL)) {
    return;
  }
  await page.goto(targetURL);
  await waitForRedirects(page);
  if (!page.url().includes(targetURL)) {
    throw new Error(`Page loading failed.`);
  }
};
export const goToTeamPage = async (page: Page, teamId: string) => {
  try {
    await goTo(page, `https://www.figma.com/files/team/${teamId}`);
  } catch {
    throw new Error(`Team with id ${teamId} page loading failed.`);
  }
};
export const goToProjectPage = async (page: Page, projectId: string) => {
  try {
    await goTo(page, `https://www.figma.com/files/project/${projectId}`);
  } catch {
    throw new Error(`Project with id ${projectId} page loading failed.`);
  }
};
export const goToFilePage = async (page: Page, fileId: string) => {
  try {
    await goTo(page, `https://www.figma.com/file/${fileId}`);
  } catch {
    throw new Error(`File with id ${fileId} page loading failed.`);
  }
};
