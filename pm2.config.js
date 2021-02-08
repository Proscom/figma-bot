require('dotenv-flow').config();

const project = process.env.DASH_PM2_PROJECT_NAME || '';
const instances = +process.env.DASH_PM2_CLUSTER_SIZE || 1;
const uid = +process.env.PM2_UID || undefined;
const gid = +process.env.PM2_GID || undefined;

const appName = (name) => (project ? `${project}_${name}` : name);

console.log(
  `Using parameters: project=${project} instances=${instances} uid=${uid} gid=${gid}`
);

module.exports = {
  apps: [
    {
      name: appName('api'),
      script: '__tests__/test.js',
      env: {
        NODE_ENV: 'production'
      },
      log: 'storage/logs/api.log',
      combine_logs: true,
      time: false,
      instances,
      uid,
      gid
    }
  ]
};
