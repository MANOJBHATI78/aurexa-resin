/** Convert a YouTube/Vimeo/direct video URL into an embeddable URL. Returns null if not embeddable. */
export function toVideoEmbed(url: string | null | undefined): string | null {
  if (!url) return null;
  const u = url.trim();
  // YouTube watch / share / short links
  const yt = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  // Vimeo
  const vm = u.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  // Direct mp4/webm — render with <video> tag, not iframe
  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(u)) return u;
  return null;
}

/** true when the embed URL is a direct video file (use <video>) rather than an iframe */
export function isDirectVideo(url: string): boolean {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
}
