#!/usr/bin/env bash
# VelvetMD Installer — One-line install for Claude Code
# curl -fsSL https://raw.githubusercontent.com/phenomenon0/VelvetMD/main/install.sh | bash
set -euo pipefail

REPO="https://github.com/phenomenon0/VelvetMD.git"
SKILL_NAME="velvetmd"
DATA_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/$SKILL_NAME"
CLAUDE_SKILLS="$HOME/.claude/skills"
SKILL_LINK="$CLAUDE_SKILLS/$SKILL_NAME"

# Colors (only in interactive terminal)
if [ -t 1 ]; then
  G='\033[0;32m' Y='\033[0;33m' B='\033[0;34m' D='\033[0;90m' N='\033[0m'
else
  G='' Y='' B='' D='' N=''
fi

echo ""
echo -e "${B}VelvetMD${N} — Markdown that feels like silk"
echo ""

# Require git
if ! command -v git &>/dev/null; then
  echo -e "${Y}Error:${N} git is required. Install it and try again."
  exit 1
fi

# Clone or update
if [ -d "$DATA_DIR/.git" ]; then
  echo -e "${D}Updating existing install...${N}"
  git -C "$DATA_DIR" pull --quiet
else
  echo -e "${D}Cloning VelvetMD...${N}"
  git clone --depth 1 "$REPO" "$DATA_DIR"
fi

# Ensure ~/.claude/skills exists
mkdir -p "$CLAUDE_SKILLS"

# Symlink into Claude's skills directory
if [ -L "$SKILL_LINK" ]; then
  rm "$SKILL_LINK"
elif [ -d "$SKILL_LINK" ]; then
  # Existing non-symlink directory — back it up
  BACKUP="${SKILL_LINK}.backup.$(date +%s)"
  echo -e "${Y}Backing up${N} existing $SKILL_LINK to $BACKUP"
  mv "$SKILL_LINK" "$BACKUP"
fi

ln -sf "$DATA_DIR" "$SKILL_LINK"

# Optional: install Electron deps for native desktop mode
if command -v npm &>/dev/null && [ -f "$DATA_DIR/electron/package.json" ]; then
  echo -e "${D}Installing Electron dependencies (native mode)...${N}"
  (cd "$DATA_DIR/electron" && npm install --silent 2>/dev/null) || true
fi

echo ""
echo -e "${G}Installed!${N} Restart Claude Code to load ${B}/velvetmd${N}"
echo ""
echo "  Usage:"
echo "    /velvetmd ./docs              # Browse a folder"
echo "    /velvetmd README.md           # Preview a file"
echo "    /velvetmd --session a.md b.md  # Session files"
echo ""
echo -e "${D}Installed to: $DATA_DIR${N}"
echo -e "${D}Linked from:  $SKILL_LINK${N}"
echo ""
echo -e "To update later: ${D}curl -fsSL https://raw.githubusercontent.com/phenomenon0/VelvetMD/main/install.sh | bash${N}"
echo ""
