// Only allow redirects to paths on this site.
export const safeNext = (n) => (n && n.startsWith("/") && !n.startsWith("//") ? n : "/");
