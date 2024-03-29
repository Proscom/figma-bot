import { promises as fs } from 'fs';

export interface ICookiesProvider {
  getCookies: () => Promise<any>;
  setCookies: (cookies: any) => Promise<void>;
}

export class FSCookiesProvider implements ICookiesProvider {
  constructor(public path: string = './cookies.json') {}
  async getCookies() {
    try {
      const cookiesBuffer = await fs.readFile(this.path);
      return JSON.parse(cookiesBuffer.toString());
    } catch {
      return null;
    }
  }
  async setCookies(cookies) {
    await fs.writeFile(this.path, JSON.stringify(cookies));
  }
}
