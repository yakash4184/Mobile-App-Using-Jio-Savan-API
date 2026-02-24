# React Native Music Player Assignment

A clean and interview-friendly implementation of the music player assignment using real JioSaavn API data.

## Tech Stack

- Expo + React Native + TypeScript
- React Navigation v6 (native stack)
- Zustand for global player state
- AsyncStorage persistence
- `expo-av` for audio playback

## Features Implemented

- Home screen
  - Song search using JioSaavn search API
  - Pagination (`page` + `limit`)
  - Add song to queue
  - Play from a selected song in search result
- Player screen
  - Full playback controls (play/pause, previous, next)
  - Seek bar (tap to seek)
  - Shuffle and repeat modes
  - Current playback time and duration
- Mini Player
  - Persistent across screens
  - Synced with full player state
  - Play/pause + next controls
- Queue screen
  - View queue
  - Play any queued item
  - Reorder (up/down)
  - Remove song
  - Queue persisted locally
- Background playback setup
  - Audio mode configured with `staysActiveInBackground`

## Project Structure

```text
src/
  api/
    saavn.ts
  components/
    MiniPlayer.tsx
    SongListItem.tsx
  navigation/
    RootNavigator.tsx
    types.ts
  screens/
    HomeScreen.tsx
    PlayerScreen.tsx
    QueueScreen.tsx
  services/
    audioPlayer.ts
  store/
    usePlayerStore.ts
  types/
    music.ts
  utils/
    time.ts
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Run the app:

```bash
npm start
```

3. For Android build/testing:

```bash
npm run android
```

## Assignment Mapping

- **Home**: song list + search + pagination
- **Player**: full controls + seek bar + background playback configuration
- **Mini Player**: persistent and synchronized with full player
- **Queue**: add/reorder/remove + local persistence

## Trade-offs and Notes

- Drag-and-drop reorder is not included; queue reorder is implemented with Up/Down buttons for simplicity and reliability.
- Background playback support depends on native build behavior. For strict production background behavior validation, test with a standalone/dev client build.
- API contracts can vary between endpoints (`url` vs `link`), so parsing includes robust fallbacks.

## Submission Checklist

- [ ] GitHub repository
- [ ] APK build
- [ ] README with setup + architecture + trade-offs
- [ ] 2-3 minute demo video
