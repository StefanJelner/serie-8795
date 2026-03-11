import { BaseChordProgression, ToneSpaces } from './base.chord-progressions';

export const BachChordProgression1 = new BaseChordProgression([
  { toneSpace: ToneSpaces['Ionian'], holdCount: 4 },
  { toneSpace: ToneSpaces['Dorian'], holdCount: 4 },
  { toneSpace: ToneSpaces['Mixolydian'], holdCount: 4 },
  { toneSpace: ToneSpaces['Ionian'], holdCount: 4 },
]);
