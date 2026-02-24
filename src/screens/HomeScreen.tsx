import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { searchSongs } from "../api/saavn";
import { SongListItem } from "../components/SongListItem";
import { RootStackParamList } from "../navigation/types";
import { usePlayerStore } from "../store/usePlayerStore";
import { Song } from "../types/music";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

const PAGE_SIZE = 20;

export function HomeScreen({ navigation }: Props): React.JSX.Element {
  const [query, setQuery] = useState("arijit");
  const [songs, setSongs] = useState<Song[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setQueueAndPlay = usePlayerStore((state) => state.setQueueAndPlay);
  const addToQueue = usePlayerStore((state) => state.addToQueue);

  const trimmedQuery = useMemo(() => query.trim(), [query]);

  const fetchPage = async (targetPage: number, append: boolean): Promise<void> => {
    if (!trimmedQuery) {
      setSongs([]);
      setHasMore(false);
      setPage(1);
      return;
    }

    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      setError(null);
      const result = await searchSongs(trimmedQuery, targetPage, PAGE_SIZE);

      setSongs((prev) => {
        if (!append) {
          return result.songs;
        }

        const seen = new Set(prev.map((song) => song.id));
        const uniqueNewSongs = result.songs.filter((song) => !seen.has(song.id));
        return [...prev, ...uniqueNewSongs];
      });

      setPage(targetPage);
      setHasMore(result.hasMore);
    } catch (fetchError) {
      const message =
        fetchError instanceof Error
          ? fetchError.message
          : "Failed to load songs from API";
      setError(message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchPage(1, false);
    }, 350);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trimmedQuery]);

  const handleLoadMore = (): void => {
    if (!hasMore || loading || loadingMore) {
      return;
    }

    void fetchPage(page + 1, true);
  };

  const handlePlayFromSearch = (index: number): void => {
    void setQueueAndPlay(songs, index);
    navigation.navigate("Player");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Music Search</Text>
        <Text style={styles.subheading}>JioSaavn API based player</Text>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search songs or artists"
          placeholderTextColor="#6B7280"
          style={styles.input}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
        <Pressable
          style={styles.queueButton}
          onPress={() => navigation.navigate("Queue")}
        >
          <Text style={styles.queueButtonText}>Queue</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="small" color="#111827" />
          <Text style={styles.centerStateText}>Loading songs...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            style={styles.retryButton}
            onPress={() => {
              void fetchPage(1, false);
            }}
          >
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={songs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onEndReachedThreshold={0.4}
          onEndReached={handleLoadMore}
          renderItem={({ item, index }) => (
            <SongListItem
              song={item}
              onPlay={() => handlePlayFromSearch(index)}
              onAddToQueue={() => addToQueue(item)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.centerState}>
              <Text style={styles.centerStateText}>
                No songs found. Try a different search.
              </Text>
            </View>
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color="#111827" />
              </View>
            ) : null
          }
        />
      )}

      <Pressable
        style={styles.floatingButton}
        onPress={() => navigation.navigate("Player")}
      >
        <Text style={styles.floatingButtonText}>Now Playing</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 14,
    paddingTop: 10
  },
  header: {
    marginBottom: 12
  },
  heading: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827"
  },
  subheading: {
    fontSize: 13,
    color: "#4B5563"
  },
  searchRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10
  },
  input: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    color: "#111827"
  },
  queueButton: {
    borderRadius: 12,
    backgroundColor: "#111827",
    justifyContent: "center",
    paddingHorizontal: 14
  },
  queueButtonText: {
    color: "#FFFFFF",
    fontWeight: "700"
  },
  listContent: {
    paddingBottom: 140,
    gap: 10
  },
  centerState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
    gap: 10
  },
  centerStateText: {
    color: "#374151",
    fontSize: 14
  },
  errorText: {
    color: "#B91C1C",
    fontWeight: "600",
    textAlign: "center"
  },
  retryButton: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#111827"
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "600"
  },
  loadingMore: {
    paddingVertical: 16
  },
  floatingButton: {
    position: "absolute",
    right: 14,
    bottom: 90,
    borderRadius: 20,
    backgroundColor: "#111827",
    paddingHorizontal: 14,
    paddingVertical: 9
  },
  floatingButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12
  }
});
