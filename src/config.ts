import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { getBaseUrl, getProviderName, getProviderDisplayName, getProviderDescription } from './api.js';

const OPENCODE_CONFIG_DIR = join(process.env.HOME || '/root', '.config', 'opencode');
const OPENCODE_CONFIG_FILE = join(OPENCODE_CONFIG_DIR, 'opencode.json');
const OPENCODE_AUTH_FILE = join(process.env.HOME || '/root', '.local', 'share', 'opencode', 'auth.json');

export interface OpenCodeConfig {
  $schema?: string;
  provider?: {
    [key: string]: {
      npm?: string;
      name?: string;
      options?: {
        baseURL?: string;
        headers?: {
          [key: string]: string;
        };
      };
      models?: {
        [key: string]: {
          name?: string;
        };
      };
    };
  };
}

export interface AuthConfig {
  [key: string]: {
    type?: string;
    token?: string;
  };
}

function ensureDir(dir: string): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function loadJsonFile<T>(path: string, defaultValue: T): T {
  try {
    if (existsSync(path)) {
      const data = readFileSync(path, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Error reading ${path}:`, error);
  }
  return defaultValue;
}

function saveJsonFile(path: string, data: unknown): void {
  ensureDir(join(path, '..'));
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8');
}

export function loadOpenCodeConfig(): OpenCodeConfig {
  return loadJsonFile(OPENCODE_CONFIG_FILE, {});
}

export function saveOpenCodeConfig(config: OpenCodeConfig): void {
  ensureDir(OPENCODE_CONFIG_DIR);
  saveJsonFile(OPENCODE_CONFIG_FILE, config);
}

export function loadAuthConfig(): AuthConfig {
  return loadJsonFile(OPENCODE_AUTH_FILE, {});
}

export function saveAuthConfig(auth: AuthConfig): void {
  const authDir = join(process.env.HOME || '/root', '.local', 'share', 'opencode');
  ensureDir(authDir);
  saveJsonFile(OPENCODE_AUTH_FILE, auth);
}

export function addProviderConfig(apiKey: string, models: string[]): void {
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
    config.provider[providerName].models![model] = {
      name: model,
    };
  }

  saveOpenCodeConfig(config);

  const auth = loadAuthConfig();
  auth[providerName] = {
    type: 'bearer',
    token: apiKey,
  };
  saveAuthConfig(auth);
}

export function removeProviderConfig(): void {
  const config = loadOpenCodeConfig();
  
  if (config.provider) {
    delete config.provider[getProviderName()];
    saveOpenCodeConfig(config);
  }

  const auth = loadAuthConfig();
  delete auth[getProviderName()];
  saveAuthConfig(auth);
}

export function listProviders(): Array<{ name: string; hasKey: boolean }> {
  const config = loadOpenCodeConfig();
  const auth = loadAuthConfig();
  const providers: Array<{ name: string; hasKey: boolean }> = [];

  if (config.provider) {
    for (const [name, _provider] of Object.entries(config.provider)) {
      providers.push({
        name,
        hasKey: !!auth[name]?.token,
      });
    }
  }

  return providers;
}

export function hasProviderConfig(): boolean {
  const config = loadOpenCodeConfig();
  return !!(config.provider?.[getProviderName()]);
}

export function getConfigPath(): string {
  return OPENCODE_CONFIG_FILE;
}

export function getAuthPath(): string {
  return OPENCODE_AUTH_FILE;
}
