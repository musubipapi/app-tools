export function formatFileSize(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }
  const kbSize = size / 1024;
  if (kbSize < 100) {
    return `${kbSize.toFixed(2)} KB`;
  }
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}
