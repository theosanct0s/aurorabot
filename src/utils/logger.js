const { bold, cyan, green, magenta, red, yellow } = require('colorette');

const prefix = bold(magenta('[Aurora]'));

const formatTimestamp = () => {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());
  return `${year}-${month}-${day} | ${hours}:${minutes}:${seconds}`;
};

const format = (label, color, message) => {
  const time = formatTimestamp();
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
