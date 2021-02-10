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
  redirectsLimit: number = 5,
  timeout = 10000
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
