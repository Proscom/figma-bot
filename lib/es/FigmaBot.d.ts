import { Browser } from 'puppeteer/lib/esm/puppeteer/common/Browser';
import { Page } from 'puppeteer/lib/esm/puppeteer/common/Page';
import { ICookiesProvider } from './common/cookiesProvider';
import { IAuthData, IFigmaBotOptions } from './figmaBot.interfaces';
export declare class FigmaBot {
    browser: Browser;
    authData: IAuthData;
    delayDuration: number;
    cookiesProvider: ICookiesProvider | undefined;
    constructor({ authData, delayDuration, cookiesProvider }: IFigmaBotOptions);
    _signIn(page: Page, authData?: IAuthData): Promise<void>;
    _confirmAuth(page: Page, authData?: IAuthData): Promise<void>;
    start(): Promise<void>;
    stop(): Promise<void>;
    createProject(projectName: string, teamId: string): Promise<string>;
    createFile(fileName: string, projectId: string): Promise<string>;
    renameFile(fileId: string, newName: string): Promise<void>;
    renameProject(projectId: string, newName: string): Promise<void>;
    /**
     * Copying [sourceFileName] from project [sourceProjectId] to [destinationProjectName]
     */
    duplicateFileFromExternalProject(sourceProjectId: string, sourceFileName: string, destinationProjectName: string): Promise<void>;
    /**
     * Rename file [sourceFileName] to [newFileName] in project [sourceProjectId]
     */
    renameFileInProject(sourceProjectId: string, sourceFileName: string, newFileName: string): Promise<void>;
}
