const { bold, cyan, green, magenta, red, yellow } = require('colorette');

const prefix = bold(magenta('[Aurora]'));

const format = (label, color, message) => {
  const time = new Date().toISOString();
  return `${prefix} ${bold(color(label))} ${time} - ${message}`;
};

const logger = {
  info: (message) => console.log(format('INFO', cyan, message)),
  success: (message) => console.log(format('OK', green, message)),
  warn: (message) => console.warn(format('WARN', yellow, message)),
  error: (message, error) => {
    const details = error ? ` ${error.message || error}` : '';
    console.error(format('ERROR', red, `${message}${details}`));
    if (error && error.stack) {
      console.error(error.stack);
    }
  },
};

module.exports = { logger };
