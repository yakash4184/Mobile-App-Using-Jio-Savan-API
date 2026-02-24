export interface Song {
  id: string;
  name: string;
  artists: string;
  albumName: string;
  durationSec: number;
  imageUrl: string;
  streamUrl: string;
  language: string;
}

export interface SearchSongsResult {
  songs: Song[];
  total: number;
  page: number;
  hasMore: boolean;
}

export type RepeatMode = "off" | "all" | "one";
