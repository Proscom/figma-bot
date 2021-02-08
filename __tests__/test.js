const { FigmaBotServer, saveURLToAirtable } = require('../lib');

const server = new FigmaBotServer({
  requestProcessingCompletedHandlers: {
    createFile: (req, res, result) =>
      saveURLToAirtable(req, res, {
        baseURL: 'https://www.figma.com/file',
        itemId: result
      })
  },
  responseAfterFileCreated: false,
  responseAfterProjectCreated: false
});
(async () => {
  await server.start();
  server.app.post(
    '/createProjectAndFile',
    server.authMiddleware,
    async (req, res) => {
      const projectName = req.query.projectName;
      const fileName = req.query.fileName;
      const teamId = req.query.teamId;
      if (!projectName || typeof projectName !== 'string') {
        res
          .status(422)
          .send('Query parameter "projectName" must be a non-empty string.');
        return;
      }
      if (!fileName || typeof fileName !== 'string') {
        res
          .status(422)
          .send('Query parameter "fileName" must be a non-empty string.');
        return;
      }
      if (!teamId || typeof teamId !== 'string') {
        res
          .status(422)
          .send('Query parameter "teamId" must be a non-empty string.');
        return;
      }
      try {
        const projectId = await server.bot.createProject(projectName, teamId);
        const fileId = await server.bot.createFile(fileName, projectId);
        await saveURLToAirtable(req, res, {
          baseURL: 'https://www.figma.com/file',
          itemId: fileId
        });
      } catch (e) {
        req.log.error(e.message);
      }
    }
  );
})();
