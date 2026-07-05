# `opfs.md`

<!-- TSDOC_START -->

## Functions

- [getDirHandle](#getdirhandle)
- [resolveParentHandle](#resolveparenthandle)
- [getFileHandle](#getfilehandle)
- [checkDirExists](#checkdirexists)
- [checkFileExists](#checkfileexists)
- [listDirEntries](#listdirentries)
- [writeFile](#writefile)
- [appendFile](#appendfile)
- [removeDir](#removedir)
- [removeFile](#removefile)
- [copyDir](#copydir)
- [copyFile](#copyfile)
- [moveDir](#movedir)
- [moveFile](#movefile)

### getDirHandle

Gets the directory handle for a given path.

| Function | Type |
| ---------- | ---------- |
| `getDirHandle` | `(path: string, { rootDir, recursive }?: GetDirHandleOptions) => Promise<FileSystemDirectoryHandle>` |

Parameters:

* `path`: The path to get a directory handle.
* `options`: The options for function.


### resolveParentHandle

Resolves the parent item for this path or handle.

If the root of the file system is passed, it returns the root itself.

| Function | Type |
| ---------- | ---------- |
| `resolveParentHandle` | `(pathOrHandle: string or FileSystemHandle, { recursive, rootDir }?: GetDirHandleOptions) => Promise<{ parentHandle: FileSystemDirectoryHandle; parentPath: string; name: any; }>` |

Parameters:

* `pathOrHandle`: A path string or a 
* `options`: The options for function.


### getFileHandle

Gets a file handle for a given path. Optionally creating the file if it doesn't exist.

| Function | Type |
| ---------- | ---------- |
| `getFileHandle` | `(path: string, { touch, recursive, rootDir }?: GetFileHandleOptions) => Promise<FileSystemFileHandle>` |

Parameters:

* `path`: A path string for the file.
* `options`: The options for function.


### checkDirExists

| Function | Type |
| ---------- | ---------- |
| `checkDirExists` | `(path: string, { rootDir }?: CheckDirExistsOptions) => Promise<boolean>` |

### checkFileExists

| Function | Type |
| ---------- | ---------- |
| `checkFileExists` | `(path: string, { rootDir }?: CheckFileExistsOptions) => Promise<boolean>` |

### listDirEntries

Lists the directory contents recursivelly up to the `depth` provided.

It returns an array of items, if the item have children and the depth is not exceeded, the children property will be filled.

| Function | Type |
| ---------- | ---------- |
| `listDirEntries` | `(pathOrHandle: string or FileSystemDirectoryHandle, { depth, rootDir }?: ListDirEntriesOptions) => Promise<FileSystemEntry[]>` |

Parameters:

* `pathOrHandle`: A path string or a 
* `options`: The options for function.


### writeFile

Write data to a file, overwriting existing data.

| Function | Type |
| ---------- | ---------- |
| `writeFile` | `(pathOrHandle: string or FileSystemFileHandle, data: FileSystemWriteChunkType, { recursive, rootDir, overwrite }?: WriteFileHandleOptions) => Promise<...>` |

Parameters:

* `pathOrHandle`: A path string or a 
* `data`: The data to write to the file.
* `options`: The options for function.


### appendFile

Appends data to the end of a file.

| Function | Type |
| ---------- | ---------- |
| `appendFile` | `(pathOrHandle: string or FileSystemFileHandle, data: FileSystemWriteChunkType, { recursive, rootDir }?: AppendFileHandleOptions) => Promise<...>` |

Parameters:

* `pathOrHandle`: A path string or a 
* `data`: The data to append to the file.
* `options`: The options for function.


### removeDir

Deletes a directory, optionally also deleting it's contents recursivelly.

If the directory is the root of the file system, all children will be deleted but the root directory itself will be kept.

| Function | Type |
| ---------- | ---------- |
| `removeDir` | `(pathOrHandle: string or FileSystemDirectoryHandle, { recursive, rootDir }: RemoveDirOptions) => Promise<void>` |

Parameters:

* `pathOrHandle`: A path string or a 
* `options`: The options for function.


### removeFile

Deletes a file.

| Function | Type |
| ---------- | ---------- |
| `removeFile` | `(pathOrHandle: string or FileSystemFileHandle, { rootDir }?: RemoveFileOptions) => Promise<void>` |

Parameters:

* `pathOrHandle`: A path string or a 
* `options`: The options for function.


### copyDir

Copies a directory from one location to another.

| Function | Type |
| ---------- | ---------- |
| `copyDir` | `(sourcePathOrHandle: string or FileSystemDirectoryHandle, destinationPathOrHandle: string or FileSystemDirectoryHandle, { overwrite, rootDir, recursive }?: CopyDirOptions) => Promise<...>` |

Parameters:

* `sourcePathOrHandle`: The path string or a 
* `destinationPathOrHandle`: The path string or a 
* `options`: The options for function.


### copyFile

Copies a file from one location to another.

| Function | Type |
| ---------- | ---------- |
| `copyFile` | `(sourcePathOrHandle: string or FileSystemFileHandle, destinationPathOrHandle: string or FileSystemFileHandle, { overwrite, rootDir, recursive }?: CopyDirOptions) => Promise<...>` |

Parameters:

* `sourcePathOrHandle`: The path string or a 
* `destinationPathOrHandle`: The path string or a 
* `options`: The options for function.


### moveDir

Moves a directory from one location to another.

| Function | Type |
| ---------- | ---------- |
| `moveDir` | `(sourcePathOrHandle: string or FileSystemDirectoryHandle, destinationPathOrHandle: string or FileSystemDirectoryHandle, { overwrite, rootDir, recursive }?: CopyDirOptions) => Promise<...>` |

Parameters:

* `sourcePathOrHandle`: The path string or a 
* `destinationPathOrHandle`: The path string or a 
* `options`: The options for function.


### moveFile

Moves a file from one location to another.

| Function | Type |
| ---------- | ---------- |
| `moveFile` | `(sourcePathOrHandle: string or FileSystemFileHandle, destinationPathOrHandle: string or FileSystemFileHandle, { overwrite, rootDir, recursive }?: CopyDirOptions) => Promise<...>` |

Parameters:

* `sourcePathOrHandle`: The path string or a 
* `destinationPathOrHandle`: The path string or a 
* `options`: The options for function.




## Interfaces

- [GetDirHandleOptions](#getdirhandleoptions)
- [GetFileHandleOptions](#getfilehandleoptions)
- [CheckDirExistsOptions](#checkdirexistsoptions)
- [CheckFileExistsOptions](#checkfileexistsoptions)
- [ListDirEntriesOptions](#listdirentriesoptions)
- [FileSystemEntry](#filesystementry)
- [WriteFileHandleOptions](#writefilehandleoptions)
- [AppendFileHandleOptions](#appendfilehandleoptions)
- [RemoveDirOptions](#removediroptions)
- [RemoveFileOptions](#removefileoptions)
- [CopyDirOptions](#copydiroptions)
- [CopyFileOptions](#copyfileoptions)
- [MoveDirOptions](#movediroptions)
- [MoveFileOptions](#movefileoptions)

### GetDirHandleOptions



| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `recursive` | `boolean or undefined` | Creates the directory structure if it doesn't exist. Throws an error otherwise |
| `rootDir` | `FileSystemDirectoryHandle or undefined` | The file system root directory to resolve against. If not provided the Origin Private File System root will be used.  {@link https://developer.mozilla.org/en-US/docs/Web/API/File_System_API#origin_private_file_system MDN Reference} |


### GetFileHandleOptions



| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `touch` | `boolean or undefined` | Creates the file if it doesn't exist. Throws an error otherwise |
| `recursive` | `boolean or undefined` | Creates the directory structure if it doesn't exist. Throws an error otherwise |
| `rootDir` | `FileSystemDirectoryHandle or undefined` | The file system root directory to resolve against. If not provided the Origin Private File System root will be used.  {@link https://developer.mozilla.org/en-US/docs/Web/API/File_System_API#origin_private_file_system MDN Reference} |


### CheckDirExistsOptions



| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `rootDir` | `FileSystemDirectoryHandle or undefined` | The file system root directory to resolve against. If not provided the Origin Private File System root will be used.  {@link https://developer.mozilla.org/en-US/docs/Web/API/File_System_API#origin_private_file_system MDN Reference} |


### CheckFileExistsOptions



| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `rootDir` | `FileSystemDirectoryHandle or undefined` | The file system root directory to resolve against. If not provided the Origin Private File System root will be used.  {@link https://developer.mozilla.org/en-US/docs/Web/API/File_System_API#origin_private_file_system MDN Reference} |


### ListDirEntriesOptions



| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `depth` | `number or undefined` | The depth to recurse on the directory tree. It defaults to 0 |
| `rootDir` | `FileSystemDirectoryHandle or undefined` | The file system root directory to resolve against. If not provided the Origin Private File System root will be used.  {@link https://developer.mozilla.org/en-US/docs/Web/API/File_System_API#origin_private_file_system MDN Reference} |


### FileSystemEntry



| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `name` | `string` |  |
| `handle` | `FileSystemHandle` |  |
| `children` | `FileSystemEntry[] or undefined` |  |


### WriteFileHandleOptions



| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `recursive` | `boolean or undefined` | Creates the directory structure if it doesn't exist. Throws an error otherwise |
| `overwrite` | `boolean or undefined` | Overwrites the file if it exists. |
| `rootDir` | `FileSystemDirectoryHandle or undefined` | The file system root directory to resolve against. If not provided the Origin Private File System root will be used.  {@link https://developer.mozilla.org/en-US/docs/Web/API/File_System_API#origin_private_file_system MDN Reference} |


### AppendFileHandleOptions



| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `recursive` | `boolean or undefined` | Creates the directory structure if it doesn't exist. Throws an error otherwise |
| `rootDir` | `FileSystemDirectoryHandle or undefined` | The file system root directory to resolve against. If not provided the Origin Private File System root will be used.  {@link https://developer.mozilla.org/en-US/docs/Web/API/File_System_API#origin_private_file_system MDN Reference} |


### RemoveDirOptions



| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `recursive` | `boolean or undefined` | If the directory has children and this is set to `true`, removes the children. If it is set to `false` and the directory has children, throws an error. If the directory has no children, this has no effect. |
| `rootDir` | `FileSystemDirectoryHandle or undefined` | The file system root directory to resolve against. If not provided the Origin Private File System root will be used.  {@link https://developer.mozilla.org/en-US/docs/Web/API/File_System_API#origin_private_file_system MDN Reference} |


### RemoveFileOptions



| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `rootDir` | `FileSystemDirectoryHandle or undefined` | The file system root directory to resolve against. If not provided the Origin Private File System root will be used.  {@link https://developer.mozilla.org/en-US/docs/Web/API/File_System_API#origin_private_file_system MDN Reference} |


### CopyDirOptions



| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `recursive` | `boolean or undefined` | Creates the destination directory structure if it doesn't exist. Throws an error otherwise |
| `overwrite` | `boolean or undefined` | Overwrites existing files in the destination. |
| `rootDir` | `FileSystemDirectoryHandle or undefined` | The file system root directory to resolve against. If not provided the Origin Private File System root will be used.  {@link https://developer.mozilla.org/en-US/docs/Web/API/File_System_API#origin_private_file_system MDN Reference} |


### CopyFileOptions



| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `recursive` | `boolean or undefined` | Creates the destination directory structure if it doesn't exist. Throws an error otherwise |
| `overwrite` | `boolean or undefined` | Overwrites the file in the destination if it already exists. |
| `rootDir` | `FileSystemDirectoryHandle or undefined` | The file system root directory to resolve against. If not provided the Origin Private File System root will be used.  {@link https://developer.mozilla.org/en-US/docs/Web/API/File_System_API#origin_private_file_system MDN Reference} |


### MoveDirOptions



| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `recursive` | `boolean or undefined` | Creates the destination directory structure if it doesn't exist. Throws an error otherwise |
| `overwrite` | `boolean or undefined` | Overwrites existing files in the destination. |
| `rootDir` | `FileSystemDirectoryHandle or undefined` | The file system root directory to resolve against. If not provided the Origin Private File System root will be used.  {@link https://developer.mozilla.org/en-US/docs/Web/API/File_System_API#origin_private_file_system MDN Reference} |


### MoveFileOptions



| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `recursive` | `boolean or undefined` | Creates the destination directory structure if it doesn't exist. Throws an error otherwise |
| `overwrite` | `boolean or undefined` | Overwrites the file in the destination if it already exists. |
| `rootDir` | `FileSystemDirectoryHandle or undefined` | The file system root directory to resolve against. If not provided the Origin Private File System root will be used.  {@link https://developer.mozilla.org/en-US/docs/Web/API/File_System_API#origin_private_file_system MDN Reference} |


<!-- TSDOC_END -->
