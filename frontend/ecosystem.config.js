module.exports = {
  apps: [
    {
      name: 'Eduquest_BdREN',
      script: 'yarn',
      args: 'start --port 3052',
      cwd: '/var/www/bdren_eduquest_frontend',
      instances: '1',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
