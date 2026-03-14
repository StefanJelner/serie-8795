export class MidiHelper {
    static limitToMidi(value) {
        return Math.min(127, Math.max(0, value));
    }
}
