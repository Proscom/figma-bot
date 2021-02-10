import { promises as fs } from 'fs';
import { CookiesProvider } from './FigmaBot';

export class FSCookiesProvider implements CookiesProvider {
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
