// Backslashes and control characters can turn an apparent local path into an external URL.
export const safeNext = (value) => {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u0020\u007f]/.test(value)) return "/";
  return value;
};
