import React from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { usePlayerStore } from "../store/usePlayerStore";
import { formatSeconds } from "../utils/time";

export function QueueScreen({ navigation }) {
  const queue = usePlayerStore((state) => state.queue);
  const currentIndex = usePlayerStore((state) => state.currentIndex);
  const playIndex = usePlayerStore((state) => state.playIndex);
  const moveQueueItem = usePlayerStore((state) => state.moveQueueItem);
  const removeFromQueue = usePlayerStore((state) => state.removeFromQueue);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Playback Queue</Text>
        <Text style={styles.subtitle}>{queue.length} songs</Text>
      </View>

      <FlatList
        data={queue}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => {
          const isCurrent = index === currentIndex;

          return (
            <View style={[styles.row, isCurrent && styles.currentRow]}>
              <View style={styles.meta}>
                <Text style={styles.indexText}>{index + 1}</Text>
                <View style={styles.textWrap}>
                  <Text style={styles.title} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.artist} numberOfLines={1}>
                    {item.artists} • {formatSeconds(item.durationSec)}
                  </Text>
                </View>
              </View>

              <View style={styles.actions}>
                <Pressable
                  style={styles.actionButton}
                  onPress={() => void playIndex(index)}
                >
                  <Text style={styles.actionText}>Play</Text>
                </Pressable>

                <Pressable
                  style={styles.actionButton}
                  onPress={() => moveQueueItem(index, index - 1)}
                  disabled={index === 0}
                >
                  <Text
                    style={[
                      styles.actionText,
                      index === 0 && styles.disabledText
                    ]}
                  >
                    Up
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.actionButton}
                  onPress={() => moveQueueItem(index, index + 1)}
                  disabled={index === queue.length - 1}
                >
                  <Text
                    style={[
                      styles.actionText,
                      index === queue.length - 1 && styles.disabledText
                    ]}
                  >
                    Down
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.removeButton}
                  onPress={() => {
                    void removeFromQueue(index);
                  }}
                >
                  <Text style={styles.removeText}>Remove</Text>
                </Pressable>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>Queue is empty</Text>
            <Text style={styles.emptyStateText}>
              Search and add songs from the Home screen.
            </Text>
            <Pressable
              style={styles.backButton}
              onPress={() => navigation.navigate("Home")}
            >
              <Text style={styles.backButtonText}>Go to Home</Text>
            </Pressable>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 14,
    paddingTop: 12
  },
  header: {
    marginBottom: 10
  },
  heading: {
    fontSize: 23,
    fontWeight: "800",
    color: "#111827"
  },
  subtitle: {
    color: "#4B5563",
    fontSize: 13
  },
  listContent: {
    gap: 10,
    paddingBottom: 140
  },
  row: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    padding: 10,
    gap: 10
  },
  currentRow: {
    borderColor: "#111827",
    borderWidth: 1.4
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  indexText: {
    width: 24,
    textAlign: "center",
    color: "#6B7280",
    fontWeight: "700"
  },
  textWrap: {
    flex: 1,
    gap: 2
  },
  title: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "700"
  },
  artist: {
    color: "#4B5563",
    fontSize: 12
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  actionButton: {
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  actionText: {
    color: "#111827",
    fontWeight: "600",
    fontSize: 12
  },
  removeButton: {
    borderRadius: 9,
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  removeText: {
    color: "#B91C1C",
    fontWeight: "700",
    fontSize: 12
  },
  disabledText: {
    color: "#9CA3AF"
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 8
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827"
  },
  emptyStateText: {
    fontSize: 13,
    color: "#4B5563",
    textAlign: "center",
    maxWidth: 260
  },
  backButton: {
    marginTop: 8,
    borderRadius: 10,
    backgroundColor: "#111827",
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  backButtonText: {
    color: "#FFFFFF",
    fontWeight: "700"
  }
});
