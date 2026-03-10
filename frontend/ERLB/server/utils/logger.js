import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDir = path.resolve(__dirname, '../logs');
const logFile = path.join(logDir, 'app.log');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const write = (level, message, meta = {}) => {
  const payload = {
    ts: new Date().toISOString(),
    level,
    message,
    ...meta
  };

  fs.appendFileSync(logFile, `${JSON.stringify(payload)}\n`);

  if (level === 'error') {
    console.error(message, meta);
  } else {
    console.log(message, meta);
  }
};

export const logger = {
  info: (message, meta) => write('info', message, meta),
  warn: (message, meta) => write('warn', message, meta),
  error: (message, meta) => write('error', message, meta)
};
