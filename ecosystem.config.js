module.exports = {
  apps: [
    {
      name: 'tmr-site',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/home/ubuntu/tmr_site',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      // Restart policy
      restart_delay: 5000,
      max_restarts: 10,
      min_uptime: '10s',
      // Logging
      out_file: '/home/ubuntu/.pm2/logs/tmr-site-out.log',
      error_file: '/home/ubuntu/.pm2/logs/tmr-site-error.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      // Monitoring
      max_memory_restart: '512M',
    },
  ],
};
