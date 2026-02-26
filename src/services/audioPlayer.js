import { createAudioPlayer, setAudioModeAsync } from "expo-audio";

class AudioPlayer {
  player = null;
  statusSubscription = null;
  statusListener = null;
  configured = false;

  async configure(listener) {
    this.statusListener = listener;

    if (this.configured) {
      return;
    }

    await setAudioModeAsync({
      allowsRecording: false,
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      shouldRouteThroughEarpiece: false,
      interruptionMode: "doNotMix"
    });

    this.configured = true;
  }

  async playSong(song) {
    if (!song.streamUrl) {
      throw new Error("Song stream URL is missing");
    }

    await this.stopAndUnload();

    this.player = createAudioPlayer(
      { uri: song.streamUrl },
      {
        updateInterval: 500,
        keepAudioSessionActive: true
      }
    );
    this.statusSubscription = this.player.addListener(
      "playbackStatusUpdate",
      this.onStatusUpdate
    );
    this.player.play();
  }

  async pause() {
    if (!this.player) {
      return;
    }

    this.player.pause();
  }

  async resume() {
    if (!this.player) {
      return;
    }

    this.player.play();
  }

  async seekTo(positionMs) {
    if (!this.player) {
      return;
    }

    await this.player.seekTo(Math.max(positionMs, 0) / 1000);
  }

  async stopAndUnload() {
    if (!this.player) {
      return;
    }

    try {
      this.player.pause();
    } catch {
      // Ignore pause errors while the player is transitioning.
    }

    this.statusSubscription?.remove?.();
    this.statusSubscription = null;

    this.player.remove();
    this.player = null;
  }

  onStatusUpdate = (status) => {
    if (!this.statusListener) {
      return;
    }

    if (!status.isLoaded) {
      this.statusListener({
        isLoaded: false,
        isPlaying: false,
        isBuffering: false,
        positionMs: 0,
        durationMs: 0,
        didJustFinish: false
      });
      return;
    }

    this.statusListener({
      isLoaded: true,
      isPlaying: status.playing,
      isBuffering: status.isBuffering,
      positionMs: Math.floor((status.currentTime ?? 0) * 1000),
      durationMs: Math.floor((status.duration ?? 0) * 1000),
      didJustFinish: status.didJustFinish
    });
  };
}

export const audioPlayer = new AudioPlayer();
