const path = require('node:path');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });

const token = process.env.DISCORD_TOKEN;
const embedColor = process.env.EMBED_COLOR || '#aa8ed6';
const ownerId = process.env.OWNER_ID || '';
const applicationId = process.env.APPLICATION_ID || '';

if (!token) {
  throw new Error('Set DISCORD_TOKEN in .env.');
}

module.exports = { token, embedColor, ownerId, applicationId };
