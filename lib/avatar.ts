import { createAvatar } from "@dicebear/core";
import { botttsNeutral } from "@dicebear/collection";

export function generateAvatar(seed: string) {
  const svg = createAvatar(botttsNeutral, {
    seed,
    size: 128,
  }).toString();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
