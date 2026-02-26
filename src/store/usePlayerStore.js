import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { fetchSongDetails } from "../api/saavn";
import { audioPlayer } from "../services/audioPlayer";

const getRandomIndex = (length, currentIndex) => {
  if (length <= 1) {
    return currentIndex;
  }

  let nextIndex = currentIndex;
  while (nextIndex === currentIndex) {
    nextIndex = Math.floor(Math.random() * length);
  }
  return nextIndex;
};

export const usePlayerStore = create()(
  persist(
    (set, get) => ({
      initialized: false,
      queue: [],
      currentIndex: 0,
      isPlaying: false,
      isBuffering: false,
      positionMs: 0,
      durationMs: 0,
      repeatMode: "off",
      isShuffle: false,

      initialize: async () => {
        if (get().initialized) {
          return;
        }

        await audioPlayer.configure((snapshot) => {
          get().syncPlaybackStatus(snapshot);
        });

        set({ initialized: true });
      },

      getCurrentSong: () => {
        const state = get();
        return state.queue[state.currentIndex] ?? null;
      },

      setQueueAndPlay: async (songs, startIndex) => {
        if (songs.length === 0) {
          return;
        }

        const index = Math.max(0, Math.min(startIndex, songs.length - 1));
        set({ queue: songs, currentIndex: index });
        await get().playIndex(index);
      },

      addToQueue: (song) => {
        set((state) => {
          const nextQueue = [...state.queue, song];
          const nextIndex = state.queue.length === 0 ? 0 : state.currentIndex;
          return { queue: nextQueue, currentIndex: nextIndex };
        });
      },

      removeFromQueue: async (index) => {
        const state = get();
        if (index < 0 || index >= state.queue.length) {
          return;
        }

        const removingCurrent = index === state.currentIndex;
        const nextQueue = state.queue.filter((_, songIndex) => songIndex !== index);

        if (nextQueue.length === 0) {
          await audioPlayer.stopAndUnload();
          set({
            queue: [],
            currentIndex: 0,
            isPlaying: false,
            positionMs: 0,
            durationMs: 0
          });
          return;
        }

        let nextIndex = state.currentIndex;
        if (index < state.currentIndex) {
          nextIndex = state.currentIndex - 1;
        }
        if (index === state.currentIndex) {
          nextIndex = Math.min(state.currentIndex, nextQueue.length - 1);
        }

        set({ queue: nextQueue, currentIndex: nextIndex });

        if (removingCurrent) {
          await get().playIndex(nextIndex);
        }
      },

      moveQueueItem: (fromIndex, toIndex) => {
        const state = get();

        if (
          fromIndex < 0 ||
          toIndex < 0 ||
          fromIndex >= state.queue.length ||
          toIndex >= state.queue.length ||
          fromIndex === toIndex
        ) {
          return;
        }

        const nextQueue = [...state.queue];
        const [movedSong] = nextQueue.splice(fromIndex, 1);
        if (!movedSong) {
          return;
        }
        nextQueue.splice(toIndex, 0, movedSong);

        let nextCurrentIndex = state.currentIndex;
        if (fromIndex === state.currentIndex) {
          nextCurrentIndex = toIndex;
        } else if (fromIndex < state.currentIndex && toIndex >= state.currentIndex) {
          nextCurrentIndex = state.currentIndex - 1;
        } else if (fromIndex > state.currentIndex && toIndex <= state.currentIndex) {
          nextCurrentIndex = state.currentIndex + 1;
        }

        set({ queue: nextQueue, currentIndex: nextCurrentIndex });
      },

      playIndex: async (index) => {
        const state = get();
        if (index < 0 || index >= state.queue.length) {
          return;
        }

        if (!state.initialized) {
          await get().initialize();
        }

        const song = state.queue[index];
        if (!song) {
          return;
        }

        let playableSong = song;
        if (!playableSong.streamUrl) {
          const details = await fetchSongDetails(playableSong.id);
          playableSong = { ...playableSong, ...details };

          set((currentState) => {
            const nextQueue = [...currentState.queue];
            nextQueue[index] = playableSong;
            return { queue: nextQueue };
          });
        }

        if (!playableSong.streamUrl) {
          throw new Error("No playable stream URL found for this song");
        }

        await audioPlayer.playSong(playableSong);
        set({
          currentIndex: index,
          isPlaying: true,
          positionMs: 0,
          durationMs: playableSong.durationSec * 1000
        });
      },

      togglePlayPause: async () => {
        const state = get();
        const currentSong = state.queue[state.currentIndex];

        if (!currentSong) {
          return;
        }

        if (state.isPlaying) {
          await audioPlayer.pause();
          set({ isPlaying: false });
          return;
        }

        // If playback has not been loaded yet, start from current index.
        if (state.positionMs === 0 && state.durationMs === 0) {
          await get().playIndex(state.currentIndex);
          return;
        }

        await audioPlayer.resume();
        set({ isPlaying: true });
      },

      seekTo: async (positionMs) => {
        await audioPlayer.seekTo(positionMs);
        set({ positionMs });
      },

      playNext: async () => {
        const state = get();
        if (state.queue.length === 0) {
          return;
        }

        let nextIndex = state.currentIndex;

        if (state.isShuffle) {
          nextIndex = getRandomIndex(state.queue.length, state.currentIndex);
        } else {
          const candidate = state.currentIndex + 1;
          if (candidate < state.queue.length) {
            nextIndex = candidate;
          } else if (state.repeatMode === "all") {
            nextIndex = 0;
          } else {
            return;
          }
        }

        await get().playIndex(nextIndex);
      },

      playPrevious: async () => {
        const state = get();
        if (state.queue.length === 0) {
          return;
        }

        if (state.positionMs > 5000) {
          await get().seekTo(0);
          return;
        }

        let nextIndex = state.currentIndex - 1;
        if (nextIndex < 0) {
          if (state.repeatMode === "all") {
            nextIndex = state.queue.length - 1;
          } else {
            nextIndex = 0;
          }
        }

        await get().playIndex(nextIndex);
      },

      toggleShuffle: () => {
        set((state) => ({ isShuffle: !state.isShuffle }));
      },

      cycleRepeatMode: () => {
        set((state) => {
          const nextMode = {
            off: "all",
            all: "one",
            one: "off"
          };

          return { repeatMode: nextMode[state.repeatMode] };
        });
      },

      syncPlaybackStatus: (snapshot) => {
        set({
          isPlaying: snapshot.isPlaying,
          isBuffering: snapshot.isBuffering,
          positionMs: snapshot.positionMs,
          durationMs: snapshot.durationMs
        });

        if (snapshot.didJustFinish) {
          void get().handleTrackFinished();
        }
      },

      handleTrackFinished: async () => {
        const state = get();
        const hasQueue = state.queue.length > 0;
        if (!hasQueue) {
          return;
        }

        if (state.repeatMode === "one") {
          await get().seekTo(0);
          await audioPlayer.resume();
          set({ isPlaying: true });
          return;
        }

        if (state.isShuffle) {
          const nextIndex = getRandomIndex(state.queue.length, state.currentIndex);
          await get().playIndex(nextIndex);
          return;
        }

        const atEnd = state.currentIndex >= state.queue.length - 1;
        if (!atEnd) {
          await get().playIndex(state.currentIndex + 1);
          return;
        }

        if (state.repeatMode === "all") {
          await get().playIndex(0);
          return;
        }

        set({
          isPlaying: false,
          positionMs: state.durationMs
        });
      }
    }),
    {
      name: "music-player-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        queue: state.queue,
        currentIndex: state.currentIndex,
        repeatMode: state.repeatMode,
        isShuffle: state.isShuffle
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) {
          return;
        }

        if (state.currentIndex >= state.queue.length) {
          state.currentIndex = Math.max(0, state.queue.length - 1);
        }
      }
    }
  )
);
