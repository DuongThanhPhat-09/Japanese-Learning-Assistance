/**
 * Offline pronunciation via the browser's built-in Speech Synthesis API.
 * Uses an installed Japanese voice (Windows: "Microsoft Haruka/Ayumi/Nanami",
 * macOS/iOS: "Kyoko/Otoya", Android: Google 日本語). No network is required
 * when a local voice is installed.
 */

export function speechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function japaneseVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  return voices.find((v) => v.lang === "ja-JP" && v.localService) ?? voices.find((v) => v.lang.startsWith("ja"));
}

export function hasJapaneseVoice(): boolean {
  return speechSupported() && !!japaneseVoice();
}

export function speak(text: string, opts: { rate?: number; onEnd?: () => void } = {}): void {
  if (!speechSupported() || !text) {
    opts.onEnd?.();
    return;
  }
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ja-JP";
  u.rate = opts.rate ?? 0.9;
  const voice = japaneseVoice();
  if (voice) u.voice = voice;
  u.onend = () => opts.onEnd?.();
  u.onerror = () => opts.onEnd?.();
  synth.speak(u);
}

/** Speaks lines sequentially; returns a cancel function. */
export function speakSequence(lines: string[], opts: { rate?: number; onLine?: (i: number) => void; onDone?: () => void } = {}): () => void {
  let cancelled = false;
  const next = (i: number) => {
    if (cancelled) return;
    if (i >= lines.length) {
      opts.onDone?.();
      return;
    }
    opts.onLine?.(i);
    speak(lines[i], { rate: opts.rate, onEnd: () => setTimeout(() => next(i + 1), 350) });
  };
  next(0);
  return () => {
    cancelled = true;
    if (speechSupported()) window.speechSynthesis.cancel();
  };
}

export function stopSpeaking() {
  if (speechSupported()) window.speechSynthesis.cancel();
}
