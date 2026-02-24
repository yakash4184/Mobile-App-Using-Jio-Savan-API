import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { Song } from "../types/music";

interface SongListItemProps {
  song: Song;
  onPlay: () => void;
  onAddToQueue: () => void;
}

export function SongListItem({
  song,
  onPlay,
  onAddToQueue
}: SongListItemProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {song.imageUrl ? (
          <Image source={{ uri: song.imageUrl }} style={styles.cover} />
        ) : (
          <View style={[styles.cover, styles.fallbackCover]}>
            <Text style={styles.fallbackText}>No Art</Text>
          </View>
        )}

        <View style={styles.meta}>
          <Text numberOfLines={1} style={styles.title}>
            {song.name}
          </Text>
          <Text numberOfLines={1} style={styles.subtitle}>
            {song.artists}
          </Text>
          <Text numberOfLines={1} style={styles.caption}>
            {song.albumName}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.primaryButton} onPress={onPlay}>
          <Text style={styles.primaryButtonText}>Play</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={onAddToQueue}>
          <Text style={styles.secondaryButtonText}>Add to Queue</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#FFFFFF",
    gap: 10
  },
  row: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center"
  },
  cover: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: "#F3F4F6"
  },
  fallbackCover: {
    alignItems: "center",
    justifyContent: "center"
  },
  fallbackText: {
    fontSize: 10,
    color: "#6B7280"
  },
  meta: {
    flex: 1,
    gap: 2
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827"
  },
  subtitle: {
    fontSize: 13,
    color: "#374151"
  },
  caption: {
    fontSize: 12,
    color: "#6B7280"
  },
  actions: {
    flexDirection: "row",
    gap: 8
  },
  primaryButton: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: "#111827",
    paddingVertical: 10,
    alignItems: "center"
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 13
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingVertical: 10,
    alignItems: "center"
  },
  secondaryButtonText: {
    color: "#111827",
    fontWeight: "600",
    fontSize: 13
  }
});
