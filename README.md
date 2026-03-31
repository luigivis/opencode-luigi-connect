# opencode-luigi-connect

CLI tool to configure [api.chat.luigivis.com](https://api.chat.luigivis.com) (LiteLLM Gateway) as a provider in [OpenCode](https://opencode.ai).

## About

This tool connects your OpenCode installation to the Luigi Connect API gateway, which provides access to various AI models through LiteLLM.

**API Gateway:** https://api.chat.luigivis.com/v1

**For API access:** Contact luigivis98@gmail.com

## Installation

```bash
npm install -g opencode-luigi-connect
```

## Usage

### Add Provider

```bash
# With API key
opencode-luigi-connect add --api-key=sk-your-key

# Interactive (will prompt for API key)
opencode-luigi-connect add
```

The tool will:
1. Validate your API key
2. Fetch available models from the gateway
3. Configure OpenCode to use the provider
4. Display all available models

### List Providers

```bash
opencode-luigi-connect list
```

### Remove Provider

```bash
opencode-luigi-connect remove
```

## After Setup

1. Run `opencode`
2. Use `/models` to select "Luigi Connect"
3. Start coding!

## How It Works

The tool configures OpenCode by:

1. **Adding provider config** to `~/.config/opencode/opencode.json`:
   ```json
   {
     "provider": {
       "luigi-connect": {
         "npm": "@ai-sdk/openai-compatible",
         "name": "Luigi Connect",
         "options": {
           "baseURL": "https://api.chat.luigivis.com/v1"
         },
         "models": {
           "gpt-4o": { "name": "gpt-4o" },
           "gpt-3.5-turbo": { "name": "gpt-3.5-turbo" }
         }
       }
     }
   }
   ```

2. **Adding auth token** to `~/.local/share/opencode/auth.json`:
   ```json
   {
     "luigi-connect": {
       "type": "bearer",
       "token": "sk-your-key"
     }
   }
   ```

## Requirements

- [OpenCode](https://opencode.ai) installed
- Node.js or Bun runtime
- API key for api.chat.luigivis.com

## Support

For API access or questions: luigivis98@gmail.com

## License

MIT
