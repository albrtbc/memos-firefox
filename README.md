# Memos Browser Extension (Custom Fork)

A custom fork of [memos-bber](https://github.com/lmm214/memos-bber) — a browser extension for quickly capturing notes to your self-hosted [Memos](https://github.com/albrtbc/memos) instance. Supports both Firefox and Chrome.

[![Upstream](https://img.shields.io/badge/upstream-lmm214%2Fmemos--bber-blue?style=flat-square)](https://github.com/lmm214/memos-bber)

## Changes from upstream

### Memos v0.26+ API Compatibility

The upstream extension only supported up to Memos v0.22.3. This fork brings full compatibility with the v0.26+ API, including migration to CEL filter syntax for search and random memo features.

### UI/UX Improvements

- **Icon-based visibility selector** — Replaced text labels with Lucide icons matching the Memos web UI, restyled as a toolbar dropdown
- **Clear button** — Added a clear button to reset the input field, with correct storage cleanup
- **Close-on-outside-click** — Dropdowns close when clicking outside

### Smart URL Handling

- Inserts plain URLs (instead of markdown links) for YouTube, Twitter/X, and Reddit links, since Memos renders these with rich embeds natively

### State Persistence

- Auto-saves all input fields to preserve state when the popup is closed and reopened

### Localization

- Fully translated all remaining Chinese UI text to English

### Chrome Support

- The extension now builds for both Firefox and Chrome from the same codebase

### CI/CD

- Release Please automation for versioning and releases
- AMO (addons.mozilla.org) auto-publish via GitHub Actions

## Installation

This extension is not published on any store. Download the latest release from the [Releases](https://github.com/albrtbc/memos-firefox/releases/latest) page.

### Firefox

1. Download the `.xpi` file from Releases
2. Open `about:addons` in Firefox
3. Click the gear icon and select "Install Add-on From File..."
4. Select the downloaded `.xpi` file

### Chrome

1. Download the Chrome `.zip` from Releases and extract it
2. Open `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extracted folder

## Compatibility

This extension is designed to work with the [albrtbc/memos](https://github.com/albrtbc/memos) backend (v0.26+). It may not be compatible with the upstream usememos/memos or other forks.

## Ecosystem

| App | Description | Repository |
|-----|-------------|------------|
| **Memos** | Server — API + web frontend | [albrtbc/memos](https://github.com/albrtbc/memos) |
| **Memos Firefox/Chrome** (this repo) | Browser extension | [albrtbc/memos-firefox](https://github.com/albrtbc/memos-firefox) |
| **GS Memos** | Android app | [albrtbc/MoeMemosAndroid](https://github.com/albrtbc/MoeMemosAndroid) |

## License

This project is open-source software licensed under the [MIT License](LICENSE).
