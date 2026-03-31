#!/usr/bin/env bash
set -e

INSTALL_DIR="${HOME}/.local/lib/opencode-luigi-connect"
BIN_LINK="${HOME}/.local/bin/opencode-luigi-connect"
BIN_NAME="opencode-luigi-connect"

echo ""
echo "━━━ Installing ${BIN_NAME} ━━━"
echo ""

# Check if node is available
if ! command -v node &> /dev/null; then
    echo "✗ Node.js is not installed"
    echo "  Install from: https://nodejs.org"
    exit 1
fi

NODE_PATH="$(command -v node)"
echo "✓ Found Node.js at ${NODE_PATH}"

# Create install directory
mkdir -p "${INSTALL_DIR}"

# Copy source files
cd "$(dirname "$0")"
cp -r src "${INSTALL_DIR}/"

# Create package.json
cat > "${INSTALL_DIR}/package.json" << 'PKGJSON'
{
  "name": "opencode-luigi-connect",
  "version": "1.1.0",
  "type": "module"
}
PKGJSON

# Create bin symlink
rm -f "${BIN_LINK}"
cat > "${BIN_LINK}" << 'WRAPPER'
#!/usr/bin/env bash
exec node "$(dirname "$(readlink -f "$0")")/../lib/opencode-luigi-connect/src/cli.js" "$@"
WRAPPER

chmod +x "${BIN_LINK}"

# Add to PATH if not already there
BASHRC="${HOME}/.bashrc"
ZSHRC="${HOME}/.zshrc"
SHELL_RC=""
PATH_LINE="export PATH=\"${HOME}/.local/bin:\$PATH\""

# Detect which rc file to use
if [ -f "$ZSHRC" ]; then
    SHELL_RC="$ZSHRC"
elif [ -f "$BASHRC" ]; then
    SHELL_RC="$BASHRC"
fi

# Check if PATH line already exists
if [ -n "$SHELL_RC" ] && ! grep -q "${HOME}/.local/bin" "$SHELL_RC" 2>/dev/null; then
    echo "" >> "$SHELL_RC"
    echo "# Added by ${BIN_NAME}" >> "$SHELL_RC"
    echo "${PATH_LINE}" >> "$SHELL_RC"
    echo "✓ Added ~/.local/bin to PATH in ${SHELL_RC}"
elif [ -n "$SHELL_RC" ]; then
    echo "✓ ~/.local/bin already in PATH"
else
    echo "⚠ Could not find .bashrc or .zshrc"
    echo "  Please add this line to your shell config:"
    echo "  ${PATH_LINE}"
fi

echo ""
echo "━━━ Installation Complete ━━━"
echo ""
echo "✓ ${BIN_NAME} installed to ${BIN_LINK}"
echo ""
echo "Next steps:"
echo "  1. Run: source ~/.bashrc  (or open a new terminal)"
echo "  2. Then: ${BIN_NAME} add --api-key=YOUR_KEY"
echo ""
