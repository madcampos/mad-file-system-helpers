# `fs-access.md`

<!-- TSDOC_START -->

## Functions

- [checkPickersAvailability](#checkpickersavailability)
- [getUserOpenFileHandle](#getuseropenfilehandle)
- [getUserSaveFileHandle](#getusersavefilehandle)
- [getUserDirHandle](#getuserdirhandle)
- [saveHandle](#savehandle)
- [getHandle](#gethandle)

### checkPickersAvailability

| Function | Type |
| ---------- | ---------- |
| `checkPickersAvailability` | `() => { openFile: boolean; saveFile: boolean; dir: boolean; all: boolean; }` |

### getUserOpenFileHandle

| Function | Type |
| ---------- | ---------- |
| `getUserOpenFileHandle` | `(options?: OpenFilePickerOptions, permissions?: FileSystemPermissionMode) => Promise<any>` |

### getUserSaveFileHandle

| Function | Type |
| ---------- | ---------- |
| `getUserSaveFileHandle` | `(options?: SaveFilePickerOptions) => Promise<any>` |

### getUserDirHandle

| Function | Type |
| ---------- | ---------- |
| `getUserDirHandle` | `(options?: DirectoryPickerOptions, permissions?: FileSystemPermissionMode) => Promise<any>` |

### saveHandle

| Function | Type |
| ---------- | ---------- |
| `saveHandle` | `<TMetadata = unknown>(id: string, handle: FileSystemHandle, metadata?: TMetadata or undefined) => Promise<void>` |

### getHandle

| Function | Type |
| ---------- | ---------- |
| `getHandle` | `<TMetadata = unknown>(id: string) => Promise<{ handle: FileSystemHandle; metadata?: TMetadata or undefined; } or undefined>` |



<!-- TSDOC_END -->
