#!/usr/bin/env node
import { MdbookMcpServer } from './server.js';
import { loadConfig } from './config.js';

async function main() {
  try {
    const config = loadConfig();
    const server = new MdbookMcpServer(config);
    await server.run();
  } catch (error: any) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

main();
