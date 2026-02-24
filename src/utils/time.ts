export const formatSeconds = (seconds: number): string => {
  const safe = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const formatMillis = (millis: number): string => {
  return formatSeconds(Math.floor(millis / 1000));
};
