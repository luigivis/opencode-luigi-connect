# opencode-luigi-connect

CLI tool to configure [api.chat.luigivis.com](https://api.chat.luigivis.com) (LiteLLM Gateway) as a provider in [OpenCode](https://opencode.ai).

## About

This tool connects your OpenCode installation to the Luigi Connect API gateway, which provides access to various AI models through LiteLLM.

**API Gateway:** https://api.chat.luigivis.com/v1

**For API access:** Contact luigivis98@gmail.com

## Installation

Requires **Node.js 16+** (no other dependencies needed).

```bash
# Clone the repo
git clone https://github.com/luigivis/opencode-luigi-connect.git
cd opencode-luigi-connect

# Run the installer
./install.sh
```

The installer will:
1. Copy files to `~/.local/lib/opencode-luigi-connect/`
2. Create a symlink in `~/.local/bin/`
3. Add `~/.local/bin` to your PATH if needed

## Requirements

- [OpenCode](https://opencode.ai) installed
- Node.js 16 or higher
- API key for api.chat.luigivis.com

## Usage

### Quick Setup (Recommended)

The easiest way to set everything up:

```bash
# One command to rule them all
opencode-luigi-connect init --api-key=sk-your-key
```

This will:
1. Install OpenCode if not present
2. Install opencode-remote-ctrl if not present
3. Configure Tailscale for remote access
4. Set up the Luigi Connect provider

### Add Provider

```bash
# With API key
opencode-luigi-connect add --api-key=sk-your-key
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

1. **Adding provider config** to `~/.config/opencode/opencode.json`
2. **Adding auth token** to `~/.local/share/opencode/auth.json`

## Troubleshooting

### "command not found" after installation

If you get `opencode-luigi-connect: command not found`, make sure `~/.local/bin` is in your PATH:

```bash
export PATH="$HOME/.local/bin:$PATH"
source ~/.bashrc
```

## Support

For API access or questions: luigivis98@gmail.com

## License

MIT
