const STEAM_IMAGE_HOSTS = new Set([
  'shared.akamai.steamstatic.com',
  'store.akamai.steamstatic.com',
  'cdn.akamai.steamstatic.com',
  'cdn.cloudflare.steamstatic.com',
]);

export function allowedSteamImageUrl(candidate?: string | null) {
  if (!candidate) {
    return null;
  }

  try {
    const host = new URL(candidate).hostname;

    if (STEAM_IMAGE_HOSTS.has(host)) {
      return candidate;
    }
  } catch {
    return null;
  }

  return null;
}

export function releaseYear(releaseDate: string | null) {
  return releaseDate?.match(/\d{4}/)?.[0] ?? null;
}
