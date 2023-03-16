export interface ICookiesProvider {
    getCookies: () => Promise<any>;
    setCookies: (cookies: any) => Promise<void>;
}
export declare class FSCookiesProvider implements ICookiesProvider {
    path: string;
    constructor(path?: string);
    getCookies(): Promise<any>;
    setCookies(cookies: any): Promise<void>;
}
