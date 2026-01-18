const path = require('node:path');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });

const token = process.env.DISCORD_TOKEN;

if (!token) {
  throw new Error('Set DISCORD_TOKEN in .env.');
}

module.exports = { token };
