export class MidiHelper {
  public static limitToMidi(value: number): number {
    return Math.min(127, Math.max(0, value));
  }
}
