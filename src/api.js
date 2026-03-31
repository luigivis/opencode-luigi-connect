const BASE_URL = 'https://api.chat.luigivis.com/v1';

export async function fetchModels(apiKey) {
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

    const data = await response.json();
    return data.data.map(m => m.id);
  } catch (error) {
    throw new Error(`Failed to fetch models: ${error}`);
  }
}

export function getBaseUrl() {
  return BASE_URL;
}

export function getProviderName() {
  return 'luigi-connect';
}

export function getProviderDisplayName() {
  return 'Luigi Connect';
}

export function getProviderDescription() {
  return 'api.chat.luigivis.com - LiteLLM Gateway. For API key contact: luigivis98@gmail.com';
}
