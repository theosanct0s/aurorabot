const fs = require('node:fs');
const path = require('node:path');
const { logger } = require('../utils/logger');

function loadEvents(client, eventsPath) {
  if (!fs.existsSync(eventsPath)) {
    logger.warn(`Events folder not found: ${eventsPath}`);
    return;
  }

  const eventFiles = fs
    .readdirSync(eventsPath)
    .filter((file) => file.endsWith('.js'));

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);

    if (!event?.name || typeof event.execute !== 'function') {
      logger.warn(`Skipping invalid event: ${file}`);
      continue;
    }

    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  }
  logger.info(`Loaded ${eventFiles.length} events.`);
}

module.exports = { loadEvents };
