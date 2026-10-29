// PM2 process file: `pm2 start deploy/ecosystem.config.cjs && pm2 save`
module.exports = {
  apps: [
    {
      name: "rig",
      cwd: "/srv/rig/app",
      script: ".next/standalone/server.js",
      env: { NODE_ENV: "production", PORT: 3000, HOSTNAME: "127.0.0.1" },
      // Values from /srv/rig/app/.env are loaded by Next.js at startup.
      max_memory_restart: "600M",
      instances: 1, // single instance: SQLite + the IMAP worker expect one process
    },
  ],
};
