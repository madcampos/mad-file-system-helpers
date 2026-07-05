# file-system-helpers

A collection of lightweight TypeScript helpers for the [File System API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API). Designed to simplify working with both the user-facing File System Access API and the Origin Private File System (OPFS).

## Features

- **OPFS Helpers**: File and directory helper functions for common operations (read, save, copy, move, delete).
- **Path Utilities**: node.js inspired path manipulation functions.
- **File System Access Helpers**: Wrappers of `showOpenFilePicker`, `showSaveFilePicker`, and `showDirectoryPicker` with permission checking.
- **Persistence**: Store and retrieve `FileSystemHandle` objects in IndexedDB to maintain access across browser sessions.
- **Permissions Management**: Helpers to check and get permissions for files and directories.

## Installation

```bash
npm install @mad-c/file-system-helpers
```

## Usage

### Origin Private File System (OPFS) Helpers

Resolve handles deeply within the OPFS structure.

```typescript
import { getDirHandle, getFileHandle } from 'mad-file-system-helpers';

// Get a file handle, creating directories recursively and the file reference
const fileHandle = await getFileHandle('/path/to/my-file.txt', {
	touch: true,
	recursive: true
});

// Get a directory handle, creating directories recursively
const dirHandle = await getDirHandle('/projects/web/src', {
	recursive: true
});
```

### Path Utilities

A set of path helpers inspired by node.js' `path` module but made to work directly with the browser and be easy to work with the OPFS.

> [!NOTE]
> All functions will use a forward slash (`/`) as the path separator.
> Browsers normalize paths to use this convention even on Windows.
> The path manipulation API is simplified byt not handling backslashes (`\`)

```typescript
import { basename, dirname, extname, resolve } from 'mad-file-system-helpers';

basename('/path/to/file.txt'); // 'file.txt'
dirname('/path/to/file.txt'); // '/path/to'
extname('/path/to/file.txt'); // '.txt'
resolve('folder', 'subfolder', 'file.js'); // '/folder/subfolder/file.js'
```

### File System Access Helpers

> [!WARNING]
> This API is supported only on Chromium based browsers.

Improve interactions with the user's local file system.

```typescript
import { getUserOpenFileHandle, getUserSaveFileHandle } from 'mad-file-system-helpers';

// Show the user a file picker with automatic permission handling
const handle = await getUserOpenFileHandle({
	types: [{ description: 'Text files', accept: { 'text/plain': ['.txt'] } }]
}, 'readwrite');

if (handle) {
	// Work with the handle...
}
```

### Persistence

[Saves handles to IndexedDB](https://developer.chrome.com/docs/capabilities/web-apis/file-system-access?authuser=1#permission_persistence) allowing to access the handle again on a new browser session (page reload, new tab, etc.).

```typescript
import { getHandle, saveHandle } from 'mad-file-system-helpers';

// Save a handle, with a defined id, and any metadata.
await saveHandle('id-for-the-handle', handle, metadata);

// On another day, a new browser session...
const saved = await getHandle('id-for-the-handle');
if (saved) {
	const { handle, metadata } = saved;

	// Use the handle...
}
```
