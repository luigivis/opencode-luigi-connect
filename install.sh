#!/usr/bin/env bash
set -e

INSTALL_DIR="${HOME}/.local/bin"
BIN_NAME="opencode-luigi-connect"

echo ""
echo "━━━ Installing ${BIN_NAME} ━━━"
echo ""

# Find bun - check common locations
if command -v bun &> /dev/null; then
    BUN_PATH="$(command -v bun)"
elif [ -f "${HOME}/.bun/bin/bun" ]; then
    BUN_PATH="${HOME}/.bun/bin/bun"
elif [ -f "/usr/local/bin/bun" ]; then
    BUN_PATH="/usr/local/bin/bun"
elif [ -f "/usr/bin/bun" ]; then
    BUN_PATH="/usr/bin/bun"
else
    echo "✗ Bun is not installed"
    echo "  Install from: https://bun.sh"
    exit 1
fi

echo "✓ Found bun at ${BUN_PATH}"

# Create install directory
mkdir -p "${INSTALL_DIR}"

# Build the project
echo "Building..."
cd "$(dirname "$0")"
bun install
bun build src/index.ts --outdir=dist --target=bun

# Replace shebang with actual bun path
sed -i "1s|#!/usr/bin/env bun|#!${BUN_PATH}|" dist/index.js

# Copy binary
cp dist/index.js "${INSTALL_DIR}/${BIN_NAME}"
chmod +x "${INSTALL_DIR}/${BIN_NAME}"

# Add to PATH if not already there
BASHRC="${HOME}/.bashrc"
ZSHRC="${HOME}/.zshrc"
SHELL_RC=""
PATH_LINE="export PATH=\"${INSTALL_DIR}:\$PATH\""

# Detect which rc file to use
if [ -f "$ZSHRC" ]; then
    SHELL_RC="$ZSHRC"
elif [ -f "$BASHRC" ]; then
    SHELL_RC="$BASHRC"
fi

# Check if PATH line already exists
if [ -n "$SHELL_RC" ] && ! grep -q "${INSTALL_DIR}" "$SHELL_RC" 2>/dev/null; then
    echo "" >> "$SHELL_RC"
    echo "# Added by ${BIN_NAME}" >> "$SHELL_RC"
    echo "${PATH_LINE}" >> "$SHELL_RC"
    echo "✓ Added ${INSTALL_DIR} to PATH in ${SHELL_RC}"
elif [ -n "$SHELL_RC" ]; then
    echo "✓ ${INSTALL_DIR} already in PATH"
else
    echo "⚠ Could not find .bashrc or .zshrc"
    echo "  Please add this line to your shell config:"
    echo "  ${PATH_LINE}"
fi

echo ""
echo "━━━ Installation Complete ━━━"
echo ""
echo "✓ ${BIN_NAME} installed to ${INSTALL_DIR}/${BIN_NAME}"
echo ""
echo "Next steps:"
echo "  1. Run: source ~/.bashrc  (or open a new terminal)"
echo "  2. Then: ${BIN_NAME} add --api-key=YOUR_KEY"
echo ""
