import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { usePlayerStore } from "../store/usePlayerStore";
import { formatMillis } from "../utils/time";

export function MiniPlayer(): React.JSX.Element | null {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const queue = usePlayerStore((state) => state.queue);
  const currentIndex = usePlayerStore((state) => state.currentIndex);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const positionMs = usePlayerStore((state) => state.positionMs);
  const durationMs = usePlayerStore((state) => state.durationMs);
  const togglePlayPause = usePlayerStore((state) => state.togglePlayPause);
  const playNext = usePlayerStore((state) => state.playNext);

  const currentSong = queue[currentIndex] ?? null;

  if (!currentSong) {
    return null;
  }

  return (
    <View style={[styles.wrapper, { bottom: insets.bottom + 8 }]}> 
      <Pressable
        style={styles.container}
        onPress={() => navigation.navigate("Player")}
      >
        <View style={styles.left}>
          {currentSong.imageUrl ? (
            <Image source={{ uri: currentSong.imageUrl }} style={styles.cover} />
          ) : (
            <View style={[styles.cover, styles.fallback]}>
              <Text style={styles.fallbackText}>Art</Text>
            </View>
          )}

          <View style={styles.meta}>
            <Text style={styles.title} numberOfLines={1}>
              {currentSong.name}
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {currentSong.artists}
            </Text>
            <Text style={styles.time}>
              {formatMillis(positionMs)} / {formatMillis(durationMs)}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={() => {
              void togglePlayPause();
            }}
            style={styles.actionButton}
          >
            <Text style={styles.actionText}>{isPlaying ? "Pause" : "Play"}</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              void playNext();
            }}
            style={styles.actionButton}
          >
            <Text style={styles.actionText}>Next</Text>
          </Pressable>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 12,
    right: 12,
    zIndex: 30
  },
  container: {
    borderRadius: 14,
    backgroundColor: "#111827",
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10
  },
  cover: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#374151"
  },
  fallback: {
    alignItems: "center",
    justifyContent: "center"
  },
  fallbackText: {
    color: "#D1D5DB",
    fontSize: 10
  },
  meta: {
    flex: 1
  },
  title: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700"
  },
  subtitle: {
    color: "#D1D5DB",
    fontSize: 11
  },
  time: {
    color: "#9CA3AF",
    fontSize: 10,
    marginTop: 1
  },
  actions: {
    flexDirection: "row",
    gap: 6
  },
  actionButton: {
    backgroundColor: "#1F2937",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700"
  }
});
