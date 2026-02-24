import React, { useMemo, useState } from "react";
import {
  Image,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { usePlayerStore } from "../store/usePlayerStore";
import { formatMillis } from "../utils/time";

type Props = NativeStackScreenProps<RootStackParamList, "Player">;

export function PlayerScreen({ navigation }: Props): React.JSX.Element {
  const queue = usePlayerStore((state) => state.queue);
  const currentIndex = usePlayerStore((state) => state.currentIndex);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const isBuffering = usePlayerStore((state) => state.isBuffering);
  const positionMs = usePlayerStore((state) => state.positionMs);
  const durationMs = usePlayerStore((state) => state.durationMs);
  const togglePlayPause = usePlayerStore((state) => state.togglePlayPause);
  const playPrevious = usePlayerStore((state) => state.playPrevious);
  const playNext = usePlayerStore((state) => state.playNext);
  const seekTo = usePlayerStore((state) => state.seekTo);
  const isShuffle = usePlayerStore((state) => state.isShuffle);
  const repeatMode = usePlayerStore((state) => state.repeatMode);
  const toggleShuffle = usePlayerStore((state) => state.toggleShuffle);
  const cycleRepeatMode = usePlayerStore((state) => state.cycleRepeatMode);

  const [seekBarWidth, setSeekBarWidth] = useState(1);

  const song = queue[currentIndex] ?? null;
  const progress = useMemo(() => {
    if (!durationMs || durationMs <= 0) {
      return 0;
    }

    return Math.max(0, Math.min(positionMs / durationMs, 1));
  }, [durationMs, positionMs]);

  const onSeekBarLayout = (event: LayoutChangeEvent): void => {
    setSeekBarWidth(Math.max(1, event.nativeEvent.layout.width));
  };

  const handleSeekPress = (locationX: number): void => {
    if (durationMs <= 0) {
      return;
    }

    const ratio = Math.max(0, Math.min(locationX / seekBarWidth, 1));
    const nextPosition = Math.floor(durationMs * ratio);
    void seekTo(nextPosition);
  };

  if (!song) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.emptyTitle}>No song selected</Text>
        <Text style={styles.emptyText}>Go to Home and play a song first.</Text>
        <Pressable style={styles.queueButton} onPress={() => navigation.navigate("Home")}>
          <Text style={styles.queueButtonText}>Open Home</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        {song.imageUrl ? (
          <Image source={{ uri: song.imageUrl }} style={styles.cover} />
        ) : (
          <View style={[styles.cover, styles.coverFallback]}>
            <Text style={styles.coverFallbackText}>No Cover</Text>
          </View>
        )}

        <Text numberOfLines={2} style={styles.title}>
          {song.name}
        </Text>
        <Text numberOfLines={1} style={styles.subtitle}>
          {song.artists}
        </Text>
        <Text numberOfLines={1} style={styles.albumText}>
          {song.albumName}
        </Text>
      </View>

      <View style={styles.seekSection}>
        <Pressable
          style={styles.seekTrack}
          onLayout={onSeekBarLayout}
          onPress={(event) => handleSeekPress(event.nativeEvent.locationX)}
        >
          <View style={[styles.seekProgress, { width: `${progress * 100}%` }]} />
        </Pressable>

        <View style={styles.seekTimes}>
          <Text style={styles.seekText}>{formatMillis(positionMs)}</Text>
          <Text style={styles.seekText}>{formatMillis(durationMs)}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <Pressable style={styles.controlButton} onPress={() => void toggleShuffle()}>
          <Text style={styles.controlText}>Shuffle: {isShuffle ? "On" : "Off"}</Text>
        </Pressable>

        <Pressable style={styles.controlButton} onPress={() => void playPrevious()}>
          <Text style={styles.controlText}>Prev</Text>
        </Pressable>

        <Pressable style={styles.playButton} onPress={() => void togglePlayPause()}>
          <Text style={styles.playButtonText}>
            {isBuffering ? "Buffering..." : isPlaying ? "Pause" : "Play"}
          </Text>
        </Pressable>

        <Pressable style={styles.controlButton} onPress={() => void playNext()}>
          <Text style={styles.controlText}>Next</Text>
        </Pressable>

        <Pressable style={styles.controlButton} onPress={() => void cycleRepeatMode()}>
          <Text style={styles.controlText}>Repeat: {repeatMode}</Text>
        </Pressable>
      </View>

      <View style={styles.bottomActions}>
        <Pressable style={styles.queueButton} onPress={() => navigation.navigate("Queue")}>
          <Text style={styles.queueButtonText}>Open Queue</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 120
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827"
  },
  emptyText: {
    color: "#4B5563"
  },
  hero: {
    alignItems: "center",
    marginTop: 10
  },
  cover: {
    width: 260,
    height: 260,
    borderRadius: 18,
    backgroundColor: "#E5E7EB"
  },
  coverFallback: {
    alignItems: "center",
    justifyContent: "center"
  },
  coverFallbackText: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "600"
  },
  title: {
    marginTop: 18,
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center"
  },
  subtitle: {
    marginTop: 6,
    fontSize: 15,
    color: "#374151"
  },
  albumText: {
    marginTop: 3,
    fontSize: 13,
    color: "#6B7280"
  },
  seekSection: {
    marginTop: 26,
    gap: 8
  },
  seekTrack: {
    height: 10,
    borderRadius: 99,
    backgroundColor: "#D1D5DB",
    overflow: "hidden"
  },
  seekProgress: {
    height: "100%",
    backgroundColor: "#111827"
  },
  seekTimes: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  seekText: {
    color: "#4B5563",
    fontSize: 12,
    fontWeight: "600"
  },
  controls: {
    marginTop: 22,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10
  },
  controlButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF"
  },
  controlText: {
    color: "#111827",
    fontWeight: "600"
  },
  playButton: {
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 11,
    backgroundColor: "#111827"
  },
  playButtonText: {
    color: "#FFFFFF",
    fontWeight: "700"
  },
  bottomActions: {
    marginTop: 24,
    alignItems: "center"
  },
  queueButton: {
    borderRadius: 10,
    backgroundColor: "#111827",
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  queueButtonText: {
    color: "#FFFFFF",
    fontWeight: "700"
  }
});
