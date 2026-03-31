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
    case 'init':
      cmdInit();
      break;
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
  console.log('  ' + color('init', 'g') + '             Initialize everything (install OpenCode, remote-ctrl, and configure)');
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

async function cmdInit() {
  console.log('');
  console.log(color('━━━ Initializing Luigi Connect Setup ━━━', 'bold'));
  console.log('');

  // Step 1: Check and install OpenCode
  console.log(color('Step 1: OpenCode', 'bold'));
  console.log('');
  
  if (isOpenCodeInstalled()) {
    console.log(color('✓ OpenCode is already installed', 'g'));
  } else {
    console.log('OpenCode is not installed. Installing...');
    try {
      execSync('curl -fsSL https://opencode.ai/install | sh', { stdio: 'inherit' });
      if (!isOpenCodeInstalled()) {
        throw new Error('OpenCode installation failed');
      }
      console.log(color('✓ OpenCode installed successfully', 'g'));
    } catch {
      log('✗ Failed to install OpenCode', 'r');
      console.log('Please install manually: curl -fsSL https://opencode.ai/install | sh');
      process.exit(1);
    }
  }

  // Step 2: Check and install opencode-remote-ctrl
  console.log('');
  console.log(color('Step 2: opencode-remote-ctrl', 'bold'));
  console.log('');

  if (isOpencodeRemoteCtrlInstalled()) {
    console.log(color('✓ opencode-remote-ctrl is already installed', 'g'));
  } else {
    console.log('opencode-remote-ctrl is not installed. Installing...');
    try {
      execSync('npm install -g opencode-remote-ctrl', { stdio: 'inherit' });
      if (!isOpencodeRemoteCtrlInstalled()) {
        throw new Error('opencode-remote-ctrl installation failed');
      }
      console.log(color('✓ opencode-remote-ctrl installed successfully', 'g'));
    } catch {
      log('✗ Failed to install opencode-remote-ctrl', 'r');
      console.log('Please install manually: npm install -g opencode-remote-ctrl');
      process.exit(1);
    }
  }

  // Step 2b: Tailscale check (handled by opencode-remote-ctrl, but we inform user)
  console.log('');
  console.log(color('Step 3: Tailscale', 'bold'));
  console.log('');
  console.log('opencode-remote-ctrl will check for Tailscale when you start it.');
  console.log('If Tailscale is not installed, you will be prompted to install it.');
  console.log('');

  // Step 4: Ask for API key and configure
  console.log(color('Step 4: Luigi Connect API Key', 'bold'));
  console.log('');

  let apiKey = '';
  const apiKeyArg = args.find(arg => arg.startsWith('--api-key='));
  if (apiKeyArg) {
    apiKey = apiKeyArg.split('=')[1];
  } else {
    console.log('Please enter your Luigi Connect API key:');
    console.log('(Contact luigivis98@gmail.com if you need one)');
    console.log('');

    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    apiKey = await new Promise(resolve => {
      rl.question(color('API Key: ', 'c'), answer => {
        rl.close();
        resolve(answer.trim());
      });
    });
  }

  if (!apiKey) {
    log('API key is required', 'r');
    console.log('Run: opencode-luigi-connect init --api-key=YOUR_KEY');
    process.exit(1);
  }

  // Step 5: Configure Luigi Connect provider
  console.log('');
  console.log(color('Step 5: Configuring Luigi Connect provider', 'bold'));
  console.log('');

  try {
    const models = await fetchModels(apiKey);

    if (models.length === 0) {
      log('No models found at the gateway', 'y');
      process.exit(1);
    }

    console.log(color('✓', 'g') + ' Found ' + models.length + ' models');

    addProviderConfig(apiKey, models);

    console.log('');
    console.log(color('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'c'));
    console.log(color('  ✓ Setup Complete!', 'g'));
    console.log(color('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'c'));
    console.log('');
    console.log(color('What was configured:', 'bold'));
    console.log('  ✓ OpenCode AI assistant');
    console.log('  ✓ opencode-remote-ctrl (web UI + Tailscale remote access)');
    console.log('  ✓ Luigi Connect provider with ' + models.length + ' models');
    console.log('');
    console.log(color('Next steps:', 'bold'));
    console.log('  1. Run ' + color('opencode-remote-ctrl start', 'c') + ' to start the web UI');
    console.log('  2. Run ' + color('opencode', 'c') + ' to use the AI assistant');
    console.log('  3. Access from phone via Tailscale IP on port 4096');
    console.log('');
    console.log(color('For support: luigivis98@gmail.com', 'gray'));
    console.log('');
  } catch (error) {
    log('✗ Failed to configure provider: ' + error, 'r');
    process.exit(1);
  }
}

function isOpenCodeInstalled() {
  try {
    execSync('which opencode', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function isOpencodeRemoteCtrlInstalled() {
  try {
    execSync('which opencode-remote-ctrl', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
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
