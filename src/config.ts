import { MdbookServerConfig } from './types.js';
import { ConfigError } from './utils/errors.js';

export function loadConfig(): MdbookServerConfig {
  const rootPath = process.env.MDBOOK_ROOT_PATH;

  if (!rootPath) {
    throw new ConfigError('MDBOOK_ROOT_PATH environment variable is required');
  }

  return {
    rootPath,
    serverName: process.env.MDBOOK_SERVER_NAME,
  };
}
