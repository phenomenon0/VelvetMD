---
name: velvetmd
description: Render markdown files as beautiful HTML pages using VelvetMD with 20+ Obsidian themes. Use when the user wants to view, preview, or present markdown documents with a polished UI. Supports folder browsing, single file preview, and session mode for files created during the current conversation.
---

# VelvetMD

A native Electron-based markdown viewer with file browser, live reload, and 20+ Obsidian themes.

## When to Use

Use VelvetMD when:
- User asks to "preview", "view", or "show" a markdown file
- User wants to present or review documentation
- User needs a distraction-free reading experience
- User wants live preview while editing markdown
- User says "view markdowns here" or similar
- User wants to see markdown files created during this session

## Launch Commands

The launcher is at `${CLAUDE_SKILL_DIR}/velvetmd`. Always background with `&`.

### 1. Folder Mode (browse all .md files in a directory)

```bash
${CLAUDE_SKILL_DIR}/velvetmd /path/to/folder &
```

### 2. Single File Mode

```bash
${CLAUDE_SKILL_DIR}/velvetmd /path/to/file.md &
```

### 3. Session Mode (show only files from this conversation)

```bash
${CLAUDE_SKILL_DIR}/velvetmd --session /path/file1.md /path/file2.md &
```

Session mode shows ONLY the specified files in a flat list, sorted by modification time. Ideal for documents created during the current conversation.

## How to Choose Mode

| User says | Mode | Command |
|-----------|------|---------|
| "view markdowns here" / "preview docs folder" | Folder | `${CLAUDE_SKILL_DIR}/velvetmd "$(pwd)" &` |
| "show the files we created" / "preview the reports" | Session | `${CLAUDE_SKILL_DIR}/velvetmd --session /abs/path/a.md /abs/path/b.md &` |
| "preview README.md" | Single file | `${CLAUDE_SKILL_DIR}/velvetmd "$(pwd)/README.md" &` |

## Fallback: Web Mode (no Electron needed)

If Electron is not installed, use the zero-dependency web viewer:

```bash
TEMP="/tmp/velvetmd-preview.html"
cp "${CLAUDE_SKILL_DIR}/index.html" "$TEMP"
open "$TEMP"       # macOS
# xdg-open "$TEMP" # Linux
```

## Features

- **20+ Obsidian themes** — Things, Catppuccin, Nord, Minimal, Primary, Prism, and more
- **Dark/light mode** — Follows system preference
- **Live reload** — Auto-refresh when files change on disk
- **Keyboard shortcuts** — Cmd+O (open folder), Cmd+W (close)
- **File list** — Sorted by modification time (newest first)
- **Three foundational themes:**
  - **Light** — Clean, sans-serif, white background
  - **Dark** — Scholarly serif reading, warm dark tones
  - **Deep Narrative** — Book-like chapters, gold accents

## Setup (one-time, optional)

To launch without permission prompts, add to `~/.claude/settings.json`:

```json
{
  "permissions": {
    "allow": [
      "Bash(electron:*)",
      "Bash(*velvetmd*:*)"
    ]
  }
}
```
