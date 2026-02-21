module.exports = {
  apps: [
    {
      name: 'ustoz-support-api',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '300M',
      env: { NODE_ENV: 'production' },
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      autorestart: true,
      restart_delay: 3000,
    },
  ],
};
