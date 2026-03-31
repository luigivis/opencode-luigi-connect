const BASE_URL = 'https://api.chat.luigivis.com/v1';

export interface Model {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

export interface ModelsResponse {
  object: string;
  data: Model[];
}

export async function fetchModels(apiKey: string): Promise<string[]> {
  try {
    const response = await fetch(`${BASE_URL}/models`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: ModelsResponse = await response.json();
    return data.data.map(m => m.id);
  } catch (error) {
    throw new Error(`Failed to fetch models: ${error}`);
  }
}

export function getBaseUrl(): string {
  return BASE_URL;
}

export function getProviderName(): string {
  return 'luigi-connect';
}

export function getProviderDisplayName(): string {
  return 'Luigi Connect';
}

export function getProviderDescription(): string {
  return 'api.chat.luigivis.com - LiteLLM Gateway. For API key contact: luigivis98@gmail.com';
}
