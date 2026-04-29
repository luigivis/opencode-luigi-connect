import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { getBaseUrl, getProviderName, getProviderDisplayName } from './api.js';

const OPENCODE_CONFIG_DIR = join(homedir(), '.config', 'opencode');
const OPENCODE_CONFIG_FILE = join(OPENCODE_CONFIG_DIR, 'opencode.json');
const OPENCODE_AUTH_FILE = join(homedir(), '.local', 'share', 'opencode', 'auth.json');

function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function loadJsonFile(path, defaultValue) {
  try {
    if (existsSync(path)) {
      const data = readFileSync(path, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading ' + path + ':', error);
  }
  return defaultValue;
}

function saveJsonFile(path, data) {
  ensureDir(join(path, '..').split('/').slice(0, -1).join('/') || '/');
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8');
}

export function loadOpenCodeConfig() {
  return loadJsonFile(OPENCODE_CONFIG_FILE, {});
}

export function saveOpenCodeConfig(config) {
  ensureDir(OPENCODE_CONFIG_DIR);
  saveJsonFile(OPENCODE_CONFIG_FILE, config);
}

export function loadAuthConfig() {
  return loadJsonFile(OPENCODE_AUTH_FILE, {});
}

export function saveAuthConfig(auth) {
  const authDir = join(homedir(), '.local', 'share', 'opencode');
  ensureDir(authDir);
  saveJsonFile(OPENCODE_AUTH_FILE, auth);
}

export const MODEL_METADATA = {
  'luigi-high': {
    context_window: 1000000,
    input_cost_per_token: 0.000006,
    output_cost_per_token: 0.000025,
  },
  'luigi-thinking': {
    context_window: 200000,
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000006,
  },
  'luigi-fast': {
    context_window: 200000,
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000006,
  },
  'luigi-ultra-think': {
    context_window: 1000000,
    input_cost_per_token: 0.000005,
    output_cost_per_token: 0.000020,
  },
};

export function addProviderConfig(apiKey, models) {
  const config = loadOpenCodeConfig();

  if (!config.provider) {
    config.provider = {};
  }

  const providerName = getProviderName();

  config.provider[providerName] = {
    npm: '@ai-sdk/openai-compatible',
    name: getProviderDisplayName(),
    options: {
      baseURL: `${getBaseUrl()}`,
    },
    models: {},
  };

  for (const model of models) {
    const metadata = MODEL_METADATA[model];
    const modelConfig = { name: model };

    if (metadata) {
      modelConfig.limit = {
        context: metadata.context_window,
        output: 32768,
      };
      modelConfig.cost = {
        input: metadata.input_cost_per_token,
        output: metadata.output_cost_per_token,
      };
    }

    config.provider[providerName].models[model] = modelConfig;
  }

  saveOpenCodeConfig(config);

  const auth = loadAuthConfig();
  auth[providerName] = {
    type: 'bearer',
    token: apiKey,
  };
  saveAuthConfig(auth);
}

export function removeProviderConfig() {
  const config = loadOpenCodeConfig();
  
  if (config.provider) {
    delete config.provider[getProviderName()];
    saveOpenCodeConfig(config);
  }

  const auth = loadAuthConfig();
  delete auth[getProviderName()];
  saveAuthConfig(auth);
}

export function listProviders() {
  const config = loadOpenCodeConfig();
  const auth = loadAuthConfig();
  const providers = [];

  if (config.provider) {
    for (const [name] of Object.entries(config.provider)) {
      providers.push({
        name,
        hasKey: !!(auth[name] && auth[name].token),
      });
    }
  }

  return providers;
}

export function hasProviderConfig() {
  const config = loadOpenCodeConfig();
  return !!(config.provider && config.provider[getProviderName()]);
}

export function getConfigPath() {
  return OPENCODE_CONFIG_FILE;
}

export function getAuthPath() {
  return OPENCODE_AUTH_FILE;
}
