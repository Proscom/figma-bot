# Figma-bot

Figma-bot is a Node.js module to programmatically create and update projects and files in [Figma](https://figma.com).

## Installation

```
yarn add @proscom/figma-bot
// or
npm install --save @proscom/figma-bot
```

## FigmaBot

```
import { FigmaBot } from '@proscom/figma-bot';
```

The main class of the module which uses [Puppeteer](https://pptr.dev/) library to interact with Figma web-site and create and update Figma projects and files.

### Properties

- `browser` **Object**: [Puppeteer Browser](https://pptr.dev/#?product=Puppeteer&version=v7.0.1&show=api-class-browser) instance, the browser which opens Figma web-site pages;
- `authData` **Object**: Figma authorization data of the account which will be used by the bot to authorize on Figma web-site:
  - `email` **string**: account email;
  - `password` **string**: account password;
- `delayDuration` **number**: duration of delay between bot interactions with Figma web-site (e.g. click, navigate etc.) in ms;
- `cookiesProvider` **Object**: object providing Figma authorization cookies (see [below](#CookiesProvider) for details).

### Constructor

```
const bot = new FigmaBot({ authData, delayDuration, cookiesProvider });
```

Parameters:

- `authData` **Object**: value to initialize `authData` property:
  - `email` **string** (required);
  - `password` **string** (required);
- `delayDuration` **number**: value to initialize `delayDuration` property (optional, default `2000`);
- `cookiesProvider` **Object**: value to initialize `cookiesProvider` property (optional).

### Methods

| Method                                | Parameters                                                                  | Description                                                         | Return value                                                         |
| ------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------- |
| bot.start()                           |                                                                             | Starts the bot.                                                     | `Promise<void>`                                                      |
| bot.stop()                            |                                                                             | Stops the bot.                                                      | `Promise<void>`                                                      |
| bot.creatProject(projectName, teamId) | - `projectName` **string** (required)<br/>- `teamId` **string** (required)  | Creates a project with name `projectName` in team with id `teamId`. | `Promise<string>` - a promise which resolves with the new project id |
| bot.creatFile(fileName, projectId)    | - `fileName` **string** (required),<br/>- `projectId` **string** (required) | Creates a file with name `fileName` in project with id `projectId`. | `Promise<string>` - a promise which resolves with the new file id    |
| bot.renameFile(fileId, newName)       | - `fileId` **string** (required)<br/>- `newName` **string** (required)      | Renames a file with id `fileId` to `newName`.                       | `Promise<void>`                                                      |
| bot.renameProject(projectId, newName) | - `projectId` **string** (required)<br/>- `newName` **string** (required)   | Renames a project with id `project` to `newName`.                   | `Promise<void>`                                                      |

You can find your team id in the team's page URL between 'team' and your team name, e.g. for team page URL
https://www.figma.com/files/team/000000000000000001/MyTeamName team id is 000000000000000001.
Same for project and file ids:

- https://www.figma.com/files/project/00000001/MyProjectName - project id is 00000001;
- https://www.figma.com/file/a1b2c3d4e5f6G7H8I9J10K/MyFileName - file id is a1b2c3d4e5f6G7H8I9J10K.

<p id="CookiesProvider"></p>

### CookiesProvider

FigmaBot's `cookiesProvider` property is an instance of the following interface:

```
export interface CookiesProvider {
  getCookies: () => Promise<any>;
  setCookies: (cookies: any) => Promise<void>;
}
```

`CookiesProvider` allows saving and loading Figma account authorization cookies. If `cookiesProvider` parameter not passed to FigmaBot's constructor, cookies are not saved and authorization is performed every new session.

#### FSCookiesProvider

A simple example of `CookiesProvider` is `FSCookiesProvider` class which implements `CookiesProvider` interface and uses `fs` module to save cookies to json file and load cookies from the file.

```
import { FSCookiesProvider } from '@proscom/figma-bot';

const cookiesProvider = new FSCookiesProvider(path);
```

Constructor parameters:

- `path` **string**: path to json file which contains cookies.

## Example

An example code that creates a simple Figma bot, uses `FSCookiesProvider` as `cookiesProvider` and creates project "My project" and file "My file":

```
const { FigmaBot, FSCookiesProvider } = require('./lib');

const bot = new FigmaBot({
  authData: {
    email: 'your figma email',
    password: 'your figma password'
  },
  cookiesProvider: new FSCookiesProvider()
});

(async () => {
  try {
    await bot.start();
    const projectId = await bot.createProject('My project', 'your team id');
    const fileId = await bot.createFile('My file', projectId);
    console.log('"My project" id is "' + projectId + '", "My file" id is "' + fileId + '".');
  } catch (e) {
    console.log(e);
  }
  await bot.stop();
})();
```
