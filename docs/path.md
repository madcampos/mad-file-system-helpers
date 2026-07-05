# `path.md`

<!-- TSDOC_START -->

## Functions

- [pathToSegments](#pathtosegments)
- [dirname](#dirname)
- [basename](#basename)
- [extname](#extname)
- [resolve](#resolve)
- [encodePath](#encodepath)
- [decodePath](#decodepath)

### pathToSegments

Split a path string into segments and normalize it.

The normalization does the following:
- Removes empty path segments.
- Decode from URI parts to handle paths coming from URLs.

| Function | Type |
| ---------- | ---------- |
| `pathToSegments` | `(path: string) => string[]` |

Parameters:

* `path`: The path to split into segments


### dirname

Returns the directory name, given a path string.
It is similar to node's `dirname` fucntion.

| Function | Type |
| ---------- | ---------- |
| `dirname` | `(path: string) => string` |

Parameters:

* `path`: The path to get the directory name


### basename

Returns the name for the last part of a given path string.
It is similar to node's `basename` function.

| Function | Type |
| ---------- | ---------- |
| `basename` | `(path: string, suffix?: string or undefined) => any` |

Parameters:

* `path`: The path to get the last part.
* `suffix`: An optional extension to remove from the item, like an extension.


### extname

Returns the extension of the path, from the last occurrence of the `.` (dot) to the end of the string.
Returns an empty string if there is no dot or if the only dot is in the start of the string.
It is similar to node's `extname` function.

| Function | Type |
| ---------- | ---------- |
| `extname` | `(path: string) => any` |

Parameters:

* `path`: The path to get the extension


### resolve

Resolves a sequence of paths or path segments into an absolute path.
It is similar to node's `resolve` function.

**Note**: If no absolute path is provided, the function prepends a `/`. It assumes the starting point is _always_ the file system root.

| Function | Type |
| ---------- | ---------- |
| `resolve` | `(...paths: string[]) => string` |

Parameters:

* `paths`: A sequence of paths or path segments


### encodePath

Encodes a path string, taking care of restricted characters and names and converting them to percent encoded characters.

| Function | Type |
| ---------- | ---------- |
| `encodePath` | `(path: string, replacer?: ((segment: string) => string) or undefined) => string` |

Parameters:

* `path`: The path to encode.
* `replacer`: A custom replacer function that will be invoked for each segment of the path.


### decodePath

Decodes a path string, converting back from perdent encoded characters.

| Function | Type |
| ---------- | ---------- |
| `decodePath` | `(path: string, replacer?: ((segment: string) => string) or undefined) => string` |

Parameters:

* `path`: The path to decode.
* `replacer`: A custom replacer function that will be invoked for each segment of the path.




<!-- TSDOC_END -->
