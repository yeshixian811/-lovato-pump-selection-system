module.exports = {
  apps: [{
    name: 'lovato-pump-selection',
    script: 'node',
    args: './node_modules/.pnpm/next@16.1.1_@babel+core@7.28.6_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/dist/bin/next',
    cwd: '/workspace/projects',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    env_development: {
      NODE_ENV: 'development',
      PORT: 5000
    },
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: '/app/work/logs/bypass/pm2-error.log',
    out_file: '/app/work/logs/bypass/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    time: true,
    listen_timeout: 10000,
    kill_timeout: 5000,
    wait_ready: true,
    min_uptime: '10s'
  }]
};
