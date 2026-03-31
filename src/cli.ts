#!/usr/bin/env bun
import { echo } from 'zx';
import chalk from 'chalk';
import { fetchModels, getBaseUrl, getProviderName, getProviderDisplayName, getProviderDescription } from './api.js';
import { addProviderConfig, removeProviderConfig, listProviders, hasProviderConfig, getConfigPath, getAuthPath } from './config.js';

const args = process.argv.slice(2);
const command = args[0];

async function main() {
  if (!command) {
    printHelp();
    return;
  }

  switch (command) {
    case 'add':
      await cmdAdd();
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
      echo`${chalk.red('Unknown command:')} ${command}`;
      echo`Run 'opencode-luigi-connect help' for usage information`;
      process.exit(1);
  }
}

function printHelp(): void {
  echo`
${chalk.cyan('opencode-luigi-connect')} - Configure api.chat.luigivis.com as OpenCode provider

${chalk.bold('Usage:')}
  opencode-luigi-connect <command>

${chalk.bold('Commands:')}
  ${chalk.green('add')}              Add Luigi Connect as OpenCode provider
  ${chalk.green('list')}            List configured providers
  ${chalk.green('remove')}          Remove Luigi Connect provider
  ${chalk.green('set-default')}     Set as default provider
  ${chalk.green('help')}            Show this help message

${chalk.bold('Examples:')}
  ${chalk.gray('$')} opencode-luigi-connect add
  ${chalk.gray('$')} opencode-luigi-connect add --api-key sk-xxx
  ${chalk.gray('$')} opencode-luigi-connect list

${chalk.bold('Provider Info:')}
  URL: ${chalk.blue(getBaseUrl())}
  ${getProviderDescription()}

${chalk.bold('Files:')}
  Config: ${chalk.gray(getConfigPath())}
  Auth:   ${chalk.gray(getAuthPath())}

${chalk.bold('After setup:')}
  Run ${chalk.cyan('opencode')} and use ${chalk.cyan('/models')} to select "Luigi Connect"
`;
}

async function cmdAdd(): Promise<void> {
  echo`${chalk.cyan('Adding Luigi Connect provider...')}`;

  let apiKey = '';

  const apiKeyArg = args.find(arg => arg.startsWith('--api-key='));
  if (apiKeyArg) {
    apiKey = apiKeyArg.split('=')[1];
  } else {
    echo`${chalk.yellow('Please provide API key with --api-key=YOUR_KEY')}`;
    echo`Or run: ${chalk.cyan('opencode-luigi-connect add --api-key=sk-your-key')}`;
    process.exit(1);
  }

  echo`Fetching available models...`;

  try {
    const models = await fetchModels(apiKey);
    
    if (models.length === 0) {
      echo`${chalk.yellow('No models found at the gateway')}`;
      process.exit(1);
    }

    echo`${chalk.green('✓')} Found ${models.length} models`;

    addProviderConfig(apiKey, models);

    echo`
${chalk.green('✓ Luigi Connect provider added successfully!')}

${chalk.bold('Models available:')}
${models.map(m => `  - ${chalk.blue(m)}`).join('\n')}

${chalk.bold('Next steps:')}
  1. Run ${chalk.cyan('opencode')}
  2. Use ${chalk.cyan('/models')} to select "Luigi Connect"
  3. Or use ${chalk.cyan('/connect')} to configure other providers

${chalk.gray('For support: luigivis98@gmail.com')}
`;
  } catch (error) {
    echo`${chalk.red('✗ Failed to add provider:')} ${error}`;
    process.exit(1);
  }
}

function cmdList(): void {
  const providers = listProviders();

  if (providers.length === 0) {
    echo`${chalk.yellow('No providers configured')}`;
    echo`Run ${chalk.cyan('opencode-luigi-connect add')} to add Luigi Connect`;
    return;
  }

  echo`
${chalk.bold('Configured providers:')}
`;

  for (const provider of providers) {
    const status = provider.hasKey ? chalk.green('✓') : chalk.yellow('○');
    const isLuigi = provider.name === getProviderName();
    const name = isLuigi ? `${provider.name} ${chalk.gray('(api.chat.luigivis.com)')}` : provider.name;
    echo`  ${status} ${name}`;
  }

  echo``;
}

function cmdRemove(): void {
  if (!hasProviderConfig()) {
    echo`${chalk.yellow('Luigi Connect provider not configured')}`;
    return;
  }

  removeProviderConfig();

  echo`
${chalk.green('✓ Luigi Connect provider removed')}
`;
}

function cmdSetDefault(): void {
  echo`${chalk.yellow('Setting default provider not yet implemented')}`;
  echo`Use ${chalk.cyan('opencode')} → ${chalk.cyan('/models')} to select default provider`;
}

main().catch(console.error);
