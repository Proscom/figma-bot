import express, { Application, Request, Response, NextFunction } from 'express';
import { Server } from 'http';
import pino, { Logger } from 'pino';
import expressPinoLogger from 'express-pino-logger';
import basicAuth from 'basic-auth';
import { FigmaBot, IFigmaBotParams } from './FigmaBot';

const FIGMA_USER_NAME = process.env.FIGMA_USER_NAME;
const FIGMA_USER_PASSWORD = process.env.FIGMA_USER_PASSWORD;

export interface RequestWithLogger extends Request {
  log: Logger;
}

export type RequestProcessedHandler<T = any> = (
  req: RequestWithLogger,
  res: Response,
  data: T
) => Promise<void>;

export interface IRequestProcessedHandlers {
  createProject?: RequestProcessedHandler;
  createFile?: RequestProcessedHandler;
}

export interface IFigmaBotServerParams {
  responseBeforeProjectCreated?: boolean;
  responseBeforeFileCreated?: boolean;
  requestProcessedHandlers?: IRequestProcessedHandlers;
  figmaBotParams?: Omit<IFigmaBotParams, 'authData'>;
}

export class FigmaBotServer {
  PORT: number;
  bot: FigmaBot;
  app: Application;
  appServer: Server;
  logger: Logger;
  responseBeforeProjectCreated: boolean;
  responseBeforeFileCreated: boolean;
  requestProcessedHandlers: IRequestProcessedHandlers;

  constructor({
    responseBeforeProjectCreated = false,
    responseBeforeFileCreated = false,
    requestProcessedHandlers = {},
    figmaBotParams
  }: IFigmaBotServerParams) {
    if (!FIGMA_USER_NAME) {
      throw new Error('Environment variable "FIGMA_USER_NAME" not found.');
    }
    if (!FIGMA_USER_PASSWORD) {
      throw new Error('Environment variable "FIGMA_USER_PASSWORD" not found.');
    }
    this.PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
    this.logger = pino();
    this.bot = new FigmaBot({
      authData: {
        email: FIGMA_USER_NAME,
        password: FIGMA_USER_PASSWORD
      },
      ...figmaBotParams
    });
    this.responseBeforeProjectCreated = responseBeforeProjectCreated;
    this.responseBeforeFileCreated = responseBeforeFileCreated;
    this.requestProcessedHandlers = requestProcessedHandlers;
  }

  async start(): Promise<void> {
    await this.bot.start();
    this.app = express();
    this.app.use(expressPinoLogger({ logger: this.logger }));

    this.app.post(
      '/createProject',
      this.authMiddleware,
      async (req: RequestWithLogger, res) => {
        const projectId = await this.createProjectHandler(req, res);
        if (projectId && this.requestProcessedHandlers.createProject) {
          try {
            await this.requestProcessedHandlers.createProject(
              req,
              res,
              projectId
            );
          } catch (e) {
            req.log.error(e.message);
          }
        }
      }
    );
    this.app.post(
      '/createFile',
      this.authMiddleware,
      async (req: RequestWithLogger, res) => {
        const fileId = await this.createFileHandler(req, res);
        if (fileId && this.requestProcessedHandlers.createFile) {
          try {
            await this.requestProcessedHandlers.createFile(req, res, fileId);
          } catch (e) {
            req.log.error(e.message);
          }
        }
      }
    );

    this.appServer = this.app.listen(this.PORT, () => {
      this.logger.info(`Figma bot server is running on port ${this.PORT}.`);
    });
  }

  async stop(): Promise<void> {
    await this.bot.stop();
    this.appServer.close();
    this.logger.info('Figma bot server closed.');
  }

  authMiddleware(req: Request, res: Response, next: NextFunction): void {
    const credentials = basicAuth(req);
    if (
      !credentials ||
      credentials.name !== FIGMA_USER_NAME ||
      credentials.pass !== FIGMA_USER_PASSWORD
    ) {
      res.statusCode = 401;
      res.setHeader('WWW-Authenticate', 'Basic realm="Figma bot server"');
      res.end('Access denied.');
    } else {
      next();
    }
  }

  async createProjectHandler(
    req: RequestWithLogger,
    res: Response
  ): Promise<string | undefined> {
    const projectName = req.query.projectName;
    const teamId = req.query.teamId;
    if (!projectName || typeof projectName !== 'string') {
      res
        .status(422)
        .send('Query parameter "projectName" must be a non-empty string.');
      return;
    }
    if (!teamId || typeof teamId !== 'string') {
      res
        .status(422)
        .send('Query parameter "teamId" must be a non-empty string.');
      return;
    }

    const creationStartedMessage = `Project "${projectName}" in team with id "${teamId}" creation started.`;
    if (this.responseBeforeProjectCreated) {
      res.status(200).send(creationStartedMessage);
    }
    req.log.info(creationStartedMessage);

    try {
      const projectId = await this.bot.createProject(projectName, teamId);
      const createdMessage = `Project "${projectName}" in team with id "${teamId}" created with id "${projectId}".`;
      req.log.info(createdMessage);
      if (!this.responseBeforeProjectCreated) {
        res.status(200).send(createdMessage);
      }
      return projectId;
    } catch (e) {
      req.log.error(e.message);
      if (!this.responseBeforeProjectCreated) {
        res.status(501).send(e.message);
      }
    }
  }

  async createFileHandler(
    req: RequestWithLogger,
    res: Response
  ): Promise<string | undefined> {
    const fileName = req.query.fileName;
    const projectId = req.query.projectId;
    if (!fileName || typeof fileName !== 'string') {
      res
        .status(422)
        .send('Query parameter "fileName" must be a non-empty string.');
      return;
    }
    if (!projectId || typeof projectId !== 'string') {
      res
        .status(422)
        .send('Query parameter "projectId" must be a non-empty string.');
      return;
    }

    const creationStartedMessage = `File "${fileName}" in project with id "${projectId}" creation started.`;
    if (this.responseBeforeFileCreated) {
      res.status(200).send(creationStartedMessage);
    }
    req.log.info(creationStartedMessage);

    try {
      const fileId = await this.bot.createFile(fileName, projectId);
      const createdMessage = `File "${fileName}" in project with id "${projectId}" created with id "${fileId}".`;
      req.log.info(createdMessage);
      if (!this.responseBeforeFileCreated) {
        res.status(200).send(createdMessage);
      }
      return fileId;
    } catch (e) {
      req.log.error(e.message);
      if (!this.responseBeforeFileCreated) {
        res.status(501).send(e.message);
      }
    }
  }
}
