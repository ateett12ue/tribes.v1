/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    MORALIS_APPLICATION_ID: process.env.MORALIS_APPLICATION_ID,
    MORALIS_SERVER_ID: process.env.MORALIS_SERVER_ID,
    GITHUB_BOT_AUTH: process.env.GITHUB_BOT_AUTH,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    CHOKIDAR_USEPOLLING: process.env.CHOKIDAR_USEPOLLING,
    INVITE_ENCRYPTION_SECRET_KEY: process.env.INVITE_ENCRYPTION_SECRET_KEY
  },
};

module.exports = nextConfig;
