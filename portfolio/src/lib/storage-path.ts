const PUBLIC_URL_MARKER = "/storage/v1/object/public/";

/** Reverses getPublicUrl(): full public URL -> path within the bucket. */
export function extractStoragePath(publicUrl: string, bucket: string): string {
  const marker = `${PUBLIC_URL_MARKER}${bucket}/`;
  const index = publicUrl.indexOf(marker);
  if (index === -1) return publicUrl;
  return publicUrl.slice(index + marker.length);
}

export function fileNameFromStoragePath(path: string): string {
  const last = path.split("/").pop() ?? path;
  // Uploads are named `${uuid}-${originalFileName}`; strip the uuid prefix for display.
  const dashIndex = last.indexOf("-");
  return dashIndex > -1 && dashIndex === 36 ? last.slice(dashIndex + 1) : last;
}
