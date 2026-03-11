import { BaseChordProgression, ToneSpaces } from './base.chord-progressions';

// Theoretically it would be better to think it as a chord progression floating around A.
// This way the starting chord on G# is rather an introduction to the actual progression.
// And the G# feels also "too deep" for the progression. Problem is, that i usually use
// the first base tone of the first chord as the root tone for the chord progression
// generators, because it is more intuitive.
export const JelnerChordProgression1 = new BaseChordProgression([
  { space: ToneSpaces['Ionian'], length: 2 }, // G#maj7 Ionian
  { space: ToneSpaces['Locrian'].map((i) => i + 1), length: 1 }, // F7(9) Locrian+1
  { space: ToneSpaces['Phrygian'].map((i) => i + 1), length: 1 }, // Fmaj9 Phrygian+1
  { space: ToneSpaces['Phrygian'].map((i) => i + 1), length: 2 }, // Gm7 Phrygian+1
  { space: ToneSpaces['Dorian'].map((i) => i + 1), length: 1 }, // Gmaj7 Dorian+1
  { space: ToneSpaces['Dorian'].map((i) => i + 1), length: 1 }, // Em9 Dorian+1
]);
