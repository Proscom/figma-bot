import { Page } from 'puppeteer/lib/esm/puppeteer/common/Page';

import { ICookiesProvider } from './common/cookiesProvider';

export interface IAuthData {
  email: string;
  password: string;
}

export interface IFigmaBotOptions {
  authData: IAuthData;
  delayDuration?: number;
  cookiesProvider?: ICookiesProvider;
}

export interface IWaitForRedirectsParams {
  page: Page;
  timeout?: number;
  redirectsLimit?: number;
}

export interface IElementSearchOptions {
  selector?: string;
  innerHTML?: string | RegExp;
}
