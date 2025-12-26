/**
 * File System Access API type declarations
 * These APIs are available in modern browsers (Chrome, Edge, Opera)
 * @see https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API
 */

interface FilePickerAcceptType {
  description?: string;
  accept: Record<string, string[]>;
}

interface SaveFilePickerOptions {
  suggestedName?: string;
  types?: FilePickerAcceptType[];
  excludeAcceptAllOption?: boolean;
}

interface OpenFilePickerOptions {
  multiple?: boolean;
  types?: FilePickerAcceptType[];
  excludeAcceptAllOption?: boolean;
}

interface FileSystemWritableFileStream extends WritableStream {
  write(data: BufferSource | Blob | string): Promise<void>;
  seek(position: number): Promise<void>;
  truncate(size: number): Promise<void>;
}

interface FileSystemFileHandle {
  kind: 'file';
  name: string;
  getFile(): Promise<File>;
  createWritable(): Promise<FileSystemWritableFileStream>;
}

interface FileSystemDirectoryHandle {
  kind: 'directory';
  name: string;
}

declare global {
  interface Window {
    showSaveFilePicker(options?: SaveFilePickerOptions): Promise<FileSystemFileHandle>;
    showOpenFilePicker(options?: OpenFilePickerOptions): Promise<FileSystemFileHandle[]>;
    showDirectoryPicker(): Promise<FileSystemDirectoryHandle>;
  }
}

export { };

