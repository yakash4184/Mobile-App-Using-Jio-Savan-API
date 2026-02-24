import { SearchSongsResult, Song } from "../types/music";

const API_BASE_URL = "https://saavn.sumit.co";

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null;

const parseNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
};

const parseQualityScore = (quality: string): number => {
  const numeric = quality.match(/\d+/g);
  if (!numeric || numeric.length === 0) {
    return 0;
  }

  return Number(numeric[numeric.length - 1]) || 0;
};

const pickHighestQualityUrl = (value: unknown): string => {
  if (!Array.isArray(value) || value.length === 0) {
    return "";
  }

  const candidates = value
    .filter(isRecord)
    .map((item) => {
      const quality = typeof item.quality === "string" ? item.quality : "0";
      const url =
        typeof item.url === "string"
          ? item.url
          : typeof item.link === "string"
            ? item.link
            : "";

      return {
        quality,
        score: parseQualityScore(quality),
        url
      };
    })
    .filter((item) => item.url.length > 0)
    .sort((a, b) => b.score - a.score);

  return candidates[0]?.url ?? "";
};

const normalizeSong = (rawSong: unknown): Song => {
  const song = isRecord(rawSong) ? rawSong : {};
  const album = isRecord(song.album) ? song.album : {};

  return {
    id: typeof song.id === "string" ? song.id : "",
    name: typeof song.name === "string" ? song.name : "Unknown title",
    artists:
      typeof song.primaryArtists === "string"
        ? song.primaryArtists
        : isRecord(song.artists) && Array.isArray(song.artists.primary)
          ? song.artists.primary
              .filter(isRecord)
              .map((artist) =>
                typeof artist.name === "string" ? artist.name : ""
              )
              .filter((name) => name.length > 0)
              .join(", ")
          : "Unknown artist",
    albumName:
      typeof album.name === "string"
        ? album.name
        : typeof song.album?.toString === "function"
          ? song.album.toString()
          : "Unknown album",
    durationSec: parseNumber(song.duration),
    imageUrl: pickHighestQualityUrl(song.image),
    streamUrl: pickHighestQualityUrl(song.downloadUrl),
    language: typeof song.language === "string" ? song.language : "unknown"
  };
};

async function fetchJson(path: string): Promise<unknown> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json();
}

export async function searchSongs(
  query: string,
  page = 1,
  limit = 20
): Promise<SearchSongsResult> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return {
      songs: [],
      total: 0,
      page,
      hasMore: false
    };
  }

  const params = new URLSearchParams({
    query: trimmedQuery,
    page: String(page),
    limit: String(limit)
  });

  const raw = await fetchJson(`/api/search/songs?${params.toString()}`);
  const result = isRecord(raw) ? raw : {};
  const data = isRecord(result.data) ? result.data : {};
  const rawSongs = Array.isArray(data.results) ? data.results : [];

  const songs = rawSongs.map(normalizeSong).filter((song) => song.id.length > 0);
  const total = parseNumber(data.total, songs.length);

  return {
    songs,
    total,
    page,
    hasMore: page * limit < total || rawSongs.length === limit
  };
}

export async function fetchSongDetails(songId: string): Promise<Partial<Song>> {
  const raw = await fetchJson(`/api/songs/${songId}`);
  const result = isRecord(raw) ? raw : {};
  const data = result.data;
  const candidate = Array.isArray(data) ? data[0] : data;

  if (!candidate) {
    return {};
  }

  const normalized = normalizeSong(candidate);

  return {
    name: normalized.name,
    artists: normalized.artists,
    albumName: normalized.albumName,
    durationSec: normalized.durationSec,
    imageUrl: normalized.imageUrl,
    streamUrl: normalized.streamUrl,
    language: normalized.language
  };
}
