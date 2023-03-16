import { Page } from 'puppeteer/lib/esm/puppeteer/common/Page';
import { ElementHandle } from 'puppeteer/lib/esm/puppeteer/common/JSHandle';
import { IElementSearchOptions, IWaitForRedirectsParams } from './figmaBot.interfaces';
export declare class FigmaBotCommonActions {
    static waitAndNavigate(page: Page, promise: Promise<any>): Promise<void>;
    static waitForRedirects({ page, redirectsLimit, timeout }: IWaitForRedirectsParams): Promise<void>;
    static findElement(page: Page, { selector, innerHTML }: IElementSearchOptions): Promise<ElementHandle>;
    static clearInput(page: any, input: ElementHandle): Promise<void>;
    static click(page: Page, elementHandle: ElementHandle, mouseButton?: 'left' | 'right'): Promise<void>;
    static moveCursor(page: Page, x: number, y: number): Promise<void>;
    static clickByCursor(page: Page, x: number, y: number): Promise<void>;
    static getNextSiblingHandle(page: Page, elementHandle: ElementHandle): Promise<ElementHandle>;
    static goTo(page: Page, targetURL: string): Promise<void>;
    static goToTeamPage(page: Page, teamId: string): Promise<void>;
    static goToProjectPage(page: Page, projectId: string): Promise<void>;
    static goToFilePage(page: Page, fileId: string): Promise<void>;
    static submitSingInForm(page: Page, authData: any, delayDuration?: number): Promise<void>;
    static parseLoginPageError(page: Page): Promise<null | string>;
    static checkAuth(page: Page): Promise<boolean>;
}
