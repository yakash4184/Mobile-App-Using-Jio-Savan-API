import {
  Audio,
  AVPlaybackStatus,
  InterruptionModeAndroid,
  InterruptionModeIOS
} from "expo-av";
import { Song } from "../types/music";

export interface PlaybackSnapshot {
  isLoaded: boolean;
  isPlaying: boolean;
  isBuffering: boolean;
  positionMs: number;
  durationMs: number;
  didJustFinish: boolean;
}

type StatusListener = (snapshot: PlaybackSnapshot) => void;

class AudioPlayer {
  private sound: Audio.Sound | null = null;
  private statusListener: StatusListener | null = null;
  private configured = false;

  public async configure(listener: StatusListener): Promise<void> {
    this.statusListener = listener;

    if (this.configured) {
      return;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix
    });

    this.configured = true;
  }

  public async playSong(song: Song): Promise<void> {
    if (!song.streamUrl) {
      throw new Error("Song stream URL is missing");
    }

    await this.stopAndUnload();

    const result = await Audio.Sound.createAsync(
      { uri: song.streamUrl },
      {
        shouldPlay: true,
        progressUpdateIntervalMillis: 500
      },
      this.onStatusUpdate
    );

    this.sound = result.sound;
    this.sound.setOnPlaybackStatusUpdate(this.onStatusUpdate);
  }

  public async pause(): Promise<void> {
    if (!this.sound) {
      return;
    }

    await this.sound.pauseAsync();
  }

  public async resume(): Promise<void> {
    if (!this.sound) {
      return;
    }

    await this.sound.playAsync();
  }

  public async seekTo(positionMs: number): Promise<void> {
    if (!this.sound) {
      return;
    }

    await this.sound.setPositionAsync(Math.max(positionMs, 0));
  }

  public async stopAndUnload(): Promise<void> {
    if (!this.sound) {
      return;
    }

    try {
      await this.sound.stopAsync();
    } catch {
      // Ignore stop error when sound is not ready.
    }

    await this.sound.unloadAsync();
    this.sound = null;
  }

  private onStatusUpdate = (status: AVPlaybackStatus): void => {
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
      isPlaying: status.isPlaying,
      isBuffering: status.isBuffering,
      positionMs: status.positionMillis ?? 0,
      durationMs: status.durationMillis ?? 0,
      didJustFinish: status.didJustFinish
    });
  };
}

export const audioPlayer = new AudioPlayer();
