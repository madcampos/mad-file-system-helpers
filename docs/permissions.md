# `permissions.md`

<!-- TSDOC_START -->

## Functions

- [getHandlePermisions](#gethandlepermisions)
- [requestHandlePermissions](#requesthandlepermissions)

### getHandlePermisions

Get the current permission state for the handle.

| Function | Type |
| ---------- | ---------- |
| `getHandlePermisions` | `(handle: FileSystemHandle, permissions?: FileSystemPermissionMode) => Promise<any>` |

Parameters:

* `handle`: The handle to check permissions.
* `permissions`: The permission type to check.


### requestHandlePermissions

Checks and then request for permissions for a given handle.

| Function | Type |
| ---------- | ---------- |
| `requestHandlePermissions` | `(handle: FileSystemHandle, permissions?: FileSystemPermissionMode) => Promise<void>` |

Parameters:

* `handle`: The handle to request permissions.
* `permissions`: The permission type to get.




<!-- TSDOC_END -->
