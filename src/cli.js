#!/usr/bin/env node
import { execSync } from 'child_process';
import { fetchModels, getBaseUrl, getProviderName, getProviderDisplayName, getProviderDescription } from './api.js';
import { addProviderConfig, removeProviderConfig, listProviders, hasProviderConfig, getConfigPath, getAuthPath } from './config.js';

const args = process.argv.slice(2);
const command = args[0];

const c = {
  r: '\x1b[31m',
  g: '\x1b[32m',
  y: '\x1b[33m',
  b: '\x1b[34m',
  c: '\x1b[36m',
  bold: '\x1b[1m',
  gray: '\x1b[90m',
  reset: '\x1b[0m',
};

const color = (msg, col) => c[col[0]] + msg + c.reset;
const log = (msg, col) => console.log(color(msg, col || 'reset'));

function main() {
  if (!command) {
    printHelp();
    return;
  }

  switch (command) {
    case 'add':
      cmdAdd();
      break;
    case 'list':
      cmdList();
      break;
    case 'remove':
    case 'rm':
      cmdRemove();
      break;
    case 'set-default':
      cmdSetDefault();
      break;
    case 'help':
    case '--help':
    case '-h':
      printHelp();
      break;
    default:
      log('Unknown command: ' + command, 'r');
      log("Run 'opencode-luigi-connect help' for usage information");
      process.exit(1);
  }
}

function printHelp() {
  console.log('');
  console.log(color('opencode-luigi-connect', 'c') + color(' - Configure api.chat.luigivis.com as OpenCode provider', 'reset'));
  console.log('');
  console.log(color('Usage:', 'bold'));
  console.log('  opencode-luigi-connect <command>');
  console.log('');
  console.log(color('Commands:', 'bold'));
  console.log('  ' + color('add', 'g') + '              Add Luigi Connect as OpenCode provider');
  console.log('  ' + color('list', 'g') + '            List configured providers');
  console.log('  ' + color('remove', 'g') + '          Remove Luigi Connect provider');
  console.log('  ' + color('set-default', 'g') + '     Set as default provider');
  console.log('  ' + color('help', 'g') + '            Show this help message');
  console.log('');
  console.log(color('Examples:', 'bold'));
  console.log('  $ opencode-luigi-connect add');
  console.log('  $ opencode-luigi-connect add --api-key sk-xxx');
  console.log('  $ opencode-luigi-connect list');
  console.log('');
  console.log(color('Provider Info:', 'bold'));
  console.log('  URL: ' + color(getBaseUrl(), 'b'));
  console.log('  ' + getProviderDescription());
  console.log('');
  console.log(color('Files:', 'bold'));
  console.log('  Config: ' + color(getConfigPath(), 'gray'));
  console.log('  Auth:   ' + color(getAuthPath(), 'gray'));
  console.log('');
  console.log(color('After setup:', 'bold'));
  console.log('  Run ' + color('opencode', 'c') + ' and use ' + color('/models', 'c') + ' to select "Luigi Connect"');
  console.log('');
}

async function cmdAdd() {
  log('Adding Luigi Connect provider...', 'c');

  let apiKey = '';

  const apiKeyArg = args.find(arg => arg.startsWith('--api-key='));
  if (apiKeyArg) {
    apiKey = apiKeyArg.split('=')[1];
  } else {
    log('Please provide API key with --api-key=YOUR_KEY', 'y');
    log('Or run: opencode-luigi-connect add --api-key=sk-your-key', 'c');
    process.exit(1);
  }

  log('Fetching available models...');

  try {
    const models = await fetchModels(apiKey);
    
    if (models.length === 0) {
      log('No models found at the gateway', 'y');
      process.exit(1);
    }

    console.log(color('✓', 'g') + ' Found ' + models.length + ' models');

    addProviderConfig(apiKey, models);

    console.log('');
    log('✓ Luigi Connect provider added successfully!', 'g');
    console.log('');
    console.log(color('Models available:', 'bold'));
    for (const m of models) {
      console.log('  - ' + color(m, 'b'));
    }
    console.log('');
    console.log(color('Next steps:', 'bold'));
    console.log('  1. Run ' + color('opencode', 'c'));
    console.log('  2. Use ' + color('/models', 'c') + ' to select "Luigi Connect"');
    console.log('  3. Or use ' + color('/connect', 'c') + ' to configure other providers');
    console.log('');
    console.log(color('For support: luigivis98@gmail.com', 'gray'));
    console.log('');
  } catch (error) {
    log('✗ Failed to add provider: ' + error, 'r');
    process.exit(1);
  }
}

function cmdList() {
  const providers = listProviders();

  if (providers.length === 0) {
    log('No providers configured', 'y');
    console.log('Run ' + color('opencode-luigi-connect add', 'c') + ' to add Luigi Connect');
    return;
  }

  console.log('');
  console.log(color('Configured providers:', 'bold'));
  console.log('');

  for (const provider of providers) {
    const status = provider.hasKey ? color('✓', 'g') : color('○', 'y');
    const isLuigi = provider.name === getProviderName();
    const name = isLuigi ? provider.name + ' ' + color('(api.chat.luigivis.com)', 'gray') : provider.name;
    console.log('  ' + status + ' ' + name);
  }

  console.log('');
}

function cmdRemove() {
  if (!hasProviderConfig()) {
    log('Luigi Connect provider not configured', 'y');
    return;
  }

  removeProviderConfig();

  console.log('');
  log('✓ Luigi Connect provider removed', 'g');
  console.log('');
}

function cmdSetDefault() {
  log('Setting default provider not yet implemented', 'y');
  console.log('Use ' + color('opencode', 'c') + ' → ' + color('/models', 'c') + ' to select default provider');
}

main();
