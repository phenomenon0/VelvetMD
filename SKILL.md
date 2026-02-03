---
name: velvetmd
description: Preview markdown files in a beautiful native desktop viewer. Use when the user wants to view, preview, or present markdown documents with a polished UI. Supports file watching for live updates. Two modes - browse folder or session files created during this conversation.
---

# VelvetMD

A native Electron-based markdown viewer with file browser, live reload, and Obsidian-compatible theming.

## When to use

Use VelvetMD when:
- User asks to "preview", "view", or "show" a markdown file
- User wants to present or review documentation
- User needs a distraction-free reading experience
- User wants live preview while editing markdown
- User says "view markdowns here" or similar (use folder mode with cwd)
- User wants to see markdown files created during this session

## Modes

### 1. Folder Mode (browse all .md files in a directory)

```bash
/home/omen/Documents/Project/ProToolz/skills/velvetmd/velvetmd /path/to/folder/ &
```

### 2. Single File Mode

```bash
/home/omen/Documents/Project/ProToolz/skills/velvetmd/velvetmd /path/to/file.md &
```

### 3. Session Mode (specific files only)

Use this when showing markdown files created during this Claude session:

```bash
/home/omen/Documents/Project/ProToolz/skills/velvetmd/velvetmd --session /path/to/file1.md /path/to/file2.md &
```

**IMPORTANT**: Session mode shows ONLY the specified files in a flat list, sorted by modification time. This is ideal for showing just the documents created during the current conversation.

## How to choose mode

- **"view markdowns here"** or **"preview docs folder"** → Folder mode with current working directory or specified folder
- **"show the markdown files we created"** or **"preview the reports"** → Session mode with specific file paths
- **"preview README.md"** → Single file mode

## Launch command

The skill binary is located at:

```
/home/omen/Documents/Project/ProToolz/skills/velvetmd/velvetmd
```

Always background the process with `&` so it doesn't block.

## Features

- **Flat file list**: Shows .md files at top level, sorted by modification time (newest first)
- **Live reload**: Auto-refresh when files change externally
- **Three foundational themes** (from technical-explainer):
  - **Light** - Clean MakingSoftware style, sans-serif body, white background
  - **Dark (Gwern)** - Scholarly reading, serif body (Source Serif 4), warm dark (#1a1815)
  - **Deep Narrative** - Book-like chapters, gold accent (#e6a756), for long-form reading
- **SVG icons**: Clean document/folder icons, no emoji
- **Tight typography**: Proper line-height, letter-spacing, heading hierarchy
- **Keyboard shortcuts**:
  - `Cmd+O` / `Ctrl+O`: Open folder
  - `Cmd+W`: Close window

## Example workflows

### User says "view markdowns here"

```bash
/home/omen/Documents/Project/ProToolz/skills/velvetmd/velvetmd "$(pwd)" &
```

### User says "show me the docs folder"

```bash
/home/omen/Documents/Project/ProToolz/skills/velvetmd/velvetmd ./docs/ &
```

### User says "preview the reports we made" (after creating REPORT.md and SUMMARY.md)

```bash
/home/omen/Documents/Project/ProToolz/skills/velvetmd/velvetmd --session /absolute/path/REPORT.md /absolute/path/SUMMARY.md &
```

### User says "preview README.md"

```bash
/home/omen/Documents/Project/ProToolz/skills/velvetmd/velvetmd "$(pwd)/README.md" &
```
